import type {ReactNode} from 'react'

/*
 * Le contenu d'une page. Pas d'animation de passage d'une page à l'autre : elle faisait
 * attendre le chargement des images de la page suivante avant de bouger (une à trois
 * secondes sans réaction au toucher). La page change tout de suite ; ses titres et son
 * image d'en-tête ont leur propre entrée (globals.css).
 */
export function Scene({children}: {children: ReactNode}) {
  return <div className="scene">{children}</div>
}
