import { useEffect, useRef, useState } from "react";
import { LoaderIcon, MapPinIcon, SearchIcon } from "lucide-react";
import type { Suggestion } from "../hooks/useAddressAutocomplete";

interface AddressAutocompleteProps {
    value: string;
    onSelect: (result: {
        address: string;
        city: string;
        state: string;
        zip: string;
        lat: number;
        lng: number;
    }) => void;
    onChange?: (value: string) => void;
    placeholder?: string;
    label?: string;
    required?: boolean;
}

const AddressAutocomplete = ({ value, onSelect, onChange, placeholder = "Cari alamat...", label = "Alamat", required = false }: AddressAutocompleteProps) => {
    const [query, setQuery] = useState(value || "");
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

    // Sync external value changes into the query
    useEffect(() => {
        if (value && value !== query) {
            setQuery(value);
        }
    }, [value]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setQuery(val);
        setIsOpen(true);

        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(async () => {
            if (!val || val.length < 3) {
                setSuggestions([]);
                setIsSearching(false);
                return;
            }

            setIsSearching(true);
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}&limit=5&addressdetails=1`,
                    { headers: { "User-Agent": "GroceShop/1.0" } }
                );
                const data = await response.json();
                setSuggestions(data || []);
            } catch {
                setSuggestions([]);
            } finally {
                setIsSearching(false);
            }
        }, 400);

        if (onChange) onChange(val);
    };

    const handleSelect = (suggestion: Suggestion) => {
        const addr = suggestion.address;
        const road = addr.road || "";
        const houseNumber = addr.house_number || "";
        const streetAddress = [houseNumber, road].filter(Boolean).join(" ") || suggestion.display_name.split(",")[0]?.trim() || "";
        const parts = suggestion.display_name.split(",").map((s: string) => s.trim());

        setQuery(streetAddress || parts[0] || "");
        setSuggestions([]);
        setIsOpen(false);

        onSelect({
            address: streetAddress || parts[0] || "",
            city:
                addr.city ||
                addr.town ||
                addr.village ||
                addr.municipality ||
                addr.county ||
                parts[parts.length - 4]?.trim() ||
                "",
            state: addr.state || parts[parts.length - 3]?.trim() || "",
            zip: addr.postcode || parts[parts.length - 2]?.trim() || "",
            lat: parseFloat(suggestion.lat),
            lng: parseFloat(suggestion.lon),
        });
    };

    const handleFocus = () => {
        if (suggestions.length > 0) setIsOpen(true);
    };

    const showDropdown = isOpen && suggestions.length > 0;

    return (
        <div ref={wrapperRef} className="relative">
            {label && (
                <label className="block text-sm font-medium text-app-green mb-1.5">{label}</label>
            )}
            <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-app-text-light" />
                <input
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onFocus={handleFocus}
                    placeholder={placeholder}
                    required={required}
                    className="w-full pl-9 pr-10 py-2.5 text-sm rounded-xl border border-app-border focus:border-app-green outline-none"
                />
                {isSearching && (
                    <LoaderIcon className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-app-green animate-spin" />
                )}
            </div>

            {/* Dropdown Suggestions */}
            {showDropdown && (
                <div className="absolute z-50 mt-1 w-full bg-white rounded-xl border border-app-border shadow-lg max-h-60 overflow-y-auto">
                    {suggestions.map((suggestion, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => handleSelect(suggestion)}
                            className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-app-cream transition-colors border-b border-app-border/50 last:border-b-0"
                        >
                            <MapPinIcon className="size-4 text-app-green mt-0.5 shrink-0" />
                            <div className="min-w-0">
                                <p className="text-sm text-zinc-900 font-medium truncate">
                                    {suggestion.display_name.split(",")[0]?.trim()}
                                </p>
                                <p className="text-xs text-app-text-light truncate">
                                    {suggestion.display_name.split(",").slice(1).join(",").trim()}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AddressAutocomplete;