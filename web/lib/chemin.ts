/**
 * Préfixe des fichiers du dossier public quand le site est servi dans un
 * sous-dossier (GitHub Pages : /Theatre-). Les liens next/link l'ajoutent seuls.
 */
export const BASE = process.env.NEXT_PUBLIC_BASE_PATH || ''

export const avecBase = (chemin: string) => `${BASE}${chemin}`
