#!/usr/bin/env node
/*
 * Prépare la version statique du site (GitHub Pages, sans serveur) :
 * - formulaires : la messagerie de la personne s'ouvre avec le message prêt ;
 * - contenus lus une fois à la construction, sans mise à jour en direct ;
 * - pas de routes d'aperçu des brouillons.
 *
 * Remplace des fichiers du dossier web : à lancer en intégration continue
 * (variable CI) ou sur une copie du dépôt, avec --force.
 */
import {copyFileSync, rmSync} from 'node:fs'
import {dirname, join} from 'node:path'
import {fileURLToPath} from 'node:url'

if (!process.env.CI && !process.argv.includes('--force')) {
  console.error('Ce script remplace des fichiers du site. Lancez-le en CI, ou sur une copie avec --force.')
  process.exit(1)
}

const WEB = join(dirname(fileURLToPath(import.meta.url)), '..')
const remplacements = [
  ['statique/actions.ts', 'app/actions.ts'],
  ['statique/live.ts', 'sanity/live.ts'],
  ['statique/apercu.tsx', 'sanity/apercu.tsx'],
]
for (const [source, cible] of remplacements) {
  copyFileSync(join(WEB, source), join(WEB, cible))
  console.log(`${cible} ← ${source}`)
}
rmSync(join(WEB, 'app/api'), {recursive: true, force: true})
console.log('app/api retiré (aperçu des brouillons indisponible sans serveur)')
