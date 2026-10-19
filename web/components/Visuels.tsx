import type {CSSProperties} from 'react'
import {preload} from 'react-dom'
import type {SourceImage} from '@/lib/image'
import type {Encre} from '@/lib/encre'
import {styleEncre} from '@/lib/encre'

/*
 * Images, utilisables côté serveur comme côté client : elles reçoivent une
 * source déjà calculée (srcset, dimensions) et ne font aucun appel.
 */

type Variante = {media: string; source: SourceImage | null; sizes: string}

type ImageProps = {
  source: SourceImage | null
  sizes: string
  priorite?: boolean
  alt?: string
  /** Autre cadrage pour les grands écrans (élément <picture>). */
  variante?: Variante
}

function Img({source, sizes, priorite, alt, gris, variante}: ImageProps & {gris?: boolean}) {
  if (!source) return null
  if (priorite) {
    // L'image principale est annoncée dans l'en-tête de la page, avant d'être lue dans le corps
    // (React ne le fait pas pour les images de <picture>) : un cadrage par taille d'écran.
    const autre = variante?.source
    preload(source.src, {as: 'image', imageSrcSet: source.srcSet, imageSizes: sizes, fetchPriority: 'high', media: autre ? `not all and ${variante.media}` : undefined})
    if (autre) preload(autre.src, {as: 'image', imageSrcSet: autre.srcSet, imageSizes: variante.sizes, fetchPriority: 'high', media: variante.media})
  }
  const style: CSSProperties = {}
  if (source.position) style.objectPosition = source.position
  if (source.lqip) style.backgroundImage = `url(${source.lqip})`
  const img = (
    <img
      src={source.src}
      srcSet={source.srcSet}
      sizes={sizes}
      width={source.width}
      height={source.height}
      alt={alt ?? source.alt}
      loading={priorite ? 'eager' : 'lazy'}
      fetchPriority={priorite ? 'high' : undefined}
      decoding={priorite ? 'sync' : 'async'}
      data-gris={gris && !source.grisFait ? 'css' : undefined}
      data-contraste={gris && source.contraste ? '' : undefined}
      style={Object.keys(style).length ? style : undefined}
    />
  )
  if (!variante?.source) return img
  return (
    <picture>
      <source media={variante.media} srcSet={variante.source.srcSet} sizes={variante.sizes} width={variante.source.width} height={variante.source.height} />
      {img}
    </picture>
  )
}

/** Photo « imprimée » dans l'encre d'un spectacle (multiplication ou écran). */
export function ImageImprimee({
  source,
  sizes,
  priorite,
  alt,
  variante,
  encre,
  impression = 'noir',
  trame,
  className,
}: ImageProps & {encre?: Encre; impression?: 'noir' | 'blanc'; trame?: boolean; className?: string}) {
  return (
    <div
      className={['imprime', trame ? 'trame' : '', className ?? ''].filter(Boolean).join(' ')}
      data-impression={impression}
      style={encre ? styleEncre(encre) : undefined}
    >
      <Img source={source} sizes={sizes} priorite={priorite} alt={alt} variante={variante} gris />
    </div>
  )
}

/** Photo en couleur (ou en noir et blanc par la feuille de style). */
export function Photo({source, sizes, priorite, alt, className}: ImageProps & {className?: string}) {
  if (!source) return null
  return (
    <div className={['photo', className ?? ''].filter(Boolean).join(' ')}>
      <Img source={source} sizes={sizes} priorite={priorite} alt={alt} />
    </div>
  )
}

/** Le bandeau collé en biais : le texte est répété pour couvrir la diagonale. */
export function Bandeau({texte, ton}: {texte: string; ton: 'rouge' | 'papier' | 'encre' | 'vert'}) {
  const ligne = `${texte} · ${texte} · ${texte} · ${texte}`
  return (
    <span className={`bandeau${ton === 'encre' ? '' : ` bandeau--${ton}`}`} aria-hidden="true">
      {ligne}
    </span>
  )
}
