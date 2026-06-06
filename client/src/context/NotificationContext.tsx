import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useAuth } from "./AuthContext";
import api from "../config/api";
import toast from "react-hot-toast";

interface NotificationContextType {
    isSubscribed: boolean;
    isSupported: boolean;
    subscribeToPush: () => Promise<void>;
    unsubscribeFromPush: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const PUBLIC_VAPID_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || "";

export function NotificationProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isSupported] = useState(() => "serviceWorker" in navigator && "PushManager" in window);
    const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);

    // Register SW and check subscription status
    useEffect(() => {
        if (!isSupported || !user) return;

        const init = async () => {
            try {
                const reg = await navigator.serviceWorker.register("/sw.js");
                setSwRegistration(reg);

                const sub = await reg.pushManager.getSubscription();
                setIsSubscribed(!!sub);
            } catch (err) {
                console.error("Failed to register SW:", err);
            }
        };

        init();
    }, [isSupported, user]);

    const urlBase64ToUint8Array = (base64String: string) => {
        const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
        const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
        const rawData = window.atob(base64);
        return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
    };

    const subscribeToPush = async () => {
        if (!swRegistration || !user) {
            toast.error("Please login to enable notifications");
            return;
        }

        try {
            // Get VAPID key from server or use hardcoded one
            let vapidKey = PUBLIC_VAPID_KEY;
            try {
                const { data } = await api.get("/notifications/vapid-public-key");
                if (data.publicKey) vapidKey = data.publicKey;
            } catch {
                // Use hardcoded fallback
            }

            const subscription = await swRegistration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidKey)
            });

            // Send to server
            await api.post("/notifications/subscribe", {
                endpoint: subscription.endpoint,
                keys: {
                    p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey("p256dh")!))),
                    auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey("auth")!)))
                }
            });

            setIsSubscribed(true);
            toast.success("Notifications enabled!");
        } catch (err: any) {
            if (err.name === "NotAllowedError") {
                toast.error("Notification permission denied");
            } else {
                toast.error("Failed to subscribe to notifications");
            }
        }
    };

    const unsubscribeFromPush = async () => {
        if (!swRegistration) return;

        try {
            const sub = await swRegistration.pushManager.getSubscription();
            if (sub) {
                await api.post("/notifications/unsubscribe", { endpoint: sub.endpoint });
                await sub.unsubscribe();
                setIsSubscribed(false);
                toast.success("Notifications disabled");
            }
        } catch {
            toast.error("Failed to unsubscribe");
        }
    };

    return (
        <NotificationContext.Provider value={{ isSubscribed, isSupported, subscribeToPush, unsubscribeFromPush }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotification() {
    const context = useContext(NotificationContext);
    if (!context) throw new Error("useNotification must be used within NotificationProvider");
    return context;
}