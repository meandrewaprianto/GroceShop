import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { Product } from "../types";
import api from "../config/api";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

interface WishlistContextType {
    wishlist: Product[];
    wishlistIds: Set<string>;
    loading: boolean;
    isWished: (productId: string) => boolean;
    toggleWishlist: (product: Product) => Promise<void>;
    wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [wishlist, setWishlist] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchWishlist = useCallback(async () => {
        if (!user) {
            setWishlist([]);
            return;
        }
        try {
            setLoading(true);
            const { data } = await api.get("/wishlist");
            setWishlist(data.products || []);
        } catch {
            // silent fail
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchWishlist();
    }, [fetchWishlist]);

    const wishlistIds = new Set(wishlist.map(p => p.id));
    const wishlistCount = wishlist.length;

    const isWished = (productId: string) => wishlistIds.has(productId);

    const toggleWishlist = async (product: Product) => {
        if (!user) {
            toast.error("Please login to add to wishlist");
            return;
        }

        const wasWished = isWished(product.id);

        // Optimistic update
        if (wasWished) {
            setWishlist(prev => prev.filter(p => p.id !== product.id));
        } else {
            setWishlist(prev => [product, ...prev]);
        }

        try {
            const { data } = await api.post(`/wishlist/${product.id}`);
            if (!data.wished) {
                // Already removed on server
            }
        } catch {
            // Rollback on error
            if (wasWished) {
                setWishlist(prev => [product, ...prev]);
            } else {
                setWishlist(prev => prev.filter(p => p.id !== product.id));
            }
            toast.error("Failed to update wishlist");
        }
    };

    return (
        <WishlistContext.Provider value={{ wishlist, wishlistIds, loading, isWished, toggleWishlist, wishlistCount }}>
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const context = useContext(WishlistContext);
    if (!context) throw new Error("useWishlist must be used within WishlistProvider");
    return context;
}