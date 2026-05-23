/**
 * Utility functions for Omni Marketplace
 */

/** Merge class names, filtering out falsy values */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

/** Format price in Vietnamese Dong (VND) */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(price);
}

/** Format compact number (e.g., 1.2k, 5M) */
export function formatCompact(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}k`;
  return num.toString();
}

/** Calculate discount percentage */
export function calcDiscount(original: number, sale: number): number {
  return Math.round(((original - sale) / original) * 100);
}

/** Generate star rating display */
export function getStarDisplay(rating: number): { full: number; half: boolean; empty: number } {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return { full, half, empty };
}
