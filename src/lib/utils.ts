import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date-only value ("YYYY-MM-DD", as Postgres `date` columns come
 * back) for display.
 *
 * `new Date("2026-07-15")` is parsed as UTC midnight, so anywhere west of
 * Greenwich it renders as the previous day. Splitting the parts and using the
 * local-time Date constructor keeps the calendar date the user entered.
 */
export function formatDateOnly(
  value: string,
  options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  }
): string {
  const [y, m, d] = value.split("-").map(Number)
  const date =
    Number.isFinite(y) && Number.isFinite(m) && Number.isFinite(d)
      ? new Date(y, m - 1, d)
      : new Date(value)
  return date.toLocaleDateString("en-US", options)
}
