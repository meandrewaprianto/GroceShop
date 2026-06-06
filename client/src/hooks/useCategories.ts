import { useState, useEffect } from "react";
import api from "../config/api";
import { categoriesData as fallbackCategories } from "../assets/assets";

interface Category {
    slug: string;
    name: string;
    image?: string;
}

// Default category image for new/unknown categories
const defaultCategoryImage = "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&q=80";

export function useCategories() {
    const [categories, setCategories] = useState<Category[]>(fallbackCategories);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await api.get("/products/categories");
                if (data.categories?.length > 0) {
                    // Preserve images from fallback for matching slugs, use default for new categories
                    const merged = data.categories.map((cat: Category) => {
                        const fallback = fallbackCategories.find(f => f.slug === cat.slug);
                        return { ...cat, image: fallback?.image || defaultCategoryImage };
                    });
                    // Add any categories from fallback that aren't in API response
                    const apiSlugs = merged.map((c: Category) => c.slug);
                    const extras = fallbackCategories.filter(f => !apiSlugs.includes(f.slug));
                    setCategories([...merged, ...extras]);
                }
            } catch {
                // Keep fallback categories on error
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    return { categories, loading };
}
