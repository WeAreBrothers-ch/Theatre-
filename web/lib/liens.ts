import {stegaClean} from 'next-sanity'
import type {Lien} from '@/sanity/types'

/** Adresse d'un lien du Studio : une page choisie, sinon l'adresse saisie. */
export function hrefLien(lien?: Lien | null): string | null {
  if (!lien) return null
  const slug = stegaClean(lien.page?.slug)
  if (slug) return lien.page?._type === 'spectacle' ? `/spectacles/${slug}` : `/${slug}`
  const url = stegaClean(lien.url)?.trim()
  return url || null
}

export function estExterne(href: string): boolean {
  return /^(https?:)?\/\//.test(href)
}

export function hrefPropre(href?: string | null): string | null {
  const h = stegaClean(href)?.trim()
  return h || null
}

export const hrefSpectacle = (slug: string) => `/spectacles/${slug}`
