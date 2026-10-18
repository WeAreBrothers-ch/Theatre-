import {fileURLToPath} from 'node:url'
import {defineConfig} from 'vite'

/*
 * Banc d'essai : les outils du Studio (tableau de bord, agenda, communication, assistant de
 * dates) affichés hors du Studio, sur les données publiées du théâtre, sans se connecter.
 * Les modules « sanity » et « sanity/router » sont remplacés par des doublures : les écritures
 * restent dans la mémoire de la page, rien n'est envoyé à Sanity.
 *
 *   npx vite --config banc/vite.config.ts      puis http://localhost:5199
 */
const ici = (chemin: string) => fileURLToPath(new URL(chemin, import.meta.url))

export default defineConfig({
  root: ici('.'),
  resolve: {
    alias: [
      {find: /^sanity\/router$/, replacement: ici('./faux-routeur.tsx')},
      {find: /^sanity$/, replacement: ici('./faux-sanity.tsx')},
    ],
  },
  server: {port: 5199},
  // Le tsconfig du Studio laisse le JSX tel quel (Sanity s'en charge) : ici, Vite le compile.
  oxc: {jsx: {runtime: 'automatic'}},
  define: {'process.env': JSON.stringify({SANITY_STUDIO_PREVIEW_URL: 'https://wearebrothers-ch.github.io/Theatre-'})},
})
