import type {Metadata, Viewport} from 'next'
import {Archivo, Newsreader} from 'next/font/google'
import {stegaClean} from 'next-sanity'
import {Entete, type LienMenu} from '@/components/entete/Entete'
import {PiedDePage} from '@/components/PiedDePage'
import {URL_SITE} from '@/lib/constantes'
import {chargerSite, chargerSpectacles} from '@/lib/donnees'
import {estAVenir} from '@/lib/spectacles'
import {sourceImage} from '@/lib/image'
import {hrefLien, hrefPropre} from '@/lib/liens'
import {lienTel, typo} from '@/lib/typo'
import {preconnect} from 'react-dom'
import {Revelations} from '@/components/Revelations'
import {Apercu} from '@/sanity/apercu'
import {avecBase} from '@/lib/chemin'
import {maintenant} from '@/lib/temps'
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
  // Les images viennent du CDN de Sanity : la connexion s'ouvre dès le début du chargement.
  preconnect('https://cdn.sanity.io')
  const [site, spectacles] = await Promise.all([chargerSite(), chargerSpectacles()])
  const r = site.reglages ?? {}
  const affiche = spectacles.filter(estAVenir).slice(0, 8).map((s) => stegaClean(s.titre))

  const liens: LienMenu[] = (r.menu ?? [])
    .map((l) => ({
      titre: l.titre ?? '',
      href: hrefLien(l) ?? '',
      sousLiens: (l.sousLiens ?? []).map((x) => ({titre: x.titre ?? '', href: hrefLien(x) ?? ''})).filter((x) => x.titre && x.href),
    }))
    .filter((l) => l.titre && l.href)
  const bouton: LienMenu = {titre: r.boutonMenu?.titre || 'Réserver', href: hrefPropre(r.boutonMenu?.url) || '/programme'}

  const tel = stegaClean(r.telBilletterie)
  const reseaux: LienMenu[] = [
    {titre: 'Instagram', href: stegaClean(r.instagram) ?? ''},
    {titre: 'Facebook', href: stegaClean(r.facebook) ?? ''},
    {titre: 'LinkedIn', href: stegaClean(r.linkedin) ?? ''},
  ].filter((x) => x.href)
  // Le bandeau se retire seul à sa date de fin (le site est reconstruit au moins une fois par heure).
  const annonce = r.annonce?.active && r.annonce.texte && (!r.annonce.jusquau || new Date(stegaClean(r.annonce.jusquau)!) > maintenant()) ? r.annonce : null
  const lienAnnonce = hrefPropre(annonce?.lien)

  return (
    <html lang="fr-CH" className={`${archivo.variable} ${newsreader.variable}`} data-scroll-behavior="smooth">
      <body>
        {/* Filtres d'impression : un canal de couleur recopié en gris, légèrement contrasté. */}
        <svg className="filtres-impression" width="0" height="0" aria-hidden="true" focusable="false">
          <defs>
            {(['r', 'g', 'b'] as const).map((c, i) => (
              <filter key={c} id={`tbb-canal-${c}`} colorInterpolationFilters="sRGB">
                <feColorMatrix type="matrix" values={[0, 1, 2].map(() => [0, 1, 2].map((j) => (j === i ? 1 : 0)).join(' ') + ' 0 0').join(' ') + ' 0 0 0 1 0'} />
                <feComponentTransfer>
                  <feFuncR type="linear" slope="1.12" intercept="-0.04" />
                  <feFuncG type="linear" slope="1.12" intercept="-0.04" />
                  <feFuncB type="linear" slope="1.12" intercept="-0.04" />
                </feComponentTransfer>
              </filter>
            ))}
          </defs>
        </svg>
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
