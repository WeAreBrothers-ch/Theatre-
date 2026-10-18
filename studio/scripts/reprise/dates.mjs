/*
 * Les dates des fiches Wix, écrites à la main (« Je 31 décembre – 21h / Sa 2 janvier –
 * 14h30 et 20h »), ramenées à une liste de représentations {date: 'AAAA-MM-JJ', heure: 'HH:MM'}.
 *
 * Principe : on lit le texte dans l'ordre, jour par jour. Une heure s'applique aux jours
 * lus depuis la précédente heure ; un mois ou une année aux jours qui n'en ont pas encore.
 * L'année manquante se déduit de la première date de la fiche (champ `date` de Wix).
 */

const MOIS = {janvier: 1, fevrier: 2, février: 2, mars: 3, avril: 4, mai: 5, juin: 6, juillet: 7, aout: 8, août: 8, septembre: 9, octobre: 10, novembre: 11, decembre: 12, décembre: 12}
const MOIS_RE = Object.keys(MOIS).sort((a, b) => b.length - a.length).join('|')
const JOURS_RE = 'lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche|lu|ma|me|je|ve|sa|di'

const deux = (n) => String(n).padStart(2, '0')
export const iso = ({a, m, j}) => `${a}-${deux(m)}-${deux(j)}`

/** Toutes les heures d'un texte : « 20h », « 14h30 », « 14 h 30 », « 18:00 ». Les heures de fin (« 17h - 18h45 ») et d'ouverture des portes sont ignorées. */
export function heures(texte) {
  if (!texte) return []
  const t = normaliser(texte).replace(/ouverture des portes\s*:?\s*\d{1,2}\s*h\s*\d{0,2}/g, ' ')
  const sortie = []
  const re = /(\d{1,2})\s*(?:h|:)\s*(\d{2})?(?!\d)/g
  let m
  let fin = -1
  while ((m = re.exec(t))) {
    if (m.index < fin) continue
    const h = Number(m[1])
    const mi = Number(m[2] || 0)
    if (h > 23 || mi > 59) continue
    // « 17h - 18h45 » ou « de 18h à 22h » : la seconde heure est une heure de fin.
    const suite = t.slice(re.lastIndex).match(/^\s*(?:-|–|à)\s*(\d{1,2})\s*h\s*(\d{2})?/)
    const avant = t.slice(Math.max(0, m.index - 4), m.index)
    if (suite && (/-|–/.test(suite[0]) || /de\s*$/.test(avant))) fin = re.lastIndex + suite[0].length
    sortie.push(`${deux(h)}:${deux(mi)}`)
  }
  return [...new Set(sortie)]
}

function normaliser(texte) {
  return String(texte)
    .normalize('NFC')
    .toLowerCase()
    .replace(/[  ]/g, ' ')
    .replace(/(\d)\s*(?:er|ᵉʳ)\b/g, '$1')
    .replace(/[’']/g, "'")
}

/**
 * Lit un texte de dates. `ancre` = {a, m, j} de la première date connue, pour l'année.
 * Rend [{date, heure|null}] dans l'ordre du texte.
 */
export function lireDates(texte, ancre) {
  if (!texte) return []
  const t = normaliser(texte).replace(/ouverture des portes\s*:?\s*\d{1,2}\s*h\s*\d{0,2}/g, ' ')
  const jetons = []
  const re = new RegExp(
    [
      `(?<heure>\\b\\d{1,2}\\s*h\\s*(?:\\d{2})?(?!\\d)|\\b\\d{1,2}:\\d{2}\\b)`,
      `(?<annee>\\b20\\d{2}\\b)`,
      `(?<jourmois>\\b(?:${JOURS_RE})?\\.?\\s*(?<j>\\d{1,2})\\s*(?<mois>${MOIS_RE})?(?![\\d:h]))`,
      `(?<au>\\bau\\b|\\bjusqu'au\\b)`,
      `(?<mois2>\\b(?:${MOIS_RE})\\b)`,
    ].join('|'),
    'g',
  )
  for (const m of t.matchAll(re)) {
    const g = m.groups
    if (g.heure) {
      // « 17h - 18h45 » : on garde l'heure de début.
      const avant = t.slice(Math.max(0, m.index - 3), m.index)
      if (/[-–]\s*$/.test(avant) && jetons.at(-1)?.type === 'heure') continue
      if (/\bà\s*$/.test(avant) && jetons.at(-1)?.type === 'heure' && /\bde\s+\d/.test(t.slice(Math.max(0, m.index - 14), m.index))) continue
      const [h, mi] = g.heure.replace(/\s/g, '').split(/h|:/)
      if (Number(h) > 23) continue
      jetons.push({type: 'heure', valeur: `${deux(h)}:${deux(mi || 0)}`})
    } else if (g.annee) jetons.push({type: 'annee', valeur: Number(g.annee)})
    else if (g.jourmois) {
      const j = Number(g.j)
      if (j < 1 || j > 31) continue
      jetons.push({type: 'jour', j, m: g.mois ? MOIS[g.mois] : null})
    } else if (g.au) jetons.push({type: 'au'})
    else if (g.mois2) jetons.push({type: 'mois', valeur: MOIS[g.mois2]})
  }

  const jours = [] // {j, m, a, heures: [], plageAvec?}
  let ouverts = []
  let heuresEnCours = []
  const fermer = () => {
    if (heuresEnCours.length) {
      for (const jour of ouverts) jour.heures.push(...heuresEnCours)
      ouverts = []
      heuresEnCours = []
    }
  }
  let plage = false
  for (const x of jetons) {
    if (x.type === 'heure') {
      heuresEnCours.push(x.valeur)
      continue
    }
    fermer()
    if (x.type === 'jour') {
      const jour = {j: x.j, m: x.m, a: null, heures: []}
      if (plage && jours.length) jour.debutPlage = jours.at(-1)
      plage = false
      jours.push(jour)
      ouverts.push(jour)
      if (x.m) for (const autre of jours) if (!autre.m) autre.m = x.m
    } else if (x.type === 'mois') {
      for (const autre of jours) if (!autre.m) autre.m = x.valeur
    } else if (x.type === 'annee') {
      for (const autre of jours) if (!autre.a) autre.a = x.valeur
    } else if (x.type === 'au') plage = true
  }
  fermer()

  // Années : celle de l'ancre, ou la suivante quand le mois revient en arrière (décembre → janvier).
  const valides = jours.filter((x) => x.m)
  for (const x of valides) {
    if (x.a) continue
    if (!ancre) continue
    x.a = x.m < ancre.m && ancre.m - x.m > 5 ? ancre.a + 1 : x.m > ancre.m && x.m - ancre.m > 6 ? ancre.a - 1 : ancre.a
  }

  // Plages « du mardi 7 au vendredi 10 » : tous les jours, si la plage est courte.
  const sortie = []
  for (const x of valides) {
    if (!x.a) continue
    if (x.debutPlage && x.debutPlage.a && x.debutPlage.m) {
      const debut = Date.UTC(x.debutPlage.a, x.debutPlage.m - 1, x.debutPlage.j)
      const fin = Date.UTC(x.a, x.m - 1, x.j)
      const nb = Math.round((fin - debut) / 864e5)
      if (nb > 0 && nb <= 10) {
        // Le premier jour de la plage est déjà dans la liste ; on ajoute ceux du milieu.
        for (let k = 1; k < nb; k++) {
          const d = new Date(debut + k * 864e5)
          sortie.push({date: iso({a: d.getUTCFullYear(), m: d.getUTCMonth() + 1, j: d.getUTCDate()}), heures: x.heures.length ? x.heures : x.debutPlage.heures})
        }
      }
      if (!x.debutPlage.heures.length) x.debutPlage.heures.push(...x.heures)
    }
    sortie.push({date: iso(x), heures: x.heures})
  }
  sortie.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
  return sortie
}

/** Date ISO (avec ou sans heure UTC) → {a, m, j, heure} à l'heure de Zurich. */
export function dateZurich(valeur) {
  if (!valeur) return null
  const brut = typeof valeur === 'object' ? valeur.$date : valeur
  if (typeof brut !== 'string') return null
  const m = brut.match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/)
  if (!m) return null
  if (!m[4]) return {a: Number(m[1]), m: Number(m[2]), j: Number(m[3]), heure: null}
  const d = new Date(brut)
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', {timeZone: 'Europe/Zurich', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'})
      .formatToParts(d)
      .map((x) => [x.type, x.value]),
  )
  const heure = `${p.hour}:${p.minute}`
  return {a: Number(p.year), m: Number(p.month), j: Number(p.day), heure: heure === '00:00' ? null : heure}
}
