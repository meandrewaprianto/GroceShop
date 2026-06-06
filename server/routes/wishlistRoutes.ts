import express from "express";
import { getWishlist, toggleWishlist, checkWishlist } from "../controllers/wishlistController.js";
import auth from "../middleware/auth.js";

const wishlistRouter = express.Router();

wishlistRouter.get("/", auth, getWishlist);
wishlistRouter.post("/:productId", auth, toggleWishlist);
wishlistRouter.get("/check/:productId", auth, checkWishlist);

export default wishlistRouter;