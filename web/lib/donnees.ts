import 'server-only'
import {cache} from 'react'
import {charger} from '@/sanity/charger'
import {REQ_SITE, REQ_SPECTACLES} from '@/sanity/requetes'
import type {CarteBrute, Site} from '@/sanity/types'
import {parDate, versSpectacle} from './spectacles'
import {maintenant} from './temps'

/* Chargements partagés par la mise en page et les pages, mis en commun pour un rendu. */

export const chargerSite = cache(async (): Promise<Site> => {
  const site = await charger<Site>(REQ_SITE)
  return {reglages: site?.reglages ?? null, partenaires: site?.partenaires ?? [], saison: site?.saison ?? null}
})

export const chargerSpectacles = cache(async () => {
  const bruts = (await charger<CarteBrute[]>(REQ_SPECTACLES)) ?? []
  const instant = maintenant()
  return bruts.map((c) => versSpectacle(c, instant)).sort(parDate)
})
