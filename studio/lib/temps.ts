/*
 * Les dates et les heures, toujours à l'heure de Zurich, quel que soit l'ordinateur
 * de la personne qui ouvre le Studio (un portable resté à l'heure de Lisbonne ne doit
 * pas décaler une représentation d'une heure).
 *
 * Fichier sans dépendance : il est aussi exécuté par les vérifications (node --test).
 */

export const FUSEAU = 'Europe/Zurich'

export const JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']
export const JOURS_COURTS = ['di', 'lu', 'ma', 'me', 'je', 've', 'sa']
export const MOIS_COURTS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.']
export const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']

/** Un instant lu à Zurich. `semaine` : 0 = dimanche. */
export type Local = {annee: number; mois: number; jour: number; heures: number; minutes: number; semaine: number; date: string; heure: string}

const parties = new Intl.DateTimeFormat('en-CA', {
  timeZone: FUSEAU,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

const deux = (n: number) => String(n).padStart(2, '0')

/** « 2026-10-29T18:00:00Z » → jeudi 29 octobre, 20:00 à Zurich. */
export function local(iso: string | Date): Local {
  const p: Record<string, string> = {}
  for (const x of parties.formatToParts(typeof iso === 'string' ? new Date(iso) : iso)) p[x.type] = x.value
  const annee = Number(p.year)
  const mois = Number(p.month)
  const jour = Number(p.day)
  const heures = Number(p.hour) % 24
  const minutes = Number(p.minute)
  return {
    annee,
    mois,
    jour,
    heures,
    minutes,
    semaine: new Date(Date.UTC(annee, mois - 1, jour)).getUTCDay(),
    date: `${annee}-${deux(mois)}-${deux(jour)}`,
    heure: `${deux(heures)}:${deux(minutes)}`,
  }
}

/** Décalage de Zurich sur l'heure universelle, en minutes, à un instant donné. */
function decalage(ts: number): number {
  const l = local(new Date(ts))
  return (Date.UTC(l.annee, l.mois - 1, l.jour, l.heures, l.minutes) - Math.floor(ts / 60000) * 60000) / 60000
}

/** « 2026-10-29 » + « 20:00 », heure de Zurich → instant ISO (UTC). */
export function versIso(date: string, heure: string): string {
  const [a, m, j] = date.split('-').map(Number)
  const [h, mi] = (heure || '00:00').split(':').map(Number)
  const voulu = Date.UTC(a, m - 1, j, h, mi)
  let ts = voulu - 60 * 60000
  // Deux passes suffisent, même le jour du changement d'heure.
  for (let i = 0; i < 3; i++) ts = voulu - decalage(ts) * 60000
  return new Date(ts).toISOString()
}

/** Le jour d'aujourd'hui à Zurich : « 2026-10-18 ». */
export function aujourdhui(maintenant: Date = new Date()): string {
  return local(maintenant).date
}

/** Ajoute des jours à une date « AAAA-MM-JJ ». */
export function plusJours(date: string, n: number): string {
  const [a, m, j] = date.split('-').map(Number)
  const d = new Date(Date.UTC(a, m - 1, j + n))
  return `${d.getUTCFullYear()}-${deux(d.getUTCMonth() + 1)}-${deux(d.getUTCDate())}`
}

/** Jour de la semaine d'une date « AAAA-MM-JJ » (0 = dimanche). */
export function jourSemaine(date: string): number {
  const [a, m, j] = date.split('-').map(Number)
  return new Date(Date.UTC(a, m - 1, j)).getUTCDay()
}

/** Le lundi de la semaine d'une date. */
export function lundi(date: string): string {
  return plusJours(date, -((jourSemaine(date) + 6) % 7))
}

/** Nombre de jours entre deux dates « AAAA-MM-JJ » (b − a). */
export function ecartJours(a: string, b: string): number {
  const [xa, ma, ja] = a.split('-').map(Number)
  const [xb, mb, jb] = b.split('-').map(Number)
  return Math.round((Date.UTC(xb, mb - 1, jb) - Date.UTC(xa, ma - 1, ja)) / 86400000)
}

/** « 2026-10 » → les dates affichées dans une grille de mois, du lundi au dimanche. */
export function grilleMois(cleMois: string): string[] {
  const premier = `${cleMois}-01`
  const debut = lundi(premier)
  const [a, m] = cleMois.split('-').map(Number)
  const dernier = new Date(Date.UTC(a, m, 0)).getUTCDate()
  const fin = plusJours(`${cleMois}-${deux(dernier)}`, (7 - jourSemaine(`${cleMois}-${deux(dernier)}`)) % 7)
  const jours: string[] = []
  for (let d = debut; d <= fin; d = plusJours(d, 1)) jours.push(d)
  return jours
}

/** « 2026-10 » + n mois. */
export function plusMois(cleMois: string, n: number): string {
  const [a, m] = cleMois.split('-').map(Number)
  const d = new Date(Date.UTC(a, m - 1 + n, 1))
  return `${d.getUTCFullYear()}-${deux(d.getUTCMonth() + 1)}`
}

/** « octobre 2026 » */
export function nomMois(cleMois: string): string {
  const [a, m] = cleMois.split('-').map(Number)
  return `${MOIS[m - 1]} ${a}`
}

/** « 20h » ou « 19h30 » */
export function heureLisible(heure: string): string {
  const [h, m] = heure.split(':')
  return m === '00' ? `${Number(h)}h` : `${Number(h)}h${m}`
}

/** « jeudi 29 octobre » (ou « jeudi 29 octobre 2026 » avec l'année). */
export function dateLongue(date: string, avecAnnee = false): string {
  const [a, m, j] = date.split('-').map(Number)
  return `${JOURS[jourSemaine(date)]} ${j === 1 ? '1er' : j} ${MOIS[m - 1]}${avecAnnee ? ` ${a}` : ''}`
}

/** « je 29.10 » */
export function dateCourte(date: string): string {
  const [, m, j] = date.split('-')
  return `${JOURS_COURTS[jourSemaine(date)]} ${j}.${m}`
}

/** « je 29.10 · 20h » à partir d'un instant ISO. */
export function quand(iso: string): string {
  const l = local(iso)
  return `${dateCourte(l.date)} · ${heureLisible(l.heure)}`
}

/**
 * Durée d'un spectacle en minutes, lue dans le texte saisi par l'équipe :
 * « 1h10 », « 1h10 avec entracte », « 50 min », « 2 h 15 », « 1h ». Null si illisible.
 */
export function minutesDuree(texte?: string | null): number | null {
  if (!texte) return null
  const t = texte.toLowerCase().replace(/\s+/g, ' ')
  const hm = t.match(/(\d{1,2})\s*h\s*(\d{1,2})?/)
  if (hm) return Number(hm[1]) * 60 + (hm[2] ? Number(hm[2]) : 0)
  const mn = t.match(/(\d{1,3})\s*(?:min|mn|')/)
  if (mn) return Number(mn[1])
  return null
}
