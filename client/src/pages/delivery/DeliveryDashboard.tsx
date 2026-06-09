import { useEffect, useState, useRef, useCallback } from "react";
import { PackageIcon, NavigationIcon, WalletIcon, CheckCircleIcon, ClockIcon, HistoryIcon } from "lucide-react";
import OtpModal from "../../components/Delivery/OtpModal";
import CancelModal from "../../components/Delivery/CancelModal";
import DeliveryOrderCard from "../../components/Delivery/DeliveryOrderCard";
import Loading from "../../components/Loading";
import type { Order } from "../../types";
import { io, Socket } from "socket.io-client";
import toast from "react-hot-toast";
import axios from "axios";

const API_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000/api"

const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("delivery_token")}` }
})

export default function DeliveryDashboard() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<"active" | "completed">("active");
    const [isTracking, setIsTracking] = useState(false);

    // Stats
    const [stats, setStats] = useState<{
        totalCompleted: number;
        totalActive: number;
        totalCancelled: number;
        totalEarnings: number;
    } | null>(null);
    const [earningsHistory, setEarningsHistory] = useState<any[]>([]);

    // OTP modal
    const [otpModal, setOtpModal] = useState<string | null>(null);
    const [otp, setOtp] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Cancel modal
    const [cancelModal, setCancelModal] = useState<string | null>(null);
    const [cancelReason, setCancelReason] = useState("");

    // Socket & Watch Refs
    const socketRef = useRef<Socket | null>(null);
    const watchIdRef = useRef<number | null>(null);
    const ordersRef = useRef<Order[]>(orders);
    const stopTrackingRef = useRef<() => void>(() => {});

    // Keep ordersRef in sync so geolocation callback always has latest orders
    useEffect(() => {
        ordersRef.current = orders;
    }, [orders]);

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${API_URL}/delivery/my-deliveries?status=${tab}`, getAuthHeaders());
            setOrders(data.orders);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to load deliveries")
        } finally {
            setLoading(false);
        }

        try {
            const statsRes = await axios.get(`${API_URL}/delivery/stats`, getAuthHeaders());
            setStats(statsRes.data.stats);
            setEarningsHistory(statsRes.data.earningsHistory);
        } catch (error: any) {
            console.error("Failed to load stats:", error);
        }
    }, [tab]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    // Define stopTracking first so other hooks can reference it
    const stopTracking = useCallback(() => {
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
        setIsTracking(false);
    }, []);

    // Keep stopTracking ref up to date
    useEffect(() => {
        stopTrackingRef.current = stopTracking;
    }, [stopTracking]);

    // ─── Socket: listen for new assignment so dashboard updates without reload ───
    useEffect(() => {
        const socketUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
        const token = localStorage.getItem("delivery_token");
        if (!token) return;

        const savedPartner = localStorage.getItem("delivery_partner");
        const partnerId = savedPartner ? JSON.parse(savedPartner).id : null;

        const socket = io(socketUrl, { auth: { token } });
        socketRef.current = socket;

        socket.on("connect", () => {
            if (partnerId) {
                socket.emit("join-partner-room", partnerId);
            }
        });

        socket.on("order-assigned", () => {
            if (tab === "active") fetchOrders();
        });

        socket.on("order-status-updated", () => {
            fetchOrders();
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [tab, fetchOrders]);

    // ─── Stop tracking when no more active orders remain ───
    useEffect(() => {
        const hasActive = orders.some(
            (o) => o.status === "Assigned" || o.status === "Packed" || o.status === "Out for Delivery"
        );
        if (isTracking && !hasActive) {
            stopTrackingRef.current();
        }
    }, [orders, isTracking]);

    // Haversine distance calculator
    const getDistanceKm = (lat1: number, lng1: number, lat2: number, lng2: number) => {
        const R = 6371;
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLng = ((lng2 - lng1) * Math.PI) / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    // Check if any active order has long-distance destination (>= 50km)
    const hasLongDistanceOrder = (lat: number, lng: number): boolean => {
        return ordersRef.current.some((order) => {
            if (order.status !== "Assigned" && order.status !== "Packed" && order.status !== "Out for Delivery") return false;
            const destLat = order.shippingAddress?.lat ? Number(order.shippingAddress.lat) : null;
            const destLng = order.shippingAddress?.lng ? Number(order.shippingAddress.lng) : null;
            if (!destLat || !destLng) return false;
            const dist = getDistanceKm(lat, lng, destLat, destLng);
            return dist >= 50;
        });
    };

    const startTracking = useCallback(() => {
        if (isTracking) return;

        if (!("geolocation" in navigator)) {
            toast.error("Geolocation is not supported by your browser");
            return;
        }

        const beginTracking = () => {
            setIsTracking(true);

            const socketUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
            const geoSocket = io(socketUrl);

            geoSocket.on("connect", () => {
                ordersRef.current.forEach((order) => {
                    geoSocket.emit("join-order-room", order.id);
                });
            });

            watchIdRef.current = navigator.geolocation.watchPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;

                    const activeOrders = ordersRef.current.filter(
                        (o) => o.status === "Assigned" || o.status === "Packed" || o.status === "Out for Delivery"
                    );

                    if (activeOrders.length === 0) {
                        stopTrackingRef.current();
                        geoSocket.disconnect();
                        return;
                    }

                    for (const order of activeOrders) {
                        if (geoSocket.connected) {
                            geoSocket.emit("send-live-location", {
                                orderId: order.id,
                                lat: latitude,
                                lng: longitude,
                            });
                        }

                        try {
                            await axios.put(`${API_URL}/delivery/my-deliveries/${order.id}/location`, {
                                lat: latitude,
                                lng: longitude,
                            }, getAuthHeaders());
                        } catch (err) {
                            console.error("HTTP location update failed:", err);
                        }
                    }
                },
                (error) => {
                    console.error("Error watching position:", error);
                    toast.error("Failed to access GPS. Please allow location access.");
                    stopTrackingRef.current();
                    geoSocket.disconnect();
                },
                { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
            );

            socketRef.current = geoSocket;
        };

        // Check distance first before starting GPS
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;

                if (hasLongDistanceOrder(latitude, longitude)) {
                    toast("Long distance delivery — location sharing disabled (expedition mode)", { icon: "🚛" });
                    return;
                }

                beginTracking();
            },
            () => {
                beginTracking();
            },
            { enableHighAccuracy: false, timeout: 5000 }
        );
    }, [isTracking]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopTracking();
            socketRef.current?.disconnect();
        };
    }, [stopTracking]);

    const handleUpdateStatus = async (orderId: string, status: string) => {
        try {
            await axios.put(`${API_URL}/delivery/my-deliveries/${orderId}/status`, { status }, getAuthHeaders());
            toast.success(`Status updated to ${status}`);
            await fetchOrders();

            if (status === "Out for Delivery" && !isTracking) {
                startTracking();
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed")
        }
    };

    const handleComplete = async () => {
        if (!otpModal || !otp) return;
        setSubmitting(true);
        try {
            await axios.put(`${API_URL}/delivery/my-deliveries/${otpModal}/complete`, { otp }, getAuthHeaders());
            toast.success("Delivery Completed! 🎉");
            setOtpModal(null);
            setOtp("");
            await fetchOrders();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed")
        } finally {
            setSubmitting(false)
        }
    };

    const handleCancel = async () => {
        if (!cancelModal) return;
        setSubmitting(true);
        try {
            await axios.put(
                `${API_URL}/delivery/my-deliveries/${cancelModal}/cancel`,
                { reason: cancelReason },
                getAuthHeaders()
            );
            toast.success("Delivery cancelled successfully");
            setCancelModal(null);
            setCancelReason("");
            fetchOrders();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to cancel delivery");
        } finally {
            setSubmitting(false);
        }
    };

    const hasOutForDelivery = orders.some((o) => o.status === "Out for Delivery");

    return (
        <div className="space-y-6">
            {/* Stats Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Earnings Card */}
                <div className="bg-white rounded-2xl p-6 border border-app-border/60 shadow-sm relative overflow-hidden transition-all hover:shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-app-text-light uppercase tracking-wider">Total Pendapatan (Komisi 5%)</p>
                            <h3 className="text-2xl font-extrabold text-app-green mt-2">
                                Rp {(stats?.totalEarnings || 0).toLocaleString("id-ID")}
                            </h3>
                            <p className="text-[10px] text-zinc-500 mt-1">Dihitung otomatis dari pesanan sukses</p>
                        </div>
                        <div className="size-12 rounded-xl bg-green-50 flex items-center justify-center text-app-green shrink-0">
                            <WalletIcon className="size-6 text-emerald-600" />
                        </div>
                    </div>
                </div>

                {/* Completed Card */}
                <div className="bg-white rounded-2xl p-6 border border-app-border/60 shadow-sm relative overflow-hidden transition-all hover:shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-app-text-light uppercase tracking-wider">Pengiriman Sukses</p>
                            <h3 className="text-2xl font-extrabold text-zinc-900 mt-2">
                                {stats?.totalCompleted || 0}
                            </h3>
                            <p className="text-[10px] text-zinc-500 mt-1">Selesai diantarkan ke pelanggan</p>
                        </div>
                        <div className="size-12 rounded-xl bg-orange-50 flex items-center justify-center text-app-orange shrink-0">
                            <CheckCircleIcon className="size-6 text-orange-600" />
                        </div>
                    </div>
                </div>

                {/* Active Card */}
                <div className="bg-white rounded-2xl p-6 border border-app-border/60 shadow-sm relative overflow-hidden transition-all hover:shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-app-text-light uppercase tracking-wider">Tugas Aktif</p>
                            <h3 className="text-2xl font-extrabold text-zinc-900 mt-2">
                                {stats?.totalActive || 0}
                            </h3>
                            <p className="text-[10px] text-zinc-500 mt-1">Dalam proses pengantaran</p>
                        </div>
                        <div className="size-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                            <ClockIcon className="size-6 text-blue-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs + Tracking toggle */}
            <div className="flex items-center gap-2 flex-wrap">
                {(["active", "completed"] as const).map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${tab === t
                            ? "bg-app-green text-white"
                            : "bg-white text-zinc-600 hover:bg-app-cream border border-app-border"
                            }`}
                    >
                        {t === "active" ? "Active" : "Completed"}
                    </button>
                ))}
                <div className="ml-auto">
                    <button
                        disabled={!hasOutForDelivery && !isTracking}
                        onClick={() => isTracking ? stopTracking() : startTracking()}
                        title={
                            !hasOutForDelivery && !isTracking
                                ? "Location sharing starts automatically when status is 'Out for Delivery'"
                                : isTracking
                                ? "Stop sharing location"
                                : "Share your location"
                        }
                        className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors flex items-center gap-1.5 ${
                            !hasOutForDelivery && !isTracking
                                ? "bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed"
                                : isTracking
                                ? "bg-green-600 text-white"
                                : "bg-white text-zinc-600 border border-app-border hover:bg-app-cream"
                            }`}
                    >
                        <NavigationIcon className={`w-3.5 h-3.5 ${isTracking ? "animate-pulse" : ""}`} />
                        {isTracking ? "Sharing Location" : "Share Location"}
                    </button>
                </div>
            </div>

            {/* Orders & Earnings Section */}
            {loading ? (
                <Loading />
            ) : (
                <div className={tab === "completed" ? "grid grid-cols-1 lg:grid-cols-3 gap-6" : "space-y-4"}>
                    {/* Orders List */}
                    <div className={tab === "completed" ? "lg:col-span-2 space-y-4" : "space-y-4"}>
                        {orders.length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-2xl border border-app-border/60">
                                <PackageIcon className="size-12 text-app-border mx-auto mb-3" />
                                <p className="text-lg font-semibold text-zinc-900 mb-1">No {tab} deliveries</p>
                                <p className="text-sm text-zinc-500">
                                    {tab === "active"
                                        ? "You'll see new assignments here automatically"
                                        : "Completed deliveries will appear here"}
                                </p>
                            </div>
                        ) : (
                            orders.map((order) => (
                                <DeliveryOrderCard
                                    key={order.id}
                                    order={order}
                                    tab={tab}
                                    handleUpdateStatus={handleUpdateStatus}
                                    setOtpModal={setOtpModal}
                                    setCancelModal={setCancelModal}
                                />
                            ))
                        )}
                    </div>

                    {/* Earnings History Sidebar (Only shown for completed tab) */}
                    {tab === "completed" && (
                        <div className="lg:col-span-1 space-y-4">
                            <div className="bg-white rounded-2xl border border-app-border/60 p-5 shadow-sm space-y-4 h-fit">
                                <div className="flex items-center justify-between border-b border-app-border/40 pb-3">
                                    <h3 className="font-bold text-zinc-900 flex items-center gap-2">
                                        <HistoryIcon className="size-4 text-app-green" />
                                        Log Komisi
                                    </h3>
                                    <span className="text-xs font-semibold text-app-green bg-green-50 px-2 py-0.5 rounded-full">
                                        {earningsHistory.length} Transaksi
                                    </span>
                                </div>

                                {earningsHistory.length === 0 ? (
                                    <p className="text-sm text-zinc-500 text-center py-6">Belum ada riwayat pendapatan.</p>
                                ) : (
                                    <div className="divide-y divide-app-border/40 max-h-[400px] overflow-y-auto pr-1">
                                        {earningsHistory.map((item: any) => (
                                            <div key={item.orderId} className="py-3 flex justify-between text-xs">
                                                <div>
                                                    <p className="font-mono font-medium text-zinc-700">
                                                        #{item.orderId.slice(-6).toUpperCase()}
                                                    </p>
                                                    <p className="text-[10px] text-zinc-400 mt-0.5">
                                                        {new Date(item.date).toLocaleDateString("id-ID", { month: "short", day: "numeric" })}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-app-green">
                                                        +Rp {item.commission.toLocaleString("id-ID")}
                                                    </p>
                                                    <p className="text-[10px] text-zinc-500">
                                                        5% dari Rp {item.totalPrice.toLocaleString("id-ID")}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* OTP Modal */}
            {otpModal && (
                <OtpModal
                    setOtpModal={setOtpModal}
                    otp={otp}
                    setOtp={setOtp}
                    handleComplete={handleComplete}
                    submitting={submitting}
                />
            )}
            {/* Cancel Modal */}
            {cancelModal && (
                <CancelModal
                    setCancelModal={setCancelModal}
                    cancelReason={cancelReason}
                    setCancelReason={setCancelReason}
                    handleCancel={handleCancel}
                    submitting={submitting}
                />
            )}
        </div>
    );
}