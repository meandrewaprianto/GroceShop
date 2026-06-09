import { Link, useNavigate, useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useEffect, useState } from "react";

import Loading from "../components/Loading";
import type { Product } from "../types";
import { ArrowLeftIcon, ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon, HomeIcon, LeafIcon, MinusIcon, PlusIcon, ShoppingCartIcon, StarIcon } from "lucide-react";
import ReviewsSection from "../components/ReviewsSection";
import ProductCard from "../components/ProductCard";
import api from "../config/api";
import { formatPriceToIDR } from "../utils/formatCurrency";

const ProductPage = () => {

    const { id } = useParams();
    const navigate = useNavigate();
    const { items, addToCart, updateQuantity, removeFromCart } = useCart();

    const [product, setProduct] = useState<Product | null>(null);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [localQuantity, setLocalQuantity] = useState(1);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        if (!id) return;

        const fetchProduct = async () => {
            setLoading(true);
            setLocalQuantity(1);
            setCurrentImageIndex(0);
            window.scrollTo(0, 0);

            try {
                // Ambil detail produk
                const { data } = await api.get(`/products/${id}`);
                const foundProduct: Product = data.product;
                setProduct(foundProduct);

                // Ambil produk terkait berdasarkan kategori
                const params = new URLSearchParams({
                    category: foundProduct.category,
                    limit: "6",
                });
                const { data: relatedData } = await api.get(`/products?${params.toString()}`);
                const related: Product[] = (relatedData.products ?? []).filter((p: Product) => p.id !== id);
                setRelatedProducts(related.slice(0, 5));
            } catch (error) {
                console.error("Failed to fetch product:", error);
                setProduct(null);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id])

    if (loading) return <Loading />
    if (!product) return null

    const cartItem = items.find((item) => item.product.id === product.id);
    const inCart = !!cartItem;
    const displayQuantity = inCart ? cartItem.quantity : localQuantity;

    // Get all available images (from `images` array or fallback to single `image`)
    const allImages = product.images && product.images.length > 0
        ? product.images
        : [product.image];

    const categoryLabel = product.category.replace(/-/g, " ");

    const handleMinus = () => {
        if (inCart) {
            if (cartItem.quantity > 1) {
                updateQuantity(product.id, cartItem.quantity - 1);
            } else {
                removeFromCart(product.id);
                setLocalQuantity(1); // Sinkronisasi kembali ke 1 setelah dihapus
            }
        } else {
            setLocalQuantity(Math.max(1, localQuantity - 1));
        }
    }

    const handlePlus = () => {
        if (inCart) {
            updateQuantity(product.id, cartItem.quantity + 1);
        } else {
            // Otomatis masukkan ke keranjang jika belum ada
            addToCart(product, localQuantity + 1);
        }
    }

    return (
        <div className="min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-app-text-light mb-6">
                    <Link to='/' className="hover:text-app-green transition-colors">
                        <HomeIcon className="size-4" />
                    </Link>
                    <span>/</span>
                    <Link to='/products' className="hover:text-app-green transition-colors">
                        Products
                    </Link>
                    <span>/</span>
                    <Link to={`/products?category=${product.category}`} className="hover:text-app-green transition-colors capitalize">
                        {categoryLabel}
                    </Link>
                    <span>/</span>
                    <span className="text-app-green font-medium truncate max-w-[200px]">{product.name}</span>
                </nav>

                {/* Back Button */}
                <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-1.5 text-sm text-app-text-light hover:text-app-green transition-colors">
                    <ArrowLeftIcon className="size-4" /> Back
                </button>

                {/* Product Detail Section */}
                <div className="bg-white/50 dark:bg-[#1a2332] rounded-2xl overflow-hidden dark:border dark:border-app-border/40">
                    <div className="grid md:grid-cols-2 gap-0">
                        {/* Left Side - Image Slider */}
                        <div className="relative flex flex-col items-center justify-center p-8 md:p-12 min-h-[320px] md:min-h-[480px] dark:bg-[#151d2a]">
                            {/* Main image */}
                            <div className="relative w-full flex-center flex-1">
                                <img
                                    src={allImages[currentImageIndex]}
                                    alt={product.name}
                                    className="max-h-[320px] w-auto object-contain"
                                />
                            </div>

                            {/* Navigation Arrows */}
                            {allImages.length > 1 && (
                                <>
                                    <button
                                        onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1))}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 size-9 rounded-full bg-white/80 hover:bg-white shadow-md flex-center transition-all z-10"
                                    >
                                        <ChevronLeftIcon className="size-5 text-zinc-700" />
                                    </button>
                                    <button
                                        onClick={() => setCurrentImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1))}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 size-9 rounded-full bg-white/80 hover:bg-white shadow-md flex-center transition-all z-10"
                                    >
                                        <ChevronRightIcon className="size-5 text-zinc-700" />
                                    </button>
                                </>
                            )}

                            {/* Thumbnails */}
                            {allImages.length > 1 && (
                                <div className="flex gap-2 mt-4">
                                    {allImages.map((img, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentImageIndex(i)}
                                            className={`size-14 rounded-lg border-2 overflow-hidden transition-all ${
                                                i === currentImageIndex ? "border-app-green opacity-100" : "border-transparent opacity-60 hover:opacity-80"
                                            }`}
                                        >
                                            <img src={img} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Badges */}
                            <div className="absolute top-5 left-5 flex flex-wrap gap-1.5">
                                {product.isOrganic && (
                                    <span className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-app-green text-white rounded-full">
                                        <LeafIcon className="w-3 h-3" />
                                        Organic
                                    </span>
                                )}
                                {product.discount > 0 && (
                                    <span className="px-2.5 py-1 text-xs font-semibold bg-app-orange text-white rounded-full">
                                        {product.discount}% OFF
                                    </span>
                                )}
                            </div>
                        </div>


                        {/* Right Side - Details */}
                        <div className="p-6 md:p-10 flex flex-col justify-center">
                            <span className="text-xs font-medium text-app-text-light tracking-wider mb-2 capitalize">{categoryLabel}</span>

                            <h1 className="text-2xl md:text-3xl font-semibold text-app-green mb-3">{product.name}</h1>

                            {/* Rating */}
                            {product.rating > 0 && (
                                <div className="flex items-center gap-2 mb-5">
                                    <div className="flex items-center gap-0.5">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <StarIcon key={star} className={`w-4 h-4 ${star <= Math.round(product.rating) ? "text-app-warning fill-app-warning" : "text-app-border"}`} />
                                        ))}
                                    </div>
                                    <span className="text-sm font-medium">{product.rating}</span>
                                    <span className="text-sm text-app-text-light">({product.reviewCount} reviews)</span>
                                </div>
                            )}

                            {/* Price */}
                            <div className="flex items-baseline gap-3 mb-5 ">
                                <span className="text-3xl md:text-4xl font-semibold text-app-green">{formatPriceToIDR(product.price)}</span>
                                {product.originalPrice > product.price && (
                                    <span className="text-lg text-app-text-light line-through">{formatPriceToIDR(product.originalPrice)}</span>
                                )}
                            </div>

                            {/* Description */}
                            <p className="text-sm text-app-text-light leading-relaxed mb-6">{product.description}</p>

                            {/* Stock */}
                            <div className="mb-6">
                                {product.stock > 0 ? (
                                    <span className="text-sm text-app-success font-medium">
                                        In Stock ({product.stock} available)
                                    </span>
                                ) : (
                                    <span className="text-sm text-app-error font-medium">
                                        Out of Stock
                                    </span>
                                )}
                            </div>

                            {/* Quantity + Add To Cart */}
                            <div className="flex items-center gap-3">
                                {/* Quantity */}
                                <div className="flex items-center border border-app-border rounded-xl overflow-hidden">
                                    <button onClick={handleMinus} className="p-3 hover:bg-app-cream transition-colors">
                                        <MinusIcon className="w-4 h-4" />
                                    </button>
                                    <span className="px-5 text-sm font-semibold min-w-[40px] text-center">{displayQuantity}</span>
                                    <button onClick={handlePlus} className="p-3 hover:bg-app-cream transition-colors">
                                        <PlusIcon className="w-4 h-4" />
                                    </button>
                                </div>
                                {/* Add to Cart */}
                                <button
                                    onClick={() => {
                                        if (!inCart) addToCart(product, localQuantity);
                                    }}
                                    disabled={product.stock === 0}
                                    className={`flex-1 py-3 font-semibold rounded-xl transition-colors flex-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] ${inCart ? "bg-app-cream text-app-green border border-app-green" : "bg-app-orange text-white hover:bg-app-orange-dark"}`}>
                                    <ShoppingCartIcon className="w-4 h-4" />
                                    {inCart ? "Added to Cart" : "Add to Cart"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Customer Reviews */}
                <ReviewsSection
                    productId={product.id}
                    productRating={product.rating}
                    productReviewCount={product.reviewCount}
                    onReviewsUpdate={() => {
                        // Refresh product data to update rating and review count
                        const refreshProduct = async () => {
                            const { data } = await api.get(`/products/${product.id}`);
                            setProduct(data.product);
                        };
                        refreshProduct();
                    }}
                />

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <section className="mt-12 mb-44">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-semibold text-app-green">Related Products</h2>
                                <p className="text-sm text-app-text-light mt-1">More from {categoryLabel}</p>
                            </div>
                            <Link className="text-sm font-semibold text-app-orange hover:text-app-orange-dark flex items-center gap-1 transition-colors" to={`/products?category=${product.category}`}>
                                View All <ArrowRightIcon className="size-4" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 xl:gap-8">
                            {relatedProducts.slice(0, 5).map((rp) => (
                                <ProductCard key={rp.id} product={rp} />
                            ))}
                        </div>
                    </section>
                )}

            </div>
        </div>
    )
}

export default ProductPage