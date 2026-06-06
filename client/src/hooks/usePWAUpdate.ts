import { useState, useEffect } from "react";

export function usePWAUpdate() {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [updateServiceWorker, setUpdateServiceWorker] = useState<
    (() => Promise<void>) | null
  >(null);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        // Check for updates periodically
        const checkUpdate = () => {
          registration.update();
        };

        // Check for updates every 60 seconds
        const interval = setInterval(checkUpdate, 60 * 1000);

        // Listen for new service worker installing
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              // New content is available, show refresh prompt
              setNeedRefresh(true);
              setUpdateServiceWorker(async () => {
                // Skip waiting and activate new service worker
                newWorker.postMessage({ type: "SKIP_WAITING" });
                setNeedRefresh(false);
                window.location.reload();
              });
            }
          });
        });

        // Initial check
        checkUpdate();

        return () => clearInterval(interval);
      });

      // Listen for controller change (new SW activated)
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        window.location.reload();
      });
    }
  }, []);

  return { needRefresh, updateServiceWorker };
}