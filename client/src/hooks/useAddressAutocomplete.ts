import { useState, useRef, useCallback } from "react";

export interface Suggestion {
    display_name: string;
    lat: string;
    lon: string;
    address: {
        road?: string;
        house_number?: string;
        city?: string;
        town?: string;
        village?: string;
        municipality?: string;
        county?: string;
        state?: string;
        postcode?: string;
        country?: string;
    };
}

interface UseAddressAutocompleteReturn {
    query: string;
    suggestions: Suggestion[];
    isSearching: boolean;
    setQuery: (q: string) => void;
    search: (q: string) => void;
    clear: () => void;
    selectSuggestion: (suggestion: Suggestion) => {
        address: string;
        city: string;
        state: string;
        zip: string;
        lat: number;
        lng: number;
    };
}

const useAddressAutocomplete = (): UseAddressAutocompleteReturn => {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

    const search = useCallback(async (q: string) => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(async () => {
            if (!q || q.length < 3) {
                setSuggestions([]);
                setIsSearching(false);
                return;
            }

            setIsSearching(true);
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5&addressdetails=1`,
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
    }, []);

    const selectSuggestion = (suggestion: Suggestion) => {
        const addr = suggestion.address;
        const road = addr.road || "";
        const houseNumber = addr.house_number || "";
        const streetAddress = [houseNumber, road].filter(Boolean).join(" ") || suggestion.display_name.split(",")[0]?.trim() || "";

        const parts = suggestion.display_name.split(",").map((s: string) => s.trim());

        setQuery(streetAddress || parts[0] || "");
        setSuggestions([]);

        return {
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
        };
    };

    const clear = useCallback(() => {
        setQuery("");
        setSuggestions([]);
        setIsSearching(false);
    }, []);

    return { query, suggestions, isSearching, setQuery, search, clear, selectSuggestion };
};

export default useAddressAutocomplete;