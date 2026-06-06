import express from "express";
import { getVapidPublicKey, subscribe, unsubscribe } from "../controllers/notificationController.js";
import auth from "../middleware/auth.js";

const notificationRouter = express.Router();

notificationRouter.get("/vapid-public-key", getVapidPublicKey);
notificationRouter.post("/subscribe", auth, subscribe);
notificationRouter.post("/unsubscribe", auth, unsubscribe);

export default notificationRouter;