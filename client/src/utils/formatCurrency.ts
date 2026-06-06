/**
 * Convert from USD-like stored value to IDR
 * Using 1 USD ≈ 16,500 IDR rate (configurable)
 */
const USD_TO_IDR_RATE = 16500;

export function usdToIdr(usdAmount: number): number {
    return usdAmount * USD_TO_IDR_RATE;
}

/**
 * Format a number to Indonesian Rupiah (IDR).
 * For product prices stored in USD: converts to IDR.
 * For calculated values (tax, total, etc.) that are already in the correct
 * display currency, use formatIDRRaw instead.
 */
export function formatIDR(amount: number): string {
    const converted = amount < 1000 ? usdToIdr(amount) : amount;
    const rounded = Math.round(converted);
    const formatted = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `Rp ${formatted}`;
}

/**
 * Format a value that is already in IDR (no conversion applied).
 * Use this for calculated values like tax, delivery fee, and total
 * to avoid double-conversion bugs.
 */
export function formatIDRRaw(idrAmount: number): string {
    const rounded = Math.round(idrAmount);
    const formatted = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `Rp ${formatted}`;
}

/**
 * Format a price directly to IDR display (alias for formatIDR)
 */
export function formatPriceToIDR(price: number): string {
    return formatIDR(price);
}

/**
 * Format a calculated total/fee/tax that is already in display currency.
 * Prevents double-conversion when values are under 1000.
 */
export function formatPriceTotal(amount: number): string {
    return formatIDRRaw(amount);
}
