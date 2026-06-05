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
    const [tracking, setTracking] = useState(false);

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

    // ─── Socket: listen for new assignment so dashboard updates without reload ───
    useEffect(() => {
        const socketUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
        const token = localStorage.getItem("delivery_token");
        if (!token) return;

        // Get partner ID from localStorage to join personal notification room
        const savedPartner = localStorage.getItem("delivery_partner");
        const partnerId = savedPartner ? JSON.parse(savedPartner).id : null;

        const socket = io(socketUrl, { auth: { token } });
        socketRef.current = socket;

        socket.on("connect", () => {
            // Join personal room so admin assignment events reach this socket
            if (partnerId) {
                socket.emit("join-partner-room", partnerId);
            }
        });

        // When admin assigns this partner to a new order, refresh active tab
        socket.on("order-assigned", () => {
            if (tab === "active") fetchOrders();
        });

        // When any order status changes (e.g. Delivered), refresh list
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
        if (tracking && !hasActive) {
            stopTracking();
        }
    }, [orders]);

    const stopTracking = () => {
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
        setTracking(false);
    };

    const startTracking = useCallback(() => {
        if (tracking) return;

        if (!("geolocation" in navigator)) {
            toast.error("Geolocation is not supported by your browser");
            return;
        }

        setTracking(true);

        const socketUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
        const geoSocket = io(socketUrl);

        geoSocket.on("connect", () => {
            // Join rooms for each active order
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

                // No more active orders — stop tracking silently (no toast)
                if (activeOrders.length === 0) {
                    stopTracking();
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

                    // HTTP fallback for serverless environments (Vercel)
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
                stopTracking();
                geoSocket.disconnect();
            },
            { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
        );

        // Store socket so we can disconnect on cleanup
        socketRef.current = geoSocket;
    }, [tracking]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopTracking();
            socketRef.current?.disconnect();
        };
    }, []);

    const handleUpdateStatus = async (orderId: string, status: string) => {
        try {
            await axios.put(`${API_URL}/delivery/my-deliveries/${orderId}/status`, { status }, getAuthHeaders());
            toast.success(`Status updated to ${status}`);
            await fetchOrders();

            // Auto-start location sharing when "Out for Delivery" is set
            if (status === "Out for Delivery" && !tracking) {
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
            // tracking will be stopped automatically via the orders useEffect above
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
                        disabled={!hasOutForDelivery && !tracking}
                        onClick={() => tracking ? stopTracking() : startTracking()}
                        title={
                            !hasOutForDelivery && !tracking
                                ? "Location sharing starts automatically when status is 'Out for Delivery'"
                                : tracking
                                ? "Stop sharing location"
                                : "Share your location"
                        }
                        className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors flex items-center gap-1.5 ${
                            !hasOutForDelivery && !tracking
                                ? "bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed"
                                : tracking
                                ? "bg-green-600 text-white"
                                : "bg-white text-zinc-600 border border-app-border hover:bg-app-cream"
                            }`}
                    >
                        <NavigationIcon className={`w-3.5 h-3.5 ${tracking ? "animate-pulse" : ""}`} />
                        {tracking ? "Sharing Location" : "Share Location"}
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
