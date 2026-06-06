import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Order } from "../types";
import { formatIDR, formatIDRRaw } from "../utils/formatCurrency";
import Loading from "../components/Loading";
import { ArrowLeftIcon, MapPinIcon, PhoneIcon } from "lucide-react";
import OrderOTP from "../components/OrderTracking/OrderOTP";
import LiveMap from "../components/OrderTracking/LiveMap";
import OrderTimeLine from "../components/OrderTracking/OrderTimeLine";
import { io, Socket } from "socket.io-client";
import api from "../config/api";
import toast from "react-hot-toast";

const OrderTracking = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [liveLocation, setLiveLocation] = useState<{ lat: number; lng: number } | null>(null);

    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (!id) return;

        const fetchOrder = async () => {
            setLoading(true);
            try {
                const { data } = await api.get(`/orders/${id}`);
                setOrder(data.order);

                if (data.order?.liveLocation) {
                    setLiveLocation(data.order.liveLocation);
                }
            } catch (error: any) {
                toast.error(error.response?.data?.message || "Order not found");
                navigate("/orders");
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [id, navigate]);

    // Logika WebSocket Client untuk Menerima Koordinat Kurir Real-Time & Update Status
    useEffect(() => {
        if (!id) return;

        const socketUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
        const socket = io(socketUrl);
        socketRef.current = socket;

        socket.on("connect", () => {
            console.log("Connected to tracking WebSocket server");
            // Masuk ke room pelacakan order ini
            socket.emit("join-order-room", id);
        });

        // Dengarkan koordinat live dari kurir
        socket.on("receive-live-location", (data: { lat: number; lng: number; updatedAt: string }) => {
            console.log("Received new coordinates:", data);
            setLiveLocation({ lat: data.lat, lng: data.lng });
        });

        // Dengarkan update status order secara real-time
        socket.on("order-status-updated", (data: { status: string; statusHistory: any[] }) => {
            console.log("Received status update:", data);
            setOrder((prev) => prev ? { ...prev, status: data.status, statusHistory: data.statusHistory } : null);
        });

        // Fallback polling: poll order status/location every 5 seconds in case WebSockets are not available
        const pollInterval = setInterval(async () => {
            try {
                const { data } = await api.get(`/orders/${id}`);
                if (data.order?.liveLocation) {
                    setLiveLocation(data.order.liveLocation);
                }
                if (data.order) {
                    setOrder((prev) => {
                        if (!prev) return data.order;
                        if (prev.status !== data.order.status || JSON.stringify(prev.statusHistory) !== JSON.stringify(data.order.statusHistory)) {
                            return data.order;
                        }
                        return prev;
                    });
                }
            } catch (err) {
                console.error("HTTP fallback polling failed:", err);
            }
        }, 5000);

        // Cleanup: Tutup koneksi & hapus interval saat user meninggalkan halaman
        return () => {
            clearInterval(pollInterval);
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [id]);

    if (loading) return <Loading />
    if (!order) return null;
    return (
        <div className="min-h-screen mb-20 bg-app-cream">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <button onClick={() => navigate("/orders")} className="flex items-center gap-2 text-sm text-app-text-light hover:text-app-green mb-6 transition-colors">
                    <ArrowLeftIcon className="size-4" /> Back to Orders
                </button>
                {/* Order id, status, date */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-semibold text-app-green">Order #{order.id.slice(-8).toUpperCase()}</h1>
                        <p className="text-sm text-app-text-light mt-1">Placed on {new Date(order.createdAt).toLocaleDateString("id-ID", { month: "long", day: "numeric", year: "numeric" })}</p>
                    </div>
                    <span className={`px-4 py-1.5 text-sm font-semibold rounded-full ${order.status === 'Delivered' ? "bg-green-100 text-green-700" : order.status === "Cancelled" ? "bg-red-100 text-red-700" : "bg-app-orange/10 text-app-orange"}`}>
                        {order.status}
                    </span>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Left side - Timeline + Map Area */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* OTP Card */}
                        <OrderOTP order={order} />
                        {/* Live Tracking Map */}
                        <LiveMap order={order} liveLocation={liveLocation} />
                        {/* Progress Timeline */}
                        <OrderTimeLine order={order} />

                        {/* Delivery Person */}
                        {order.deliveryPartner && order.status !== "Delivered" && order.status !== "Cancelled" && (
                            <div className="bg-white rounded-2xl p-5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="size-11 rounded-full bg-app-green flex-center">
                                        <span className="text-white font-semibold text-sm">
                                            {order.deliveryPartner.name.charAt(0)}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-app-green">{order.deliveryPartner.name}</p>
                                        <p className="text-xs text-app-text-light capitalize">{order.deliveryPartner.vehicleType} / Delivery Partner </p>
                                    </div>
                                </div>
                                <a href={`tel:${order.deliveryPartner.phone}`} className="p-2.5 bg-app-cream rounded-xl hover:bg-app-cream-dark transition-colors">
                                    <PhoneIcon className="size-4 text-app-green" />
                                </a>
                            </div>
                        )}
                    </div>

                    {/* Right side - Order Details */}
                    <div className="space-y-5">
                        {/* Delivery Address */}
                        <div className="bg-white rounded-2xl p-5">
                            <h3 className="text-sm font-semibold text-app-green mb-3 flex items-center gap-2">
                                <MapPinIcon className="size-4" />
                                Delivery Address
                            </h3>
                            <p className="text-sm text-app-text-light leading-relaxed">
                                {order.shippingAddress.label}
                                <br />
                                {order.shippingAddress.address}
                                <br />
                                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
                            </p>
                        </div>

                        {/* Items */}
                        <div className="bg-white rounded-2xl p-5">
                            <h3 className="text-sm font-semibold text-app-green mb-3">Items ({order.items.length})</h3>
                            <div className="space-y-3">
                                {order.items.map((item, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <img src={item.image} alt={item.name} className="size-10 rounded-lg object-cover" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-app-green truncate">{item.name}</p>
                                            <p className="text-xs text-app-text-light">x{item.quantity}</p>
                                        </div>
                                        <span className="text-sm font-semibold">
                                            {formatIDR(item.price * item.quantity)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 pt-3 border-t border-app-border space-y-1.5 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-app-text-light">Subtotal</span>
                                    <span>{formatIDR(order.subtotal)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-app-text-light">Delivery</span>
                                    <span>{order.deliveryFee === 0 ? "Free" : formatIDRRaw(order.deliveryFee)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-app-text-light">Tax</span>
                                    <span>{formatIDRRaw(order.tax)}</span>
                                </div>

                                <div className="flex justify-between pt-2 border-t border-app-border font-semibold text-app-green">
                                    <span>Total</span>
                                    <span>{formatIDRRaw(order.total)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderTracking;