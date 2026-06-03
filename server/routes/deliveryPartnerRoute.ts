import express from "express";
import { cancelDelivery, completeDelivery, getDeliveryDetail, getMyDelivery, loginPartner, updateDeliveryLocation, updateDeliveryStatus } from "../controllers/deliveryController.js";
import deliveryAuth from "../middleware/deliveryAuth.js";

const deliveryPartnerRouter = express.Router();

deliveryPartnerRouter.post("/login", loginPartner);
deliveryPartnerRouter.get("/my-deliveries", deliveryAuth, getMyDelivery);
deliveryPartnerRouter.get("/my-deliveries/:id", deliveryAuth, getDeliveryDetail);
deliveryPartnerRouter.put("/my-deliveries/:id/complete", deliveryAuth, completeDelivery);
deliveryPartnerRouter.put("/my-deliveries/:id/cancel", deliveryAuth, cancelDelivery);
deliveryPartnerRouter.put("/my-deliveries/:id/status", deliveryAuth, updateDeliveryStatus);
deliveryPartnerRouter.put("/my-deliveries/:id/location", deliveryAuth, updateDeliveryLocation);


export default deliveryPartnerRouter;
