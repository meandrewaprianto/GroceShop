import { useEffect, useState, useRef, useCallback } from "react";
import { PackageIcon, NavigationIcon } from "lucide-react";
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

            {/* Orders */}
            {loading ? (
                <Loading />
            ) : orders.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-app-border">
                    <PackageIcon className="size-12 text-app-border mx-auto mb-3" />
                    <p className="text-lg font-semibold text-zinc-900 mb-1">No {tab} deliveries</p>
                    <p className="text-sm text-zinc-500">
                        {tab === "active"
                            ? "You'll see new assignments here automatically"
                            : "Completed deliveries will appear here"}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <DeliveryOrderCard
                            key={order.id}
                            order={order}
                            tab={tab}
                            handleUpdateStatus={handleUpdateStatus}
                            setOtpModal={setOtpModal}
                            setCancelModal={setCancelModal}
                        />
                    ))}
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