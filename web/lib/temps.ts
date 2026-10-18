/**
 * L'instant présent. TBB_AUJOURDHUI (par exemple 2026-10-18T12:00:00+02:00)
 * fige la date pour une démonstration ou un test.
 */
export function maintenant(): Date {
  const fixe = process.env.TBB_AUJOURDHUI
  const date = fixe ? new Date(fixe) : new Date()
  return Number.isNaN(date.getTime()) ? new Date() : date
}
