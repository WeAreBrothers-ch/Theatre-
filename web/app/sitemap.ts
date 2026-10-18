import type {MetadataRoute} from 'next'
import {URL_SITE} from '@/lib/constantes'
import {charger} from '@/sanity/charger'
import {REQ_SLUGS_PAGES, REQ_SLUGS_RENDEZ_VOUS, REQ_SLUGS_SPECTACLES} from '@/sanity/requetes'

export const dynamic = 'force-static'
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [pages, spectacles, rendezVous] = await Promise.all([
    charger<string[]>(REQ_SLUGS_PAGES, {publie: true}),
    charger<string[]>(REQ_SLUGS_SPECTACLES, {publie: true}),
    charger<string[]>(REQ_SLUGS_RENDEZ_VOUS, {publie: true}),
  ])
  return [
    {url: `${URL_SITE}/`, changeFrequency: 'daily', priority: 1},
    {url: `${URL_SITE}/programme`, changeFrequency: 'daily', priority: 0.9},
    ...(spectacles ?? []).map((slug) => ({url: `${URL_SITE}/spectacles/${slug}`, changeFrequency: 'weekly' as const, priority: 0.8})),
    ...(pages ?? []).map((slug) => ({url: `${URL_SITE}/${slug}`, changeFrequency: 'monthly' as const, priority: 0.6})),
    ...(rendezVous ?? []).map((slug) => ({url: `${URL_SITE}/rendez-vous/${slug}`, changeFrequency: 'monthly' as const, priority: 0.5})),
  ]
}
