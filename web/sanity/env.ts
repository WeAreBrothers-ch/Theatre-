export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'pgmabzq0'
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
export const apiVersion = '2025-02-19'

/** Adresse du Studio, pour les liens « Modifier » de l'aperçu en direct. */
export const studioUrl = process.env.NEXT_PUBLIC_SANITY_STUDIO_URL || 'https://theatrebennobesson.sanity.studio'

/** Jeton de lecture (brouillons, aperçu en direct). Jamais exposé côté navigateur sauf en mode aperçu. */
export const tokenLecture = process.env.SANITY_API_READ_TOKEN || ''

/** Jeton d'écriture pour enregistrer les messages du formulaire de contact. */
export const tokenEcriture = process.env.SANITY_API_WRITE_TOKEN || ''

/**
 * Source des contenus :
 * - « sanity » : le Content Lake ;
 * - « amorce » : le jeu local web/sanity/amorce.json (développement sans contenu dans Sanity) ;
 * - « auto » (par défaut) : Sanity s'il contient des spectacles, sinon l'amorce.
 */
export const source = (process.env.TBB_SOURCE || 'auto') as 'auto' | 'sanity' | 'amorce'
