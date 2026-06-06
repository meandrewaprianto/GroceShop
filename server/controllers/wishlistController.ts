import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";

// GET /api/wishlist
export const getWishlist = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const items = await prisma.wishlistItem.findMany({
            where: { userId },
            include: {
                product: true
            },
            orderBy: { createdAt: "desc" }
        });

        const products = items.map((item: any) => {
            const product = item.product;
            const discount = product.originalPrice && product.price
                ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                : 0;
            return { ...product, discount, wishedAt: item.createdAt };
        });

        res.json({ products });
    } catch (error) {
        console.error("Error fetching wishlist:", error);
        res.status(500).json({ message: "Failed to fetch wishlist" });
    }
};

// POST /api/wishlist/:productId
export const toggleWishlist = async (req: Request<{ productId: string }>, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { productId } = req.params;

        // Check if product exists
        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Check if already wishlisted
        const existing = await prisma.wishlistItem.findUnique({
            where: { userId_productId: { userId, productId } }
        });

        if (existing) {
            await prisma.wishlistItem.delete({ where: { id: existing.id } });
            res.json({ wished: false, message: "Removed from wishlist" });
        } else {
            await prisma.wishlistItem.create({ data: { userId, productId } });
            res.json({ wished: true, message: "Added to wishlist" });
        }
    } catch (error) {
        console.error("Error toggling wishlist:", error);
        res.status(500).json({ message: "Failed to toggle wishlist" });
    }
};

// GET /api/wishlist/check/:productId
export const checkWishlist = async (req: Request<{ productId: string }>, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { productId } = req.params;

        const existing = await prisma.wishlistItem.findUnique({
            where: { userId_productId: { userId, productId } }
        });

        res.json({ wished: !!existing });
    } catch (error) {
        console.error("Error checking wishlist:", error);
        res.status(500).json({ message: "Failed to check wishlist" });
    }
};