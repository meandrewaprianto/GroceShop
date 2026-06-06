import { useState } from "react";

interface CurrencyInputProps {
    /** Raw numeric string (e.g. "15000" or "15000.50"). No formatting. */
    value: string;
    /** Called with the new raw numeric string (digits + optional "." for decimals). */
    onChange: (raw: string) => void;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    className?: string;
    name?: string;
    id?: string;
}

/**
 * Format a raw numeric string into Indonesian Rupiah display.
 * - "15000"      -> "15.000"
 * - "1500000"    -> "1.500.000"
 * - "15000.5"    -> "15.000,5"   (decimal uses comma, IDR convention)
 * - ""           -> ""
 */
function formatDisplay(raw: string): string {
    if (!raw) return "";
    const [intPart, decPart] = raw.split(".");
    const intFormatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    if (decPart !== undefined && decPart !== "") {
        return `${intFormatted},${decPart}`;
    }
    // User typed "15000." — show trailing dot/comma to indicate they're entering decimals
    if (raw.endsWith(".")) {
        return `${intFormatted},`;
    }
    return intFormatted;
}

/**
 * Parse whatever the user typed/pasted into a clean raw numeric string.
 * Strips Rp, dots, spaces. Converts comma to period for decimals.
 * Keeps at most one decimal separator.
 */
function parseInput(input: string): string {
    if (!input) return "";
    // Replace comma with period so we can detect decimals uniformly
    let cleaned = input.replace(/,/g, ".");
    // Remove everything except digits and period
    cleaned = cleaned.replace(/[^\d.]/g, "");
    // Keep only the first period
    const firstDot = cleaned.indexOf(".");
    if (firstDot !== -1) {
        cleaned =
            cleaned.slice(0, firstDot + 1) +
            cleaned.slice(firstDot + 1).replace(/\./g, "");
    }
    // Remove leading zeros (but keep "0" and "0.xxx")
    if (cleaned.length > 1 && cleaned.startsWith("0") && !cleaned.startsWith("0.")) {
        cleaned = cleaned.replace(/^0+/, "") || "0";
    }
    return cleaned;
}

/**
 * A controlled Indonesian-Rupiah-styled numeric input.
 * - Shows "Rp" prefix inside the field
 * - Formats with dot thousand separators (15.000, 1.500.000)
 * - Shows raw value while focused (so the user can edit naturally),
 *   formatted value when blurred
 * - The value/onChange contract is always RAW digits — no formatting on the wire
 */
export default function CurrencyInput({
    value,
    onChange,
    placeholder = "0",
    required = false,
    disabled = false,
    className = "",
    name,
    id,
}: CurrencyInputProps) {
    const [isFocused, setIsFocused] = useState(false);
    const displayValue = isFocused ? value : formatDisplay(value);

    return (
        <div className={`relative ${className}`}>
            <span
                aria-hidden="true"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-500 font-semibold pointer-events-none select-none"
            >
                Rp
            </span>
            <input
                id={id}
                name={name}
                type="text"
                inputMode="decimal"
                autoComplete="off"
                required={required}
                disabled={disabled}
                placeholder={placeholder}
                value={displayValue}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onChange={(e) => {
                    onChange(parseInput(e.target.value));
                }}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-zinc-200 focus:border-app-green focus:ring-1 focus:ring-app-green outline-none transition-all disabled:bg-zinc-50 disabled:text-zinc-500"
            />
        </div>
    );
}
