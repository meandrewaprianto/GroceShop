// Create Order
import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import { inngest } from "../inngest/index.js";
import Stripe from "stripe";

// POST /api/orders
export const createOrder = async (req: Request, res: Response) => {
    const { items, shippingAddress, paymentMethod } = req.body;

    if (!items || items.length === 0) {
        return res.status(400).json({ message: "No order Items" });
    }

    const productIds = items.map((i: any) => i.product);
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
    const productMap: Record<string, (typeof products)[0]> = {}

    products.forEach((p: any) => productMap[p.id] = p);

    for (const item of items) {
        const product = productMap[item.product];
        if (!product || (product.stock ?? 0) < item.quantity) {
            return res.status(404).json({ message: "Product out of stock" });
        }
    }
    const orderItems = items.map((item: any) => {
        const dbProduct = productMap[item.product];
        if (!dbProduct) throw new Error(`Product ${item.product} not found`);
        return {
            product: dbProduct.id,
            name: dbProduct.name,
            image: dbProduct.image,
            price: dbProduct.price,
            quantity: item.quantity,
            unit: dbProduct.unit,
        }
    })

    const subtotal = orderItems.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
    const deliveryFee = subtotal > 20 ? 0 : 1.99;
    const tax = Math.round(subtotal * 0.11 * 100) / 100;
    const total = Math.round((subtotal + deliveryFee + tax) * 100) / 100;

    const order = await prisma.order.create({
        data: {
            userId: req.user!.id,
            items: orderItems,
            shippingAddress,
            paymentMethod,
            subtotal,
            deliveryFee,
            tax,
            total,
            statusHistory: [{ status: "Placed", note: "Order placed successfully", timestamp: new Date() }]
        }
    });

    if (paymentMethod == "card") {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
        const session = await stripe.checkout.sessions.create({
            success_url: `${req.headers.origin}/orders?clearCart=true`,
            cancel_url: `${req.headers.origin}/checkout`,
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: "Payment Groceshop",
                        },
                        unit_amount: Math.round(total * 100),
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            metadata: { orderId: order.id }
        });
        return res.json({ url: session.url })
    }

    res.json({ order });

    for (const item of orderItems) {
        await prisma.product.update({
            where: { id: item.product },
            data: { stock: { decrement: item.quantity } }
        })
    }

    for (const item of orderItems) {
        await inngest.send({ name: "inventory/stock.updated", data: { productId: item.product } })
    }
    await inngest.send({ name: "order/placed", data: { orderId: order.id } })
}

// GET /api/orders/
export const getUserOrders = async (req: Request, res: Response) => {
    const { status } = req.query;
    const where: any = {
        userId: req.user?.id,
        NOT: [{ paymentMethod: "card", isPaid: false }]
    }
    if (status && status !== "all") {
        where.status = status;
    }
    const orders = await prisma.order.findMany({
        where,
        include: { deliveryPartner: { select: { name: true, phone: true } } },
        orderBy: { createdAt: "desc" }
    })
    res.json({ orders });
}

// GET /api/orders/:id
export const getOrder = async (req: Request, res: Response) => {
    const order = await prisma.order.findFirst({
        where: { id: req.params.id as string, userId: req.user?.id },
        include: { deliveryPartner: { select: { name: true, phone: true, avatar: true, vehicleType: true } } }
    })
    if (!order) {
        return res.status(404).json({ message: "Order not found" });
    }
    res.json({ order });
}

// PUT /api/orders/:id/status
export const updateOrderStatus = async (req: Request, res: Response) => {
    const { status, note } = req.body;
    const order = await prisma.order.findUnique({ where: { id: req.params.id as string } })

    if (!order) {
        return res.status(404).json({ message: "Order not found!" })
    }

    const history = (Array.isArray(order.statusHistory) ? order.statusHistory : []) as any[];
    history.push({ status, note: note || `Order ${status.toLowerCase()}`, timestamp: new Date() });

    const updateOrder = await prisma.order.update({ where: { id: req.params.id as string }, data: { status, statusHistory: history } })

    const io = req.app.get("io");
    if (io) {
        io.to(`order:${updateOrder.id}`).emit("order-status-updated", { status, statusHistory: history });
    }

    // Smart notification config with friendly messages
    interface NotifConf {
        title: string;
        body: string;
        note: string;
        url: string;
    }

    const notificationConfig: Record<string, NotifConf> = {
        "Placed": {
            title: "📦 Pesanan Dibuat",
            body: "Pesanan kamu sudah dibuat! Ditunggu ya, pesanan sedang dikemas dulu 🎁",
            note: "Pesanan dibuat. Ditunggu ya, pesanan sedang dikemas dulu 🎁",
            url: `/orders/${updateOrder.id}`
        },
        "Confirmed": {
            title: "✅ Pesanan Dikonfirmasi",
            body: "Pesanan kamu sudah dikonfirmasi! Lagi kami siapkan nih.",
            note: "Pesanan dikonfirmasi. Lagi kami siapkan nih ✅",
            url: `/orders/${updateOrder.id}`
        },
        "Out for Delivery": {
            title: "🚚 Pesanan Dalam Perjalanan!",
            body: "Hore! Pesanan kamu sudah dijalan nih 🎉",
            note: "Pesanan dalam perjalanan! Hore! 🚚🎉",
            url: `/orders/${updateOrder.id}`
        },
        "Delivered": {
            title: "✅ Pesanan Selesai!",
            body: "Terima kasih telah berbelanja! Belanja lagi yuk di tempat kami 🛒",
            note: "Pesanan selesai. Terima kasih telah berbelanja! 🛒",
            url: "/"
        },
        "Cancelled": {
            title: "❌ Pesanan Dibatalkan",
            body: "Pesanan kamu telah dibatalkan.",
            note: "Pesanan dibatalkan 🙁",
            url: "/orders"
        },
    };

    const config = notificationConfig[status];
    if (config) {
        // Update the last history entry with friendly note
        const updatedHistory = [...history];
        updatedHistory[updatedHistory.length - 1] = {
            ...updatedHistory[updatedHistory.length - 1],
            note: config.note
        };

        await prisma.order.update({
            where: { id: req.params.id as string },
            data: { statusHistory: updatedHistory }
        });
    }

    res.json({ order: updateOrder })
}

// GET /api/orders/all
export const getAllOrders = async (req: Request, res: Response) => {
    const orders = await prisma.order.findMany({
        where: { NOT: [{ paymentMethod: "card", isPaid: false }] },
        include: {
            user: { select: { name: true, email: true } },
            deliveryPartner: { select: { name: true, phone: true, email: true } }
        },
        orderBy: { createdAt: "desc" }
    })
    res.json({ orders });
}

// GET /api/orders/:id/location
export const getOrderLocation = async (req: Request, res: Response) => {
    const order = await prisma.order.findFirst({
        where: { id: req.params.id as string, userId: req.user?.id },
        select: { liveLocation: true, status: true }
    })
    if (!order) return res.status(404).json({ message: "Order Not Found" });
    res.json({ liveLocation: order.liveLocation, status: order.status })
}