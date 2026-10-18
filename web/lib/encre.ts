import type {CSSProperties} from 'react'

/*
 * Une encre par spectacle : la couleur de l'affiche, celle sous l'image imprimée
 * et celle du texte posé dessus (noir ou blanc selon la clarté de l'encre).
 */

export const VERT = '#019e35'
export const NOIR = '#0d0d0c'
export const BLANC = '#ffffff'

export type Encre = {ink: string; img: string; texte: string}

function rgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  const plein = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  return [0, 2, 4].map((i) => parseInt(plein.slice(i, i + 2), 16)) as [number, number, number]
}

function versHex(c: number[]): string {
  return '#' + c.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('')
}

export function luminance(hex: string): number {
  const [r, g, b] = rgb(hex).map((v) => {
    const x = v / 255
    return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function melanger(a: string, b: string, part: number): string {
  const x = rgb(a)
  const y = rgb(b)
  return versHex(x.map((v, i) => v + (y[i] - v) * part))
}

const valide = (hex?: string | null): hex is string => !!hex && /^#?[0-9a-f]{3}([0-9a-f]{3})?$/i.test(hex.trim())

/** L'encre d'un spectacle ; à défaut, le vert TBB. */
export function encre(...candidates: (string | null | undefined)[]): Encre {
  const brut = candidates.find(valide)
  const ink = brut ? (brut.startsWith('#') ? brut : `#${brut}`).toLowerCase() : VERT
  const L = luminance(ink)
  return {
    ink,
    // Sous une encre très sombre, l'image imprimée s'éclaircit pour rester lisible.
    img: L < 0.12 ? melanger(ink, BLANC, 0.4) : ink,
    texte: L > 0.179 ? NOIR : BLANC,
  }
}

export function styleEncre(e: Encre): CSSProperties {
  return {'--ink': e.ink, '--ink-img': e.img, '--ink-texte': e.texte} as CSSProperties
}

/** Photo claire : le noir s'imprime sur l'encre. Photo sombre : le blanc s'imprime. */
export function impression(choix: string | null | undefined, dominante?: string | null): 'noir' | 'blanc' {
  if (choix === 'noir' || choix === 'blanc') return choix
  return valide(dominante) && luminance(dominante.startsWith('#') ? dominante : `#${dominante}`) < 0.16 ? 'blanc' : 'noir'
}
