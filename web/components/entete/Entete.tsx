'use client'

import Link from 'next/link'
import {usePathname} from 'next/navigation'
import {useCallback, useEffect, useRef, useState, type CSSProperties, type MouseEvent} from 'react'
import {avecBase} from '@/lib/chemin'
import {Defilant} from '../Defilant'
import {Billet} from '../Icones'

export type LienMenu = {titre: string; href: string}

type Props = {
  liens: LienMenu[]
  bouton: LienMenu
  tel?: string | null
  lienTel?: string | null
  reseaux: LienMenu[]
  /** Titres des prochains spectacles, pour le bandeau qui défile dans le menu. */
  affiche?: string[]
}

/**
 * Le mot qui bascule au survol, lettre par lettre (d'après « Flip Links », 21st.dev) :
 * chaque lettre porte son double en ombre portée, juste en dessous, et remonte d'un cran.
 */
function Bascule({texte}: {texte: string}) {
  return (
    <>
      <span className="visuellement-cache">{texte}</span>
      <span className="bascule" aria-hidden="true">
        {[...texte].map((c, i) => (
          <span key={i} style={{'--l': i} as CSSProperties}>
            {c === ' ' ? '\u00a0' : c}
          </span>
        ))}
      </span>
    </>
  )
}

/** Lien de menu actif : la page elle-même, ou une page de sa rubrique. */
function etatLien(pathname: string, href: string): 'page' | 'true' | undefined {
  const chemin = href.split('#')[0].split('?')[0]
  if (!chemin.startsWith('/')) return undefined
  if (chemin === '/') return pathname === '/' ? 'page' : undefined
  if (pathname === chemin) return 'page'
  if (pathname.startsWith(`${chemin}/`)) return 'true'
  if (chemin === '/programme' && pathname.startsWith('/spectacles/')) return 'true'
  return undefined
}

/*
 * L'en-tête et son menu.
 *
 * - Le menu de téléphone est un <dialog> natif : le focus y reste, Échap le ferme,
 *   le reste de la page est inerte, sans code de piège à focus fragile.
 * - Il se ferme au clic sur n'importe quel lien (même vers une ancre de la page
 *   en cours), au changement de page et quand l'écran passe en format ordinateur.
 * - En descendant, l'en-tête s'efface pour laisser la place au contenu ; il revient
 *   au moindre mouvement vers le haut. Seul un attribut change, sans recalcul de mise en page.
 */
export function Entete({liens, bouton, tel, lienTel, reseaux, affiche = []}: Props) {
  const pathname = usePathname()
  const menu = useRef<HTMLDialogElement>(null)
  const fermerBouton = useRef<HTMLButtonElement>(null)
  const [ouvert, setOuvert] = useState(false)

  const fermer = useCallback(() => {
    if (menu.current?.open) menu.current.close()
  }, [])

  const ouvrir = () => {
    const d = menu.current
    if (!d || d.open) return
    d.showModal()
    setOuvert(true)
    fermerBouton.current?.focus({preventScroll: true})
  }

  // Changement de page : le menu se ferme.
  useEffect(() => {
    fermer()
  }, [pathname, fermer])

  // Passage en format ordinateur : le menu de téléphone n'a plus lieu d'être.
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const surChangement = (e: MediaQueryListEvent) => e.matches && fermer()
    mq.addEventListener('change', surChangement)
    return () => mq.removeEventListener('change', surChangement)
  }, [fermer])

  // En-tête qui s'efface en descendant et revient en remontant.
  useEffect(() => {
    const racine = document.documentElement
    let precedent = window.scrollY
    let cumul = 0
    let image = 0
    const regler = (etat: 'haut' | 'bas') => {
      if (racine.dataset.defile !== etat) racine.dataset.defile = etat
    }
    const mesurer = () => {
      image = 0
      const y = window.scrollY
      const max = racine.scrollHeight - window.innerHeight
      // Rebond élastique d'iOS en haut ou en bas de page : on l'ignore.
      if (y < 0 || y > max) return
      const delta = y - precedent
      precedent = y
      if (y < 140) {
        cumul = 0
        regler('haut')
        return
      }
      if (delta === 0) return
      if (Math.sign(delta) !== Math.sign(cumul)) cumul = 0
      cumul += delta
      if (cumul > 28) regler('bas')
      else if (cumul < -14) regler('haut')
    }
    const surDefilement = () => {
      if (!image) image = requestAnimationFrame(mesurer)
    }
    regler(window.scrollY < 140 ? 'haut' : 'bas')
    window.addEventListener('scroll', surDefilement, {passive: true})
    return () => {
      window.removeEventListener('scroll', surDefilement)
      cancelAnimationFrame(image)
    }
  }, [])

  const surClicMenu = (e: MouseEvent<HTMLDialogElement>) => {
    if ((e.target as Element).closest('a')) fermer()
  }

  return (
    <>
      <header className="entete bande" style={{viewTransitionName: 'entete'}}>
        <div className="cadre entete__barre">
          <Link className="entete__logo" href="/" aria-label="Théâtre Benno Besson, Yverdon-les-Bains : accueil">
            <img src={avecBase('/logo-tbb.png')} alt="" width={300} height={259} />
          </Link>
          <nav className="entete__nav" aria-label="Navigation principale">
            <ul>
              {liens.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} aria-current={etatLien(pathname, l.href)}>
                    <Bascule texte={l.titre} />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="entete__actions">
            <Link className="btn btn--plein btn--petit entete__billets" href={bouton.href}>
              <Billet />
              {bouton.titre}
            </Link>
            <button type="button" className="btn btn--trait btn--petit entete__menu" aria-haspopup="dialog" aria-expanded={ouvert} aria-controls="menu" onClick={ouvrir}>
              <span className="burger" aria-hidden="true" />
              Menu
            </button>
          </div>
        </div>
      </header>

      <dialog ref={menu} id="menu" className="menu" aria-label="Menu" onClose={() => setOuvert(false)} onClick={surClicMenu}>
        <div className="bande menu__haut">
          <div className="cadre entete__barre">
            <Link className="entete__logo" href="/" aria-label="Accueil">
              <img src={avecBase('/logo-tbb.png')} alt="" width={300} height={259} />
            </Link>
            <div className="entete__actions">
              <Link className="btn btn--vert btn--petit" href={bouton.href}>
                <Billet />
                {bouton.titre}
              </Link>
              <button ref={fermerBouton} type="button" className="btn btn--trait btn--petit entete__menu" onClick={fermer}>
                <span className="burger burger--croix" aria-hidden="true" />
                Fermer
              </button>
            </div>
          </div>
        </div>
        <div className="menu__corps bande">
          <div className="cadre">
            <nav aria-label="Menu principal">
              <ol className="menu__liens">
                {liens.map((l, i) => (
                  <li key={l.href} style={{'--i': i} as CSSProperties}>
                    <Link href={l.href} aria-current={etatLien(pathname, l.href)}>
                      <span className="menu__num chiffres" aria-hidden="true">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="menu__mot">{l.titre}</span>
                    </Link>
                  </li>
                ))}
              </ol>
            </nav>
          </div>
        </div>
        {affiche.length > 0 && (
          <Link className="menu__affiche" href="/programme" aria-label="À l’affiche : voir tout le programme">
            <Defilant mots={affiche} />
          </Link>
        )}
        <div className="menu__facade">
          <div>
            <svg className="menu__arches" viewBox="0 0 1300 276" preserveAspectRatio="xMidYMax meet" aria-hidden="true" focusable="false">
              <path d="M0 276A215 215 0 0 1 410.01 185.47A248 248 0 0 1 889.99 185.47A215 215 0 0 1 1300 276Z" />
            </svg>
            <div className="menu__bas bande">
              <div className="cadre">
                {tel && lienTel && (
                  <a className="menu__tel" href={lienTel}>
                    <span className="t-label">Billetterie</span>
                    <span className="chiffres">{tel}</span>
                  </a>
                )}
                {reseaux.length > 0 && (
                  <span className="menu__reseaux">
                    {reseaux.map((r) => (
                      <a key={r.href} href={r.href} target="_blank" rel="noopener noreferrer">
                        {r.titre}
                      </a>
                    ))}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </dialog>
    </>
  )
}
