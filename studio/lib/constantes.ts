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

/*
 * Étiquettes d'un spectacle. Les valeurs servent de clés (site, filtres, liens #midi-theatre) :
 * on peut changer un titre, jamais une valeur. Même liste dans web/lib/constantes.ts.
 */
export const ETIQUETTES = [
  {title: 'Création', value: 'creation'},
  {title: 'Coproduction', value: 'coproduction'},
  {title: 'Compagnie en résidence', value: 'residence'},
  {title: 'Midi théâtre', value: 'midi-theatre'},
  {title: 'Afterwork', value: 'afterwork'},
  {title: 'Saison musicale classique', value: 'saison-musicale'},
  {title: 'Hors saison', value: 'hors-saison'},
  {title: 'Nova Jazz', value: 'nova-jazz'},
  {title: 'Bord de scène', value: 'bord-de-scene'},
  {title: 'Avant-spectacle', value: 'avant-spectacle'},
  {title: 'Librairie Payot', value: 'librairie'},
  {title: 'Médiation le soir du spectacle', value: 'mediation'},
  {title: 'Version FALC', value: 'falc'},
  {title: 'Adapté aux personnes malentendantes', value: 'malentendants'},
  {title: 'Langue des signes (LSF)', value: 'lsf'},
  {title: 'Surtitré', value: 'surtitrage'},
  {title: 'Audiodescription', value: 'audiodescription'},
  {title: 'Avec Ecoute Voir', value: 'ecoute-voir'},
]

/** Les équipes, dans l'ordre de la page Équipe. */
export const GROUPES_EQUIPE = [
  {title: 'Direction et administration', value: 'direction'},
  {title: 'Communication et médiation', value: 'communication'},
  {title: 'Billetterie', value: 'billetterie'},
  {title: 'Accueil et salle', value: 'accueil'},
  {title: 'Technique', value: 'technique'},
  {title: 'Graphisme et impression', value: 'prestataires'},
  {title: 'Comité des Ami·es du TBB', value: 'comite-amis'},
  {title: 'Autres', value: 'autres'},
]

export const TYPES_PARTENAIRES = [
  {title: 'Pouvoirs publics', value: 'institution'},
  {title: 'Partenaires et soutiens', value: 'partenaire'},
  {title: 'Partenaires culturels', value: 'culturel'},
  {title: 'Médias', value: 'media'},
  {title: 'Prestataires et commerces', value: 'prestataire'},
]

export const CATEGORIES_RENDEZ_VOUS = [
  {title: 'Grand rendez-vous de la saison', value: 'festival'},
  {title: 'Événement au TBB', value: 'evenement'},
  {title: 'Rencontre ou bord de scène', value: 'rencontre'},
  {title: 'Atelier', value: 'atelier'},
  {title: 'Exposition', value: 'exposition'},
  {title: 'Visite', value: 'visite'},
  {title: 'Activité des Ami·es', value: 'amis'},
]

export const TYPES_PRESSE = [
  {title: 'Article', value: 'article'},
  {title: 'Radio', value: 'radio'},
  {title: 'Télévision', value: 'tv'},
  {title: 'En ligne', value: 'web'},
]

export const STATUTS = [
  {title: 'En vente', value: 'en-vente'},
  {title: 'Complet', value: 'complet'},
  {title: 'Liste d’attente', value: 'liste-attente'},
  {title: 'Annulé', value: 'annule'},
]

/** Adresses réservées par le site, interdites pour les pages. */
export const SLUGS_RESERVES = ['programme', 'spectacles', 'rendez-vous', 'api', 'studio', 'recherche']

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
