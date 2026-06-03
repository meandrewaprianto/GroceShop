const FilterPanel = ({ categories, category, minPrice, maxPrice, updateFilter, clearFilters, hasFilters }: any) => {
    const categoriesWithAll = [{ slug: "", name: "All Categories" }, ...categories]

    const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;
        if (value !== "") {
            const num = Number(value);
            // Cegah angka negatif
            if (num < 0) {
                value = "0";
            }
        }
        updateFilter('minPrice', value);
    };

    const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;
        if (value !== "") {
            const num = Number(value);
            // Cegah angka negatif
            if (num < 0) {
                value = "0";
            }
        }
        updateFilter('maxPrice', value);
    };

    const handleMinBlur = () => {
        if (minPrice && maxPrice) {
            const min = Number(minPrice);
            const max = Number(maxPrice);
            if (max < min) {
                updateFilter('maxPrice', minPrice);
            }
        }
    };

    const handleMaxBlur = () => {
        if (minPrice && maxPrice) {
            const min = Number(minPrice);
            const max = Number(maxPrice);
            if (max < min) {
                updateFilter('maxPrice', minPrice);
            }
        }
    };

    return (
        <div className='space-y-6'>
            {/* Categories */}
            <div>
                <h3 className='text-sm font-semibold text-app-green mb-3'>Categories</h3>
                <div className='space-y-1.5'>
                    {categoriesWithAll.map((cat: any) => (
                        <button key={cat.slug} onClick={() => updateFilter("category", cat.slug)} className={`block w-full text-left px-3 py-2 text-sm rounded-md transition-all ${category === cat.slug ? "bg-app-green text-white" : "text-app-text-light hover:bg-app-cream"}`}>
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Price Range */}
            <div>
                <h3 className="text-sm font-semibold text-app-green mb-3">
                    Price Range
                </h3>
                <div className="flex items-center gap-2">
                    <input 
                        type="number" 
                        placeholder="Min" 
                        min="0"
                        value={minPrice} 
                        onChange={handleMinChange} 
                        onBlur={handleMinBlur}
                        className="w-full px-3 py-2 text-sm bg-white rounded-lg border focus:border-app-green outline-none" 
                    />
                    <span className="text-app-text-light">-</span>
                    <input 
                        type="number" 
                        placeholder="Max" 
                        min={minPrice || "0"}
                        value={maxPrice} 
                        onChange={handleMaxChange} 
                        onBlur={handleMaxBlur}
                        className="w-full px-3 py-2 text-sm bg-white rounded-lg border focus:border-app-green outline-none" 
                    />
                </div>
            </div>

            {hasFilters && (
                <button onClick={clearFilters} className="w-full py-2 text-sm text-app-error hover:bg-red-50 rounded-lg transition-color font-medium">
                    Clear All Filters
                </button>
            )}
        </div>
    )
}

export default FilterPanel