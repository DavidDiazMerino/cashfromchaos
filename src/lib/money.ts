export function eur(amount: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(amount);
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Round a price to a natural-looking marketplace number. Low-value items keep
 * whole euros (rounding €18.40→€18 not €20); everything else snaps to the
 * nearest €5 (€110.72→€110, €73.75→€75). Never returns 0 for a positive price.
 */
export function niceRound(n: number): number {
  if (n <= 0) return 0;
  if (n < 30) return Math.max(1, Math.round(n));
  return Math.round(n / 5) * 5;
}

/** Parse the first plausible euro amount out of free buyer text. */
export function parseOffer(text: string): number | undefined {
  // Matches "50", "50€", "€50", "50 euros", "50.5", "1.200" (thousands), "75,50"
  const cleaned = text.replace(/(\d)\.(\d{3})(?!\d)/g, "$1$2"); // 1.200 -> 1200
  const m = cleaned.match(/(?:€\s*)?(\d+(?:[.,]\d{1,2})?)\s*(?:€|eur|euros?)?/i);
  if (!m) return undefined;
  const val = parseFloat(m[1].replace(",", "."));
  return Number.isFinite(val) ? val : undefined;
}
