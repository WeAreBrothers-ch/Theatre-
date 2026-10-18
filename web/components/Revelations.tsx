'use client'

import {usePathname} from 'next/navigation'
import {useEffect} from 'react'

/*
 * Le mouvement au défilement, inspiré de 21st.dev (« Text Reveal (Mask) », « Stagger Reveal Grid »,
 * « Number Ticker », « Tilt Card »), réécrit sans bibliothèque :
 * - les grands titres montent mot à mot hors de leur masque ;
 * - les cartes et les affiches arrivent une à une, les affiches de travers puis redressées ;
 * - les photos se découvrent derrière un rideau ;
 * - les prix comptent jusqu'à leur valeur ;
 * - sur ordinateur, les affiches s'inclinent sous la souris.
 *
 * Ce qui est déjà à l'écran au chargement ne bouge pas. Le style est dans globals.css.
 */
const TITRES = '.rubrique h2, .mois h2, .appel h2, .lettre h2, .ecrire__intro h2, .citation--affiche blockquote'
const ELEMENTS =
  '.mur > *, .agenda > .ligne, .blocs > .bloc, .tarif, .tarifs__pied > div, .formule, .equipe > li, .plan, .carte-contact, .annuaire > li, .faq details, .acces__moyens, .reperes > .repere, .representation, .encart, .distribution__bloc'
const IMAGES = '.galerie .photo, .photos .photo, .texte-bloc__image .photo, .citation__portrait .photo'
const NOMBRES = '.tarif__prix, .formule__prix'

/** Fait compter un prix de zéro à sa valeur. Seul le texte du nombre change. */
function compter(el: Element) {
  const noeud = el.firstChild
  if (!noeud || noeud.nodeType !== Node.TEXT_NODE) return
  const cible = Number(noeud.nodeValue?.trim())
  if (!Number.isInteger(cible) || cible <= 0 || cible > 9999) return
  const debut = performance.now()
  const duree = 1100
  const pas = (t: number) => {
    const p = Math.min(1, (t - debut) / duree)
    noeud.nodeValue = String(Math.round(cible * (1 - Math.pow(1 - p, 4))))
    if (p < 1) requestAnimationFrame(pas)
  }
  noeud.nodeValue = '0'
  requestAnimationFrame(pas)
}

export function Revelations() {
  const pathname = usePathname()

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return
    const racine = document.documentElement
    const hauteur = window.innerHeight
    const minuteries: number[] = []

    const observateur = new IntersectionObserver(
      (entrees) => {
        for (const e of entrees) {
          if (!e.isIntersecting) continue
          const el = e.target
          el.setAttribute('data-vu', '')
          observateur.unobserve(el)
          if (el.matches(NOMBRES)) compter(el)
          // Une fois arrivée, la carte retrouve son style normal (survol, inclinaison…).
          if (el.classList.contains('revele')) {
            const rang = Number((el as HTMLElement).style.getPropertyValue('--rang')) || 0
            minuteries.push(window.setTimeout(() => el.classList.remove('revele'), 1200 + rang * 90))
          }
        }
      },
      {rootMargin: '0px 0px -12% 0px'},
    )

    const preparer = (el: Element, classe: string, rang = 0) => {
      if (el.hasAttribute('data-vu')) return
      if (!el.classList.contains(classe)) {
        // Déjà visible au chargement : rien ne bouge.
        if (el.getBoundingClientRect().top < hauteur * 0.92) {
          el.setAttribute('data-vu', '')
          return
        }
        el.classList.add(classe)
        if (rang) (el as HTMLElement).style.setProperty('--rang', String(rang))
      }
      observateur.observe(el)
    }

    document.querySelectorAll(TITRES).forEach((el) => preparer(el, 'revele-titre'))
    document.querySelectorAll(IMAGES).forEach((el) => preparer(el, 'revele-image'))
    document.querySelectorAll(NOMBRES).forEach((el) => preparer(el, 'compte'))
    document.querySelectorAll(ELEMENTS).forEach((el) => {
      const freres = el.parentElement ? Array.from(el.parentElement.children).indexOf(el) : 0
      preparer(el, 'revele', freres % 4)
    })
    racine.classList.add('anim')

    return () => {
      observateur.disconnect()
      minuteries.forEach((m) => window.clearTimeout(m))
    }
  }, [pathname])

  // Affiches inclinées sous la souris (ordinateur) : deux variables CSS, rien d'autre.
  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let courante: HTMLElement | null = null
    let image = 0
    let dernier: PointerEvent | null = null
    const appliquer = () => {
      image = 0
      const e = dernier
      if (!e) return
      const affiche = (e.target as Element | null)?.closest?.('a.affiche') as HTMLElement | null
      if (courante && courante !== affiche) for (const v of ['--rx', '--ry', '--gx', '--gy']) courante.style.removeProperty(v)
      courante = affiche
      if (!affiche) return
      const r = affiche.getBoundingClientRect()
      const x = (e.clientX - r.left) / r.width
      const y = (e.clientY - r.top) / r.height
      affiche.style.setProperty('--rx', `${((0.5 - y) * 10).toFixed(2)}deg`)
      affiche.style.setProperty('--ry', `${((x - 0.5) * 12).toFixed(2)}deg`)
      affiche.style.setProperty('--gx', `${(x * 100).toFixed(1)}%`)
      affiche.style.setProperty('--gy', `${(y * 100).toFixed(1)}%`)
    }
    const surMouvement = (e: PointerEvent) => {
      dernier = e
      if (!image) image = requestAnimationFrame(appliquer)
    }
    document.addEventListener('pointermove', surMouvement, {passive: true})
    return () => {
      document.removeEventListener('pointermove', surMouvement)
      cancelAnimationFrame(image)
    }
  }, [])

  return null
}
