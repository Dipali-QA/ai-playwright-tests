// utils/dateHelpers.ts

/** Format a Date as YYYY-MM-DD. */
export function toISODate(d: Date = new Date()): string {
  return d.toISOString().slice(0, 10);
}

/** Add `days` to a date and return a new Date. */
export function addDays(d: Date, days: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + days);
  return out;
}

/** Difference in whole days between two dates (b - a). */
export function daysBetween(a: Date, b: Date): number {
  const ms = b.getTime() - a.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}
