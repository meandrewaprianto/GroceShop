import { useEffect, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon, QuoteIcon, StarIcon } from "lucide-react";
import api from "../../config/api";

const AppPromoBanner = () => {
    const [reviews, setReviews] = useState<any[]>([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/reviews/recent")
            .then(({ data }) => {
                setReviews(data.reviews || []);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to load recent reviews:", err);
                setLoading(false);
            });
    }, []);

    // Auto-slide every 6 seconds
    useEffect(() => {
        if (reviews.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % reviews.length);
        }, 6000);
        return () => clearInterval(interval);
    }, [reviews.length]);

    const handleNext = () => {
        if (reviews.length === 0) return;
        setCurrentSlide((prev) => (prev + 1) % reviews.length);
    };

    const handlePrev = () => {
        if (reviews.length === 0) return;
        setCurrentSlide((prev) => (prev - 1 + reviews.length) % reviews.length);
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto py-16 text-center text-zinc-500">
                <div className="size-8 border-4 border-app-orange border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm font-medium">Memuat ulasan asli pelanggan...</p>
            </div>
        );
    }

    if (reviews.length === 0) {
        return (
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 my-10 bg-app-cream border border-app-border rounded-3xl text-center">
                <p className="text-zinc-500 font-medium">Belum ada review produk nyata dari pelanggan saat ini. Jadilah yang pertama memberikan review!</p>
            </section>
        );
    }

    const activeSlide = reviews[currentSlide];

    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 my-14 bg-gradient-to-br from-green-950 via-emerald-900 to-green-950 rounded-3xl relative overflow-hidden shadow-lg border border-green-900/40">
            {/* Background design elements */}
            <div className="absolute -top-10 -left-10 size-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -right-10 size-40 bg-orange-400/10 rounded-full blur-2xl pointer-events-none" />
 
            <div className="relative z-10 max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h2 className="font-serif text-3xl sm:text-4xl text-white">Review Nyata Pelanggan Kami</h2>
                    <p className="text-white/60 text-sm mt-1">Ulasan asli 100% dari basis data pembeli terverifikasi</p>
                </div>
 
                {/* Carousel Card Container */}
                <div className="flex flex-col justify-center items-center text-center min-h-[220px] max-w-2xl mx-auto">
                    {/* Customer Review Quote */}
                    <div className="flex flex-col justify-center items-center text-white space-y-4 w-full">
                        <div className="flex justify-center text-orange-300">
                            {Array.from({ length: activeSlide.rating }).map((_, i) => (
                                <StarIcon key={i} className="size-4 fill-orange-300 stroke-orange-300" />
                            ))}
                        </div>
 
                        <div className="relative w-full">
                            <QuoteIcon className="absolute -top-4 left-0 md:left-4 size-8 text-white/5 pointer-events-none transform -scale-x-100" />
                            <p className="font-serif text-lg sm:text-xl text-white/95 leading-relaxed italic px-8">
                                "{activeSlide.comment || "Produk yang sangat bagus!"}"
                            </p>
                        </div>
 
                        <div className="flex items-center justify-center gap-3 mt-4">
                            {activeSlide.user?.avatar ? (
                                <img src={activeSlide.user.avatar} alt={activeSlide.user.name} className="size-10 rounded-full border-2 border-white/20 bg-white/5" />
                            ) : (
                                <div className="size-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-white border-2 border-white/20">
                                    {activeSlide.user?.name?.charAt(0) || "U"}
                                </div>
                            )}
                            <div className="text-left">
                                <h4 className="font-bold text-sm text-white">{activeSlide.user?.name || "Pelanggan Terverifikasi"}</h4>
                                <p className="text-[10px] text-white/50 uppercase tracking-wider">Verified Buyer</p>
                            </div>
                        </div>
                    </div>
                </div>
 
                {/* Slider Controls (Arrows & Dots) */}
                {reviews.length > 1 && (
                    <div className="flex items-center justify-between mt-8 border-t border-white/10 pt-4">
                        {/* Dots indicators */}
                        <div className="flex gap-2">
                            {reviews.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentSlide(idx)}
                                    className={`size-2 rounded-full transition-all cursor-pointer ${currentSlide === idx ? "w-6 bg-orange-300" : "bg-white/30 hover:bg-white/50"}`}
                                />
                            ))}
                        </div>
 
                        {/* Arrow Navigation */}
                        <div className="flex gap-2">
                            <button
                                onClick={handlePrev}
                                className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 transition-colors cursor-pointer"
                            >
                                <ChevronLeftIcon className="size-4" />
                            </button>
                            <button
                                onClick={handleNext}
                                className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 transition-colors cursor-pointer"
                            >
                                <ChevronRightIcon className="size-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};
export default AppPromoBanner;