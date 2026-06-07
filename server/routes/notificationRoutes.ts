import express from "express";
import { getVapidPublicKey, subscribe, unsubscribe, testNotification, testNotificationAll, getSubscriptionStatus } from "../controllers/notificationController.js";
import auth from "../middleware/auth.js";
import admin from "../middleware/admin.js";

const notificationRouter = express.Router();

notificationRouter.get("/vapid-public-key", getVapidPublicKey);
notificationRouter.post("/subscribe", auth, subscribe);
notificationRouter.post("/unsubscribe", auth, unsubscribe);
notificationRouter.post("/test", auth, testNotification);
notificationRouter.post("/test-all", auth, admin, testNotificationAll);
notificationRouter.get("/status", auth, getSubscriptionStatus);

export default notificationRouter;
