import type {CSSProperties} from 'react'

/**
 * Un bandeau de mots qui défile sans fin (d'après « Infinite Text Marquee », 21st.dev),
 * en CSS seul : deux copies identiques, la piste glisse de la moitié de sa largeur.
 * Décoratif : le lien qui l'entoure porte le nom accessible.
 */
export function Defilant({mots, vitesse = 3.5}: {mots: string[]; vitesse?: number}) {
  if (!mots.length) return null
  // Assez de mots pour couvrir un écran large, sinon la boucle se verrait.
  let serie = mots
  while (serie.length < 8) serie = [...serie, ...mots]
  return (
    <span className="defilant" aria-hidden="true" style={{'--duree': `${serie.length * vitesse}s`} as CSSProperties}>
      {[0, 1].map((copie) => (
        <span key={copie} className="defilant__piste">
          {serie.map((mot, i) => (
            <span key={i}>{mot}</span>
          ))}
        </span>
      ))}
    </span>
  )
}
