#!/usr/bin/env node
/*
 * Contenus d'amorçage du Studio : tout le site actuel du TBB (repris de Wix dans
 * studio/donnees/reprise.json) et la mise en forme de la maquette (maquette/assets/js/data.js).
 *
 * Produit studio/amorce/import.ndjson, lu par `scripts/migrer.mjs` (images et PDF téléversés).
 * Ne touche jamais au dossier du site (web/).
 *
 * Usage : node scripts/generer-amorce.mjs
 */
import {mkdirSync, readFileSync, writeFileSync} from 'node:fs'
import {dirname, join, resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import vm from 'node:vm'
import {creerRecueil} from './amorce/outils.mjs'
import {ajouterEquipe, ajouterLieux, ajouterPartenaires, ajouterRendezVous, ajouterSaisons} from './amorce/referentiels.mjs'
import {ajouterGrilles, ajouterPresse, ajouterSpectacles, preparerGrilles} from './amorce/spectacles.mjs'
import {ajouterPages} from './amorce/pages.mjs'
import {ajouterReglages} from './amorce/reglages.mjs'

const ICI = dirname(fileURLToPath(import.meta.url))
const RACINE = resolve(ICI, '../..')

// La maquette (titres courts, accroches, couleurs, visuels déjà dans Sanity).
const bac = {window: {}}
vm.createContext(bac)
vm.runInContext(readFileSync(join(RACINE, 'maquette/assets/js/data.js'), 'utf8').replace(/window\.TBB = window\.TBB \|\| \{\};/, 'var TBB = window.TBB = {};'), bac)
const maquette = bac.window.TBB

// Le site actuel.
const reprise = JSON.parse(readFileSync(join(ICI, '../donnees/reprise.json'), 'utf8'))

const recueil = creerRecueil(join(RACINE, 'maquette/assets/img'))
const grilles = preparerGrilles(reprise.fiches)

ajouterLieux(recueil)
ajouterSaisons(recueil, reprise)
ajouterGrilles(recueil, grilles)
ajouterSpectacles(recueil, {reprise, maquette, grilles})
const articles = ajouterPresse(recueil, reprise)
ajouterEquipe(recueil)
ajouterPartenaires(recueil)
ajouterRendezVous(recueil, new Set(reprise.fiches.map((f) => f.slug)))
ajouterPages(recueil)
ajouterReglages(recueil)

// Contrôle : identifiants uniques.
const ids = new Set()
for (const d of recueil.docsImport) {
  if (ids.has(d._id)) throw new Error(`Identifiant en double : ${d._id}`)
  ids.add(d._id)
}

const {docsImport, assetsLocaux} = recueil
mkdirSync(join(ICI, '../amorce'), {recursive: true})
writeFileSync(join(ICI, '../amorce/import.ndjson'), docsImport.map((d) => JSON.stringify(d)).join('\n') + '\n')

const parType = docsImport.reduce((o, d) => ((o[d._type] = (o[d._type] ?? 0) + 1), o), {})
console.log(`${docsImport.length} documents, ${assetsLocaux.size} images et fichiers, ${articles} articles de presse`)
console.log('  ' + Object.entries(parType).map(([t, n]) => `${t} ${n}`).join(' · '))
console.log('→ studio/amorce/import.ndjson')
