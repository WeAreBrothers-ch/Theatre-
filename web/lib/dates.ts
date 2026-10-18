/* Dates et heures affichées à l'heure de Zurich, quel que soit le fuseau du serveur. */

const JOURS = ['Di', 'Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa']
const JOURS_LONGS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']
export const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
export const MOIS_COURTS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.']

const format = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Zurich',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

export type Moment = {
  annee: number
  mois: number // 0 à 11
  jour: number
  semaine: number // 0 = dimanche
  heures: number
  minutes: number
  cleJour: string // 2026-10-29
  cleMois: string // 2026-10
}

const memoire = new Map<string, Moment>()

export function moment(iso: string): Moment {
  const connu = memoire.get(iso)
  if (connu) return connu
  const p: Record<string, string> = {}
  for (const part of format.formatToParts(new Date(iso))) p[part.type] = part.value
  const annee = Number(p.year)
  const mois = Number(p.month) - 1
  const jour = Number(p.day)
  const m: Moment = {
    annee,
    mois,
    jour,
    semaine: new Date(Date.UTC(annee, mois, jour)).getUTCDay(),
    heures: Number(p.hour) % 24,
    minutes: Number(p.minute),
    cleJour: `${p.year}-${p.month}-${p.day}`,
    cleMois: `${p.year}-${p.month}`,
  }
  memoire.set(iso, m)
  return m
}

const deux = (n: number) => String(n).padStart(2, '0')
const quantieme = (n: number) => (n === 1 ? '1er' : String(n))

/** 20h · 19h30 */
export function heure(iso: string): string {
  const m = moment(iso)
  return m.minutes ? `${m.heures}h${deux(m.minutes)}` : `${m.heures}h`
}
/** 29.10 */
export function dateCourte(iso: string): string {
  const m = moment(iso)
  return `${deux(m.jour)}.${deux(m.mois + 1)}`
}
/** Je */
export function jourCourt(iso: string): string {
  return JOURS[moment(iso).semaine]
}
/** jeudi 29 octobre */
export function dateLongue(iso: string): string {
  const m = moment(iso)
  return `${JOURS_LONGS[m.semaine]} ${quantieme(m.jour)} ${MOIS[m.mois]}`
}
/** Jeudi 29 octobre 2026 */
export function dateComplete(iso: string): string {
  const d = dateLongue(iso)
  return `${d.charAt(0).toUpperCase()}${d.slice(1)} ${moment(iso).annee}`
}

export function nomMois(cleMois: string): string {
  return MOIS[Number(cleMois.slice(5, 7)) - 1] ?? ''
}
export function moisCourt(cleMois: string): string {
  return MOIS_COURTS[Number(cleMois.slice(5, 7)) - 1] ?? ''
}

/** Garde une date par jour (un spectacle joué deux fois le même jour compte une fois). */
export function joursDistincts(isos: string[]): string[] {
  const vus = new Set<string>()
  return isos.filter((iso) => {
    const cle = moment(iso).cleJour
    if (vus.has(cle)) return false
    vus.add(cle)
    return true
  })
}

/**
 * Résumé des dates d'un spectacle.
 * Court : « Je 29.10 » · « Je 29 + Ve 30.10 » · « 03.11 → 07.11 »
 * Long : « jeudi 29 octobre » · « jeudi 29 + vendredi 30 octobre » · « du mardi 3 au samedi 7 novembre »
 */
export function resumeDates(isos: string[], long = false): string {
  const ds = joursDistincts(isos)
  if (!ds.length) return ''
  const [a] = ds
  const b = ds[ds.length - 1]
  if (long) {
    if (ds.length === 1) return dateLongue(a)
    const ma = moment(a)
    const mb = moment(b)
    if (ds.length === 2) {
      if (ma.mois === mb.mois) return `${JOURS_LONGS[ma.semaine]} ${quantieme(ma.jour)} + ${dateLongue(b)}`
      return `${dateLongue(a)} + ${dateLongue(b)}`
    }
    if (ma.mois === mb.mois) return `du ${JOURS_LONGS[ma.semaine]} ${quantieme(ma.jour)} au ${dateLongue(b)}`
    return `du ${dateLongue(a)} au ${dateLongue(b)}`
  }
  if (ds.length === 1) return `${jourCourt(a)} ${dateCourte(a)}`
  if (ds.length === 2) {
    const memeMois = moment(a).mois === moment(b).mois
    return `${jourCourt(a)} ${memeMois ? deux(moment(a).jour) : dateCourte(a)} + ${jourCourt(b)} ${dateCourte(b)}`
  }
  return `${dateCourte(a)} → ${dateCourte(b)}`
}

/** « 20h » ou « 19h / 20h » quand les heures varient. */
export function heuresResume(isos: string[]): string {
  return [...new Set(isos.map(heure))].join(' / ')
}

export function majuscule(texte: string): string {
  return texte ? texte.charAt(0).toUpperCase() + texte.slice(1) : texte
}

/** Un jour « AAAA-MM-JJ » (sans heure) lu comme un instant à midi : même jour à Zurich. */
export const midi = (jour: string) => `${jour}T12:00:00Z`

/**
 * La période d'un rendez-vous : « samedi 30 janvier 2027 », « du 5 juin au 15 août 2026 »,
 * « du mercredi 6 au dimanche 9 août 2026 ».
 */
export function periode(debut?: string | null, fin?: string | null): string {
  if (!debut) return ''
  const a = moment(midi(debut))
  if (!fin || fin === debut) return `${dateLongue(midi(debut))} ${a.annee}`
  const b = moment(midi(fin))
  if (a.annee === b.annee && a.mois === b.mois) return `du ${a.jour === 1 ? '1er' : a.jour} au ${dateLongue(midi(fin)).replace(/^\S+ /, '')} ${b.annee}`
  const anneeA = a.annee === b.annee ? '' : ` ${a.annee}`
  return `du ${dateLongue(midi(debut)).replace(/^\S+ /, '')}${anneeA} au ${dateLongue(midi(fin)).replace(/^\S+ /, '')} ${b.annee}`
}
