/**
 * Convert from USD-like stored value to IDR
 * Using 1 USD ≈ 16,500 IDR rate (configurable)
 */
const USD_TO_IDR_RATE = 16500;

export function usdToIdr(usdAmount: number): number {
    return usdAmount * USD_TO_IDR_RATE;
}

/**
 * Format a number to Indonesian Rupiah (IDR)
 * Automatically converts from USD-stored value to IDR.
 * Example: formatIDR(45) => "Rp 742.500"
 * Example: formatIDR(420) => "Rp 6.930.000"
 */
export function formatIDR(amount: number): string {
    // If amount is already in Rupiah range (>1000 per item typical), skip conversion
    // Otherwise convert from USD to IDR
    const converted = amount < 1000 ? usdToIdr(amount) : amount;

    // Round to nearest integer
    const rounded = Math.round(converted);

    // Format with thousand separators (dots)
    const formatted = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    return `Rp ${formatted}`;
}

/**
 * Format a price directly to IDR display (alias for formatIDR)
 */
export function formatPriceToIDR(price: number): string {
    return formatIDR(price);
}
