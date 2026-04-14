import type { DateRange } from "@/types/pagination";

/** Formats a Date as a YYYY-MM year/month string (UTC). */
export function toYearMonth(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

/** Returns the first instant of the UTC month containing `d`. */
export function startOfMonth(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}

/** Returns the first instant of the UTC month after the one containing `d`. */
export function startOfNextMonth(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1));
}

/** Formats a Date as a YYYY-MM-DD ISO 8601 calendar date (UTC). */
export function toIsoDate(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

/**
 * Returns the given range if both bounds are set, otherwise fills in the
 * last `n` months: `to` defaults to the start of the current month, `from`
 * defaults to `n - 1` months earlier.
 */
export function rangeOrLastMonths(range: DateRange, n: number): { from: Date; to: Date } {
  const now = new Date();
  const to = range.to ?? new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const from = range.from ?? new Date(Date.UTC(to.getUTCFullYear(), to.getUTCMonth() - (n - 1), 1));
  return { from, to };
}

/**
 * Returns the given range if both bounds are set, otherwise fills in the
 * last `n` days: `to` defaults to the start of tomorrow (exclusive), `from`
 * defaults to `n` days earlier.
 */
export function rangeOrLastDays(range: DateRange, n: number): { from: Date; to: Date } {
  const now = new Date();
  const to =
    range.to ?? new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  const from = range.from ?? new Date(to.getTime() - n * 24 * 60 * 60 * 1000);
  return { from, to };
}

/**
 * Returns the start date for a given analytics period, or null for all-time.
 * @param period - The analytics period ("today", "week", "month", or "all")
 * @returns The start date for the period, or null for all-time
 */
export function getPeriodStart(period: string): Date | null {
  const now = new Date();

  switch (period) {
    case "today": {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      return start;
    }
    case "week":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "month":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    default:
      return null;
  }
}
