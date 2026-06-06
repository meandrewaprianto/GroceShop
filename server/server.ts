import "dotenv/config";
import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import authRouter from "./routes/authRoutes.js";
import productRouter from "./routes/productRoutes.js";
import uploadRouter from "./routes/uploadRoutes.js";
import orderRouter from "./routes/orderRoute.js";

import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js";
import addressRouter from "./routes/addressRoute.js";
import adminRouter from "./routes/adminRoute.js";
import deliveryPartnerRouter from "./routes/deliveryPartnerRoute.js";
import reviewRouter from "./routes/reviewRoutes.js";
import wishlistRouter from "./routes/wishlistRoutes.js";
import notificationRouter from "./routes/notificationRoutes.js";

import { stripeWebhook } from "./controllers/webhooks.js";

const IS_VERCEL = Boolean(process.env.VERCEL);

const app = express();

// Stripe webhook needs raw body BEFORE express.json() is applied
app.post("/api/stripe", express.raw({ type: 'application/json' }), stripeWebhook);

//Middleware
app.use(cors());
app.use(express.json({ limit: "5mb" }));

// Health check
app.get('/', (req: Request, res: Response) => {
    res.json({
        status: "live",
        env: process.env.NODE_ENV || "unknown",
        vercel: IS_VERCEL,
        timestamp: new Date().toISOString(),
    });
});

app.use('/api/auth', authRouter);
app.use('/api/products', productRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/orders', orderRouter);
app.use('/api/inngest', serve({ client: inngest, functions }));
app.use('/api/addresses', addressRouter);
app.use('/api/admin', adminRouter);
app.use('/api/delivery', deliveryPartnerRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/wishlist', wishlistRouter);
app.use('/api/notifications', notificationRouter);

// Error Handling
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
    console.error("[error-handler]", error);
    res.status(500).json({ message: error?.message || "Internal server error" });
});

// ──────────────────────────────────────────────────────────────
// WebSocket / HTTP server: only when NOT on Vercel.
// Vercel serverless functions do NOT support persistent WebSocket
// connections nor `server.listen()`. We export the express app
// directly and let Vercel wire it into a serverless function.
// ──────────────────────────────────────────────────────────────
if (!IS_VERCEL) {
    // Lazy-import heavy server-only modules so they don't break
    // the serverless build on Vercel.
    const http = await import("http");
    const { Server } = await import("socket.io");
    const { prisma } = await import("./config/prisma.js");

    const server = http.createServer(app);
    const io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || "http://localhost:5173",
            methods: ["GET", "POST"]
        }
    });
    app.set("io", io);

    io.on("connection", (socket) => {
        console.log(`Socket connected: ${socket.id}`);

        socket.on("join-order-room", (orderId: string) => {
            socket.join(`order:${orderId}`);
            console.log(`Socket ${socket.id} joined room: order:${orderId}`);
        });

        socket.on("join-partner-room", (partnerId: string) => {
            socket.join(`partner:${partnerId}`);
            console.log(`Socket ${socket.id} joined room: partner:${partnerId}`);
        });

        socket.on("send-live-location", async (data: { orderId: string; lat: number; lng: number }) => {
            const { orderId, lat, lng } = data;
            const updatedAt = new Date();
            socket.to(`order:${orderId}`).emit("receive-live-location", { lat, lng, updatedAt });
            try {
                await prisma.order.update({
                    where: { id: orderId },
                    data: { liveLocation: { lat, lng, updatedAt } }
                });
            } catch (error) {
                console.error("Failed to persist live location:", error);
            }
        });

        socket.on("disconnect", () => {
            console.log(`Socket disconnected: ${socket.id}`);
        });
    });

    const port = process.env.PORT || 3000;
    server.listen(port, () => {
        console.log(`Server with WebSocket is running at http://localhost:${port}`);
    });
}

// Export the app for Vercel (@vercel/node) to use as a serverless function.
// On Vercel, do NOT call server.listen() — Vercel manages the request lifecycle.
export default app;
