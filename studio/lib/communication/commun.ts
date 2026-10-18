import {local, heureLisible, dateLongue, minutesDuree} from '../temps.ts'

/*
 * Ce que partagent les générateurs (lettre d'information, feuille de salle, agenda imprimé,
 * textes pour les réseaux, export) : les données d'un spectacle, l'échappement HTML,
 * les images du CDN de Sanity et les couleurs.
 */

export const VERT = '#019e35'
export const NOIR = '#0d0d0c'
export const ROUGE = '#e3241b'
export const GRIS = '#eef0ed'

export type RepCom = {
  _key: string
  dateHeure: string
  statut?: string
  mention?: string
  lieu?: string | null
  heureAConfirmer?: boolean
  scolaire?: boolean
}

export type BlocTexte = {_type: string; style?: string; listItem?: string; children?: {text?: string}[]}

export type SpectacleCom = {
  _id: string
  titre: string
  sousTitre?: string | null
  compagnie?: string | null
  genre?: string | null
  genreLibelle?: string | null
  precision?: string | null
  etiquettes?: string[] | null
  accroche?: string | null
  age?: string | null
  duree?: string | null
  slug?: string | null
  encre?: string | null
  visuel?: {ref?: string | null; alt?: string | null; hotspot?: {x: number; y: number} | null; dominante?: string | null} | null
  lieu?: string | null
  lieuComplet?: string | null
  adresse?: string | null
  representations?: RepCom[] | null
  prix?: {categorie: string; prix: number; precision?: string | null}[] | null
  noteTarifs?: string | null
  lienBilletterie?: string | null
  texte?: BlocTexte[] | null
  distribution?: {titre?: string | null; lignes?: {role?: string | null; noms?: string | null}[] | null}[] | null
  production?: string | null
  avertissement?: string | null
  deroule?: {titre?: string | null; duree?: string | null}[] | null
  autour?: string[] | null
  presse?: {citation?: string | null; source?: string | null}[] | null
}

export type ReglagesCom = {
  nom?: string | null
  rue?: string | null
  localite?: string | null
  telBilletterie?: string | null
  emailBilletterie?: string | null
  emailGeneral?: string | null
  lienBilletterie?: string | null
  instagram?: string | null
  facebook?: string | null
  horaires?: {jours?: string | null; heures?: string | null}[] | null
  noteHoraires?: string | null
}

/** Ce que les générateurs savent du projet et du site public. */
export type Contexte = {projectId: string; dataset: string; site: string}

export function echapper(texte: string | null | undefined): string {
  return (texte ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** Espaces fines insécables de la typographie française, comme sur le site. */
export function typo(texte: string | null | undefined): string {
  return (texte ?? '')
    .replace(/\b(0\d{2}) (\d{3}) (\d{2}) (\d{2})\b/g, '$1 $2 $3 $4')
    .replace(/[  ]([:;!?»])/g, ' $1')
    .replace(/«[  ]/g, '« ')
}

/** Capitales écrites dans le texte (l'Outlook récent ignore text-transform). */
export const capitales = (texte: string | null | undefined) => (texte ?? '').toLocaleUpperCase('fr-CH')

/** Adresse du CDN de Sanity pour une image, recadrée sur son point important. */
export function urlImage(
  ctx: Contexte,
  visuel: SpectacleCom['visuel'],
  {largeur, hauteur, format = 'jpg'}: {largeur: number; hauteur?: number; format?: 'jpg' | 'png'},
): string | null {
  const ref = visuel?.ref
  const m = ref?.match(/^image-([a-f0-9]+)-(\d+x\d+)-(\w+)$/)
  if (!m) return null
  const params = new URLSearchParams({w: String(largeur), fm: format, q: '80'})
  if (hauteur) {
    params.set('h', String(hauteur))
    params.set('fit', 'crop')
    if (visuel?.hotspot) {
      params.set('crop', 'focalpoint')
      params.set('fp-x', visuel.hotspot.x.toFixed(3))
      params.set('fp-y', visuel.hotspot.y.toFixed(3))
    }
  }
  return `https://cdn.sanity.io/images/${ctx.projectId}/${ctx.dataset}/${m[1]}-${m[2]}.${m[3]}?${params}`
}

function rgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  const plein = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  return [0, 2, 4].map((i) => parseInt(plein.slice(i, i + 2), 16)) as [number, number, number]
}

export const hexValide = (hex?: string | null): hex is string => !!hex && /^#?[0-9a-f]{3}([0-9a-f]{3})?$/i.test(hex.trim())

/** Noir ou blanc sur une couleur, pour garder le contraste (même règle que le site). */
export function texteSur(hex: string): string {
  const [r, g, b] = rgb(hex).map((v) => {
    const x = v / 255
    return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.179 ? NOIR : '#ffffff'
}

/** L'encre du spectacle, sinon le vert du TBB. */
export function encreDe(s: SpectacleCom): string {
  const e = s.encre || s.visuel?.dominante
  return hexValide(e) ? (e.startsWith('#') ? e : `#${e}`).toLowerCase() : VERT
}

/** Adresse publique de la page d'un spectacle. */
export function urlSpectacle(ctx: Contexte, s: SpectacleCom): string {
  return `${ctx.site.replace(/\/$/, '')}/spectacles/${s.slug ?? ''}`
}

/** Les représentations ouvertes au public (sans les scolaires), triées. */
export function repsPubliques(s: SpectacleCom): RepCom[] {
  return [...(s.representations ?? [])].filter((r) => r.dateHeure && !r.scolaire).sort((a, b) => a.dateHeure.localeCompare(b.dateHeure))
}

export function repsEntre(s: SpectacleCom, debut: string, fin: string): RepCom[] {
  return repsPubliques(s).filter((r) => r.dateHeure >= debut && r.dateHeure < fin)
}

/** « jeudi 29 octobre · 20h » */
export function libelleRep(r: RepCom): string {
  const l = local(r.dateHeure)
  return `${dateLongue(l.date)} · ${r.heureAConfirmer ? 'heure à confirmer' : heureLisible(l.heure)}`
}

/** « 29.10 · 20h » */
export function libelleCourt(r: RepCom): string {
  const l = local(r.dateHeure)
  return `${l.date.slice(8, 10)}.${l.date.slice(5, 7)} · ${r.heureAConfirmer ? 'heure à conf.' : heureLisible(l.heure)}`
}

export const STATUTS: Record<string, string> = {
  'en-vente': '',
  complet: 'Complet',
  'liste-attente': 'Liste d’attente',
  annule: 'Annulé',
}

/** Le texte riche d'un spectacle en paragraphes simples. */
export function paragraphes(blocs?: BlocTexte[] | null): {style: string; texte: string}[] {
  return (blocs ?? [])
    .filter((b) => b._type === 'block')
    .map((b) => ({style: b.listItem ? 'puce' : b.style || 'normal', texte: (b.children ?? []).map((c) => c.text ?? '').join('')}))
    .filter((p) => p.texte.trim())
}

/** « 1h10 » si la durée est lisible, sinon le texte saisi. */
export function dureeCourte(duree?: string | null): string {
  const m = minutesDuree(duree)
  if (m === null) return duree ?? ''
  return m >= 60 ? `${Math.floor(m / 60)}h${m % 60 ? String(m % 60).padStart(2, '0') : ''}` : `${m} min`
}

/** Les prix en une ligne : « 40.– / 35.– / 25.– / 15.– » */
export function prixEnLigne(s: SpectacleCom): string {
  if (s.noteTarifs) return s.noteTarifs
  const prix = [...(s.prix ?? [])].sort((a, b) => b.prix - a.prix)
  return prix.length ? prix.map((p) => `${p.prix}.–`).join(' / ') : ''
}
