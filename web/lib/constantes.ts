/* Listes partagées avec le Studio (studio/lib/constantes.ts) : mêmes valeurs, mêmes libellés. */

export type Option = {title: string; value: string}

export const GENRES: Option[] = [
  {title: 'Théâtre', value: 'theatre'},
  {title: 'Danse', value: 'danse'},
  {title: 'Humour', value: 'humour'},
  {title: 'Musique', value: 'musique'},
  {title: 'Jeune public', value: 'jeune-public'},
  {title: 'Cirque', value: 'cirque'},
]

export const ETIQUETTES: Option[] = [
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

export const STATUTS: Option[] = [
  {title: 'En vente', value: 'en-vente'},
  {title: 'Complet', value: 'complet'},
  {title: 'Liste d’attente', value: 'liste-attente'},
  {title: 'Annulé', value: 'annule'},
]

export function libelle(liste: Option[], valeur?: string | null): string {
  return liste.find((x) => x.value === valeur)?.title ?? ''
}

/** Adresse lisible et sans accents, à partir d'un titre (même règle que le Studio). */
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

export const NOM_SITE = 'Théâtre Benno Besson'
export const URL_SITE = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')
