'use client'

import {Children, useId, useState, type ReactNode} from 'react'

/*
 * Sur téléphone, une série ne montre que ses premiers éléments ; un bouton déplie le reste,
 * sur place. Sur ordinateur, tout est visible et le bouton n'apparaît pas (globals.css).
 */
export function Depliant({visibles, libelle, className, balise: Balise = 'div', children}: {visibles: 4 | 6; libelle: string; className: string; balise?: 'div' | 'ul'; children: ReactNode}) {
  const [ouvert, setOuvert] = useState(false)
  const id = useId()
  const total = Children.count(children)
  return (
    <>
      <Balise id={id} className={className} data-replie={ouvert ? undefined : visibles}>
        {children}
      </Balise>
      {total > visibles && (
        <button type="button" className="depliant" aria-expanded={ouvert} aria-controls={id} onClick={() => setOuvert((v) => !v)}>
          {ouvert ? 'Réduire' : `${libelle} (${total})`}
          <span className="depliant__signe" aria-hidden="true" />
        </button>
      )}
    </>
  )
}
