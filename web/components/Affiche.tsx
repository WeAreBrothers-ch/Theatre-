import Link from 'next/link'
import type {Carte} from '@/lib/spectacles'
import {styleEncre} from '@/lib/encre'
import {longueur} from '@/lib/typo'
import {Bandeau, ImageImprimee} from './Visuels'

/** Une affiche au format mondial (F4), imprimée dans l'encre du spectacle. */
export function Affiche({carte, sizes = '(min-width: 1180px) 22vw, (min-width: 720px) 30vw, 46vw', priorite}: {carte: Carte; sizes?: string; priorite?: boolean}) {
  return (
    <Link className="affiche" href={`/spectacles/${carte.slug}`} style={styleEncre(carte.encre)} aria-label={carte.libelleAccessible}>
      <ImageImprimee source={carte.image} sizes={sizes} priorite={priorite} alt="" impression={carte.impression} />
      <div className="affiche__haut">
        <span className="etiquette chiffres">{carte.datesCourtes}</span>
        <span className="etiquette etiquette--encre">{carte.midi ? 'Midi théâtre' : carte.genreLibelle}</span>
      </div>
      {carte.bandeau && <Bandeau {...carte.bandeau} />}
      <div className="affiche__bas">
        <h3 className="affiche__titre t-affiche" data-longueur={longueur(carte.titre)}>
          {carte.titre}
        </h3>
        {carte.compagnieCourte && <p className="affiche__par">{carte.compagnieCourte}</p>}
        <p className="affiche__infos">
          <span>{carte.lieu}</span>
          <span>{carte.heures}</span>
        </p>
      </div>
    </Link>
  )
}
