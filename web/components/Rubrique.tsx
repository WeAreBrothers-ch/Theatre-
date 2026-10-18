import type {ReactNode} from 'react'
import {typo} from '@/lib/typo'

/** En-tête de section : surtitre, grand titre d'affiche, texte et lien facultatifs. */
export function Rubrique({
  surtitre,
  titre,
  texte,
  action,
  id,
  taille = 'xl',
  niveau = 2,
  enfants,
}: {
  surtitre?: string | null
  titre?: string | null
  texte?: string | null
  action?: ReactNode
  id?: string
  taille?: 'xxl' | 'xl' | 'l' | 'm'
  niveau?: 1 | 2
  enfants?: ReactNode
}) {
  if (!titre && !surtitre && !texte && !action) return null
  const Titre = niveau === 1 ? 'h1' : 'h2'
  return (
    <div className="rubrique">
      <div className="rubrique__titre">
        {surtitre && <p className="t-label">{typo(surtitre)}</p>}
        {titre && (
          <Titre className={`t-affiche t-${taille}`} id={id}>
            {typo(titre)}
          </Titre>
        )}
      </div>
      {texte && <p className="rubrique__texte">{typo(texte)}</p>}
      {action && <div className="rubrique__action">{action}</div>}
      {enfants}
    </div>
  )
}
