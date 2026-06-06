import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PackageIcon, UsersIcon, ShoppingBagIcon, AlertTriangleIcon, DollarSignIcon, TrendingUpIcon, TruckIcon } from "lucide-react";
import Loading from "../../components/Loading";
import api from "../../config/api";
import { formatPriceToIDR } from "../../utils/formatCurrency";

interface Stats {
    totalOrders: number;
    totalUsers: number;
    totalProducts: number;
    outOfStock: number;
    totalPartners: number;
    recentOrders: any[];
    totalRevenue: number;
    avgOrderValue: number;
    statusBreakdown: Record<string, number>;
    dailyRevenue: { date: string; revenue: number; orders: number }[];
    topProducts: { id: string; name: string; price: number; image: string; category: string; totalSold: number }[];
}

const statusColorMap: Record<string, string> = {
    Placed: "bg-blue-100 text-blue-700",
    Confirmed: "bg-indigo-100 text-indigo-700",
    Assigned: "bg-purple-100 text-purple-700",
    "Out for Delivery": "bg-orange-100 text-orange-700",
    Delivered: "bg-green-100 text-green-700",
    Cancelled: "bg-red-100 text-red-700",
};

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/admin/stats")
            .then((res) => setStats(res.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const cards = stats
        ? [
            { label: "Total Revenue", value: formatPriceToIDR(stats.totalRevenue), icon: DollarSignIcon, color: "bg-green-50 text-green-600" },
            { label: "Total Orders", value: stats.totalOrders, icon: ShoppingBagIcon, color: "bg-blue-50 text-blue-600" },
            { label: "Avg Order Value", value: formatPriceToIDR(stats.avgOrderValue), icon: TrendingUpIcon, color: "bg-purple-50 text-purple-600" },
            { label: "Total Users", value: stats.totalUsers, icon: UsersIcon, color: "bg-orange-50 text-orange-600" },
            { label: "Total Products", value: stats.totalProducts, icon: PackageIcon, color: "bg-cyan-50 text-cyan-600" },
            { label: "Out of Stock", value: stats.outOfStock, icon: AlertTriangleIcon, color: "bg-red-50 text-red-600" },
            { label: "Delivery Partners", value: stats.totalPartners, icon: TruckIcon, color: "bg-amber-50 text-amber-600" },
        ]
        : [];

    const maxRevenue = Math.max(...(stats?.dailyRevenue.map(d => d.revenue) || [1]), 1);

    if (loading) return <Loading />;

    return (
        <div className="space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.slice(0, 4).map((card) => (
                    <div key={card.label} className="bg-white rounded-2xl p-5 border border-app-border flex justify-between gap-3">
                        <div>
                            <p className="text-2xl font-semibold text-zinc-900">{card.value}</p>
                            <p className="text-sm text-app-text-light">{card.label}</p>
                        </div>
                        <div className={`size-10 rounded-xl flex-center ${card.color}`}>
                            <card.icon className="size-5" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Second row stats */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {cards.slice(4).map((card) => (
                    <div key={card.label} className="bg-white rounded-2xl p-5 border border-app-border flex justify-between gap-3">
                        <div>
                            <p className="text-2xl font-semibold text-zinc-900">{card.value}</p>
                            <p className="text-sm text-app-text-light">{card.label}</p>
                        </div>
                        <div className={`size-10 rounded-xl flex-center ${card.color}`}>
                            <card.icon className="size-5" />
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart - Last 7 Days */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-app-border p-6">
                    <h2 className="text-lg font-semibold text-zinc-900 mb-6">Revenue (Last 7 Days)</h2>
                    <div className="flex items-end gap-3 h-48">
                        {stats?.dailyRevenue.map((day) => {
                            const height = day.revenue > 0 ? Math.max((day.revenue / maxRevenue) * 100, 8) : 4;
                            const dayLabel = new Date(day.date).toLocaleDateString("en-US", { weekday: "short" });
                            return (
                                <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                                    <span className="text-[10px] text-zinc-500 font-medium">{day.revenue > 0 ? formatPriceToIDR(day.revenue) : "-"}</span>
                                    <div className="w-full flex justify-center">
                                        <div
                                            className={`w-full max-w-[40px] rounded-t-lg transition-all duration-500 ${day.revenue > 0 ? "bg-app-green" : "bg-zinc-100"}`}
                                            style={{ height: `${height}%` }}
                                        />
                                    </div>
                                    <span className="text-[11px] text-zinc-500">{dayLabel}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Order Status Breakdown */}
                <div className="bg-white rounded-2xl border border-app-border p-6">
                    <h2 className="text-lg font-semibold text-zinc-900 mb-4">Order Status</h2>
                    <div className="space-y-3">
                        {Object.entries(stats?.statusBreakdown || {}).map(([status, count]) => {
                            const total = stats?.totalOrders || 1;
                            const pct = Math.round((count / total) * 100);
                            return (
                                <div key={status}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm text-zinc-700">{status}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-zinc-500">{count} ({pct}%)</span>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusColorMap[status] || "bg-zinc-100 text-zinc-600"}`}>{count}</span>
                                        </div>
                                    </div>
                                    <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-app-green rounded-full transition-all duration-500"
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                        {Object.keys(stats?.statusBreakdown || {}).length === 0 && (
                            <p className="text-sm text-zinc-500 text-center py-4">No orders yet.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Top Products */}
            {stats?.topProducts && stats.topProducts.length > 0 && (
                <div className="bg-white rounded-2xl border border-app-border overflow-hidden">
                    <div className="px-6 py-5 border-b border-app-border">
                        <h2 className="text-lg font-semibold text-zinc-900">Top Selling Products</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-app-cream/50 text-zinc-500 uppercase text-xs font-semibold">
                                <tr>
                                    <th className="px-6 py-3">#</th>
                                    <th className="px-6 py-3">Product</th>
                                    <th className="px-6 py-3">Category</th>
                                    <th className="px-6 py-3">Price</th>
                                    <th className="px-6 py-3 text-right">Sold</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-app-border">
                                {stats.topProducts.map((product, i) => (
                                    <tr key={product.id} className="hover:bg-zinc-50/50 transition-colors">
                                        <td className="px-6 py-3 font-semibold text-app-green">{i + 1}</td>
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-3">
                                                <img src={product.image} alt={product.name} className="size-10 rounded-lg object-cover" />
                                                <span className="font-medium text-zinc-900 truncate max-w-[200px]">{product.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 text-zinc-500 capitalize">{product.category?.replace(/-/g, " ")}</td>
                                        <td className="px-6 py-3 font-medium">{formatPriceToIDR(product.price)}</td>
                                        <td className="px-6 py-3 text-right font-semibold text-app-green">{product.totalSold} sold</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Recent Orders */}
            <div className="bg-white rounded-2xl border border-app-border overflow-hidden">
                <div className="px-6 py-5 border-b border-app-border flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-zinc-900">Recent Orders</h2>
                    <Link to="/admin/orders" className="text-sm font-medium text-app-orange hover:text-app-orange-dark transition-colors">
                        View All →
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-app-cream/50 text-zinc-500 uppercase text-xs font-semibold">
                            <tr>
                                <th className="px-6 py-3">Order ID</th>
                                <th className="px-6 py-3">Customer</th>
                                <th className="px-6 py-3">Items</th>
                                <th className="px-6 py-3">Total</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-app-border">
                            {stats?.recentOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">No orders yet.</td>
                                </tr>
                            ) : (
                                stats?.recentOrders.map((order: any) => (
                                    <tr key={order.id} className="hover:bg-zinc-50/50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs text-zinc-500">#{order.id.slice(-6).toUpperCase()}</td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-zinc-900">{order.user?.name || "—"}</p>
                                            <p className="text-xs text-zinc-500">{order.user?.email || ""}</p>
                                        </td>
                                        <td className="px-6 py-4 text-zinc-600">{order.items?.length || 0} items</td>
                                        <td className="px-6 py-4 font-medium">{formatPriceToIDR(order.total || 0)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColorMap[order.status] || "bg-zinc-100 text-zinc-600"}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-zinc-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}