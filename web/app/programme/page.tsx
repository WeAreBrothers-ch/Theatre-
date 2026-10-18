import type {Metadata} from 'next'
import {stegaClean} from 'next-sanity'
import {Programme} from '@/components/programme/Programme'
import {Scene} from '@/components/Scene'
import {TetePage} from '@/components/TetePage'
import {GENRES} from '@/lib/constantes'
import {chargerSite, chargerSpectacles} from '@/lib/donnees'
import {estAVenir, versCarte} from '@/lib/spectacles'

export const metadata: Metadata = {
  title: 'Programme',
  description: 'Tous les spectacles de la saison au Théâtre Benno Besson : théâtre, danse, humour, musique, cirque et jeune public.',
  alternates: {canonical: '/programme'},
}

export default async function PageProgramme() {
  const [site, spectacles] = await Promise.all([chargerSite(), chargerSpectacles()])
  const aVenir = spectacles.filter(estAVenir).length
  const saison = stegaClean(site.saison?.titre)
  const pdf = stegaClean(site.saison?.programmePdf)
  return (
    <Scene>
      <TetePage
        titre="Programme"
        surtitre={saison || 'Programme'}
        intro={`${aVenir} spectacle${aVenir > 1 ? 's' : ''} à venir${saison ? ` dans la ${saison.charAt(0).toLowerCase()}${saison.slice(1)}` : ''}. Choisissez un genre, un mois, ou cherchez un titre.`}
        enPlus={
          pdf ? (
            <p style={{marginTop: 14}}>
              <a className="lien-fleche" href={pdf}>
                Le programme en PDF
              </a>
            </p>
          ) : undefined
        }
      />
      <Programme cartes={spectacles.map(versCarte)} genres={GENRES.map((g) => ({valeur: g.value, titre: g.title}))} />
    </Scene>
  )
}
