
import { Request, Response } from "express";
import { prisma } from "../config/prisma.js"

// GET /api/products/flash-deals
export const getFlashDeals = async (req: Request, res: Response) => {
    try {
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.max(1, Number(req.query.limit) || 10);

        // Ambil semua produk dengan stok > 0
        const allProducts = await prisma.product.findMany({
            where: { stock: { gt: 0 } },
            orderBy: { originalPrice: "desc" }
        });

        // Hitung diskon dan filter yang >= 10%
        const flashDeals = allProducts
            .map((p: any) => {
                const discount = p.originalPrice && p.price
                    ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
                    : 0;
                return { ...p, discount };
            })
            .filter((p: any) => p.discount >= 10);

        const totalPages = Math.max(1, Math.ceil(flashDeals.length / limit));
        const safePage = Math.min(page, totalPages);
        const startIndex = (safePage - 1) * limit;
        const products = flashDeals.slice(startIndex, startIndex + limit);

        res.json({ products, totalPages, page: safePage, total: flashDeals.length });
    } catch (error) {
        console.error("Error fetching flash deals:", error);
        res.status(500).json({ message: "Failed to fetch flash deals" });
    }
}

// GET /api/products
export const getProducts = async (req: Request, res: Response) => {
    try {
        const { category, search, minPrice, maxPrice, sort, limit } = req.query;

        const where: any = {}
        if (category && category !== 'all') where.category = category as string;
        if (search) where.name = { contains: search as string, mode: "insensitive" }
        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price.gte = Number(minPrice)
            if (maxPrice) where.price.lte = Number(maxPrice)
        }

        const orderBy: any = {};
        if (sort === "price-low") orderBy.price = 'asc'
        else if (sort === "price-high") orderBy.price = 'desc'
        else orderBy.createdAt = 'desc';

        const takeLimit = limit ? Number(limit) : undefined;

        const products = await prisma.product.findMany({ where, orderBy, ...(takeLimit ? { take: takeLimit } : {}) });

        const productsWithDiscount = products.map((p: any) => {
            const discount = p.originalPrice && p.price ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0;
            return { ...p, discount }
        })

        res.json({ products: productsWithDiscount });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ message: "Failed to fetch products" });
    }
}

// GET /api/products/:id
export const getProduct = async (req: Request, res: Response) => {
    try {
        const product = await prisma.product.findUnique({ where: { id: req.params.id as string } })

        if (!product) {
            res.status(404).json({ message: "Product not found" });
            return;
        }

        const discount = product.originalPrice && product.price ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

        res.json({ product: { ...product, discount } })
    } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).json({ message: "Failed to fetch product" });
    }
}

// POST /api/products
export const createProduct = async (req: Request, res: Response) => {
    try {
        const { name, description, price, originalPrice, image, category, unit, stock, isOrganic } = req.body;

        // Validation
        if (!name || !price || !image || !category || !unit) {
            res.status(400).json({ message: "Missing required fields: name, price, image, category, unit" });
            return;
        }

        // Sanitize & transform
        const product = await prisma.product.create({
            data: {
                name: String(name).trim(),
                description: String(description || "").trim(),
                price: Number(price),
                originalPrice: originalPrice ? Number(originalPrice) : null,
                image: String(image).trim(),
                category: String(category).toLowerCase().trim().replace(/\s+/g, '-'),
                unit: String(unit).trim(),
                stock: Number(stock) || 0,
                isOrganic: Boolean(isOrganic),
            }
        });

        res.status(201).json({ product });
    } catch (error: any) {
        console.error("Error creating product:", error);
        res.status(500).json({
            message: "Failed to create product",
            error: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    }
}

// PUT /api/products/:id
export const updateProduct = async (req: Request, res: Response) => {
    try {
        const product = await prisma.product.update({ where: { id: req.params.id as string }, data: req.body })
        res.json({ product });
    } catch (error: any) {
        console.error("Error updating product:", error);
        if (error.code === "P2025") {
            res.status(404).json({ message: "Product not found" });
            return;
        }
        res.status(500).json({ message: "Failed to update product" });
    }
}

// DELETE /api/products/:id
export const deleteProduct = async (req: Request, res: Response) => {
    try {
        await prisma.product.update({ where: { id: req.params.id as string }, data: { stock: Number(0) } });
        res.json({ message: "Product Updated" });
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ message: "Failed to delete product" });
    }
}
