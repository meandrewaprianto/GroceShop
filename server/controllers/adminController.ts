import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import bcrypt from "bcrypt";

// Get admin dashboard data
export const getAdminStats = async (req: Request, res: Response) => {
    const validOrderFilter = { NOT: [{ paymentMethod: "card", isPaid: false }] };

    const [totalOrders, totalUsers, totalProducts, outOfStock, totalPartners, recentOrders, allOrders] = await Promise.all([
        prisma.order.count({ where: validOrderFilter }),
        prisma.user.count(),
        prisma.product.count(),
        prisma.product.count({ where: { stock: 0 } }),
        prisma.deliveryPartner.count(),
        prisma.order.findMany({
            where: validOrderFilter,
            orderBy: { createdAt: "desc" },
            take: 8,
            include: { user: { select: { name: true, email: true } }, deliveryPartner: { select: { name: true, phone: true } } },
        }),
        prisma.order.findMany({
            where: validOrderFilter,
            select: { total: true, status: true, createdAt: true, items: true },
        })
    ]);

    // Revenue stats
    const totalRevenue = allOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Order status breakdown
    const statusBreakdown: Record<string, number> = {};
    allOrders.forEach(o => {
        statusBreakdown[o.status] = (statusBreakdown[o.status] || 0) + 1;
    });

    // Daily revenue for last 7 days
    const dailyRevenue: { date: string; revenue: number; orders: number }[] = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayStr = d.toISOString().split("T")[0];
        const dayOrders = allOrders.filter(o => o.createdAt.toISOString().split("T")[0] === dayStr);
        dailyRevenue.push({
            date: dayStr,
            revenue: dayOrders.reduce((sum, o) => sum + (o.total || 0), 0),
            orders: dayOrders.length,
        });
    }

    // Top products by order frequency
    const productCounts: Record<string, number> = {};
    allOrders.forEach(o => {
        (o.items as any[])?.forEach((item: any) => {
            const pid = typeof item.product === "string" ? item.product : item.product?.id;
            if (pid) productCounts[pid] = (productCounts[pid] || 0) + (item.quantity || 1);
        });
    });
    const topProductIds = Object.entries(productCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([id]) => id);

    const topProducts = topProductIds.length > 0
        ? await prisma.product.findMany({
            where: { id: { in: topProductIds } },
            select: { id: true, name: true, price: true, image: true, category: true },
        })
        : [];

    const topProductsWithCount = topProducts.map(p => ({
        ...p,
        totalSold: productCounts[p.id] || 0,
    }));

    res.json({
        totalOrders, totalUsers, totalProducts, outOfStock, totalPartners,
        recentOrders, totalRevenue, avgOrderValue, statusBreakdown,
        dailyRevenue, topProducts: topProductsWithCount,
    });
};

// Get delivery partners list for admin
export const getDeliveryPartners = async (req: Request, res: Response) => {
    const partners = await prisma.deliveryPartner.findMany({
        orderBy: { createdAt: "desc" }
    });
    res.json({ partners });
};

// Create delivery partner profile
export const createDeliveryPartner = async (req: Request, res: Response) => {
    const { name, email, password, phone, vehicleType } = req.body;

    if (!name || !email || !password || !phone) {
        res.status(404).json({ message: "Please provide all required fields" });
        return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const partner = await prisma.deliveryPartner.create({
        data: { name, email: email.toLowerCase(), password: hashedPassword, phone, vehicleType }
    });

    res.status(201).json({ partner });
};

// Update delivery partner profile
export const updateDeliveryPartner = async (req: Request, res: Response) => {
    const { name, phone, vehicleType, isActive } = req.body;
    const data: any = {};
    if (name) data.name = name;
    if (phone) data.phone = phone;
    if (vehicleType) data.vehicleType = vehicleType;
    data.isActive = isActive;

    try {
        const partner = await prisma.deliveryPartner.update({
            where: { id: req.params.id as string },
            data
        });
        res.json({ partner });
    } catch (err) {
        res.status(404).json({ message: "Partner not found" });
    }
};

// Assign delivery partner for order
export const assignDeliveryPartner = async (req: Request, res: Response) => {
    const { partnerId } = req.body;

    const order = await prisma.order.findUnique({
        where: { id: req.params.id as string }
    });

    const partner = await prisma.deliveryPartner.findUnique({
        where: { id: partnerId }
    });

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    let status = order?.status;

    const history: any[] = Array.isArray(order?.statusHistory) ? order.statusHistory : [];

    if (order?.status === "Placed" || order?.status === "Confirmed") {
        status = "Assigned";
        history.push({
            status: "Assigned",
            note: `Assigned to ${partner?.name}`, timestamp: new Date()
        });
    }

    const updatedOrder = await prisma.order.update({
        where: { id: order?.id },
        data: { deliveryPartnerId: partner?.id, deliveryOtp: otp, status, statusHistory: history }
    });

    const io = req.app.get("io");
    if (io) {
        io.to(`order:${order?.id}`).emit("order-status-updated", { status, statusHistory: history });
        io.to(`partner:${partner?.id}`).emit("order-assigned", { order: updatedOrder });
    }

    res.json({ order: updatedOrder });
};