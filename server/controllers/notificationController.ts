import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import webpush from "web-push";

// Configure web-push with VAPID keys
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || "";
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || "";

console.log("[PushNotification] VAPID keys configured:", {
    hasPublicKey: !!vapidPublicKey,
    hasPrivateKey: !!vapidPrivateKey,
    publicKeyLength: vapidPublicKey.length,
    privateKeyLength: vapidPrivateKey.length,
});

if (vapidPublicKey && vapidPrivateKey) {
    webpush.setVapidDetails(
        "mailto:" + (process.env.SENDER_EMAIL || "admin@groceshop.com"),
        vapidPublicKey,
        vapidPrivateKey
    );
    console.log("[PushNotification] web-push initialized successfully");
} else {
    console.error("[PushNotification] VAPID keys are missing! Push notifications will not work.");
}

// GET /api/notifications/vapid-public-key
export const getVapidPublicKey = (_req: Request, res: Response) => {
    res.json({ publicKey: vapidPublicKey });
};

// GET /api/notifications/status — check current subscription status for the user
export const getSubscriptionStatus = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const subscriptions = await prisma.pushSubscription.findMany({
            where: { userId },
            select: { id: true, endpoint: true, createdAt: true }
        });

        const totalSubscriptions = await prisma.pushSubscription.count();

        res.json({
            userId,
            yourSubscriptions: subscriptions.length,
            subscriptionEndpoints: subscriptions.map(s => ({
                id: s.id,
                endpointPrefix: s.endpoint.substring(0, 60) + "...",
                createdAt: s.createdAt
            })),
            totalSubscriptionsInDB: totalSubscriptions
        });
    } catch (error) {
        console.error("[PushNotification] Error checking status:", error);
        res.status(500).json({ message: "Failed to check subscription status" });
    }
};

// POST /api/notifications/test — sends notification to the requesting user only
export const testNotification = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Check if user has any subscriptions first
        const subscriptionCount = await prisma.pushSubscription.count({
            where: { userId }
        });

        if (subscriptionCount === 0) {
            return res.status(400).json({
                message: "No push subscriptions found for this user. Please enable notifications first via the Bell icon in the navbar dropdown."
            });
        }

        console.log(`[PushNotification] Sending test notification to user ${userId} (${subscriptionCount} subscriptions)`);

        await sendPushNotification(
            userId,
            "🔔 Test Notification",
            "Ini adalah notifikasi percobaan dari GroceShop!",
            "/orders"
        );

        res.json({ 
            message: "Test notification sent!",
            subscriptionCount
        });
    } catch (error) {
        console.error("[PushNotification] Error sending test notification:", error);
        res.status(500).json({ message: "Failed to send test notification" });
    }
};

// POST /api/notifications/test-all — admin-only: sends notification to ALL subscribed users
export const testNotificationAll = async (req: Request, res: Response) => {
    try {
        // Get all subscriptions
        const allSubscriptions = await prisma.pushSubscription.findMany({
            include: { user: { select: { name: true, email: true } } }
        });

        if (allSubscriptions.length === 0) {
            return res.status(400).json({
                message: "No users have enabled push notifications yet."
            });
        }

        console.log(`[PushNotification] Broadcasting test notification to ${allSubscriptions.length} subscribers`);

        const payload = JSON.stringify({
            title: "🔔 GroceShop Test",
            body: "Test notification dari Admin!",
            url: "/orders",
            icon: "/icons/icon-192x192.svg"
        });

        const results = await Promise.allSettled(
            allSubscriptions.map(sub =>
                webpush.sendNotification({
                    endpoint: sub.endpoint,
                    keys: { p256dh: sub.p256dh, auth: sub.auth }
                }, payload).then(() => ({
                    userId: sub.userId,
                    userName: sub.user.name,
                    email: sub.user.email,
                    status: "fulfilled" as const
                }))
            )
        );

        let success = 0;
        let failed = 0;
        const errors: string[] = [];

        for (let i = 0; i < results.length; i++) {
            const result = results[i];
            if (result.status === "fulfilled") {
                success++;
            } else {
                failed++;
                const reason = result.reason as any;
                if (reason?.statusCode === 410) {
                    await prisma.pushSubscription.delete({ where: { id: allSubscriptions[i].id } });
                    errors.push(`Subscription ${i} expired (410) — cleaned up`);
                } else {
                    errors.push(`Subscription ${i}: ${reason?.body || reason?.message || "Unknown error"}`);
                }
            }
        }

        console.log(`[PushNotification] Broadcast complete: ${success} success, ${failed} failed`);

        res.json({
            message: `Broadcast complete: ${success} sent, ${failed} failed`,
            total: allSubscriptions.length,
            success,
            failed,
            errors: errors.slice(0, 5)
        });
    } catch (error) {
        console.error("[PushNotification] Error broadcasting test notification:", error);
        res.status(500).json({ message: "Failed to broadcast test notification" });
    }
};

// POST /api/notifications/subscribe
export const subscribe = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { endpoint, keys } = req.body;
        if (!endpoint || !keys?.p256dh || !keys?.auth) {
            return res.status(400).json({ 
                message: "Invalid subscription object", 
                received: { endpoint: !!endpoint, p256dh: !!keys?.p256dh, auth: !!keys?.auth } 
            });
        }

        console.log(`[PushNotification] Subscribe request for user ${userId}, endpoint: ${endpoint.substring(0, 50)}...`);

        // Upsert: replace existing subscription for same endpoint
        const existing = await prisma.pushSubscription.findFirst({
            where: { userId, endpoint }
        });

        if (existing) {
            await prisma.pushSubscription.update({
                where: { id: existing.id },
                data: { p256dh: keys.p256dh, auth: keys.auth }
            });
            console.log(`[PushNotification] Updated existing subscription for user ${userId}`);
        } else {
            await prisma.pushSubscription.create({
                data: {
                    userId,
                    endpoint,
                    p256dh: keys.p256dh,
                    auth: keys.auth
                }
            });
            console.log(`[PushNotification] Created new subscription for user ${userId}`);
        }

        res.json({ message: "Subscribed successfully" });
    } catch (error) {
        console.error("[PushNotification] Error subscribing:", error);
        res.status(500).json({ message: "Failed to subscribe" });
    }
};

// POST /api/notifications/unsubscribe
export const unsubscribe = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { endpoint } = req.body;
        if (!endpoint) {
            return res.status(400).json({ message: "Endpoint is required" });
        }

        console.log(`[PushNotification] Unsubscribe for user ${userId}`);

        await prisma.pushSubscription.deleteMany({
            where: { userId, endpoint }
        });

        res.json({ message: "Unsubscribed successfully" });
    } catch (error) {
        console.error("[PushNotification] Error unsubscribing:", error);
        res.status(500).json({ message: "Failed to unsubscribe" });
    }
};

/**
 * Send push notification to a specific user
 * This is used internally (e.g., by order controller when status changes)
 */
export async function sendPushNotification(userId: string, title: string, body: string, url?: string) {
    try {
        const subscriptions = await prisma.pushSubscription.findMany({
            where: { userId }
        });

        if (subscriptions.length === 0) {
            console.warn(`[PushNotification] No subscriptions found for user ${userId}`);
            return;
        }

        console.log(`[PushNotification] Sending "${title}" to user ${userId} (${subscriptions.length} subscriptions)`);

        const payload = JSON.stringify({
            title,
            body,
            url: url || "/orders",
            icon: "/icons/icon-192x192.svg"
        });

        const results = await Promise.allSettled(
            subscriptions.map(sub =>
                webpush.sendNotification({
                    endpoint: sub.endpoint,
                    keys: { p256dh: sub.p256dh, auth: sub.auth }
                }, payload)
            )
        );

        let deletedCount = 0;
        let errorCount = 0;

        for (let i = 0; i < results.length; i++) {
            const result = results[i];
            if (result.status === "fulfilled") {
                console.log(`[PushNotification] ✓ Sent successfully to subscription ${i}`);
            } else {
                errorCount++;
                const reason = result.reason as any;
                console.error(`[PushNotification] ✗ Failed for subscription ${i}:`, {
                    statusCode: reason?.statusCode,
                    body: reason?.body || reason?.message || reason
                });
                if (reason?.statusCode === 410) {
                    await prisma.pushSubscription.delete({ where: { id: subscriptions[i].id } });
                    deletedCount++;
                }
            }
        }

        if (deletedCount > 0) {
            console.warn(`[PushNotification] Cleaned up ${deletedCount} expired subscriptions for user ${userId}`);
        }
        if (errorCount > 0) {
            console.warn(`[PushNotification] ${errorCount}/${subscriptions.length} failed for user ${userId}`);
        }
    } catch (error) {
        console.error("[PushNotification] Error sending push notification:", error);
    }
}