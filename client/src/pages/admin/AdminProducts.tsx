import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { PlusIcon, EditIcon, PackageXIcon, SearchIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import type { Product } from "../../types";
import Loading from "../../components/Loading";
import api from "../../config/api";
import toast from "react-hot-toast";
import { formatPriceToIDR } from "../../utils/formatCurrency";

const ITEMS_PER_PAGE = 10;

export default function AdminProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    const fetchProducts = async () => {
        try {
            const { data } = await api.get("/products");
            setProducts(data.products);
        } catch (error: any) {
            toast.error(error.response?.data?.message || error?.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const filtered = useMemo(() => {
        if (!search.trim()) return products;
        const q = search.toLowerCase();
        return products.filter(p =>
            p.name.toLowerCase().includes(q) ||
            p.category?.toLowerCase().includes(q)
        );
    }, [products, search]);

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    const handleMarkOutOfStock = async (id: string, name: string) => {
        if (!window.confirm(`Are you sure you want to mark "${name}" as out of stock?`)) return;
        try {
            await api.delete(`/products/${id}`);
            toast.success("Product marked as out of stock");
            fetchProducts();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to update product");
        }
    };

    if (loading) return <Loading />

    return (
        <>
            <div className="bg-white rounded-2xl shadow-sm border border-app-border overflow-hidden">
                {/* Header */}
                <div className="px-6 py-5 border-b border-app-border flex items-center justify-between gap-4 flex-wrap">
                    <h2 className="text-xl font-semibold text-zinc-900">Products</h2>
                    <Link to="/admin/products/new" className="flex items-center gap-2 px-4 py-2 bg-app-green text-white rounded-xl hover:bg-green-950 transition-colors font-medium text-sm">
                        <PlusIcon className="size-4" /> Add Product
                    </Link>
                </div>

                {/* Search */}
                <div className="px-6 py-4 border-b border-app-border">
                    <div className="relative max-w-sm">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-app-border focus:border-app-green outline-none transition-colors"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-app-cream/50 text-zinc-500 uppercase text-xs font-semibold">
                            <tr>
                                <th className="px-6 py-4">Product</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4">Stock</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-app-border">
                            {paginated.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-zinc-500">
                                        {search ? "No products match your search." : "No products found."}
                                    </td>
                                </tr>
                            ) : (
                                paginated.map(product => (
                                    <tr key={product.id} className="hover:bg-zinc-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <img src={product.image} alt={product.name} className="size-12 rounded-lg object-cover shrink-0" />
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-zinc-900 truncate max-w-[200px] sm:max-w-[300px]">{product.name}</p>
                                                    <p className="text-xs text-zinc-500 truncate">{product.category || "Uncategorized"}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium whitespace-nowrap">{formatPriceToIDR(product.price)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${product.stock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                                {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link to={`/admin/products/${product.id}/edit`} className="p-2 text-zinc-500 hover:text-app-orange bg-zinc-100 hover:bg-orange-50 rounded-lg transition-colors" title="Edit">
                                                    <EditIcon className="size-4" />
                                                </Link>
                                                <button onClick={() => handleMarkOutOfStock(product.id, product.name)} title="Mark Out of Stock" className="p-2 text-zinc-500 hover:text-red-600 bg-zinc-100 hover:bg-red-50 rounded-lg transition-colors">
                                                    <PackageXIcon className="size-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-app-border flex items-center justify-between">
                        <p className="text-xs text-zinc-500">
                            Showing {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
                        </p>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 rounded-lg hover:bg-app-cream disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeftIcon className="size-4" />
                            </button>
                            {Array.from({ length: totalPages }).map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPage(i + 1)}
                                    className={`size-8 rounded-lg text-xs font-medium transition-colors ${page === i + 1 ? "bg-app-green text-white" : "hover:bg-app-cream text-zinc-600"}`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="p-2 rounded-lg hover:bg-app-cream disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRightIcon className="size-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}