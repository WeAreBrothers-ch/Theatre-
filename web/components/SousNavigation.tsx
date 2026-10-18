import Link from 'next/link'
import {stegaClean} from 'next-sanity'
import {hrefLien} from '@/lib/liens'
import type {Site} from '@/sanity/types'

/*
 * En tête des pages d'une rubrique du menu (Le théâtre : Histoire, Équipe, Technique…),
 * la liste de ses pages, la page en cours marquée. Rien à régler : le menu des Réglages
 * du site suffit.
 */
export function SousNavigation({site, chemin}: {site: Site; chemin: string}) {
  const sansAncre = (h: string) => h.split('#')[0].replace(/\/$/, '') || '/'
  const entree = (site.reglages?.menu ?? []).find((m) => (m.sousLiens ?? []).some((x) => sansAncre(hrefLien(x) ?? '') === chemin))
  if (!entree) return null
  const liens = (entree.sousLiens ?? []).map((x) => ({cle: x._key, titre: x.titre ?? '', href: hrefLien(x) ?? ''})).filter((x) => x.titre && x.href.startsWith('/'))
  if (liens.length < 2) return null
  return (
    <nav className="sous-nav bande" aria-label={stegaClean(entree.titre) || 'Rubrique'}>
      <div className="cadre">
        <span className="sous-nav__titre">{entree.titre}</span>
        {liens.map((l) => (
          <Link key={l.cle} href={l.href} aria-current={sansAncre(l.href) === chemin ? 'page' : undefined}>
            {l.titre}
          </Link>
        ))}
      </div>
    </nav>
  )
}
