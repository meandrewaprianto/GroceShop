import { Request, Response } from "express";
import { prisma } from "../config/prisma.js"

// GET /api/products/flash-deals
export const getFlashDeals = async (req: Request, res: Response) => {
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
}

// GET /api/products
export const getProducts = async (req: Request, res: Response) => {
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
}

// GET /api/products/:id
export const getProduct = async (req: Request, res: Response) => {
    const product = await prisma.product.findUnique({ where: { id: req.params.id as string } })

    if (!product) {
        res.status(404).json({ message: "Product not found" });
        return;
    }

    const discount = product.originalPrice && product.price ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

    res.json({ product: { ...product, discount } })
}

// POST /api/produts
export const createProduct = async (req: Request, res: Response) => {
    const product = await prisma.product.create({ data: req.body });
    res.status(201).json({ product });
}

// PUT /api/products/:id
export const updateProduct = async (req: Request, res: Response) => {
    const product = await prisma.product.update({ where: { id: req.params.id as string }, data: req.body })
    res.json({ product });
}

// DELETE /api/products/:id
export const deleteProduct = async (req: Request, res: Response) => {
    await prisma.product.update({ where: { id: req.params.id as string }, data: { stock: Number(0) } });
    res.json({ message: "Product Updated" });
}