/* Listes partagées par les schémas, la structure et le tableau de bord. */

export const PROJECT_ID = 'pgmabzq0'
export const DATASET = 'production'
export const API_VERSION = '2025-02-19'

/** Adresse du site pour l'aperçu en direct (Presentation). */
export const URL_SITE = process.env.SANITY_STUDIO_PREVIEW_URL || 'http://localhost:3000'

export const GENRES = [
  {title: 'Théâtre', value: 'theatre'},
  {title: 'Danse', value: 'danse'},
  {title: 'Humour', value: 'humour'},
  {title: 'Musique', value: 'musique'},
  {title: 'Jeune public', value: 'jeune-public'},
  {title: 'Cirque', value: 'cirque'},
]

export const ETIQUETTES = [
  {title: 'Création', value: 'creation'},
  {title: 'Coproduction', value: 'coproduction'},
  {title: 'Midi théâtre', value: 'midi-theatre'},
  {title: 'Afterwork', value: 'afterwork'},
  {title: 'Compagnie en résidence', value: 'residence'},
  {title: 'Hors saison', value: 'hors-saison'},
  {title: 'Bord de scène', value: 'bord-de-scene'},
  {title: 'Librairie Payot', value: 'librairie'},
  {title: 'Version FALC', value: 'falc'},
  {title: 'Adapté aux personnes malentendantes', value: 'malentendants'},
]

export const STATUTS = [
  {title: 'En vente', value: 'en-vente'},
  {title: 'Complet', value: 'complet'},
  {title: 'Liste d’attente', value: 'liste-attente'},
  {title: 'Annulé', value: 'annule'},
]

/** Adresses réservées par le site, interdites pour les pages. */
export const SLUGS_RESERVES = ['programme', 'spectacles', 'api', 'studio', 'recherche']

const formatDate = new Intl.DateTimeFormat('fr-CH', {
  timeZone: 'Europe/Zurich',
  weekday: 'short',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})
const formatHeure = new Intl.DateTimeFormat('fr-CH', {timeZone: 'Europe/Zurich', hour: '2-digit', minute: '2-digit'})

/** « je 29.10.2026 · 20h00 » pour les aperçus du Studio. */
export function dateLisible(iso?: string): string {
  if (!iso) return 'Sans date'
  const d = new Date(iso)
  return `${formatDate.format(d).replace(/\./g, '.')} · ${formatHeure.format(d).replace(':', 'h')}`
}

export function libelle(liste: {title: string; value: string}[], valeur?: string): string {
  return liste.find((x) => x.value === valeur)?.title ?? ''
}

/** Adresse lisible et sans accents, à partir d'un titre. */
export function slugifier(texte: string): string {
  return texte
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[’'«»"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}
