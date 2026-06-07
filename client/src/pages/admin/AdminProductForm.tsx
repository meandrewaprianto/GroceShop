import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeftIcon } from "lucide-react";
import { useCategories } from "../../hooks/useCategories";
import Loading from "../../components/Loading";
import CurrencyInput from "../../components/CurrencyInput";
import api from "../../config/api";
import toast from "react-hot-toast";

// Compress an image File in the browser using Canvas.
// Target: max dimension 1200px, JPEG quality 0.8.
// This keeps product images well under Vercel's 4.5 MB request body limit.
async function compressImage(file: File, maxDimension = 1200, quality = 0.8): Promise<File> {
    // Skip non-images and small files
    if (!file.type.startsWith("image/")) return file;
    if (file.size <= 500 * 1024) return file; // already under ~500KB

    const imgBitmap = await createImageBitmap(file);
    let { width, height } = imgBitmap;

    if (width > maxDimension || height > maxDimension) {
        if (width >= height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
        } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
        }
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(imgBitmap, 0, 0, width, height);

    const blob: Blob | null = await new Promise((resolve) =>
        canvas.toBlob((b) => resolve(b), "image/jpeg", quality)
    );

    if (!blob) return file;

    const newName = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], newName, { type: "image/jpeg" });
}

export default function AdminProductForm() {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();
    const { categories } = useCategories();

    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [compressing, setCompressing] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [originalSize, setOriginalSize] = useState<number | null>(null);
    const [compressedSize, setCompressedSize] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        originalPrice: "",
        image: "",
        category: "",
        unit: "",
        stock: "",
        isOrganic: false,
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (isEdit) {
                    const { data: prodData } = await api.get(`/products/${id}`);
                    const p = prodData.product
                    setFormData({
                        name: p.name,
                        description: p.description,
                        price: p.price.toString(),
                        originalPrice: p.originalPrice ? p.originalPrice.toString() : "",
                        image: p.image,
                        category: p.category,
                        unit: p.unit,
                        stock: p.stock.toString(),
                        isOrganic: p.isOrganic,
                    })
                }
            } catch (error: unknown) {
                if (error instanceof Error) {
                    toast.error(error.message);
                }
            } finally {
                setLoading(false)
            }
        };
        fetchData();
    }, [id, isEdit]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            setImageFile(null);
            setOriginalSize(null);
            setCompressedSize(null);
            return;
        }

        setOriginalSize(file.size);
        setCompressing(true);
        try {
            const compressed = await compressImage(file);
            setImageFile(compressed);
            setCompressedSize(compressed.size);
            if (compressed.size < file.size) {
                toast.success(`Image compressed: ${(file.size / 1024).toFixed(0)}KB → ${(compressed.size / 1024).toFixed(0)}KB`);
            }
        } catch (err) {
            console.error("Compression failed, using original:", err);
            setImageFile(file);
            setCompressedSize(file.size);
        } finally {
            setCompressing(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            let finalImageUrl = formData.image;

            if (imageFile) {
                const formDataUpload = new FormData();
                formDataUpload.append("image", imageFile);
                const { data } = await api.post("/upload", formDataUpload, {
                    timeout: 60000, // 60s for slow Cloudinary uploads
                });
                finalImageUrl = data.url
            }

            if (!finalImageUrl) {
                toast.error("Please upload a product image");
                setSaving(false);
                return
            }

            const payload = {
                ...formData,
                image: finalImageUrl,
                price: Number(formData.price),
                originalPrice: formData.originalPrice ? Number(formData.originalPrice) : 0,
                stock: Number(formData.stock),
            }

            if (isEdit) {
                await api.put(`/products/${id}`, payload);
                toast.success('Product updated successfully')
            } else {
                await api.post('/products', payload);
                toast.success('Product created successfully')
            }
            navigate('/admin/products')
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                const msg = error.response?.data?.message || error.message;
                toast.error(msg);
            } else if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("Failed to save product");
            }
        } finally {
            setSaving(false)
        }
    };

    return (
        <>
            <div className="bg-white rounded-2xl shadow-sm border border-app-border overflow-hidden">
                <div className="px-6 py-5 border-b border-app-border flex items-center gap-4">
                    <Link to="/admin/products" className="p-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-500 rounded-lg transition-colors">
                        <ArrowLeftIcon className="size-5" />
                    </Link>
                    <h2 className="text-xl font-semibold text-zinc-900">{isEdit ? "Edit Product" : "New Product"}</h2>
                </div>
                {loading ? (
                    <Loading />
                ) : (
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-2">Name</label>
                                <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 focus:border-app-green focus:ring-1 focus:ring-app-green outline-none transition-all" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-2">Category</label>
                                <input
                                    required
                                    type="text"
                                    list="category-list"
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    placeholder="Type or select a category"
                                    className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 focus:border-app-green focus:ring-1 focus:ring-app-green outline-none transition-all"
                                />
                                <datalist id="category-list">
                                    {categories.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                                </datalist>
                            </div>
                            <div>
                                <label htmlFor="price" className="block text-sm font-medium text-zinc-700 mb-2">Price</label>
                                <CurrencyInput
                                    id="price"
                                    name="price"
                                    required
                                    value={formData.price}
                                    onChange={(v) => setFormData({ ...formData, price: v })}
                                    placeholder="15.000"
                                />
                                <p className="text-xs text-zinc-500 mt-1">Harga jual produk dalam Rupiah</p>
                            </div>
                            <div>
                                <label htmlFor="originalPrice" className="block text-sm font-medium text-zinc-700 mb-2">Original Price <span className="text-zinc-400 font-normal">— Optional</span></label>
                                <CurrencyInput
                                    id="originalPrice"
                                    name="originalPrice"
                                    value={formData.originalPrice}
                                    onChange={(v) => setFormData({ ...formData, originalPrice: v })}
                                    placeholder="20.000"
                                />
                                <p className="text-xs text-zinc-500 mt-1">Harga coret (untuk label diskon). Kosongkan jika tidak ada diskon.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-2">Unit</label>
                                <input required type="text" placeholder="e.g., kg, piece, liter" value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 focus:border-app-green focus:ring-1 focus:ring-app-green outline-none transition-all" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-2">Stock</label>
                                <input required type="number" min="0" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 focus:border-app-green focus:ring-1 focus:ring-app-green outline-none transition-all" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-zinc-700 mb-2">Product Image</label>
                                <div className="flex items-center gap-4">
                                    {(imageFile || formData.image) && (
                                        <div className="size-16 rounded-lg border border-zinc-200 overflow-hidden shrink-0 bg-app-cream">
                                            <img src={imageFile ? URL.createObjectURL(imageFile) : formData.image} alt="Preview" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 focus:border-app-green outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-app-orange file:text-white hover:file:bg-orange-600 cursor-pointer"
                                        />
                                        {compressing && (
                                            <p className="text-xs text-zinc-500 mt-1">Compressing image...</p>
                                        )}
                                        {!compressing && originalSize && compressedSize && originalSize !== compressedSize && (
                                            <p className="text-xs text-zinc-500 mt-1">
                                                Compressed: {(originalSize / 1024).toFixed(0)}KB → {(compressedSize / 1024).toFixed(0)}KB
                                            </p>
                                        )}
                                        {!compressing && compressedSize && (
                                            <p className="text-xs text-zinc-500 mt-1">
                                                Max upload size: 4MB (Vercel limit)
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-zinc-700 mb-2">Description</label>
                                <textarea required rows={4} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 focus:border-app-green focus:ring-1 focus:ring-app-green outline-none transition-all resize-none" />
                            </div>
                            <div className="flex items-center gap-3">
                                <label htmlFor="isOrganic" className="text-sm font-medium text-zinc-700 cursor-pointer">Organic</label>
                                <input type="checkbox" id="isOrganic" checked={formData.isOrganic} onChange={e => setFormData({ ...formData, isOrganic: e.target.checked })} className="size-5 text-app-green rounded border-zinc-300 focus:ring-app-green cursor-pointer" />
                            </div>
                        </div>

                        <div className="pt-6 border-t border-app-border flex justify-end gap-3">
                            <Link
                                to="/admin/products"
                                className="px-6 py-2.5 bg-zinc-100 text-zinc-600 font-medium rounded-lg hover:bg-zinc-200 transition-colors"
                            >
                                Cancel
                            </Link>
                            <button
                                disabled={saving || compressing}
                                type="submit"
                                className="px-6 py-2.5 bg-app-orange text-white font-medium rounded-lg hover:bg-orange-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 min-w-[140px] justify-center"
                            >
                                {saving ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                        </svg>
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    "Save Product"
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </>
    );
}
