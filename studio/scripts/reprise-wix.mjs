#!/usr/bin/env node
/*
 * Reprise des fiches du site Wix (une collection CMS par saison) dans un fichier
 * propre, studio/donnees/reprise.json, que lit le générateur d'amorce.
 *
 * À lancer une seule fois (ou pour rafraîchir) : les exports Wix ont été lus le
 * 18 octobre 2026 avec l'API publique du site (/_api/cloud-data/v2/items/query).
 *
 * La page « La presse en parle » (82 entrées, texte relevé à la main dans l'inventaire)
 * est lue à part avec --presse.
 *
 * Usage : node scripts/reprise-wix.mjs --source <dossier des q-*.json> [--presse <fichier .md>]
 */
import {existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync} from 'node:fs'
import {dirname, join, resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import {adresse, dateArticle, lireFiche, sansAccents} from './reprise/fiches.mjs'

const ICI = dirname(fileURLToPath(import.meta.url))
const args = process.argv.slice(2)
const source = args[args.indexOf('--source') + 1]
const fichierPresse = args.includes('--presse') ? args[args.indexOf('--presse') + 1] : null
if (!source || !existsSync(source)) {
  console.error('Indiquez le dossier des exports Wix : --source <dossier>')
  process.exit(1)
}

const SAISONS = [
  {code: '26-27', collection: 'Programme26-27', titre: 'Saison 26–27'},
  {code: '25-26', collection: 'Import716', titre: 'Saison 25–26'},
  {code: '24-25', collection: 'Import715', titre: 'Saison 24–25'},
  {code: '23-24', collection: 'Elements1', titre: 'Saison 23–24'},
  {code: '22-23', collection: 'Programme22-23', titre: 'Saison 22–23'},
  {code: '21-22', collection: 'Programme21-22', titre: 'Saison 21–22'},
  {code: '20-21', collection: 'Programme20-21', titre: 'Saison 20–21'},
]

// Les adresses de la maquette pour la saison en cours (documents déjà dans Sanity).
const ADRESSES_2627 = {
  'choices-precede-de-please-wash-mii-brain': 'choices', 'chœur-diakoff': 'diakoff', 'je-n-ai-jamais-vu-le-kremlin': 'kremlin', 'tavolo-pour-dru': 'tavolo',
  cosimo: 'cosimo', 'un-spectacle-de-droite': 'reto', 'the-navigator': 'navigator', 'l-envol-de-prevert': 'prevert', 'se-dire-oui': 'se-dire-oui',
  cosmogonia: 'cosmogonia', jacqueline: 'jacqueline', dakhabrakha: 'dakhabrakha', 'gaetan-pour-le-meilleur': 'gaetan', 'un-air-de-famille': 'air-de-famille',
  'au-diapason': 'au-diapason', 'run-baby-run': 'run-baby-run', 'swiss-maker': 'swiss-maker', 'festival-nova-jazz': 'nova-jazz', 'tango-prononcé': 'tango',
  planchette: 'planchette', 'le-manuel-de-la-jeune-mariee-1957': 'manuel', 'ensemble-fratres': 'fratres', 'yann-marguet': 'yann-marguet',
  'lionel-frésard': 'fresard-cattin', 'henry-iv': 'henry-iv', 'chaplin-my-father': 'chaplin', 'akmi-duo': 'akmi', 'body-electric': 'body-electric', art: 'art',
  'benjamin-alard': 'alard', 'comment-l’oncle': 'komodo', annette: 'annette', deluge: 'deluge', cendrillon: 'cendrillon', 'la-manekine': 'manekine',
}

/** Spans compacts pour le fichier : {t, g?, i?, l?}. */
const compact = (paras) =>
  paras.map((p) => ({
    style: p.style,
    ...(p.vide ? {vide: true} : {}),
    spans: p.spans.map((s) => ({t: s.texte, ...(s.gras ? {g: 1} : {}), ...(s.italique ? {i: 1} : {}), ...(s.lien ? {l: s.lien} : {})})),
  }))

const fiches = []
const alertes = []
for (const saison of SAISONS) {
  const fichiers = readdirSync(source).filter((f) => f.startsWith(`q-${saison.collection}-`) && f.endsWith('.json'))
  const items = fichiers.flatMap((f) => JSON.parse(readFileSync(join(source, f), 'utf8')).dataItems ?? [])
  for (const item of items) {
    const f = lireFiche(item.data, saison)
    if (!f) continue
    if (!f.representations.length) alertes.push(`${saison.code} ${f.titre} : aucune date lisible (${f.datesTexte})`)
    if (f.representations.some((r) => r.heureAConfirmer)) alertes.push(`${saison.code} ${f.titre} : heure à confirmer (${f.datesTexte} | ${item.data.heure ?? ''})`)
    fiches.push(f)
  }
}

// Adresses : celles de la maquette pour la saison en cours, sinon le titre ; une saison en suffixe en cas de doublon.
const prises = new Set()
const ordreSaisons = SAISONS.map((s) => s.code)
fiches.sort((a, b) => ordreSaisons.indexOf(a.saison) - ordreSaisons.indexOf(b.saison) || (a.representations[0]?.date ?? '').localeCompare(b.representations[0]?.date ?? ''))
for (const f of fiches) {
  let slug = null
  if (f.saison === '26-27' && f.ancienneAdresse) {
    const wix = decodeURIComponent(f.ancienneAdresse.split('/').pop())
    const cle = Object.keys(ADRESSES_2627).find((k) => wix.startsWith(k))
    slug = cle ? ADRESSES_2627[cle] : null
    f.maquette = Boolean(cle)
  }
  if (!slug) slug = adresse(f.titre)
  if (!slug) slug = adresse(f.wix)
  if (prises.has(slug)) slug = `${slug}-${f.saison}`
  let n = 2
  while (prises.has(slug)) slug = `${slug.replace(/-\d+$/, '')}-${n++}`
  prises.add(slug)
  f.slug = slug
}

// ---------------------------------------------------------------------------
// La presse en parle
// ---------------------------------------------------------------------------
const personne = (x) =>
  /^[A-ZÉ][\wÀ-ÿ'’.-]+(?:\s+(?:de\s+|da\s+|van\s+)?[A-ZÉ][\wÀ-ÿ'’.-]+){1,2}$/.test(x.trim()) && !/^(Le|La|Les|L'|L’|RTS|Radio|Emission|Émission|Musique|Canal|Scènes|Tribune)\b/.test(x.trim())
function typeDe(url) {
  if (/audio-podcast|play\/radio|lfm\.ch\/podcasts|radionv|vertigo/.test(url)) return 'radio'
  if (/play\/tv|canalalpha|lemanbleu|rts\.ch\/play\/tv/.test(url)) return 'tv'
  if (/_files\/ugd|dropbox|calameo/.test(url)) return 'article'
  return 'web'
}
const cleTitre = (t) => sansAccents(t.toLowerCase()).replace(/[^a-z0-9]/g, '')
/** Le spectacle d'un titre, joué au plus près de la date de l'article (un même titre revient d'une saison à l'autre). */
function spectacleDe(titre, date) {
  const cle = cleTitre(titre)
  const candidats = fiches.filter((f) => {
    const k = cleTitre(f.titre)
    return k === cle || (cle.length > 5 && k.startsWith(cle))
  })
  const ecart = (f) => Math.abs(Date.parse(f.representations[0]?.date ?? '2000-01-01') - Date.parse(date))
  return candidats.sort((a, b) => ecart(a) - ecart(b))[0]?.slug ?? null
}
const presse = []
if (fichierPresse) {
  for (const ligne of readFileSync(fichierPresse, 'utf8').split('\n')) {
    const m = ligne.match(/^- (.+?) — \*(.*?)\* — (\S.*)$/)
    if (!m) continue
    let [, titre, meta] = m
    const urls = m[3].split(/\s*;\s*/).filter((u) => /^https?:/.test(u))
    if (!meta.trim() || /\/auteur\//.test(urls[0] ?? '')) continue
    // « Titre (Spectacle) » : le spectacle concerné entre parenthèses.
    const d = dateArticle(meta)
    if (!d) continue
    let spectacle = null
    const par = titre.match(/^(.*\S)\s*\(([^()]+)\)(?:\.docx\))?$/)
    if (par && !/minute/i.test(par[2])) {
      spectacle = spectacleDe(par[2], d.date)
      titre = par[1]
    }
    titre = titre.replace(/\.docx\)$/, '').replace(/^"(.+)"$/, '$1').replace(/^«\s*(.+?)\s*»$/, '$1').trim()
    const parties = meta
      .replace(d.texte, '')
      .replace(/\s+(le|du)\s*$/, '')
      .split(/\s*,\s*|\s+-\s+|\s*:\s+/)
      .map((x) => x.replace(/^(critique théâtrale de|critique de|interview de .+ par|propos recueillis par|témoignage de)\s+/i, '').replace(/\s+le$/, '').trim())
      .filter(Boolean)
    const media = parties.shift() ?? ''
    const auteur = parties.filter(personne).pop() ?? null
    const emission = parties.filter((x) => x !== auteur && !/^(culture|critique)$/i.test(x)).join(', ')
    presse.push({titre, media: emission ? `${media}, ${emission}` : media, auteur, date: d.date, lien: urls[0] ?? null, type: typeDe(urls[0] ?? ''), spectacle})
  }
}

const sortie = {
  releve: '2026-10-18',
  source: 'theatrebennobesson.ch, collections CMS Wix (API publique du site)',
  saisons: SAISONS.map((s) => {
    const dates = fiches.filter((f) => f.saison === s.code).flatMap((f) => f.representations.map((r) => r.date)).sort()
    return {...s, premiere: dates[0] ?? null, derniere: dates.at(-1) ?? null, nombre: fiches.filter((f) => f.saison === s.code).length}
  }),
  presse,
}
const lignesFiches = fiches.map((f) => JSON.stringify({...f, chapeau: compact(f.chapeau), texte: compact(f.texte)}))

mkdirSync(join(ICI, '../donnees'), {recursive: true})
const cible = resolve(ICI, '../donnees/reprise.json')
// Une fiche par ligne : le fichier reste lisible et ses changements se suivent dans git.
const entete = JSON.stringify(sortie, null, 1).replace(/\n}$/, '')
writeFileSync(cible, `${entete},\n "fiches": [\n${lignesFiches.join(',\n')}\n ]\n}\n`)
console.log(`${fiches.length} fiches, ${SAISONS.length} saisons, ${presse.length} articles de presse → ${cible}`)
for (const s of sortie.saisons) console.log(`  ${s.code} : ${s.nombre} fiches, du ${s.premiere} au ${s.derniere}`)
if (alertes.length) {
  console.log(`\n${alertes.length} point(s) à vérifier :`)
  for (const a of alertes) console.log('  - ' + a)
}
