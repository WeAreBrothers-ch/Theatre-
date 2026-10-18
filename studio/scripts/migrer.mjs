#!/usr/bin/env node
/*
 * Migration non destructive des contenus d'amorçage (studio/amorce/import.ndjson) vers Sanity.
 *
 * Règle d'or : on n'écrase jamais le travail de l'équipe.
 *   - document absent                       → créé ;
 *   - document jamais retouché depuis qu'il  → remplacé par la nouvelle version
 *     a été écrit par l'amorce                  (vérifié par son numéro de révision) ;
 *   - document modifié dans le Studio,       → seuls les champs encore vides sont ajoutés,
 *     ou brouillon en cours                     sur le document publié et sur le brouillon.
 *
 * Le registre `migrations.amorce` (invisible dans le Studio et pour le public) retient
 * la révision écrite pour chaque document et les images déjà téléversées. Lors de la toute
 * première migration, un document importé d'un bloc par `sanity dataset import` et jamais
 * retouché depuis (modifié moins de 10 minutes après sa création) compte comme intact.
 *
 * Usage : SANITY_AUTH_TOKEN=… node scripts/migrer.mjs [--essai]
 *   --essai : n'écrit rien, affiche ce qui serait fait (sans jeton : documents publiés seulement).
 */
import {createHash} from 'node:crypto'
import {readFileSync} from 'node:fs'
import {basename, dirname, join} from 'node:path'
import {fileURLToPath} from 'node:url'

const ICI = dirname(fileURLToPath(import.meta.url))
const PROJET = process.env.SANITY_PROJET || process.env.SANITY_STUDIO_PROJECT_ID || 'pgmabzq0'
const DATASET = process.env.SANITY_DATASET || 'production'
const JETON = process.env.SANITY_AUTH_TOKEN || ''
const ESSAI = process.argv.includes('--essai') || !JETON
const API = `https://${PROJET}.api.sanity.io/v2025-02-19`
const REGISTRE = 'migrations.amorce'
const INTACT_MS = 10 * 60 * 1000

const entetes = (extra = {}) => ({...(JETON ? {Authorization: `Bearer ${JETON}`} : {}), ...extra})
const pause = (ms) => new Promise((r) => setTimeout(r, ms))
const empreinte = (x) => createHash('sha1').update(JSON.stringify(x)).digest('hex')
const cleCourte = (x) => createHash('sha1').update(x).digest('hex').slice(0, 12)

async function appel(url, options = {}, essais = 4) {
  for (let i = 0; ; i++) {
    const r = await fetch(url, options).catch((e) => ({ok: false, status: 0, text: async () => String(e)}))
    if (r.ok) return r
    if (r.status === 409 || r.status === 404 || r.status === 400 || r.status === 401 || r.status === 403 || i >= essais) {
      const corps = await r.text()
      const err = new Error(`${r.status} ${url.replace(/\?.*/, '')} ${corps.slice(0, 300)}`)
      err.status = r.status
      throw err
    }
    await pause(1000 * 2 ** i)
  }
}

async function requete(query, params = {}) {
  const r = await appel(`${API}/data/query/${DATASET}?perspective=raw`, {method: 'POST', headers: entetes({'Content-Type': 'application/json'}), body: JSON.stringify({query, params})})
  return (await r.json()).result
}

async function muter(mutations) {
  const r = await appel(`${API}/data/mutate/${DATASET}?returnIds=true&visibility=sync`, {method: 'POST', headers: entetes({'Content-Type': 'application/json'}), body: JSON.stringify({mutations})}, 2)
  return (await r.json()).transactionId
}

// ---------------------------------------------------------------------------
// Images et fichiers
// ---------------------------------------------------------------------------
const TYPES = {jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp', pdf: 'application/pdf', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', zip: 'application/zip'}

function lireRegistre(reg) {
  return {
    docs: new Map((reg?.docs ?? []).map((d) => [d.id, d])),
    assets: new Map((reg?.assets ?? []).map((a) => [a.source, a.id])),
  }
}

/** « image@https://… » ou « file@file:///… » → identifiant d'asset dans Sanity (téléversé si besoin). */
async function asset(source, registre, stats) {
  if (registre.assets.has(source)) return registre.assets.get(source)
  const [genre, adresse] = [source.slice(0, source.indexOf('@')), source.slice(source.indexOf('@') + 1)]
  let octets
  if (adresse.startsWith('file://')) octets = readFileSync(fileURLToPath(adresse))
  else octets = Buffer.from(await (await appel(adresse, {}, 3)).arrayBuffer())
  const sha1 = createHash('sha1').update(octets).digest('hex')
  let id = await requete('*[_type in ["sanity.imageAsset", "sanity.fileAsset"] && sha1hash == $sha1][0]._id', {sha1})
  if (!id) {
    const nom = decodeURIComponent(basename(adresse.replace(/\?.*$/, ''))) || 'fichier'
    const ext = nom.match(/\.([a-z0-9]+)$/i)?.[1]?.toLowerCase() ?? (genre === 'image' ? 'jpg' : 'pdf')
    const r = await appel(`${API}/assets/${genre === 'image' ? 'images' : 'files'}/${DATASET}?filename=${encodeURIComponent(nom)}`, {
      method: 'POST',
      headers: entetes({'Content-Type': TYPES[ext] ?? 'application/octet-stream'}),
      body: octets,
    })
    id = (await r.json()).document._id
    stats.televerses++
  }
  registre.assets.set(source, id)
  return id
}

/** Remplace chaque `_sanityAsset` d'un objet par la référence à l'asset. Un asset introuvable retire le champ. */
async function resoudre(valeur, registre, stats, chemin = '') {
  if (Array.isArray(valeur)) {
    const sortie = []
    for (const [i, x] of valeur.entries()) {
      const r = await resoudre(x, registre, stats, `${chemin}[${i}]`)
      if (r !== undefined) sortie.push(r)
    }
    return sortie
  }
  if (!valeur || typeof valeur !== 'object') return valeur
  if (valeur._sanityAsset) {
    const {_sanityAsset, ...reste} = valeur
    try {
      const id = await asset(_sanityAsset, registre, stats)
      return {...reste, asset: {_type: 'reference', _ref: id}}
    } catch (e) {
      stats.alertes.push(`Asset ignoré (${chemin}) : ${_sanityAsset.slice(0, 120)} — ${e.message.slice(0, 120)}`)
      return undefined
    }
  }
  const sortie = {}
  for (const [k, v] of Object.entries(valeur)) {
    const r = await resoudre(v, registre, stats, chemin ? `${chemin}.${k}` : k)
    if (r !== undefined) sortie[k] = r
  }
  return sortie
}

async function parLots(liste, taille, travail) {
  let i = 0
  const ouvriers = Array.from({length: taille}, async () => {
    while (i < liste.length) await travail(liste[i++])
  })
  await Promise.all(ouvriers)
}

// ---------------------------------------------------------------------------
// Migration
// ---------------------------------------------------------------------------
const docs = readFileSync(join(ICI, '../amorce/import.ndjson'), 'utf8').trim().split('\n').map((l) => JSON.parse(l))
console.log(`${docs.length} documents d’amorce · projet ${PROJET}/${DATASET}${ESSAI ? ' · ESSAI (rien n’est écrit)' : ''}`)

const reg = JETON ? await requete('*[_id == $id][0]', {id: REGISTRE}) : null
const registre = lireRegistre(reg)
const premiere = !reg

const existants = new Map()
const ids = docs.map((d) => d._id)
for (let i = 0; i < ids.length; i += 200) {
  const lot = ids.slice(i, i + 200)
  const trouves = await requete('*[_id in $ids]', {ids: [...lot, ...lot.map((x) => `drafts.${x}`)]})
  for (const d of trouves) existants.set(d._id, d)
}

const plan = {creer: [], remplacer: [], completer: [], rien: []}
for (const d of docs) {
  const publie = existants.get(d._id)
  const brouillon = existants.get(`drafts.${d._id}`)
  const trace = registre.docs.get(d._id)
  const e = empreinte(d)
  if (!publie && !brouillon) plan.creer.push({d, e})
  else if (publie && !brouillon && !trace?.equipe && (trace ? trace.rev === publie._rev : premiere && Date.parse(publie._updatedAt) - Date.parse(publie._createdAt) < INTACT_MS)) {
    if (trace?.empreinte === e) plan.rien.push({d, e})
    else plan.remplacer.push({d, e, publie})
  } else plan.completer.push({d, e, publie, brouillon})
}
console.log(`À créer : ${plan.creer.length} · à mettre à jour (jamais retouchés) : ${plan.remplacer.length} · retouchés par l’équipe, champs vides complétés : ${plan.completer.length} · inchangés : ${plan.rien.length}`)
for (const {d} of plan.completer) console.log(`  · gardé tel quel (modifié dans le Studio) : ${d._id}`)

if (ESSAI) {
  console.log('Essai terminé.')
  process.exit(0)
}

const stats = {televerses: 0, alertes: [], ecrits: 0, conflits: 0}
const SYSTEME = new Set(['_id', '_type', '_rev', '_createdAt', '_updatedAt'])

/** Les mutations d'un document selon le plan. */
async function mutationsDe(entree, mode) {
  const {d, publie, brouillon} = entree
  if (mode === 'creer') return [{createIfNotExists: await resoudre(d, registre, stats)}]
  if (mode === 'remplacer') {
    const complet = await resoudre(d, registre, stats)
    const set = Object.fromEntries(Object.entries(complet).filter(([k]) => !SYSTEME.has(k)))
    const unset = Object.keys(publie).filter((k) => !SYSTEME.has(k) && !(k in set))
    return [{patch: {id: d._id, ifRevisionID: publie._rev, set, ...(unset.length ? {unset} : {})}}]
  }
  // Compléter : seulement les champs absents, sur le publié et sur le brouillon.
  const sortie = []
  for (const cible of [publie, brouillon].filter(Boolean)) {
    const manquants = Object.fromEntries(Object.entries(d).filter(([k]) => !SYSTEME.has(k) && !(k in cible)))
    if (!Object.keys(manquants).length) continue
    sortie.push({patch: {id: cible._id, setIfMissing: await resoudre(manquants, registre, stats)}})
  }
  return sortie
}

async function ecrire(liste, mode) {
  for (let i = 0; i < liste.length; i += 25) {
    const lot = liste.slice(i, i + 25)
    const prepares = []
    await parLots(lot, 6, async (x) => prepares.push({x, mutations: await mutationsDe(x, mode)}))
    const mutations = prepares.flatMap((p) => p.mutations)
    if (!mutations.length) continue
    try {
      const rev = await muter(mutations)
      for (const {x} of prepares) registre.docs.set(x.d._id, mode === 'completer' ? {id: x.d._id, equipe: true} : {id: x.d._id, rev, empreinte: x.e})
      stats.ecrits += prepares.length
    } catch (e) {
      if (e.status !== 409 || mode !== 'remplacer') throw e
      // Quelqu'un a modifié un document entre-temps : on reprend un par un, et les retouchés sont complétés.
      for (const p of prepares) {
        try {
          const rev = await muter(p.mutations)
          registre.docs.set(p.x.d._id, {id: p.x.d._id, rev, empreinte: p.x.e})
          stats.ecrits++
        } catch (err) {
          if (err.status !== 409) throw err
          stats.conflits++
          const actuel = (await requete('*[_id in $ids]', {ids: [p.x.d._id, `drafts.${p.x.d._id}`]})) ?? []
          const entree = {d: p.x.d, publie: actuel.find((y) => y._id === p.x.d._id), brouillon: actuel.find((y) => y._id.startsWith('drafts.'))}
          const m = await mutationsDe(entree, 'completer')
          if (m.length) await muter(m)
          registre.docs.set(p.x.d._id, {id: p.x.d._id, equipe: true})
        }
      }
    }
    process.stdout.write(`  ${mode} : ${Math.min(i + 25, liste.length)}/${liste.length}\r`)
  }
  if (liste.length) console.log(`  ${mode} : ${liste.length}/${liste.length}`)
}

// Les références d'abord (lieux, saisons, grilles…), les spectacles et pages ensuite.
const ordre = ['lieu', 'saison', 'grilleTarifaire', 'personne', 'partenaire', 'spectacle', 'articlePresse', 'rendezVous', 'page', 'accueil', 'reglages']
const rangDe = (x) => {
  const i = ordre.indexOf(x.d._type)
  return i < 0 ? 99 : i
}
let erreur = null
try {
  for (const mode of ['creer', 'remplacer', 'completer']) await ecrire(plan[mode].sort((a, b) => rangDe(a) - rangDe(b)), mode)
} catch (e) {
  erreur = e
}

// Le registre est enregistré même après une erreur : la prochaine exécution reprend où celle-ci s'est arrêtée.
await muter([
  {
    createOrReplace: {
      _id: REGISTRE,
      _type: 'migrationAmorce',
      derniereMigration: new Date().toISOString(),
      docs: [...registre.docs.values()].map((x) => ({_key: cleCourte(x.id), ...x})),
      assets: [...registre.assets.entries()].map(([source, id]) => ({_key: cleCourte(source), source, id})),
    },
  },
])

console.log(`Écrits : ${stats.ecrits} · images et fichiers téléversés : ${stats.televerses} · conflits : ${stats.conflits}`)
for (const a of stats.alertes) console.log(`  ! ${a}`)
if (erreur) {
  console.error(erreur.message)
  process.exit(1)
}
