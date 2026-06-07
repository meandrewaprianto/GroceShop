import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PackageIcon, UsersIcon, ShoppingBagIcon, AlertTriangleIcon, DollarSignIcon, TrendingUpIcon, TruckIcon, ArrowUpIcon, MoreHorizontalIcon } from "lucide-react";
import Loading from "../../components/Loading";
import api from "../../config/api";
import { formatPriceTotal } from "../../utils/formatCurrency";

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

const statusDotColor: Record<string, string> = {
    Placed: "#3b82f6",
    Confirmed: "#6366f1",
    Assigned: "#a855f7",
    "Out for Delivery": "#f97316",
    Delivered: "#22c55e",
    Cancelled: "#ef4444",
};

const statusBgColor: Record<string, string> = {
    Placed: "bg-blue-100 text-blue-700",
    Confirmed: "bg-indigo-100 text-indigo-700",
    Assigned: "bg-purple-100 text-purple-700",
    "Out for Delivery": "bg-orange-100 text-orange-700",
    Delivered: "bg-green-100 text-green-700",
    Cancelled: "bg-red-100 text-red-700",
};

function RevenueLineChart({ data }: { data: { date: string; revenue: number }[] }) {
    if (!data || data.length === 0) return null;

    const width = 600;
    const height = 220;
    const padding = { top: 24, right: 24, bottom: 32, left: 56 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const max = Math.max(...data.map(d => d.revenue), 1);
    const range = max || 1;

    const stepX = chartW / (data.length - 1 || 1);
    const points = data.map((d, i) => ({
        x: padding.left + i * stepX,
        y: padding.top + chartH - (d.revenue / range) * chartH,
        ...d,
    }));

    const linePath = points.reduce((acc, p, i) => {
        if (i === 0) return `M ${p.x} ${p.y}`;
        const prev = points[i - 1];
        const cp1x = prev.x + (p.x - prev.x) / 2;
        return `${acc} C ${cp1x} ${prev.y}, ${cp1x} ${p.y}, ${p.x} ${p.y}`;
    }, "");

    const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`;

    const yTicks = [0, 0.33, 0.66, 1].map(t => max * t);

    return (
        <div className="w-full">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
                <defs>
                    <linearGradient id="revenueArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22c55e" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                    </linearGradient>
                </defs>

                {yTicks.map((tick, i) => {
                    const y = padding.top + chartH - (tick / range) * chartH;
                    return (
                        <g key={i}>
                            <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#e4e4e7" strokeDasharray="3 3" strokeWidth="1" />
                            <text x={padding.left - 10} y={y + 4} textAnchor="end" fontSize="10" fill="#a1a1aa">
                                {tick >= 1000000 ? `${(tick / 1000000).toFixed(1)}M` : tick >= 1000 ? `${(tick / 1000).toFixed(0)}K` : Math.round(tick)}
                            </text>
                        </g>
                    );
                })}

                <path d={areaPath} fill="url(#revenueArea)" />
                <path d={linePath} fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                {points.map((p, i) => (
                    <g key={i}>
                        <circle cx={p.x} cy={p.y} r="5" fill="#fff" stroke="#22c55e" strokeWidth="2.5" />
                        <text x={p.x} y={height - 10} textAnchor="middle" fontSize="11" fill="#52525b" fontWeight="500">
                            {new Date(p.date).toLocaleDateString("en-US", { weekday: "short" })}
                        </text>
                    </g>
                ))}
            </svg>
        </div>
    );
}

function StatusDonut({ data }: { data: Record<string, number> }) {
    const entries = Object.entries(data).filter(([, v]) => v > 0);
    const total = entries.reduce((sum, [, v]) => sum + v, 0) || 1;
    let cumulative = 0;
    const size = 160;
    const radius = 60;
    const strokeWidth = 22;
    const center = size / 2;
    const circumference = 2 * Math.PI * radius;

    return (
        <div className="flex items-center gap-6">
            <svg width={size} height={size} className="shrink-0">
                <circle cx={center} cy={center} r={radius} fill="none" stroke="#f4f4f5" strokeWidth={strokeWidth} />
                {entries.map(([status, count]) => {
                    const offset = circumference * (1 - cumulative / total);
                    cumulative += count;
                    return (
                        <circle
                            key={status}
                            cx={center}
                            cy={center}
                            r={radius}
                            fill="none"
                            stroke={statusDotColor[status] || "#71717a"}
                            strokeWidth={strokeWidth}
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            transform={`rotate(-90 ${center} ${center})`}
                            style={{ transition: "stroke-dashoffset 0.5s" }}
                        />
                    );
                })}
                <text x={center} y={center - 4} textAnchor="middle" fontSize="24" fontWeight="700" fill="#18181b">{total}</text>
                <text x={center} y={center + 16} textAnchor="middle" fontSize="10" fill="#71717a" fontWeight="500">Total</text>
            </svg>
            <div className="flex-1 space-y-2 min-w-0">
                {entries.map(([status, count]) => {
                    const pct = Math.round((count / total) * 100);
                    return (
                        <div key={status} className="flex items-center gap-2 text-sm">
                            <span className="size-2.5 rounded-full shrink-0" style={{ backgroundColor: statusDotColor[status] || "#71717a" }} />
                            <span className="text-zinc-700 truncate flex-1">{status}</span>
                            <span className="text-zinc-500 tabular-nums font-medium">{count}</span>
                            <span className="text-zinc-400 tabular-nums w-9 text-right">{pct}%</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

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
            { label: "Total Revenue", value: formatPriceTotal(stats.totalRevenue), icon: DollarSignIcon, iconBg: "bg-green-100 text-green-600" },
            { label: "Total Orders", value: stats.totalOrders.toLocaleString("id-ID"), icon: ShoppingBagIcon, iconBg: "bg-blue-100 text-blue-600" },
            { label: "Avg Order Value", value: formatPriceTotal(stats.avgOrderValue), icon: TrendingUpIcon, iconBg: "bg-purple-100 text-purple-600" },
            { label: "Total Users", value: stats.totalUsers.toLocaleString("id-ID"), icon: UsersIcon, iconBg: "bg-orange-100 text-orange-600" },
            { label: "Total Products", value: stats.totalProducts.toLocaleString("id-ID"), icon: PackageIcon, iconBg: "bg-cyan-100 text-cyan-600" },
            { label: "Out of Stock", value: stats.outOfStock.toLocaleString("id-ID"), icon: AlertTriangleIcon, iconBg: "bg-red-100 text-red-600" },
            { label: "Delivery Partners", value: stats.totalPartners.toLocaleString("id-ID"), icon: TruckIcon, iconBg: "bg-amber-100 text-amber-600" },
        ]
        : [];

    if (loading) return <Loading />;

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-zinc-900">Welcome back! 👋</h1>
                    <p className="text-sm text-zinc-500 mt-1">Here's what's happening with your store today.</p>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.slice(0, 4).map((card) => (
                    <div key={card.label} className="bg-white rounded-2xl p-5 border border-app-border hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                            <div className={`size-10 rounded-xl flex-center ${card.iconBg}`}>
                                <card.icon className="size-5" />
                            </div>
                            <button className="text-zinc-400 hover:text-zinc-600"><MoreHorizontalIcon className="size-4" /></button>
                        </div>
                        <p className="text-xl lg:text-2xl font-semibold text-zinc-900 tabular-nums">{card.value}</p>
                        <p className="text-sm text-zinc-500 mt-0.5">{card.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {cards.slice(4).map((card) => (
                    <div key={card.label} className="bg-white rounded-2xl p-5 border border-app-border hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                            <div className={`size-10 rounded-xl flex-center ${card.iconBg}`}>
                                <card.icon className="size-5" />
                            </div>
                        </div>
                        <p className="text-xl lg:text-2xl font-semibold text-zinc-900 tabular-nums">{card.value}</p>
                        <p className="text-sm text-zinc-500 mt-0.5">{card.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl border border-app-border p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h2 className="text-base font-semibold text-zinc-900">Revenue Overview</h2>
                            <p className="text-sm text-zinc-500 mt-0.5">Last 7 days performance</p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-semibold text-zinc-900 tabular-nums">
                                {formatPriceTotal(stats?.dailyRevenue.reduce((s, d) => s + d.revenue, 0) || 0)}
                            </p>
                            <p className="text-xs text-green-600 font-medium flex items-center gap-1 justify-end mt-0.5">
                                <ArrowUpIcon className="size-3" /> Total this week
                            </p>
                        </div>
                    </div>
                    <RevenueLineChart data={stats?.dailyRevenue || []} />
                </div>

                <div className="bg-white rounded-2xl border border-app-border p-6">
                    <div className="mb-4">
                        <h2 className="text-base font-semibold text-zinc-900">Order Status</h2>
                        <p className="text-sm text-zinc-500 mt-0.5">Distribution by status</p>
                    </div>
                    {Object.keys(stats?.statusBreakdown || {}).length > 0 ? (
                        <StatusDonut data={stats?.statusBreakdown || {}} />
                    ) : (
                        <p className="text-sm text-zinc-500 text-center py-12">No orders yet.</p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 bg-white rounded-2xl border border-app-border overflow-hidden">
                    <div className="px-5 py-4 border-b border-app-border">
                        <h2 className="text-base font-semibold text-zinc-900">Top Products</h2>
                        <p className="text-xs text-zinc-500 mt-0.5">Best sellers</p>
                    </div>
                    {stats?.topProducts && stats.topProducts.length > 0 ? (
                        <div className="divide-y divide-app-border">
                            {stats.topProducts.map((product, i) => (
                                <div key={product.id} className="flex items-center gap-3 p-4 hover:bg-zinc-50 transition-colors">
                                    <span className="size-7 rounded-lg bg-app-cream flex-center text-xs font-semibold text-zinc-500 shrink-0">{i + 1}</span>
                                    <img src={product.image} alt={product.name} className="size-10 rounded-lg object-cover shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-zinc-900 truncate">{product.name}</p>
                                        <p className="text-xs text-zinc-500">{product.totalSold} sold</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-zinc-500 text-center py-12">No sales yet.</p>
                    )}
                </div>

                <div className="lg:col-span-2 bg-white rounded-2xl border border-app-border overflow-hidden">
                    <div className="px-5 py-4 border-b border-app-border flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-semibold text-zinc-900">Recent Orders</h2>
                            <p className="text-xs text-zinc-500 mt-0.5">Latest transactions</p>
                        </div>
                        <Link to="/admin/orders" className="text-sm font-medium text-app-orange hover:text-app-orange-dark transition-colors">
                            View All →
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-zinc-50 text-zinc-500 uppercase text-[11px] font-semibold tracking-wider">
                                <tr>
                                    <th className="px-5 py-3">Order</th>
                                    <th className="px-5 py-3">Customer</th>
                                    <th className="px-5 py-3">Total</th>
                                    <th className="px-5 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-app-border">
                                {stats?.recentOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-5 py-8 text-center text-zinc-500">No orders yet.</td>
                                    </tr>
                                ) : (
                                    stats?.recentOrders.map((order: any) => (
                                        <tr key={order.id} className="hover:bg-zinc-50/50 transition-colors">
                                            <td className="px-5 py-3.5 font-mono text-xs text-zinc-500">#{order.id.slice(-6).toUpperCase()}</td>
                                            <td className="px-5 py-3.5">
                                                <p className="font-medium text-zinc-900">{order.user?.name || "—"}</p>
                                                <p className="text-xs text-zinc-500">{order.user?.email || ""}</p>
                                            </td>
                                            <td className="px-5 py-3.5 font-semibold text-zinc-900 tabular-nums">{formatPriceTotal(order.total || 0)}</td>
                                            <td className="px-5 py-3.5">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusBgColor[order.status] || "bg-zinc-100 text-zinc-600"}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}