// ============================================================
// NESTOR AI — Formatter Utilities
// ============================================================

/**
 * Formats a number (in rupees) into Indian currency notation.
 * Examples:
 *   125_00_000  → "₹1.25 Cr"
 *   45_50_000   → "₹45.5 L"
 *   8_50_000    → "₹8,50,000"
 */
export function formatCurrency(value: number): string {
  if (value >= 1_00_00_000) {
    // 1 Cr+
    const cr = value / 1_00_00_000
    return `₹${parseFloat(cr.toFixed(2))} Cr`
  }
  if (value >= 1_00_000) {
    // 1 L+
    const lakh = value / 1_00_000
    return `₹${parseFloat(lakh.toFixed(2))} L`
  }
  // below 1 L — Indian number format
  return `₹${value.toLocaleString('en-IN')}`
}

/**
 * Formats area in square feet with Indian-style number formatting.
 * Example: 1250 → "1,250 sq.ft."
 */
export function formatArea(value: number): string {
  return `${value.toLocaleString('en-IN')} sq.ft.`
}

/**
 * Formats a confidence score (0–1) as a percentage string.
 * Example: 0.873 → "87.3%"
 */
export function formatConfidence(value: number): string {
  return `${(value * 100).toFixed(1)}%`
}

/**
 * Formats a price-per-sqft value.
 * Example: 12500 → "₹12,500/sq.ft."
 */
export function formatPricePerSqft(value: number): string {
  return `₹${value.toLocaleString('en-IN')}/sq.ft.`
}
