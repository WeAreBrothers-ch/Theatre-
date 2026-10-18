#!/usr/bin/env node
/*
 * Prépare les images du jeu d'amorçage pour le site (web/public/amorce).
 *
 * Pour chaque image citée dans web/sanity/amorce.json, écrit des versions WebP
 * aux largeurs 480, 960 et 1440 (sans agrandir) plus une à la largeur d'origine,
 * nommées « nom-480.webp ». Le composant Visuel construit le même srcset.
 * Les fichiers déjà à jour sont ignorés : l'exécution suivante est instantanée.
 *
 * Inutile une fois les contenus dans Sanity : son CDN redimensionne lui-même.
 */
import {existsSync, mkdirSync, readFileSync, statSync} from 'node:fs'
import {dirname, join, resolve} from 'node:path'
import {fileURLToPath} from 'node:url'

const ICI = dirname(fileURLToPath(import.meta.url))
const WEB = resolve(ICI, '..')
const SOURCE = resolve(WEB, '../maquette/assets/img')
const CIBLE = join(WEB, 'public')
const LARGEURS = [480, 960, 1440]

const amorce = JSON.parse(readFileSync(join(WEB, 'sanity/amorce.json'), 'utf8'))
const assets = amorce.filter((d) => d._type === 'sanity.imageAsset')

let sharp
try {
  sharp = (await import('sharp')).default
} catch {
  console.warn('sharp est introuvable : images d’amorçage non préparées.')
  process.exit(0)
}

let ecrites = 0
for (const asset of assets) {
  const largeur = asset.metadata.dimensions.width
  const tailles = [...LARGEURS.filter((l) => l < largeur), largeur]
  for (const url of [asset.url, asset.urlGris].filter(Boolean)) {
    const relatif = url.replace(/^\/amorce\//, '')
    const original = join(SOURCE, relatif)
    if (!existsSync(original)) {
      console.warn('Image manquante :', relatif)
      continue
    }
    const date = statSync(original).mtimeMs
    for (const l of tailles) {
      const sortie = join(CIBLE, url.replace(/\.(jpe?g|png)$/i, `-${l}.webp`))
      if (existsSync(sortie) && statSync(sortie).mtimeMs >= date) continue
      mkdirSync(dirname(sortie), {recursive: true})
      await sharp(original).resize({width: l, withoutEnlargement: true}).webp({quality: l > 960 ? 72 : 76, effort: 5}).toFile(sortie)
      ecrites++
    }
  }
}
console.log(ecrites ? `Images d’amorçage : ${ecrites} fichier(s) écrit(s).` : 'Images d’amorçage à jour.')
