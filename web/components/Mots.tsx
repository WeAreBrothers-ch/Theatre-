import {Fragment, type CSSProperties} from 'react'

/**
 * Un titre découpé en mots, chacun dans son masque, pour les faire monter l'un après
 * l'autre (d'après « Text Reveal (Mask) », 21st.dev). Le découpage se fait au rendu,
 * le texte reste lisible tel quel sans script ; l'animation est dans globals.css.
 */
export function Mots({texte}: {texte?: string | null}) {
  if (!texte) return null
  return (
    <>
      {texte
        .split(' ')
        .filter(Boolean)
        .map((mot, i) => (
          <Fragment key={i}>
            {i > 0 && ' '}
            <span className="mot" style={{'--m': i} as CSSProperties}>
              <span>{mot}</span>
            </span>
          </Fragment>
        ))}
    </>
  )
}
