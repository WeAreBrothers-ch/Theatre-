import type {Metadata, Viewport} from 'next'
import {Archivo, Newsreader} from 'next/font/google'
import {draftMode} from 'next/headers'
import {stegaClean} from 'next-sanity'
import {VisualEditing} from 'next-sanity/visual-editing'
import {Entete, type LienMenu, type Prochain} from '@/components/entete/Entete'
import {PiedDePage} from '@/components/PiedDePage'
import {URL_SITE} from '@/lib/constantes'
import {dateLongue, heure} from '@/lib/dates'
import {chargerSite, chargerSpectacles} from '@/lib/donnees'
import {sourceImage} from '@/lib/image'
import {hrefLien, hrefPropre} from '@/lib/liens'
import {lienTel, typo} from '@/lib/typo'
import {contenusSanity} from '@/sanity/charger'
import {SanityLive} from '@/sanity/live'
import './globals.css'

const archivo = Archivo({subsets: ['latin'], axes: ['wdth'], variable: '--police-archivo', display: 'swap'})
// La voix (accroches, citations, textes des spectacles) : une seule graisse, romain et italique, pour rester léger.
const newsreader = Newsreader({subsets: ['latin'], weight: '400', style: ['normal', 'italic'], variable: '--police-newsreader', display: 'swap'})

// Les contenus se mettent à jour en direct ; ce délai sert à faire avancer l'agenda avec les jours.
export const revalidate = 3600

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#ffffff',
}

export async function generateMetadata(): Promise<Metadata> {
  const {reglages} = await chargerSite()
  const titre = stegaClean(reglages?.seo?.titre) || 'Théâtre Benno Besson, Yverdon-les-Bains'
  const description = stegaClean(reglages?.seo?.description) || 'Théâtre, danse, humour, musique et jeune public au Théâtre Benno Besson, à Yverdon-les-Bains.'
  const image = sourceImage(reglages?.seo?.image, {ratio: 1200 / 630, max: 1200})
  return {
    metadataBase: new URL(URL_SITE),
    title: {default: titre, template: `%s · ${stegaClean(reglages?.nom) || 'Théâtre Benno Besson'}`},
    description,
    openGraph: {type: 'website', locale: 'fr_CH', siteName: stegaClean(reglages?.nom) || 'Théâtre Benno Besson', ...(image ? {images: [{url: image.src, width: 1200, height: 630}]} : {})},
    formatDetection: {telephone: false},
  }
}

export default async function MiseEnPage({children}: {children: React.ReactNode}) {
  const [site, spectacles, sanity, brouillons] = await Promise.all([chargerSite(), chargerSpectacles(), contenusSanity(), draftMode()])
  const r = site.reglages ?? {}

  const liens: LienMenu[] = (r.menu ?? [])
    .map((l) => ({titre: l.titre ?? '', href: hrefLien(l) ?? ''}))
    .filter((l) => l.titre && l.href)
  const bouton: LienMenu = {titre: r.boutonMenu?.titre || 'Réserver', href: hrefPropre(r.boutonMenu?.url) || '/programme'}

  const suivant = spectacles.find((s) => s.etat === 'en-vente' || s.etat === 'liste-attente')
  const prochain: Prochain | null =
    suivant && suivant.reference
      ? {
          titre: typo(suivant.titre),
          href: `/spectacles/${suivant.slug}`,
          quand: `${dateLongue(suivant.reference.iso)} à ${heure(suivant.reference.iso)}`,
          encre: suivant.encre,
          impression: suivant.impression,
          image: sourceImage(suivant.brut.visuel, {ratio: 895 / 1280, gris: true, max: 480}),
        }
      : null

  const tel = stegaClean(r.telBilletterie)
  const horaires = (r.horaires ?? []).map((h) => `${h.jours} ${h.heures}`).join(' · ')
  const reseaux: LienMenu[] = [
    {titre: 'Instagram', href: stegaClean(r.instagram) ?? ''},
    {titre: 'Facebook', href: stegaClean(r.facebook) ?? ''},
    {titre: 'LinkedIn', href: stegaClean(r.linkedin) ?? ''},
  ].filter((x) => x.href)
  const annonce = r.annonce?.active && r.annonce.texte ? r.annonce : null
  const lienAnnonce = hrefPropre(annonce?.lien)

  return (
    <html lang="fr-CH" className={`${archivo.variable} ${newsreader.variable}`} data-scroll-behavior="smooth">
      <body>
        <a className="lien-evitement" href="#contenu">
          Aller au contenu
        </a>
        {annonce && (
          <div className="annonce bande" role="note">
            <div className="cadre">
              <span className="annonce__point" aria-hidden="true" />
              <p>
                {typo(annonce.texte)}
                {lienAnnonce && (
                  <>
                    {' '}
                    <a href={lienAnnonce}>En savoir plus</a>
                  </>
                )}
              </p>
            </div>
          </div>
        )}
        <Entete
          liens={liens}
          bouton={bouton}
          prochain={prochain}
          tel={r.telBilletterie}
          lienTel={tel ? lienTel(tel) : null}
          horaires={horaires ? typo(horaires) : null}
          adresse={[r.rue, r.localite].filter(Boolean).join(', ')}
          lienPlan={hrefPropre(r.lienPlan)}
          reseaux={reseaux}
        />
        <main id="contenu" tabIndex={-1}>
          {children}
        </main>
        <PiedDePage site={site} />
        {sanity && <SanityLive />}
        {brouillons.isEnabled && <VisualEditing />}
      </body>
    </html>
  )
}
