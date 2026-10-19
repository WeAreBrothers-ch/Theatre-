import type {Metadata, Viewport} from 'next'
import {Archivo, Newsreader} from 'next/font/google'
import localFont from 'next/font/local'
import {stegaClean} from 'next-sanity'
import {Entete, type LienMenu} from '@/components/entete/Entete'
import {PiedDePage} from '@/components/PiedDePage'
import {URL_SITE} from '@/lib/constantes'
import {chargerSite, chargerSpectacles} from '@/lib/donnees'
import {estAVenir} from '@/lib/spectacles'
import {boutique} from '@/lib/billetterie'
import {sourceImage} from '@/lib/image'
import {hrefLien, hrefPropre} from '@/lib/liens'
import {lienTel, typo} from '@/lib/typo'
import {preconnect} from 'react-dom'
import {Revelations} from '@/components/Revelations'
import {Apercu} from '@/sanity/apercu'
import {avecBase} from '@/lib/chemin'
import './globals.css'

// Les titres d'affiche : Tanker (Indian Type Foundry, Fontshare), hébergée avec le site.
// Une seule graisse, déclarée pour toutes : le navigateur ne fabrique jamais de faux gras.
const tanker = localFont({src: './polices/Tanker-Regular.woff2', weight: '100 900', variable: '--police-tanker', display: 'swap'})
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
  // Les images viennent du CDN de Sanity : la connexion s'ouvre dès le début du chargement.
  preconnect('https://cdn.sanity.io')
  const [site, spectacles] = await Promise.all([chargerSite(), chargerSpectacles()])
  const r = site.reglages ?? {}
  const affiche = spectacles.filter(estAVenir).slice(0, 8).map((s) => stegaClean(s.titre))

  const liens: LienMenu[] = (r.menu ?? [])
    .map((l) => ({titre: l.titre ?? '', href: hrefLien(l) ?? ''}))
    .filter((l) => l.titre && l.href)
  // « Réserver » : la boutique Infomaniak (Réglages, sinon la saison en cours).
  const bouton: LienMenu = {titre: r.boutonMenu?.titre || 'Réserver', href: hrefPropre(r.boutonMenu?.url) || boutique(site) || '/programme'}

  const tel = stegaClean(r.telBilletterie)
  const reseaux: LienMenu[] = [
    {titre: 'Instagram', href: stegaClean(r.instagram) ?? ''},
    {titre: 'Facebook', href: stegaClean(r.facebook) ?? ''},
    {titre: 'LinkedIn', href: stegaClean(r.linkedin) ?? ''},
  ].filter((x) => x.href)
  const annonce = r.annonce?.active && r.annonce.texte ? r.annonce : null
  const lienAnnonce = hrefPropre(annonce?.lien)

  return (
    <html lang="fr-CH" className={`${tanker.variable} ${archivo.variable} ${newsreader.variable}`} data-scroll-behavior="smooth">
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
                    <a href={lienAnnonce.startsWith('/') ? avecBase(lienAnnonce) : lienAnnonce}>En savoir plus</a>
                  </>
                )}
              </p>
            </div>
          </div>
        )}
        <Entete
          liens={liens}
          bouton={bouton}
          tel={r.telBilletterie}
          lienTel={tel ? lienTel(tel) : null}
          reseaux={reseaux}
          affiche={affiche}
        />
        <main id="contenu" tabIndex={-1}>
          {children}
        </main>
        <PiedDePage site={site} />
        <Revelations />
        <Apercu />
      </body>
    </html>
  )
}
