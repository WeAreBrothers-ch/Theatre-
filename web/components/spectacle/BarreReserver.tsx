'use client'

import {useEffect, useState} from 'react'

/**
 * Sur téléphone, la réservation reste à portée de pouce : la barre apparaît
 * dès que le bouton « Réserver » du haut de page sort de l'écran.
 */
export function BarreReserver({titre, quand, action, cible = 'action-reserver'}: {titre: string; quand?: string | null; action: string; cible?: string}) {
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
      <a className="btn btn--clair" href="#dates" data-reserver="">
        {action}
      </a>
    </div>
  )
}
