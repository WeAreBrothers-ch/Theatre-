'use client'

import {Children, useEffect, useRef, useState, type ReactNode} from 'react'
import type {Encre} from '@/lib/encre'
import {styleEncre} from '@/lib/encre'
import {Fleche, FlecheGauche} from '../Icones'

/*
 * « À l'affiche » : les diapositives défilent au doigt (défilement natif aimanté,
 * fluide et sans bibliothèque) ; les flèches servent à la souris et au clavier.
 * La couleur du bandeau suit l'encre de la diapositive visible.
 */
export function Carrousel({encres, libelle, children}: {encres: Encre[]; libelle: string; children: ReactNode}) {
  const piste = useRef<HTMLDivElement>(null)
  const [actif, setActif] = useState(0)
  const nombre = Children.count(children)

  useEffect(() => {
    const el = piste.current
    if (!el) return
    const diapos = Array.from(el.children) as HTMLElement[]
    const observateur = new IntersectionObserver(
      (entrees) => {
        for (const e of entrees) {
          if (!e.isIntersecting) continue
          const i = diapos.indexOf(e.target as HTMLElement)
          if (i < 0) continue
          setActif(i)
          diapos.forEach((d, k) => (k === i ? d.setAttribute('data-entree', '') : d.removeAttribute('data-entree')))
        }
      },
      {root: el, threshold: 0.6},
    )
    diapos.forEach((d) => observateur.observe(d))
    return () => observateur.disconnect()
  }, [nombre])

  const aller = (i: number) => {
    const el = piste.current
    const cible = el?.children[i] as HTMLElement | undefined
    if (!el || !cible) return
    const doux = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollTo({left: cible.offsetLeft, behavior: doux ? 'smooth' : 'auto'})
  }

  return (
    <section className="une" style={styleEncre(encres[actif] ?? encres[0])} aria-roledescription="carrousel" aria-label={libelle}>
      <div className="bande">
        <div className="cadre une__barre">
          <p className="t-label">{libelle}</p>
          {nombre > 1 && (
            <div className="une__pagination">
              <button type="button" onClick={() => aller(actif - 1)} disabled={actif === 0} aria-label="Spectacle précédent">
                <FlecheGauche />
              </button>
              <span className="une__compteur t-label chiffres" aria-live="polite">
                {actif + 1} / {nombre}
              </span>
              <button type="button" onClick={() => aller(actif + 1)} disabled={actif === nombre - 1} aria-label="Spectacle suivant">
                <Fleche />
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="une__piste" ref={piste}>
        {children}
      </div>
    </section>
  )
}
