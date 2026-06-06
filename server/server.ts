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

import http from "http";
import { Server } from "socket.io";
import { prisma } from "./config/prisma.js";
import { stripeWebhook } from "./controllers/webhooks.js";

const app = express();
app.post("/api/stripe", express.raw({ type: 'application/json'}), stripeWebhook)
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});
app.set("io", io);

// WebSocket Server Logics
io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Customer joins room by order ID (for order tracking updates)
    socket.on("join-order-room", (orderId: string) => {
        socket.join(`order:${orderId}`);
        console.log(`Socket ${socket.id} joined room: order:${orderId}`);
    });

    // Delivery partner joins their personal room (for new assignment notifications)
    socket.on("join-partner-room", (partnerId: string) => {
        socket.join(`partner:${partnerId}`);
        console.log(`Socket ${socket.id} joined room: partner:${partnerId}`);
    });

    // Send real-time coordinates from courier to customer & save to database
    socket.on("send-live-location", async (data: { orderId: string; lat: number; lng: number }) => {
        const { orderId, lat, lng } = data;
        const updatedAt = new Date();

        // Broadcast directly to customer in same room
        socket.to(`order:${orderId}`).emit("receive-live-location", { lat, lng, updatedAt });

        // Persist to database asynchronously
        try {
            await prisma.order.update({
                where: { id: orderId },
                data: {
                    liveLocation: { lat, lng, updatedAt }
                }
            });
        } catch (error) {
            console.error("Failed to persist live location to database:", error);
        }
    });

    socket.on("disconnect", () => {
        console.log(`Socket disconnected: ${socket.id}`);
    });
});

//Middleware
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3000;

app.get('/', (req: Request, res: Response) => {
    res.send('Server is live');
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
    console.error(error);
    res.status(500).json({ message: error.message })

})

server.listen(port, () => {
    console.log(`Server with WebSocket is running at http://localhost:${port}`);
})