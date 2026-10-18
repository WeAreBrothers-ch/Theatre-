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

/** Étiquettes d'accessibilité : rappelées sur la page du spectacle. */
export const ETIQUETTES_ACCESSIBILITE = ['falc', 'malentendants', 'lsf', 'surtitrage', 'audiodescription', 'ecoute-voir']

export const GROUPES_EQUIPE: Option[] = [
  {title: 'Direction et administration', value: 'direction'},
  {title: 'Communication et médiation', value: 'communication'},
  {title: 'Billetterie', value: 'billetterie'},
  {title: 'Accueil et salle', value: 'accueil'},
  {title: 'Technique', value: 'technique'},
  {title: 'Graphisme et impression', value: 'prestataires'},
  {title: 'Comité des Ami·es du TBB', value: 'comite-amis'},
  {title: 'Autres', value: 'autres'},
]

export const TYPES_PARTENAIRES: Option[] = [
  {title: 'Pouvoirs publics', value: 'institution'},
  {title: 'Partenaires et soutiens', value: 'partenaire'},
  {title: 'Partenaires culturels', value: 'culturel'},
  {title: 'Médias', value: 'media'},
  {title: 'Prestataires et commerces', value: 'prestataire'},
]

export const CATEGORIES_RENDEZ_VOUS: Option[] = [
  {title: 'Grand rendez-vous de la saison', value: 'festival'},
  {title: 'Événement au TBB', value: 'evenement'},
  {title: 'Rencontre ou bord de scène', value: 'rencontre'},
  {title: 'Atelier', value: 'atelier'},
  {title: 'Exposition', value: 'exposition'},
  {title: 'Visite', value: 'visite'},
  {title: 'Activité des Ami·es', value: 'amis'},
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
