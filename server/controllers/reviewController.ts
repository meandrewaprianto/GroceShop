import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";

// GET /api/reviews/product/:productId - Get all reviews for a product
export const getProductReviews = async (req: Request, res: Response) => {
    const productId = req.params.productId as string;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Math.min(20, Number(req.query.limit) || 10));
    const userId = req.user?.id;

    try {
        // Get total count
        const totalReviews = await prisma.review.count({
            where: { productId }
        });

        // Get reviews with user info
        const reviews = await prisma.review.findMany({
            where: { productId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit
        });

        // Calculate rating breakdown
        const allReviews = await prisma.review.findMany({
            where: { productId },
            select: { rating: true }
        });

        const breakdown = [0, 0, 0, 0, 0]; // 1-5 stars
        allReviews.forEach(review => {
            if (review.rating >= 1 && review.rating <= 5) {
                breakdown[review.rating - 1]++;
            }
        });

        // Check if user has purchased this product
        let hasPurchased = false;
        if (userId) {
            const userOrders = await prisma.order.findMany({
                where: {
                    userId,
                    status: {
                        in: ['Delivered', 'Completed']
                    }
                },
                select: {
                    items: true
                }
            });

            for (const order of userOrders) {
                const items = order.items as any[];
                if (Array.isArray(items)) {
                    const found = items.some(item =>
                        item.product === productId || item.productId === productId || item.id === productId
                    );
                    if (found) {
                        hasPurchased = true;
                        break;
                    }
                }
            }
        }

        res.json({
            reviews: reviews.map(r => ({
                id: r.id,
                user: {
                    id: r.user.id,
                    name: r.user.name,
                    avatar: r.user.avatar,
                    email: r.user.email
                },
                rating: r.rating,
                comment: r.comment,
                helpful: r.helpful,
                createdAt: r.createdAt,
                updatedAt: r.updatedAt
            })),
            pagination: {
                page,
                limit,
                total: totalReviews,
                totalPages: Math.ceil(totalReviews / limit)
            },
            breakdown: breakdown.reverse(), // 5→1
            hasPurchased
        });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ message: 'Failed to fetch reviews' });
    }
};

// POST /api/reviews - Create a new review
export const createReview = async (req: Request, res: Response) => {
    const productId = req.body.productId as string;
    const rating = req.body.rating as number;
    const comment = req.body.comment as string;
    const userId = req.user?.id;

    if (!userId) {
        res.status(401).json({ message: 'Authentication required' });
        return;
    }

    if (!productId || !rating || rating < 1 || rating > 5) {
        res.status(400).json({ message: 'Invalid rating. Must be between 1 and 5.' });
        return;
    }

    try {
        // Check if product exists
        const product = await prisma.product.findUnique({
            where: { id: productId }
        });

        if (!product) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }

        // Check if user already reviewed this product
        const existingReview = await prisma.review.findUnique({
            where: {
                userId_productId: {
                    userId,
                    productId
                }
            }
        });

        if (existingReview) {
            res.status(409).json({ message: 'You have already reviewed this product' });
            return;
        }

        // Check if user has purchased this product (has order with this product)
        const userOrders = await prisma.order.findMany({
            where: {
                userId,
                status: {
                    in: ['Delivered', 'Completed'] // Only allow review for completed orders
                }
            },
            select: {
                items: true
            }
        });

        // Parse items from orders and check if product exists
        let hasPurchased = false;
        for (const order of userOrders) {
            const items = order.items as any[];
            if (Array.isArray(items)) {
                const found = items.some(item => 
                    item.product === productId || item.productId === productId || item.id === productId
                );
                if (found) {
                    hasPurchased = true;
                    break;
                }
            }
        }

        if (!hasPurchased) {
            res.status(403).json({ 
                message: 'You can only review products you have purchased',
                hasPurchased: false
            });
            return;
        }

        // Create review
        const review = await prisma.review.create({
            data: {
                userId,
                productId,
                rating,
                comment: comment || ''
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true
                    }
                }
            }
        });

        // Update product rating and review count
        const allReviews = await prisma.review.findMany({
            where: { productId },
            select: { rating: true }
        });

        const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
        const averageRating = totalRating / allReviews.length;

        await prisma.product.update({
            where: { id: productId },
            data: {
                rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
                reviewCount: allReviews.length
            }
        });

        res.status(201).json({
            message: 'Review created successfully',
            review: {
                id: review.id,
                user: {
                    id: review.user.id,
                    name: review.user.name,
                    avatar: review.user.avatar,
                    email: review.user.email
                },
                rating: review.rating,
                comment: review.comment,
                helpful: review.helpful,
                createdAt: review.createdAt
            }
        });
    } catch (error: any) {
        console.error('Error creating review:', error);
        res.status(500).json({ message: 'Failed to create review', error: error.message });
    }
};

// PUT /api/reviews/:id - Update a review (user can only update their own)
export const updateReview = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const rating = req.body.rating as number;
    const comment = req.body.comment as string;
    const userId = req.user?.id;

    if (!userId) {
        res.status(401).json({ message: 'Authentication required' });
        return;
    }

    try {
        // Find existing review
        const existingReview = await prisma.review.findUnique({
            where: { id },
            include: { user: true }
        });

        if (!existingReview) {
            res.status(404).json({ message: 'Review not found' });
            return;
        }

        // Check ownership
        if (existingReview.userId !== userId) {
            res.status(403).json({ message: 'You can only update your own reviews' });
            return;
        }

        // Update review
        const updatedReview = await prisma.review.update({
            where: { id },
            data: {
                rating: rating !== undefined ? Math.max(1, Math.min(5, rating)) : undefined,
                comment: comment !== undefined ? comment : undefined
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true
                    }
                }
            }
        });

        // Recalculate product rating
        const allReviews = await prisma.review.findMany({
            where: { productId: existingReview.productId },
            select: { rating: true }
        });

        const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
        const averageRating = totalRating / allReviews.length;

        await prisma.product.update({
            where: { id: existingReview.productId },
            data: {
                rating: Math.round(averageRating * 10) / 10,
                reviewCount: allReviews.length
            }
        });

        res.json({
            message: 'Review updated successfully',
            review: {
                id: updatedReview.id,
                user: {
                    id: updatedReview.user.id,
                    name: updatedReview.user.name,
                    avatar: updatedReview.user.avatar,
                    email: updatedReview.user.email
                },
                rating: updatedReview.rating,
                comment: updatedReview.comment,
                helpful: updatedReview.helpful,
                updatedAt: updatedReview.updatedAt
            }
        });
    } catch (error: any) {
        console.error('Error updating review:', error);
        res.status(500).json({ message: 'Failed to update review', error: error.message });
    }
};

// DELETE /api/reviews/:id - Delete a review (user can only delete their own)
export const deleteReview = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const userId = req.user?.id;

    if (!userId) {
        res.status(401).json({ message: 'Authentication required' });
        return;
    }

    try {
        // Find existing review
        const existingReview = await prisma.review.findUnique({
            where: { id },
            include: { user: true }
        });

        if (!existingReview) {
            res.status(404).json({ message: 'Review not found' });
            return;
        }

        // Check ownership
        if (existingReview.userId !== userId) {
            res.status(403).json({ message: 'You can only delete your own reviews' });
            return;
        }

        // Delete review
        await prisma.review.delete({
            where: { id }
        });

        // Recalculate product rating
        const allReviews = await prisma.review.findMany({
            where: { productId: existingReview.productId },
            select: { rating: true }
        });

        if (allReviews.length > 0) {
            const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
            const averageRating = totalRating / allReviews.length;

            await prisma.product.update({
                where: { id: existingReview.productId },
                data: {
                    rating: Math.round(averageRating * 10) / 10,
                    reviewCount: allReviews.length
                }
            });
        } else {
            // No reviews left, reset to 0
            await prisma.product.update({
                where: { id: existingReview.productId },
                data: {
                    rating: 0,
                    reviewCount: 0
                }
            });
        }

        res.json({ message: 'Review deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting review:', error);
        res.status(500).json({ message: 'Failed to delete review', error: error.message });
    }
};

// POST /api/reviews/:id/helpful - Mark a review as helpful
export const markReviewHelpful = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const userId = req.user?.id;

    if (!userId) {
        res.status(401).json({ message: 'Authentication required' });
        return;
    }

    try {
        const review = await prisma.review.findUnique({
            where: { id }
        });

        if (!review) {
            res.status(404).json({ message: 'Review not found' });
            return;
        }

        // Increment helpful count
        const updatedReview = await prisma.review.update({
            where: { id },
            data: {
                helpful: {
                    increment: 1
                }
            }
        });

        res.json({
            message: 'Review marked as helpful',
            helpful: updatedReview.helpful
        });
    } catch (error: any) {
        console.error('Error marking review as helpful:', error);
        res.status(500).json({ message: 'Failed to mark review as helpful', error: error.message });
    }
};

// GET /api/reviews/recent - Get recent reviews across the store
export const getRecentReviews = async (req: Request, res: Response) => {
    try {
        const reviews = await prisma.review.findMany({
            take: 6,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true
                    }
                },
                product: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        image: true,
                        category: true
                    }
                }
            }
        });

        res.json({ reviews });
    } catch (error) {
        console.error('Error fetching recent reviews:', error);
        res.status(500).json({ message: 'Failed to fetch recent reviews' });
    }
};