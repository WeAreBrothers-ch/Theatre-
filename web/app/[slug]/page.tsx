import type {Metadata} from 'next'
import {notFound} from 'next/navigation'
import {stegaClean} from 'next-sanity'
import {Sections} from '@/components/sections/Sections'
import {TetePage} from '@/components/TetePage'
import {chargerSite, chargerSpectacles} from '@/lib/donnees'
import {sourceImage} from '@/lib/image'
import {maintenant} from '@/lib/temps'
import {charger} from '@/sanity/charger'
import {REQ_PAGE, REQ_SLUGS_PAGES} from '@/sanity/requetes'
import type {PageBrute} from '@/sanity/types'

type Props = {params: Promise<{slug: string}>}

const chargerPage = (slug: string) => charger<PageBrute | null>(REQ_PAGE, {params: {slug}})

export async function generateStaticParams() {
  const slugs = (await charger<string[]>(REQ_SLUGS_PAGES, {publie: true})) ?? []
  return slugs.map((slug) => ({slug}))
}

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {slug} = await params
  const page = await chargerPage(slug)
  if (!page) return {}
  const image = sourceImage(page.seo?.image ?? page.image, {ratio: 1200 / 630, max: 1200})
  return {
    title: stegaClean(page.seo?.titre) || stegaClean(page.titre),
    description: stegaClean(page.seo?.description) || stegaClean(page.intro) || undefined,
    alternates: {canonical: `/${slug}`},
    ...(image ? {openGraph: {images: [{url: image.src, width: 1200, height: 630}]}} : {}),
  }
}

export default async function PageLibre({params}: Props) {
  const {slug} = await params
  const [page, site, spectacles] = await Promise.all([chargerPage(slug), chargerSite(), chargerSpectacles()])
  if (!page) notFound()
  return (
    <>
      <TetePage titre={page.titre} intro={page.intro} image={page.image} />
      <Sections sections={page.sections} contexte={{site, spectacles, instant: maintenant()}} />
    </>
  )
}
