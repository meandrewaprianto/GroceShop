import { useState, useCallback, useRef, useEffect } from "react";
import { StarIcon, ThumbsUpIcon, PencilIcon, Trash2Icon, SendIcon } from "lucide-react";
import type { Review, ReviewResponse } from "../types";
import { useAuth } from "../context/AuthContext";
import api from "../config/api";
import toast from "react-hot-toast";

interface ReviewsSectionProps {
    productId: string;
    productRating: number;
    productReviewCount: number;
    onReviewsUpdate: () => void;
}

export default function ReviewsSection({ productId, productRating, productReviewCount, onReviewsUpdate }: ReviewsSectionProps) {
    const { user, token } = useAuth();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [breakdown, setBreakdown] = useState<number[]>([0, 0, 0, 0, 0]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [newRating, setNewRating] = useState(0);
    const [newComment, setNewComment] = useState("");
    const [hoveredRating, setHoveredRating] = useState(0);
    const [userReview, setUserReview] = useState<Review | null>(null);
    const [hasPurchased, setHasPurchased] = useState(false);
    const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
    const [editComment, setEditComment] = useState("");
    const [editRating, setEditRating] = useState(0);

    // Use ref to track if we should update userReview
    const shouldUpdateUserReview = useRef(true);
    const isMounted = useRef(true);

    const fetchReviews = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await api.get<ReviewResponse>(`/reviews/product/${productId}`);
            if (!isMounted.current) return;
            setReviews(data.reviews);
            setBreakdown(data.breakdown);
            if (data.hasPurchased !== undefined) {
                setHasPurchased(data.hasPurchased);
            }

            if (user && shouldUpdateUserReview.current) {
                const myReview = data.reviews.find(r => r.user.id === user.id);
                if (myReview) {
                    setUserReview(myReview);
                }
            }
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
        } finally {
            if (isMounted.current) {
                setLoading(false);
            }
        }
    }, [productId, user]);

    // Fetch reviews on mount and when productId changes
    // Note: This effect fetches data which triggers state updates - this is expected behavior
    // for data fetching in React components. The ESLint warning about cascading renders is
    // acknowledged but acceptable in this case as we need to load reviews when the component mounts.
    useEffect(() => {
        const loadData = async () => {
            await fetchReviews();
        };
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [productId]);

    const handleSubmitReview = async () => {
        if (!token) {
            toast.error('Please login to submit a review');
            return;
        }

        if (newRating < 1 || newRating > 5) {
            toast.error('Please select a rating');
            return;
        }

        try {
            setSubmitting(true);
            await api.post('/reviews', {
                productId,
                rating: newRating,
                comment: newComment
            });
            toast.success('Review submitted successfully!');
            setNewRating(0);
            setNewComment('');
            fetchReviews();
            onReviewsUpdate();
        } catch (error: unknown) {
            const err = error as { response?: { status?: number; data?: { message?: string } } };
            if (err.response?.status === 409) {
                toast.error('You have already reviewed this product');
            } else {
                toast.error(err.response?.data?.message || 'Failed to submit review');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateReview = async (reviewId: string) => {
        if (editRating < 1 || editRating > 5) {
            toast.error('Please select a rating');
            return;
        }

        try {
            setSubmitting(true);
            await api.put(`/reviews/${reviewId}`, {
                rating: editRating,
                comment: editComment
            });
            toast.success('Review updated successfully!');
            setEditingReviewId(null);
            fetchReviews();
            onReviewsUpdate();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Failed to update review');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteReview = async (reviewId: string) => {
        if (!confirm('Are you sure you want to delete your review?')) return;

        try {
            await api.delete(`/reviews/${reviewId}`);
            toast.success('Review deleted successfully!');
            fetchReviews();
            onReviewsUpdate();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Failed to delete review');
        }
    };

    const handleMarkHelpful = async (reviewId: string) => {
        if (!token) {
            toast.error('Please login to mark reviews as helpful');
            return;
        }

        try {
            const { data } = await api.post(`/reviews/${reviewId}/helpful`);
            setReviews(reviews.map(r =>
                r.id === reviewId ? { ...r, helpful: data.helpful } : r
            ));
            toast.success('Thanks for your feedback!');
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Failed to mark as helpful');
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const maxBreakdown = Math.max(...breakdown, 1);

    if (loading) {
        return (
            <section className="mt-10">
                <h2 className="text-2xl font-semibold text-app-green mb-6">Customer Reviews</h2>
                <div className="bg-white/50 rounded-2xl p-6 md:p-8">
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-app-green"></div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="mt-10">
            <h2 className="text-2xl font-semibold text-app-green mb-6">Customer Reviews</h2>

            <div className="bg-white/50 rounded-2xl p-6 md:p-8">
                {/* Summary row */}
                <div className="flex flex-col md:flex-row gap-8 mb-8 pb-8 border-b border-app-border">
                    {/* Average */}
                    <div className="flex-center flex-col md:min-w-[160px] lg:w-1/3">
                        <span className="text-5xl font-semibold text-app-green">{productRating > 0 ? productRating.toFixed(1) : '0.0'}</span>
                        <div className="flex items-center gap-0.5 mt-2 mb-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <StarIcon key={s} className={`size-4 ${s <= Math.round(productRating) ? "text-app-warning fill-app-warning" : "text-app-border"}`} />
                            ))}
                        </div>
                        <span className="text-sm text-zinc-600">{productReviewCount} reviews</span>
                    </div>

                    {/* Breakdown bars */}
                    <div className="flex-1 space-y-2">
                        {breakdown.map((count, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <span className="text-sm text-zinc-600 w-8 text-right">{5 - i} ★</span>
                                <div className="flex-1 h-2.5 bg-app-border rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-app-warning rounded-full transition-all duration-500"
                                        style={{ width: `${(count / maxBreakdown) * 100}%` }}
                                    />
                                </div>
                                <span className="text-xs text-zinc-600 w-6">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Write a review form - only show if user has purchased this product */}
                {!userReview && hasPurchased && (
                    <div className="mb-8 pb-8 border-b border-app-border">
                        <h3 className="text-lg font-semibold text-app-green mb-4">Write a Review</h3>
                        {token ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-app-text mb-2">Your Rating</label>
                                    <div className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setNewRating(star)}
                                                onMouseEnter={() => setHoveredRating(star)}
                                                onMouseLeave={() => setHoveredRating(0)}
                                                className="p-1 hover:scale-110 transition-transform"
                                            >
                                                <StarIcon
                                                    className={`size-6 ${star <= (hoveredRating || newRating)
                                                        ? "text-app-warning fill-app-warning"
                                                        : "text-app-border"
                                                        }`}
                                                />
                                            </button>
                                        ))}
                                        {newRating > 0 && (
                                            <span className="ml-2 text-sm text-app-text">{newRating} star{newRating > 1 ? 's' : ''}</span>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-app-text mb-2">Your Review</label>
                                    <textarea
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Share your experience with this product..."
                                        rows={4}
                                        className="w-full px-4 py-3 rounded-xl border border-app-border focus:outline-none focus:ring-2 focus:ring-app-green-light focus:border-transparent resize-none"
                                    />
                                </div>
                                <button
                                    onClick={handleSubmitReview}
                                    disabled={submitting || newRating === 0}
                                    className="flex items-center gap-2 px-6 py-3 bg-app-green text-white rounded-xl font-semibold hover:bg-app-green-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <SendIcon className="size-4" />
                                    {submitting ? 'Submitting...' : 'Submit Review'}
                                </button>
                            </div>
                        ) : (
                            <p className="text-sm text-app-text-light">
                                Please <a href="/login" className="text-app-green font-semibold hover:underline">login</a> to write a review.
                            </p>
                        )}
                    </div>
                )}

                {/* Individual reviews */}
                <div className="space-y-6">
                    {reviews.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-app-text-light">No reviews yet. Be the first to review this product!</p>
                        </div>
                    ) : (
                        reviews.map((review) => {
                            const isMyReview = user && review.user.id === user.id;
                            const isEditing = editingReviewId === review.id;

                            return (
                                <div key={review.id} className="flex gap-4">
                                    <div className="size-10 rounded-full bg-app-green/10 text-app-green flex-center shrink-0 text-sm font-semibold">
                                        {review.user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center flex-wrap gap-2 mb-1">
                                            <span className="text-sm font-semibold text-app-text">{review.user.name}</span>
                                            {isMyReview && (
                                                <span className="text-xs px-2 py-0.5 bg-app-green/10 text-app-green rounded-full">You</span>
                                            )}
                                            <span className="text-xs text-zinc-600">·</span>
                                            <span className="text-xs text-zinc-600">{formatDate(review.createdAt)}</span>
                                        </div>

                                        {isEditing ? (
                                            <div className="space-y-3 mt-2">
                                                <div className="flex items-center gap-1">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <button
                                                            key={star}
                                                            type="button"
                                                            onClick={() => setEditRating(star)}
                                                            className="p-1"
                                                        >
                                                            <StarIcon
                                                                className={`size-4 ${star <= editRating
                                                                    ? "text-app-warning fill-app-warning"
                                                                    : "text-app-border"
                                                                    }`}
                                                            />
                                                        </button>
                                                    ))}
                                                </div>
                                                <textarea
                                                    value={editComment}
                                                    onChange={(e) => setEditComment(e.target.value)}
                                                    rows={3}
                                                    className="w-full px-3 py-2 rounded-lg border border-app-border focus:outline-none focus:ring-2 focus:ring-app-green-light resize-none"
                                                />
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleUpdateReview(review.id)}
                                                        disabled={submitting}
                                                        className="px-4 py-2 bg-app-green text-white rounded-lg text-sm font-medium hover:bg-app-green-light transition-colors disabled:opacity-50"
                                                    >
                                                        Save Changes
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setEditingReviewId(null);
                                                            setEditComment('');
                                                            setEditRating(0);
                                                        }}
                                                        className="px-4 py-2 bg-app-cream text-app-text rounded-lg text-sm font-medium hover:bg-app-cream-dark transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex items-center gap-0.5 mb-2">
                                                    {[1, 2, 3, 4, 5].map((s) => (
                                                        <StarIcon
                                                            key={s}
                                                            className={`size-3.5 ${s <= review.rating ? "text-app-warning fill-app-warning" : "text-app-border"}`}
                                                        />
                                                    ))}
                                                </div>
                                                <p className="text-sm text-zinc-600 leading-relaxed">{review.comment}</p>
                                            </>
                                        )}

                                        {!isEditing && (
                                            <div className="flex items-center gap-4 mt-2">
                                                <button
                                                    onClick={() => handleMarkHelpful(review.id)}
                                                    className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-app-green transition-colors"
                                                >
                                                    <ThumbsUpIcon className="size-3.5" /> Helpful ({review.helpful})
                                                </button>
                                                {isMyReview && (
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setEditingReviewId(review.id);
                                                                setEditComment(review.comment);
                                                                setEditRating(review.rating);
                                                            }}
                                                            className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-app-green transition-colors"
                                                        >
                                                            <PencilIcon className="size-3.5" /> Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteReview(review.id)}
                                                            className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-app-error transition-colors"
                                                        >
                                                            <Trash2Icon className="size-3.5" /> Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </section>
    );
}