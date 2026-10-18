import type {Metadata} from 'next'
import {stegaClean} from 'next-sanity'
import {Jour} from '@/components/accueil/Jour'
import {Une} from '@/components/accueil/Une'
import {Sections} from '@/components/sections/Sections'
import {chargerSite, chargerSpectacles} from '@/lib/donnees'
import {estAVenir} from '@/lib/spectacles'
import {maintenant} from '@/lib/temps'
import {charger} from '@/sanity/charger'
import {REQ_ACCUEIL} from '@/sanity/requetes'
import type {AccueilBrut} from '@/sanity/types'

const chargerAccueil = () => charger<AccueilBrut | null>(REQ_ACCUEIL)

export async function generateMetadata(): Promise<Metadata> {
  const accueil = await chargerAccueil()
  const titre = stegaClean(accueil?.seo?.titre)
  const description = stegaClean(accueil?.seo?.description)
  return {...(titre ? {title: {absolute: titre}} : {}), ...(description ? {description} : {})}
}

export default async function Accueil() {
  const [accueil, site, spectacles] = await Promise.all([chargerAccueil(), chargerSite(), chargerSpectacles()])
  const instant = maintenant()
  const aVenir = spectacles.filter(estAVenir)

  // À l'affiche : le choix de l'équipe, sinon les trois prochains spectacles en vente.
  const choisis = (accueil?.aLaffiche ?? []).map((id) => aVenir.find((s) => s.id === stegaClean(id))).filter((s) => s !== undefined)
  const enVente = aVenir.filter((s) => s.etat === 'en-vente')
  const une = choisis.length ? choisis : (enVente.length >= 3 ? enVente : aVenir).slice(0, 3)

  return (
    <>
      <h1 className="visuellement-cache">
        {stegaClean(site.reglages?.nom) || 'Théâtre Benno Besson'}, Yverdon-les-Bains{site.saison?.titre ? `, ${stegaClean(site.saison.titre)}` : ''}
      </h1>
      <Jour spectacles={aVenir} instant={instant} tel={stegaClean(site.reglages?.telBilletterie)} />
      <Une spectacles={une} />
      <Sections sections={accueil?.sections} contexte={{site, spectacles, instant}} />
    </>
  )
}
