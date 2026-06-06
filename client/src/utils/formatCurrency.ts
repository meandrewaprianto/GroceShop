/**
 * Format a number to Indonesian Rupiah (IDR)
 * Example: formatIDR(25000) => "Rp 25.000"
 * Example: formatIDR(15500.5) => "Rp 15.500"
 */
export function formatIDR(amount: number): string {
    // Round to nearest integer (Rupiah has no cents)
    const rounded = Math.round(amount);

    // Format with thousand separators (dots)
    const formatted = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    return `Rp ${formatted}`;
}

/**
 * Convert from USD-like stored value to IDR
 * Using 1 USD ≈ 16,500 IDR rate (configurable)
 */
const USD_TO_IDR_RATE = 16500;

export function usdToIdr(usdAmount: number): number {
    return usdAmount * USD_TO_IDR_RATE;
}

/**
 * Format a price directly to IDR display (price is stored as Rupiah)
 */
export function formatPriceToIDR(price: number): string {
    return formatIDR(price);
}
