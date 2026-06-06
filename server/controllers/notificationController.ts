import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import webpush from "web-push";

// Configure web-push with VAPID keys
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || "";
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || "";

if (vapidPublicKey && vapidPrivateKey) {
    webpush.setVapidDetails(
        "mailto:" + (process.env.SENDER_EMAIL || "admin@groceshop.com"),
        vapidPublicKey,
        vapidPrivateKey
    );
}

// GET /api/notifications/vapid-public-key
export const getVapidPublicKey = (_req: Request, res: Response) => {
    res.json({ publicKey: vapidPublicKey });
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
            return res.status(400).json({ message: "Invalid subscription object" });
        }

        // Upsert: replace existing subscription for same endpoint
        const existing = await prisma.pushSubscription.findFirst({
            where: { userId, endpoint }
        });

        if (existing) {
            await prisma.pushSubscription.update({
                where: { id: existing.id },
                data: { p256dh: keys.p256dh, auth: keys.auth }
            });
        } else {
            await prisma.pushSubscription.create({
                data: {
                    userId,
                    endpoint,
                    p256dh: keys.p256dh,
                    auth: keys.auth
                }
            });
        }

        res.json({ message: "Subscribed successfully" });
    } catch (error) {
        console.error("Error subscribing:", error);
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

        await prisma.pushSubscription.deleteMany({
            where: { userId, endpoint }
        });

        res.json({ message: "Unsubscribed successfully" });
    } catch (error) {
        console.error("Error unsubscribing:", error);
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

        // Clean up invalid subscriptions
        for (let i = 0; i < results.length; i++) {
            const result = results[i];
            if (result.status === "rejected" && (result.reason as any)?.statusCode === 410) {
                await prisma.pushSubscription.delete({ where: { id: subscriptions[i].id } });
            }
        }
    } catch (error) {
        console.error("Error sending push notification:", error);
    }
}