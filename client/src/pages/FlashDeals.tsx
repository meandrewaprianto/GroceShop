import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom";
import type { Product } from "../types";
import { Zap } from "lucide-react";
import Loading from "../components/Loading";
import ProductCard from "../components/ProductCard";
import api from "../config/api";

const FlashDeals = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);

    const page = Number(searchParams.get("page")) || 1;
    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        const fetchFlashDeals = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams({
                    page: String(page),
                    limit: String(ITEMS_PER_PAGE),
                    minDiscount: "10",
                    inStock: "true",
                });

                const { data } = await api.get(`/products/flash-deals?${params.toString()}`);

                const fetchedProducts: Product[] = data.products ?? [];
                setProducts(fetchedProducts);
                setTotalPages(data.totalPages ?? 1);
            } catch (error) {
                console.error("Failed to fetch flash deals:", error);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchFlashDeals();
    }, [page])

    const handlePageChange = (newPage: number) => {
        setSearchParams({ page: String(newPage) });
        window.scrollTo(0, 0);
    };

    return (
        <div className="min-h-screen bg-app-cream">
            {/* Banner */}
            <div className="bg-linear-to-r from-app-orange to-app-orange-dark text-white py-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="flex-center gap-2 mb-3">
                        <Zap className="size-6 fill-white" />
                        <h1 className="text-3xl font-semibold">Flash Deals</h1>
                        <Zap className="size-6 fill-white" />
                    </div>
                    <p className="text-white/80 max-w-md mx-auto">Limited-time offers on your favorite orgnaic products. Grab them before they're gone!</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {loading ? (<Loading />) : (
                    products.length === 0 ? (
                        <div className="text-center py-16">
                            <Zap className="size-6 text-app-border mx-auto mb-4" />
                            <h2 className="text-lg font-semibold text-app-green mb-2">
                                No deals right now
                            </h2>
                            <p className="text-sm text-app-text-light">Check back soon for amazing offers!</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
                                {products.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex justify-center items-center gap-2 mt-16">
                                    {Array.from({ length: totalPages }).map((_, i) => (
                                        <button key={i}
                                            onClick={() => handlePageChange(i + 1)}
                                            className={`size-9 rounded-lg text-sm font-medium transition-colors ${page === i + 1 ? "bg-app-orange text-white" : "bg-white text-app-text-light hover:bg-app-cream"}`}>
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </>
                    )
                )}
            </div>
        </div>
    )
}

export default FlashDeals