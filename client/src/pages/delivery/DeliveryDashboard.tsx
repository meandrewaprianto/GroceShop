import { useEffect, useState, useRef } from "react";
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

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${API_URL}/delivery/my-deliveries?status=${tab}`, getAuthHeaders());
            setOrders(data.orders);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to load deliveries")
        } finally {
            setLoading(false);
        }

    };

    useEffect(() => {
        fetchOrders();
    }, [tab]);

    // Logika Real-time Geolocation Sharing via WebSocket
    useEffect(() => {
        if (tracking) {
            // 1. Inisialisasi Socket.io Client
            const socketUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
            const socket = io(socketUrl);
            socketRef.current = socket;

            socket.on("connect", () => {
                toast.success("Connected to tracking server");
                // Join room untuk setiap order aktif
                orders.forEach((order) => {
                    socket.emit("join-order-room", order.id);
                });
            });

            // 2. Mulai mendengarkan sensor GPS perangkat menggunakan watchPosition
            if ("geolocation" in navigator) {
                watchIdRef.current = navigator.geolocation.watchPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;

                        // Kirim koordinat untuk setiap pesanan aktif yang sedang diantar
                        const activeOrders = orders.filter(
                            (o) => o.status === "Assigned" || o.status === "Packed" || o.status === "Out for Delivery"
                        );

                        if (activeOrders.length === 0) {
                            toast.error("No active deliveries to share location for");
                            setTracking(false);
                            return;
                        }

                        activeOrders.forEach((order) => {
                            socket.emit("send-live-location", {
                                orderId: order.id,
                                lat: latitude,
                                lng: longitude,
                            });
                        });
                    },
                    (error) => {
                        console.error("Error watching position:", error);
                        toast.error("Failed to access GPS. Please allow location access.");
                        setTracking(false);
                    },
                    {
                        enableHighAccuracy: true,
                        maximumAge: 10000,
                        timeout: 5000,
                    }
                );
            } else {
                toast.error("Geolocation is not supported by your browser");
                setTracking(false);
            }
        }

        // Cleanup: Berhenti sharing saat tombol dinonaktifkan atau komponen di-unmount
        return () => {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
                watchIdRef.current = null;
            }
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [tracking, orders]);

    const handleUpdateStatus = async (orderId: string, status: string) => {
        console.log(orderId, status);
        try {
            await axios.put(`${API_URL}/delivery/my-deliveries/${orderId}/status`, { status }, getAuthHeaders());
            toast.success(`Status updated to ${status}`);
            fetchOrders();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed")
        }
    };

    const handleComplete = async () => {
        if (!otpModal || !otp) return;
        setSubmitting(true);
        try {
            await axios.put(`${API_URL}/delivery/my-deliveries/${otpModal}/complete`, { otp }, getAuthHeaders());
            toast.success("Delivery Completed");
            setOtpModal(null);
            setOtp("");
            fetchOrders();
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
                        disabled={!hasOutForDelivery}
                        onClick={() => setTracking((prev) => !prev)}
                        className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors flex items-center gap-1.5 ${
                            !hasOutForDelivery
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
                            ? "You'll see new assignments here"
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
