import {ViewTransition, type ReactNode} from 'react'

/*
 * Changement de page : l'ancienne scène s'efface, la nouvelle monte comme un rideau
 * qui se lève (View Transitions, via React). L'en-tête ne bouge pas.
 * À placer dans chaque page, pas dans la mise en page : elle, ne change jamais.
 */
export function Scene({children}: {children: ReactNode}) {
  return (
    <ViewTransition enter="scene-entree" exit="scene-sortie" default="none">
      <div className="scene">{children}</div>
    </ViewTransition>
  )
}
