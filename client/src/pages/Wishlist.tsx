import { useWishlist } from "../context/WishlistContext";
import ProductCard from "../components/ProductCard";
import Loading from "../components/Loading";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";

export default function Wishlist() {
    const { wishlist, loading, wishlistCount } = useWishlist();

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-slate-100 flex items-center gap-2">
                    <Heart className="size-6 text-red-500 fill-red-500" />
                    My Wishlist
                </h1>
                <p className="text-sm text-zinc-500 mt-1">{wishlistCount} saved items</p>
            </div>

            {loading ? (
                <Loading />
            ) : wishlist.length === 0 ? (
                <div className="text-center py-20">
                    <Heart className="size-16 text-zinc-300 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-zinc-700 dark:text-slate-300 mb-2">Your wishlist is empty</h2>
                    <p className="text-zinc-500 mb-6">Save your favorite items here!</p>
                    <Link
                        to="/products"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-app-orange text-white rounded-full font-medium hover:bg-orange-600 transition-colors"
                    >
                        Browse Products
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {wishlist.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
}