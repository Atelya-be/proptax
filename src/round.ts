// ──────────────────────────────────────────────
// Arrondi monétaire — helper partagé
// ──────────────────────────────────────────────

/** Arrondit à `decimals` décimales (2 par défaut : centime d'euro). */
export function round(n: number, decimals = 2): number {
  const factor = 10 ** decimals
  return Math.round(n * factor) / factor
}
