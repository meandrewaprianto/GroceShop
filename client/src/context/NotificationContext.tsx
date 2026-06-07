import { createContext, useContext, type ReactNode } from "react";

interface NotificationContextType {
    isSubscribed: boolean;
    isSupported: boolean;
    subscribeToPush: () => Promise<void>;
    unsubscribeFromPush: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
    // Push notifications are disabled - this is a stub provider
    return (
        <NotificationContext.Provider value={{ 
            isSubscribed: false, 
            isSupported: false, 
            subscribeToPush: async () => {},
            unsubscribeFromPush: async () => {}
        }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotification() {
    const context = useContext(NotificationContext);
    if (!context) throw new Error("useNotification must be used within NotificationProvider");
    return context;
}