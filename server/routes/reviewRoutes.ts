import { Router } from "express";
import {
    getProductReviews,
    createReview,
    updateReview,
    deleteReview,
    markReviewHelpful
} from "../controllers/reviewController.js";
import auth, { optionalAuth } from "../middleware/auth.js";

const router = Router();

// GET /api/reviews/product/:productId - Get all reviews for a product (public, optional auth)
router.get("/product/:productId", optionalAuth, getProductReviews);

// POST /api/reviews - Create a new review (requires auth)
router.post("/", auth, createReview);

// PUT /api/reviews/:id - Update a review (requires auth, own review only)
router.put("/:id", auth, updateReview);

// DELETE /api/reviews/:id - Delete a review (requires auth, own review only)
router.delete("/:id", auth, deleteReview);

// POST /api/reviews/:id/helpful - Mark a review as helpful (requires auth)
router.post("/:id/helpful", auth, markReviewHelpful);

export default router;