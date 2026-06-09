import { useEffect, useState } from "react";
import { heroSectionData } from "../../assets/assets";
import { StarIcon, ShoppingCart, PlusIcon, MinusIcon } from "lucide-react";
import { useCart } from "../../context/CartContext";
import api from "../../config/api";
import toast from "react-hot-toast";
import type { Product } from "../../types";

const Hero = () => {
    const [activeProduct, setActiveProduct] = useState<Product | null>(null);
    const [quantity, setQuantity] = useState(1);
    const { addToCart } = useCart();

    useEffect(() => {
        api.get("/products")
            .then(({ data }) => {
                const dbProds = data.products || [];
                if (dbProds.length > 0) {
                    // Choose a highlighted product that is stable for the current calendar day
                    const today = new Date();
                    const dateSeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
                    const dailyProduct = dbProds[dateSeed % dbProds.length];
                    setActiveProduct(dailyProduct);
                }
            })
            .catch((err) => {
                console.error("Failed to load products for highlight:", err);
            });
    }, []);

    const handleAddToCart = () => {
        if (activeProduct) {
            addToCart(activeProduct, quantity);
            toast.success(`${quantity} ${activeProduct.name} dimasukkan ke keranjang! 🛒`);
        }
    };

    const currentPrice = activeProduct ? activeProduct.price * quantity : 0;
    const currentOriginalPrice = activeProduct && activeProduct.originalPrice ? activeProduct.originalPrice * quantity : null;

    return (
        <section className="relative overflow-hidden min-h-[500px] mb-10 rounded-3xl flex items-center p-6 sm:p-12 shadow-md">
            <img src={heroSectionData.hero_image} alt="Hero Background" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-green-950/80 to-transparent" />
            
            <div className="relative max-w-7xl mx-auto w-full z-10 grid md:grid-cols-12 gap-8 items-center">
                {/* Left Side: Product Details */}
                <div className="md:col-span-7 text-white">
                    <div className="flex flex-wrap gap-2 items-center mb-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-orange-300 bg-orange-300/10 rounded-full">
                            <StarIcon className="size-3 fill-orange-300 text-orange-300" /> Sorotan Hari Ini
                        </span>
                        {activeProduct && activeProduct.isOrganic && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-emerald-300 bg-emerald-400/15 rounded-full">
                                100% Organik
                            </span>
                        )}
                    </div>

                    {!activeProduct ? (
                        <div className="py-10 space-y-4">
                            <div className="size-10 border-4 border-orange-300 border-t-transparent rounded-full animate-spin" />
                            <p className="text-white/80 font-medium text-sm animate-pulse">
                                Memuat produk unggulan...
                            </p>
                        </div>
                    ) : (
                        <>
                            <h1 className="font-serif text-3xl sm:text-4.5xl lg:text-5.5xl leading-tight mb-4 text-white">
                                {activeProduct.name}
                            </h1>
                            <div className="relative border-l-2 border-orange-300/60 pl-4 my-6 py-1">
                                <p className="text-sm sm:text-base text-white/90 leading-relaxed">
                                    {activeProduct.description}
                                </p>
                            </div>

                            {/* Product Info Badges (Rating only) */}
                            {activeProduct.rating && activeProduct.rating > 0 ? (
                                <div className="flex flex-wrap gap-4 text-xs font-medium text-white/80 mb-6">
                                    <div className="flex items-center gap-1.5 px-3 py-2 bg-white/5 rounded-xl border border-white/10">
                                        <StarIcon className="size-3.5 text-orange-300 fill-orange-300" />
                                        <span>{activeProduct.rating} ({activeProduct.reviewCount} ulasan)</span>
                                    </div>
                                </div>
                            ) : null}
                        </>
                    )}
                </div>

                {/* Right Side: Product Card */}
                <div className="md:col-span-5 relative">
                    {activeProduct && (
                        <div className="relative backdrop-blur-md bg-white/10 dark:bg-zinc-900/40 border border-white/20 rounded-3xl p-6 text-white shadow-xl max-w-sm mx-auto transition-all duration-300 hover:shadow-2xl">
                            {/* Product Image Container */}
                            <div className="relative aspect-square w-full rounded-2xl overflow-hidden mb-5 bg-white/5 flex items-center justify-center border border-white/10 p-4">
                                <img 
                                    src={activeProduct.image} 
                                    alt={activeProduct.name} 
                                    className="max-h-full max-w-full object-contain select-none" 
                                />
                            </div>

                            {/* Content Layer */}
                            <div className="space-y-4">
                                <div className="text-xs font-semibold text-white/70 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span>Kategori:</span>
                                        <span className="text-orange-300 capitalize font-bold">{activeProduct.category.replace("-", " ")}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>Stok Tersedia:</span>
                                        <span className="text-white font-bold">{activeProduct.stock || 0} unit</span>
                                    </div>
                                </div>

                                <div className="border-t border-white/10 pt-3">
                                    {currentOriginalPrice && currentOriginalPrice > currentPrice ? (
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center text-xs text-white/50">
                                                <span>Harga Normal:</span>
                                                <span className="line-through">Rp {currentOriginalPrice.toLocaleString("id-ID")}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-emerald-300 font-bold bg-emerald-400/20 px-1.5 py-0.5 rounded">
                                                    Diskon menjadi:
                                                </span>
                                                <span className="text-2xl font-black text-orange-300">
                                                    Rp {currentPrice.toLocaleString("id-ID")}
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-white/70 font-semibold">Harga:</span>
                                            <span className="text-2xl font-black text-orange-300">
                                                Rp {currentPrice.toLocaleString("id-ID")}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between border-y border-white/10 py-3 text-sm">
                                    <span className="text-white/70">Jumlah ({activeProduct.unit || "item"})</span>
                                    <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
                                        <button 
                                            onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                                            className="p-1 hover:text-orange-300 transition-colors cursor-pointer"
                                        >
                                            <MinusIcon className="size-3.5" />
                                        </button>
                                        <span className="font-bold text-sm min-w-4 text-center">{quantity}</span>
                                        <button 
                                            onClick={() => setQuantity(prev => Math.min(activeProduct.stock || 99, prev + 1))}
                                            className="p-1 hover:text-orange-300 transition-colors cursor-pointer"
                                        >
                                            <PlusIcon className="size-3.5" />
                                        </button>
                                    </div>
                                </div>

                                <button
                                    onClick={handleAddToCart}
                                    className="w-full py-3.5 bg-app-orange hover:bg-app-orange-dark text-white font-bold rounded-2xl transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-app-orange/20 cursor-pointer text-sm sm:text-base"
                                >
                                    <ShoppingCart className="size-4 shrink-0" /> Beli Sekarang
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default Hero;