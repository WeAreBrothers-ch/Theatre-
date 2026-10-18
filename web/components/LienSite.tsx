import Link from 'next/link'
import type {ReactNode} from 'react'
import {estExterne} from '@/lib/liens'

/** Lien interne (navigation instantanée) ou externe, selon l'adresse. */
export function LienSite({href, children, className, nouvelOnglet}: {href: string; children: ReactNode; className?: string; nouvelOnglet?: boolean}) {
  if (estExterne(href) || href.startsWith('mailto:') || href.startsWith('tel:')) {
    const externe = estExterne(href) && nouvelOnglet
    return (
      <a className={className} href={href} {...(externe ? {target: '_blank', rel: 'noopener noreferrer'} : {})}>
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
