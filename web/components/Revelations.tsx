'use client'

import {usePathname} from 'next/navigation'
import {useEffect} from 'react'

/*
 * Révélations au défilement, inspirées de « Text Reveal (Mask) » et « Stagger Reveal Grid »
 * (21st.dev), réécrites sans bibliothèque : les grands titres sortent de leur masque,
 * les affiches et les cartes arrivent une à une. Le style est dans globals.css.
 *
 * Ce qui est déjà à l'écran au chargement ne bouge pas. Dans les rangées horizontales
 * du téléphone, l'effet de profondeur (CSS) prend le relais.
 */
const TITRES = '.rubrique h2, .tete-page h1, .mois h2, .appel h2, .lettre h2, .ecrire__intro h2, .citation--affiche blockquote'
const ELEMENTS =
  '.mur > *, .agenda > .ligne, .blocs > .bloc, .tarif, .tarifs__pied > div, .etape, .formule, .equipe > li, .galerie > figure, .photos > figure, .citation__portrait, .texte-bloc__image, .plan, .carte-contact, .annuaire > li, .faq details, .liste-acces > li, .reperes > .repere'

export function Revelations() {
  const pathname = usePathname()

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return
    const racine = document.documentElement
    const telephone = window.matchMedia('(max-width: 1023px)').matches
    const hauteur = window.innerHeight

    const observateur = new IntersectionObserver(
      (entrees) => {
        for (const e of entrees) {
          if (!e.isIntersecting) continue
          e.target.setAttribute('data-vu', '')
          observateur.unobserve(e.target)
        }
      },
      {rootMargin: '0px 0px -12% 0px'},
    )

    const preparer = (el: Element, classe: string, rang = 0) => {
      if (el.hasAttribute('data-vu') || el.classList.contains(classe)) return
      // Déjà visible au chargement : rien ne bouge.
      if (el.getBoundingClientRect().top < hauteur * 0.92) {
        el.setAttribute('data-vu', '')
        return
      }
      el.classList.add(classe)
      if (rang) (el as HTMLElement).style.setProperty('--rang', String(rang))
      observateur.observe(el)
    }

    document.querySelectorAll(TITRES).forEach((el) => preparer(el, 'revele-titre'))
    document.querySelectorAll(ELEMENTS).forEach((el) => {
      if (telephone && el.parentElement?.classList.contains('rangee')) return
      const freres = el.parentElement ? Array.from(el.parentElement.children).indexOf(el) : 0
      preparer(el, 'revele', freres % 4)
    })
    racine.classList.add('anim')

    return () => observateur.disconnect()
  }, [pathname])

  return null
}
