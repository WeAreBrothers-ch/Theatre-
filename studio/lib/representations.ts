import {ecartJours, jourSemaine, local, minutesDuree, plusJours, versIso} from './temps.ts'

/*
 * Les représentations : séries de dates, lecture d'une liste collée, conflits de salle.
 * Sans dépendance au Studio : exécuté aussi par les vérifications (node --test).
 */

export type Statut = 'en-vente' | 'complet' | 'liste-attente' | 'annule'

export type RepresentationBrute = {
  _key: string
  _type?: string
  dateHeure?: string
  statut?: Statut | string
  lieu?: {_type?: string; _ref?: string} | null
  mention?: string
  lien?: string
  heureAConfirmer?: boolean
  scolaire?: boolean
}

/** Durée retenue quand la fiche ne dit rien : une soirée ordinaire. */
export const DUREE_PAR_DEFAUT = 120

/** Une représentation à plat, avec son spectacle, pour l'agenda et les conflits. */
export type Rep = {
  cle: string
  spectacleId: string
  titre: string
  iso: string
  date: string
  heure: string
  statut: Statut
  lieuId: string | null
  debut: number
  fin: number
  /** La durée vient de la fiche (true) ou de la valeur par défaut (false). */
  dureeConnue: boolean
  mention?: string
  heureAConfirmer?: boolean
  scolaire?: boolean
}

export type SpectaclePourAgenda = {
  _id: string
  titre?: string
  duree?: string
  lieu?: {_ref?: string} | string | null
  representations?: RepresentationBrute[] | null
}

const refDe = (l?: {_ref?: string} | string | null) => (typeof l === 'string' ? l : l?._ref) || null

const STATUTS: Statut[] = ['en-vente', 'complet', 'liste-attente', 'annule']
export const statutValide = (s?: string): Statut => (STATUTS.includes(s as Statut) ? (s as Statut) : 'en-vente')

/** Toutes les représentations de plusieurs spectacles, triées par date. */
export function aplatir(spectacles: SpectaclePourAgenda[]): Rep[] {
  const reps: Rep[] = []
  for (const s of spectacles) {
    const id = s._id.replace(/^drafts\./, '')
    const minutes = minutesDuree(s.duree)
    for (const r of s.representations ?? []) {
      if (!r?.dateHeure || !r._key) continue
      const l = local(r.dateHeure)
      const debut = new Date(r.dateHeure).getTime()
      reps.push({
        cle: r._key,
        spectacleId: id,
        titre: s.titre || 'Sans titre',
        iso: r.dateHeure,
        date: l.date,
        heure: l.heure,
        statut: statutValide(r.statut),
        lieuId: refDe(r.lieu) || refDe(s.lieu),
        debut,
        fin: debut + (minutes ?? DUREE_PAR_DEFAUT) * 60000,
        dureeConnue: minutes !== null,
        mention: r.mention,
        heureAConfirmer: r.heureAConfirmer,
        scolaire: r.scolaire,
      })
    }
  }
  return reps.sort((a, b) => a.debut - b.debut || a.titre.localeCompare(b.titre))
}

export type Conflit = {a: Rep; b: Rep}

/**
 * Deux représentations se chevauchent dans la même salle. Les dates annulées ne comptent pas.
 * Deux dates d'un même spectacle à la même heure sont un doublon, signalé aussi.
 */
export function conflits(reps: Rep[]): Conflit[] {
  const actives = reps.filter((r) => r.statut !== 'annule' && r.lieuId).sort((a, b) => a.debut - b.debut)
  const trouves: Conflit[] = []
  for (let i = 0; i < actives.length; i++) {
    for (let j = i + 1; j < actives.length && actives[j].debut < actives[i].fin; j++) {
      if (actives[i].lieuId === actives[j].lieuId) trouves.push({a: actives[i], b: actives[j]})
    }
  }
  return trouves
}

/** Les clés « spectacleId/cle » des représentations en conflit. */
export function clesEnConflit(liste: Conflit[]): Set<string> {
  const cles = new Set<string>()
  for (const {a, b} of liste) {
    cles.add(`${a.spectacleId}/${a.cle}`)
    cles.add(`${b.spectacleId}/${b.cle}`)
  }
  return cles
}

/* ---------------------------------------------------------------------------
 * Séries
 * ------------------------------------------------------------------------- */

export type Serie = {
  /** Premier et dernier jour, « AAAA-MM-JJ ». */
  du: string
  au: string
  /** L'heure de chaque jour joué (0 = dimanche) ; un jour absent n'est pas joué. */
  heures: Partial<Record<number, string>>
  /** Jours sautés (relâche, jour férié). */
  sauf?: string[]
}

/** Les instants ISO d'une série : « du 3 au 14 novembre, du mardi au samedi à 20h, dimanche à 17h ». */
export function genererSerie(serie: Serie): string[] {
  if (!serie.du || !serie.au || serie.au < serie.du) return []
  if (ecartJours(serie.du, serie.au) > 400) return []
  const sauf = new Set(serie.sauf ?? [])
  const isos: string[] = []
  for (let d = serie.du; d <= serie.au; d = plusJours(d, 1)) {
    const heure = serie.heures[jourSemaine(d)]
    if (heure && !sauf.has(d)) isos.push(versIso(d, heure))
  }
  return isos
}

/* ---------------------------------------------------------------------------
 * Liste collée : « 29.10 20h, 30.10 à 19h30 · dimanche 1.11.2026 17:00 »
 * ------------------------------------------------------------------------- */

export type Lecture = {isos: string[]; incomprises: string[]}

/**
 * L'année d'un jour donné sans année : celle qui le place dans les douze mois
 * qui suivent la date de référence (deux mois en arrière tolérés).
 */
export function devinerAnnee(mois: number, jour: number, reference: string): number {
  const annee = Number(reference.slice(0, 4))
  const candidats = [annee - 1, annee, annee + 1]
  const pad = (n: number) => String(n).padStart(2, '0')
  for (const a of candidats) {
    const e = ecartJours(reference, `${a}-${pad(mois)}-${pad(jour)}`)
    if (e >= -62 && e < 366 - 62) return a
  }
  return annee
}

const MOIS_NOMS: Record<string, number> = {
  janvier: 1, janv: 1, fevrier: 2, fevr: 2, fev: 2, mars: 3, avril: 4, avr: 4, mai: 5, juin: 6, juillet: 7, juil: 7,
  aout: 8, septembre: 9, sept: 9, sep: 9, octobre: 10, oct: 10, novembre: 11, nov: 11, decembre: 12, dec: 12,
}

/**
 * Lit les dates d'un texte collé (e-mail, tableur, programme) : une date par ligne,
 * ou plusieurs séparées par des virgules. Formats compris : 29.10, 29.10.26, 29/10/2026,
 * 2026-10-29, « jeudi 29 octobre », avec une heure 20h, 20h30, 20:30 ou « à 20 h ».
 * Sans heure, `heureParDefaut` est utilisée.
 */
export function lireListe(texte: string, reference: string, heureParDefaut = '20:00'): Lecture {
  const isos: string[] = []
  const incomprises: string[] = []
  const morceaux = texte
    .split(/\n|;|,(?!\d)|·|\|/)
    .map((m) => m.trim())
    .filter(Boolean)
  for (const brut of morceaux) {
    const m = brut
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
    let annee: number | null = null
    let mois: number | null = null
    let jour: number | null = null
    let reste = m
    const iso = m.match(/(\d{4})-(\d{2})-(\d{2})/)
    const num = m.match(/\b(\d{1,2})[./](\d{1,2})(?:[./](\d{2,4}))?\b/)
    const lettres = m.match(/\b(\d{1,2})(?:er)?\s+([a-z]+)\.?(?:\s+(\d{4}))?/)
    if (iso) {
      ;[annee, mois, jour] = [Number(iso[1]), Number(iso[2]), Number(iso[3])]
      reste = m.replace(iso[0], ' ')
    } else if (num) {
      jour = Number(num[1])
      mois = Number(num[2])
      if (num[3]) annee = num[3].length === 2 ? 2000 + Number(num[3]) : Number(num[3])
      reste = m.replace(num[0], ' ')
    } else if (lettres && MOIS_NOMS[lettres[2]]) {
      jour = Number(lettres[1])
      mois = MOIS_NOMS[lettres[2]]
      if (lettres[3]) annee = Number(lettres[3])
      reste = m.replace(lettres[0], ' ')
    }
    if (!jour || !mois || mois > 12 || jour > 31) {
      incomprises.push(brut)
      continue
    }
    const h = reste.match(/\b(\d{1,2})\s*(?:h|:)\s*(\d{2})?\b/)
    let heure = heureParDefaut
    if (h && Number(h[1]) < 24) heure = `${h[1].padStart(2, '0')}:${(h[2] ?? '00').padStart(2, '0')}`
    const a = annee ?? devinerAnnee(mois, jour, reference)
    const date = `${a}-${String(mois).padStart(2, '0')}-${String(jour).padStart(2, '0')}`
    // 31.02 : la date n'existe pas.
    if (plusJours(date, 0) !== date) {
      incomprises.push(brut)
      continue
    }
    isos.push(versIso(date, heure))
  }
  return {isos: [...new Set(isos)].sort(), incomprises}
}

/** Clé aléatoire courte pour un élément de tableau Sanity. */
export function nouvelleCle(): string {
  const octets = new Uint8Array(6)
  globalThis.crypto.getRandomValues(octets)
  return Array.from(octets, (o) => o.toString(16).padStart(2, '0')).join('')
}

/** Trie des représentations par date (celles sans date à la fin). */
export function trier<T extends {dateHeure?: string}>(reps: T[]): T[] {
  return [...reps].sort((a, b) => (a.dateHeure ?? '9999').localeCompare(b.dateHeure ?? '9999'))
}
