import { useEffect, useState } from "react";
import type { Order } from "../types";
import { Link, useSearchParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { dummyDashboardOrdersData, statusColors } from "../assets/assets";
import Loading from "../components/Loading";
import { CalendarIcon, ChevronRightIcon, PackageIcon, XIcon } from "lucide-react";

const MyOrders = () => {
    const currency = import.meta.env.VITE_CURRENCY_SYMBOL || "$";
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("all");
    const [searchParams, setSearchParams] = useSearchParams();
    const [selectedOrderForModal, setSelectedOrderForModal] = useState<Order | null>(null);

    const tabs = ["all", "Placed", "Out of Delivery", "Delivered"];

    const { clearCart } = useCart();

    const fetchOrders = async () => {
        setOrders(dummyDashboardOrdersData as any);
        setLoading(false);
    }

    useEffect(() => {
        if (searchParams.get("clearCart")) {
            clearCart();
            setSearchParams({});
            setTimeout(() => {
                fetchOrders();
            }, 2000)
        } else {
            fetchOrders();
        }

    }, [activeTab])

    return (
        <div className="min-h-screen bg-app-cream mb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-2xl font-semibold text-app-green mb-6">My Orders</h1>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {tabs.map((tab) => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 text-sm font-medium rounded-xl whitespace-nowrap transition-colors ${activeTab === tab ? "bg-app-green text-white" : "bg-white text-app-text-light hover:bg-app-cream"}`}>
                            {tab === 'all' ? "All Orders" : tab}
                        </button>
                    ))}
                </div>

                {/* Orders List */}
                {loading ? (
                    <Loading />
                ) : orders.length === 0 ? (
                    <div className="text-center py-16">
                        <PackageIcon className="size-16 text-app-border mx-auto mb-4" />
                        <h2 className="text-lg font-medium text-app-green mb-2">No orders yet</h2>
                        <p className="text-sm text-app-text-light mb-4">Start shopping to see your orders here</p>
                        <Link to="/products" className="inline-flex px-4 py-2 bg-app-green text-white text-sm rounded-lg">
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div key={order._id} className="block max-w-4xl bg-white rounded-2xl p-5 hover:shadow transition-all">
                                {/* Order Id, Date, Status */}
                                <div className="flex items-start justify-between mb-3">
                                    {/* Left */}
                                    <div>
                                        <p className="text-sm font-medium text-app-green">Order #{order._id.slice(-8).toUpperCase()}</p>
                                        <div className="flex items-center gap-2 mt-1 ">
                                            <CalendarIcon className="size-3 text-app-text-light" />
                                            <span className="text-xs text-app-text-light">{new Date(order.createdAt).toLocaleDateString("id-ID", { month: "short", day: "numeric", year: "numeric" })}</span>
                                        </div>
                                    </div>
                                    {/* Right */}
                                    <div className="flex items-center gap-2">
                                        <span className={`px-4 py-1 text-xs font-medium rounded-full ${statusColors[order.status] || "bg-gray-100 text-gray-700"}`}>
                                            {order.status}
                                        </span>
                                        <ChevronRightIcon className="size-4 text-app-text-light" />
                                    </div>
                                </div>

                                {/* Item Thumbnails */}
                                <div
                                    className="flex items-center gap-2 mb-3 cursor-pointer group"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setSelectedOrderForModal(order);
                                    }}
                                >
                                    {order.items.slice(0, 4).map((item, i) => (
                                        <img key={i} src={item.image} alt={item.name} className="size-12 sm:size-16 rounded-lg object-cover border border-app-border group-hover:opacity-80 transition-opacity" />
                                    ))}
                                    {order.items.length > 4 && (
                                        <div className="size-12 sm:size-16 rounded-lg bg-app-cream flex items-center justify-center text-xs font-semibold text-app-text-light group-hover:bg-gray-200 transition-colors">
                                            +{order.items.length - 4}
                                        </div>
                                    )}
                                </div>

                                {/* Total item & price & Track Button */}
                                <div className="flex justify-between items-center pt-4 mt-2 text-sm border-t border-app-border">
                                    <div className="flex items-center gap-3">
                                        <span className="text-app-text-light">{order.items.length} items</span>
                                        <span className="font-semibold text-app-green text-base">{currency}{order.total.toFixed(2)}</span>
                                    </div>
                                    <Link to={`/orders/${order._id}`} className="px-4 py-2 bg-app-green text-white text-xs font-medium rounded-xl hover:bg-app-green-light transition-colors">
                                        Track Order
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal for Order Items */}
            {selectedOrderForModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={() => setSelectedOrderForModal(null)}>
                    <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col animate-fade-in" onClick={(e) => e.stopPropagation()}>
                        <div className="p-4 border-b border-app-border flex justify-between items-center">
                            <h3 className="font-semibold text-app-green">Items in Order #{selectedOrderForModal._id.slice(-8).toUpperCase()}</h3>
                            <button onClick={() => setSelectedOrderForModal(null)} className="p-1 hover:bg-app-cream rounded-md text-app-text-light">
                                <XIcon className="size-5" />
                            </button>
                        </div>
                        <div className="p-4 overflow-y-auto">
                            <div className="space-y-4">
                                {selectedOrderForModal.items.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-4">
                                        <img src={item.image} alt={item.name} className="size-16 rounded-lg object-cover border border-app-border" />
                                        <div className="flex-1">
                                            <p className="font-medium text-app-green text-sm">{item.name}</p>
                                            <p className="text-xs text-app-text-light">{item.quantity} x {item.unit}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t border-app-border mt-4 pt-4 flex justify-center items-center text-sm">
                                <span className="font-medium text-app-text-light">
                                    Total Items: {selectedOrderForModal.items.reduce((sum, item) => sum + item.quantity, 0)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default MyOrders