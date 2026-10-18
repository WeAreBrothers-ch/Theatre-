import type {NextConfig} from 'next'
import {dirname, join} from 'node:path'
import {fileURLToPath} from 'node:url'

const ici = dirname(fileURLToPath(import.meta.url))
const racine = join(ici, '..')

/*
 * TBB_STATIQUE=1 : site exporté en pages HTML (GitHub Pages), servi dans
 * le sous-dossier NEXT_PUBLIC_BASE_PATH (par exemple /Theatre-).
 * Voir scripts/preparer-statique.mjs et .github/workflows/site.yml.
 */
const statique = process.env.TBB_STATIQUE === '1'
const base = process.env.NEXT_PUBLIC_BASE_PATH || ''

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Monorepo : les dépendances sont installées à la racine.
  turbopack: {root: racine},
  outputFileTracingRoot: racine,
  ...(statique
    ? {output: 'export' as const, basePath: base, trailingSlash: true, images: {unoptimized: true}}
    : {
        // Le jeu d'amorçage est lu au rendu tant que Sanity est vide.
        outputFileTracingIncludes: {'/**': ['./sanity/amorce.json']},
        async headers() {
          return [
            {source: '/amorce/:chemin*', headers: [{key: 'Cache-Control', value: 'public, max-age=31536000, immutable'}]},
            {source: '/:fichier(logo-tbb.*\\.png)', headers: [{key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800'}]},
          ]
        },
      }),
}

export default nextConfig
