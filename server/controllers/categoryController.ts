import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";

// GET /api/products/categories - Get all unique categories from products
export const getCategories = async (req: Request, res: Response) => {
    try {
        const products = await prisma.product.findMany({
            where: { stock: { gt: 0 } },
            select: { category: true },
            distinct: ['category'],
            orderBy: { category: 'asc' }
        });

        const categories = products.map(p => ({
            slug: p.category,
            name: p.category.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
        }));

        res.json({ categories });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Failed to fetch categories' });
    }
};