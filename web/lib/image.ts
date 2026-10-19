import 'server-only'
import {createImageUrlBuilder} from '@sanity/image-url'
import {stegaClean} from 'next-sanity'
import {dataset, projectId} from '@/sanity/env'
import {avecBase} from './chemin'
import type {Img} from '@/sanity/types'

/*
 * Sources d'image responsives.
 * - Images Sanity : le CDN recadre selon le point d'intérêt, convertit en AVIF/WebP
 *   et désature si l'image doit être « imprimée » dans l'encre d'une affiche.
 * - Contenus d'amorçage : variantes WebP préparées par scripts/preparer-amorce.mjs.
 */

const builder = createImageUrlBuilder({projectId, dataset})
const LARGEURS_CDN = [360, 540, 720, 900, 1200, 1600]
const LARGEURS_AMORCE = [480, 960, 1440]

export type SourceImage = {
  src: string
  srcSet: string
  width: number
  height: number
  /** Point d'intérêt, pour object-position quand le navigateur recadre. */
  position?: string
  lqip?: string
  /** L'image est déjà en niveaux de gris ; sinon la feuille de style s'en charge. */
  grisFait: boolean
  /** Désaturée par le CDN, sans renfort de contraste : la feuille de style l'ajoute. */
  contraste?: boolean
  alt: string
}

type Options = {ratio?: number; gris?: boolean; max?: number}

export function sourceImage(img: Img | null | undefined, {ratio, gris = false, max = 1920}: Options = {}): SourceImage | null {
  const url = stegaClean(img?.url)
  if (!img || !url) return null
  const W = img.l || 1600
  const H = img.h || Math.round(W / 1.5)
  const r = ratio ?? W / H
  const position = img.hotspot ? `${Math.round(img.hotspot.x * 100)}% ${Math.round(img.hotspot.y * 100)}%` : undefined
  const alt = stegaClean(img.alt) || ''

  if (url.startsWith('https://cdn.sanity.io/')) {
    const ref = stegaClean(img.ref)
    const base = builder
      .image(ref ? {asset: {_ref: ref}, crop: img.crop ?? undefined, hotspot: img.hotspot ? {width: 1, height: 1, ...img.hotspot} : undefined} : url)
      .auto('format')
      // Une image imprimée en niveaux de gris et tramée supporte une compression plus forte.
      .quality(gris ? 60 : 74)
    const plafond = Math.min(W, max)
    const largeurs = LARGEURS_CDN.filter((l) => l <= plafond)
    if (!largeurs.length || largeurs[largeurs.length - 1] < plafond) largeurs.push(plafond)
    const fabriquer = (l: number) => {
      let b = base.width(l)
      b = ratio ? b.height(Math.round(l / ratio)).fit('crop') : b.fit('max')
      if (gris) b = b.saturation(-100)
      return b.url()
    }
    const defaut = largeurs.find((l) => l >= 720) ?? largeurs[largeurs.length - 1]
    return {
      src: fabriquer(defaut),
      srcSet: largeurs.map((l) => `${fabriquer(l)} ${l}w`).join(', '),
      width: defaut,
      height: Math.round(defaut / r),
      position: ratio ? undefined : position,
      lqip: img.lqip ?? undefined,
      grisFait: gris,
      contraste: gris,
      alt,
    }
  }

  const fichier = (gris && stegaClean(img.gris)) || url
  const racine = avecBase(fichier.replace(/\.(jpe?g|png)$/i, ''))
  const largeurs = [...LARGEURS_AMORCE.filter((l) => l < W), W]
  const defaut = largeurs.find((l) => l >= 960) ?? largeurs[largeurs.length - 1]
  return {
    src: `${racine}-${defaut}.webp`,
    srcSet: largeurs.map((l) => `${racine}-${l}.webp ${l}w`).join(', '),
    width: defaut,
    height: Math.round(defaut / r),
    position,
    grisFait: gris && !!img.gris,
    alt,
  }
}
