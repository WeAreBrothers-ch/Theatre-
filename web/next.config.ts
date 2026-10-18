import type {NextConfig} from 'next'
import {dirname, join} from 'node:path'
import {fileURLToPath} from 'node:url'

const ici = dirname(fileURLToPath(import.meta.url))
const racine = join(ici, '..')

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Monorepo : les dépendances sont installées à la racine.
  turbopack: {root: racine},
  outputFileTracingRoot: racine,
  // Le jeu d'amorçage est lu au rendu tant que Sanity est vide.
  outputFileTracingIncludes: {'/**': ['./sanity/amorce.json']},
  async headers() {
    return [
      {source: '/amorce/:chemin*', headers: [{key: 'Cache-Control', value: 'public, max-age=31536000, immutable'}]},
      {source: '/:fichier(logo-tbb.*\\.png)', headers: [{key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800'}]},
    ]
  },
}

export default nextConfig
