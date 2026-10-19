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

/** « Réserver » : la boutique Infomaniak s'ouvre dans un nouvel onglet, une page du site sur place. */
function BoutonReserver({lien, className, depuisMenu}: {lien: LienMenu; className: string; depuisMenu?: boolean}) {
  if (/^(https?:)?\/\//.test(lien.href))
    return (
      <a className={className} href={lien.href} target="_blank" rel="noopener noreferrer">
        <Billet />
        {lien.titre}
        <span className="visuellement-cache"> (billetterie en ligne, nouvel onglet)</span>
      </a>
    )
  return (
    <Link className={className} href={lien.href} transitionTypes={depuisMenu ? ['menu'] : undefined}>
      <Billet />
      {lien.titre}
    </Link>
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
 * - Vers une autre page, il reste ouvert le temps que la page arrive dessous, puis se lève
 *   d'un bloc et la découvre : pas de page qui saute pendant que le menu se ferme.
 *   Les autres liens (téléphone, réseaux, page en cours) le ferment tout de suite, comme
 *   le passage en format ordinateur.
 * - Sur ordinateur, en descendant, l'en-tête s'efface pour laisser la place au contenu ; il
 *   revient au moindre mouvement vers le haut. Sur téléphone, il reste toujours visible.
 */
export function Entete({liens, bouton, tel, lienTel, reseaux, affiche = []}: Props) {
  const pathname = usePathname()
  const menu = useRef<HTMLDialogElement>(null)
  const [ouvert, setOuvert] = useState(false)
  // Lien du menu choisi : la page change sous le menu, qui se lève ensuite dessus.
  const [choisi, setChoisi] = useState<string | null>(null)
  const filet = useRef(0)

  // Le choix reste marqué pendant que le menu se lève ; il est oublié à la prochaine ouverture.
  const fermer = useCallback(() => {
    window.clearTimeout(filet.current)
    if (menu.current?.open) menu.current.close()
  }, [])

  const ouvrir = () => {
    const d = menu.current
    if (!d || d.open) return
    setChoisi(null)
    d.showModal()
    setOuvert(true)
    // Le focus va au menu lui-même : aucun bouton n'apparaît encadré à l'ouverture.
    d.focus({preventScroll: true})
  }

  // Changement de page : la nouvelle page est déjà là, sous le menu ; il se lève et la découvre.
  // Le focus passe au contenu, pas au bouton « Menu ».
  useEffect(() => {
    if (!menu.current?.open) return
    fermer()
    document.getElementById('contenu')?.focus({preventScroll: true})
  }, [pathname, fermer])

  // Passage en format ordinateur : le menu de téléphone n'a plus lieu d'être.
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const surChangement = (e: MediaQueryListEvent) => e.matches && fermer()
    mq.addEventListener('change', surChangement)
    return () => mq.removeEventListener('change', surChangement)
  }, [fermer])

  // Sur ordinateur, l'en-tête s'efface en descendant et revient en remontant (globals.css) ;
  // sur téléphone, il reste toujours visible.
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
    const a = (e.target as Element).closest('a')
    if (!a) return
    const url = new URL(a.href, window.location.href)
    const sansBarre = (c: string) => c.replace(/\/+$/, '')
    const autrePage = url.origin === window.location.origin && sansBarre(url.pathname) !== sansBarre(window.location.pathname)
    // Téléphone, réseaux, ancre de la page en cours : le menu se ferme tout de suite.
    if (!autrePage || a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      fermer()
      return
    }
    // Autre page : le menu reste le temps qu'elle arrive (filet de sécurité si elle tarde).
    setChoisi(a.dataset.lien ?? url.pathname)
    window.clearTimeout(filet.current)
    filet.current = window.setTimeout(fermer, 4000)
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
            <BoutonReserver lien={bouton} className="btn btn--plein btn--petit entete__billets" />
            <button type="button" className="btn btn--trait btn--petit entete__menu" aria-haspopup="dialog" aria-expanded={ouvert} aria-controls="menu" onClick={ouvrir}>
              <span className="burger" aria-hidden="true" />
              Menu
            </button>
          </div>
        </div>
      </header>

      <dialog ref={menu} id="menu" className="menu" aria-label="Menu" tabIndex={-1} data-choix={choisi ? '' : undefined} onClose={() => setOuvert(false)} onClick={surClicMenu}>
        <div className="bande menu__haut">
          <div className="cadre entete__barre">
            <Link className="entete__logo" href="/" aria-label="Accueil" transitionTypes={['menu']}>
              <img src={avecBase('/logo-tbb.png')} alt="" width={300} height={259} />
            </Link>
            <div className="entete__actions">
              <BoutonReserver lien={bouton} className="btn btn--vert btn--petit" depuisMenu />
              <button type="button" className="btn btn--trait btn--petit entete__menu" onClick={fermer}>
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
                    <Link href={l.href} aria-current={etatLien(pathname, l.href)} transitionTypes={['menu']} data-lien={l.href} data-choisi={choisi === l.href ? '' : undefined}>
                      {l.titre}
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
