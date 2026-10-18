import {stegaClean} from 'next-sanity'

/** Lien YouTube ou Vimeo vers son adresse d'intégration, sans pistage. */
export function integration(url?: string | null): string | null {
  const u = stegaClean(url)
  if (!u) return null
  const yt = u.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/)
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}`
  const vimeo = u.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}?dnt=1`
  return null
}
