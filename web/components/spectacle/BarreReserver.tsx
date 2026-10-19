'use client'

import {useEffect, useState} from 'react'
import {Externe} from '../Icones'

/**
 * Sur téléphone, la réservation reste à portée de pouce : la barre apparaît
 * dès que le bouton « Réserver » du haut de page sort de l'écran.
 * Avec une adresse, le bouton mène à la billetterie Infomaniak (nouvel onglet) ;
 * sans, il ouvre le tiroir de réservation de la page.
 */
export function BarreReserver({
  titre,
  quand,
  action,
  href,
  externe,
  cible = 'action-reserver',
}: {
  titre: string
  quand?: string | null
  action: string
  href?: string | null
  externe?: boolean
  cible?: string
}) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = document.getElementById(cible)
    if (!el) return
    const observateur = new IntersectionObserver(([e]) => setVisible(!e.isIntersecting && e.boundingClientRect.top < 0), {threshold: 0})
    observateur.observe(el)
    return () => observateur.disconnect()
  }, [cible])

  return (
    <div className="barre-reserver" data-visible={visible ? 'oui' : 'non'} aria-hidden={!visible} inert={!visible}>
      <p>
        <strong>{titre}</strong>
        {quand}
      </p>
      {href ? (
        <a className="btn btn--clair" href={href} {...(externe ? {target: '_blank', rel: 'noopener noreferrer'} : {})}>
          {action}
          {externe && <Externe />}
          {externe && <span className="visuellement-cache"> (billetterie en ligne, nouvel onglet)</span>}
        </a>
      ) : (
        <a className="btn btn--clair" href="#dates" data-reserver="">
          {action}
        </a>
      )}
    </div>
  )
}
