import Link from 'next/link'
import type {ReactNode} from 'react'
import {NOUVEL_ONGLET, sortDuSite} from '@/lib/liens'

/** Lien interne (navigation instantanée) ; un lien qui sort du site s'ouvre dans un nouvel onglet. */
export function LienSite({href, children, className}: {href: string; children: ReactNode; className?: string}) {
  if (sortDuSite(href)) {
    return (
      <a className={className} href={href} {...NOUVEL_ONGLET}>
        {children}
        <span className="visuellement-cache"> (nouvel onglet)</span>
      </a>
    )
  }
  if (href.startsWith('mailto:') || href.startsWith('tel:')) {
    return (
      <a className={className} href={href}>
        {children}
      </a>
    )
  }
  return (
    <Link className={className} href={href}>
      {children}
    </Link>
  )
}
