import type {DocumentBadgeComponent} from 'sanity'

type Representation = {dateHeure?: string; statut?: string}

/** Badge en haut de chaque spectacle : À venir, Complet ou Passé. */
export const BadgeSpectacle: DocumentBadgeComponent = (props) => {
  const doc = (props.draft || props.published) as {representations?: Representation[]} | null
  const dates = doc?.representations?.filter((r) => r.dateHeure) ?? []
  if (!dates.length) return null
  const maintenant = new Date().toISOString()
  const avenir = dates.filter((r) => (r.dateHeure as string) >= maintenant)
  if (!avenir.length) return {label: 'Passé', title: 'Toutes les dates sont passées', color: 'warning'}
  if (avenir.every((r) => r.statut === 'complet')) return {label: 'Complet', title: 'Toutes les dates à venir sont complètes', color: 'danger'}
  return {label: 'À venir', title: `${avenir.length} date(s) à venir`, color: 'success'}
}
