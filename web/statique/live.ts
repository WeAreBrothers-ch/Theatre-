import {client} from '@/sanity/client'

/*
 * Version statique de sanity/live.ts : les contenus publiés sont lus une fois,
 * à la construction du site. Copiée par scripts/preparer-statique.mjs.
 */
export async function sanityFetch({query, params = {}}: {query: string; params?: Record<string, unknown>; perspective?: string; stega?: boolean}) {
  const data = await client.fetch(query, params, {perspective: 'published', stega: false, useCdn: false})
  return {data, sourceMap: null, tags: [] as string[]}
}

export function SanityLive() {
  return null
}
