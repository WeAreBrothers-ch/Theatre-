#!/usr/bin/env node
/*
 * Copie locale des contenus publiés pour le banc d'essai (le navigateur ne peut pas lire
 * l'API depuis localhost à cause des règles CORS du projet).
 *   node banc/telecharger.mjs
 */
import {execFileSync} from 'node:child_process'
import {writeFileSync} from 'node:fs'

const SOURCE = 'https://pgmabzq0.apicdn.sanity.io/v2025-02-19/data/query/production'
const TOUT =
  '*[!(_id in path("_.**")) && (_type in ["spectacle", "lieu", "saison", "grilleTarifaire", "reglages", "accueil", "page", "personne", "partenaire", "rendezVous", "articlePresse"] || _type == "sanity.imageAsset")]'
const url = `${SOURCE}?query=${encodeURIComponent(TOUT)}`
// curl suit le proxy de la machine quand il y en a un, ce que fetch de Node ne fait pas toujours.
const texte = execFileSync('curl', ['-fsS', url], {encoding: 'utf8', maxBuffer: 64 * 1024 * 1024})
writeFileSync(new URL('./donnees.json', import.meta.url), texte)
console.log(`${JSON.parse(texte).result.length} documents → banc/donnees.json`)
