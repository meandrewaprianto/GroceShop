import { useState, useEffect } from "react";
import { DownloadIcon, XIcon } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPWA() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            // Show prompt after 3 seconds
            setTimeout(() => setShowPrompt(true), 3000);
        };

        // Check if already dismissed within 7 days
        const lastDismissed = localStorage.getItem('pwa_dismissed');
        if (lastDismissed && Date.now() - Number(lastDismissed) < 7 * 24 * 60 * 60 * 1000) {
            setDismissed(true);
        }

        window.addEventListener('beforeinstallprompt', handler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
        }
        setDeferredPrompt(null);
        setShowPrompt(false);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        setDismissed(true);
        // Don't show again for 7 days
        localStorage.setItem('pwa_dismissed', Date.now().toString());
    };

    if (dismissed || !showPrompt || !deferredPrompt) return null;

    return (
        <div className="fixed bottom-20 left-4 right-4 z-50 max-w-sm mx-auto animate-slide-in-up">
            <div className="bg-white rounded-2xl shadow-2xl border border-app-border p-4 flex items-center gap-3">
                <div className="size-12 rounded-xl bg-app-green/10 flex items-center justify-center shrink-0">
                    <DownloadIcon className="size-6 text-app-green" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-app-green">Install GroceShop</p>
                    <p className="text-xs text-app-text-light">Add to your home screen for a better experience</p>
                </div>
                <button
                    onClick={handleInstall}
                    className="px-4 py-2 bg-app-green text-white text-sm font-medium rounded-xl hover:bg-app-green-light transition-colors shrink-0"
                >
                    Install
                </button>
                <button onClick={handleDismiss} className="p-1 text-zinc-400 hover:text-zinc-600 transition-colors shrink-0">
                    <XIcon className="size-4" />
                </button>
            </div>
        </div>
    );
}