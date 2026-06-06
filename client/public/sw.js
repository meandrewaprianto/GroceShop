// GroceShop Service Worker for Push Notifications
self.addEventListener("install", (event) => {
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(clients.claim());
});

self.addEventListener("push", (event) => {
    const data = event.data?.json() || {};
    const title = data.title || "GroceShop";
    const options = {
        body: data.body || "",
        icon: data.icon || "/icons/icon-192x192.svg",
        badge: "/icons/icon-192x192.svg",
        data: {
            url: data.url || "/orders"
        }
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    const urlToOpen = event.notification.data?.url || "/orders";

    event.waitUntil(
        clients.matchAll({ type: "window", includeUncontrolled: true }).then(windowClients => {
            // If already open, focus the tab
            for (const client of windowClients) {
                if (client.url.includes(urlToOpen) && "focus" in client) {
                    return client.focus();
                }
            }
            // Otherwise open new tab
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});