import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";

// GET /api/products/search - Search suggestions for autocomplete
export const getSearchSuggestions = async (req: Request, res: Response) => {
    const q = req.query.q as string;
    const limit = Math.min(8, Math.max(1, Number(req.query.limit) || 5));

    if (!q || q.trim().length < 1) {
        res.json({ suggestions: [] });
        return;
    }

    try {
        const products = await prisma.product.findMany({
            where: {
                name: { contains: q.trim(), mode: "insensitive" },
                stock: { gt: 0 }
            },
            select: {
                id: true,
                name: true,
                image: true,
                price: true,
                unit: true,
                category: true
            },
            orderBy: { createdAt: 'desc' },
            take: limit
        });

        const suggestions = products.map(p => ({
            ...p,
            discount: 0
        }));

        res.json({ suggestions });
    } catch (error) {
        console.error('Error fetching suggestions:', error);
        res.status(500).json({ message: 'Failed to fetch suggestions' });
    }
};