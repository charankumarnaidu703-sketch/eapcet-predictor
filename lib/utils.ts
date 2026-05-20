/**
 * Parse a rank string to a number.
 * Returns null for "-", "Not Allotted", "NQ", "0", empty or null.
 */
export function parseRank(rank: string | null | undefined): number | null {
  if (!rank) return null
  const trimmed = rank.trim()
  if (
    trimmed === '-' ||
    trimmed === '' ||
    trimmed.toLowerCase() === 'not allotted' ||
    trimmed.toLowerCase() === 'nq' ||
    trimmed === '0' ||
    trimmed.toLowerCase() === 'n/a'
  ) return null
  const n = Number(trimmed.replace(/,/g, ''))
  return isNaN(n) || n <= 0 ? null : n
}

/**
 * Parse a fee string like "₹ 2.75 L" or "Rs. 85,000" to a number (in rupees).
 * Returns null if parsing fails.
 */
export function parseFee(fee: string | null | undefined): number | null {
  if (!fee) return null
  const s = fee.replace(/[₹Rs.\s]/g, '').replace(/,/g, '').trim()
  if (s.toLowerCase().endsWith('l')) {
    const val = parseFloat(s.slice(0, -1))
    return isNaN(val) ? null : Math.round(val * 100000)
  }
  if (s.toLowerCase().endsWith('k')) {
    const val = parseFloat(s.slice(0, -1))
    return isNaN(val) ? null : Math.round(val * 1000)
  }
  const val = parseFloat(s)
  return isNaN(val) ? null : Math.round(val)
}

/**
 * Format a number as Indian Rupee string e.g. 275000 → "Rs. 2,75,000"
 */
export function formatINR(amount: number): string {
  const s = amount.toString()
  if (s.length <= 3) return `Rs. ${s}`
  const last3 = s.slice(-3)
  const rest = s.slice(0, -3)
  const formatted = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',')
  return `Rs. ${formatted},${last3}`
}

/**
 * Convert a college name to a URL slug.
 * "JNTU Hyderabad" → "jntu-hyderabad"
 */
export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

/**
 * Convert a URL slug back to a display name.
 * "jntu-hyderabad" → "JNTU Hyderabad"
 */
export function fromSlug(slug: string): string {
  return slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

/**
 * Return a Tailwind CSS class string for a probability level.
 */
export function getProbabilityColor(level: string): string {
  switch (level) {
    case 'Safe':      return 'bg-green-100 text-green-800 border-green-300'
    case 'Moderate':  return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    case 'Reach':     return 'bg-orange-100 text-orange-800 border-orange-300'
    case 'Ambitious': return 'bg-red-100 text-red-800 border-red-300'
    default:          return 'bg-gray-100 text-gray-500 border-gray-200'
  }
}

/**
 * Return hex color for recharts line based on probability level.
 */
export function getProbabilityHex(level: string): string {
  switch (level) {
    case 'Safe':      return '#16a34a'
    case 'Moderate':  return '#ca8a04'
    case 'Reach':     return '#ea580c'
    case 'Ambitious': return '#dc2626'
    default:          return '#9ca3af'
  }
}

/**
 * Clamp a number between min and max.
 */
export function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max)
}
