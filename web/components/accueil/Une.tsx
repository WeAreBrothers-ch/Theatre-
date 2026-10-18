import Link from 'next/link'
import {sourceImage} from '@/lib/image'
import {styleEncre} from '@/lib/encre'
import {type Spectacle, versCarte} from '@/lib/spectacles'
import {longueur, typo} from '@/lib/typo'
import {Fleche} from '../Icones'
import {Mots} from '../Mots'
import {Bandeau, ImageImprimee} from '../Visuels'
import {Carrousel} from './Carrousel'

/** Le grand format de l'accueil : un spectacle par diapositive, dans son encre. */
export function Une({spectacles}: {spectacles: Spectacle[]}) {
  if (!spectacles.length) return null
  return (
    <Carrousel encres={spectacles.map((s) => s.encre)} libelle="À l’affiche">
      {spectacles.map((s, i) => {
        const c = versCarte(s)
        const href = `/spectacles/${s.slug}`
        const meta = [s.lieu, s.midi ? 'Midi théâtre' : s.precision || s.genreLibelle, s.age].filter(Boolean).join(' · ')
        return (
          <article
            key={s.id}
            className="une__diapo"
            style={styleEncre(s.encre)}
            aria-roledescription="diapositive"
            aria-label={`${i + 1} sur ${spectacles.length} : ${c.titre}`}
            data-entree={i === 0 ? '' : undefined}
          >
            <div className="bande">
              <div className="cadre une__grille">
                <Link className="une__visuel" href={href} tabIndex={-1} aria-hidden="true">
                  <ImageImprimee
                    source={sourceImage(s.brut.visuel, {ratio: 3 / 2, gris: true, max: 1200})}
                    sizes="72vw"
                    variante={{media: '(min-width: 1024px)', source: sourceImage(s.brut.visuel, {ratio: 895 / 1280, gris: true, max: 1080}), sizes: '32vw'}}
                    priorite={i === 0}
                    alt=""
                    impression={s.impression}
                    trame
                  />
                  {s.bandeau && <Bandeau {...s.bandeau} />}
                </Link>
                <div className="une__contenu">
                  <div>
                    <h2 className="une__titre t-affiche" data-longueur={longueur(c.titre)}>
                      <Link href={href}>
                        <Mots texte={c.titre} />
                      </Link>
                    </h2>
                    {(c.sousTitre || c.compagnie) && <p className="une__sous-titre">{c.sousTitre || c.compagnie}</p>}
                  </div>
                  <div className="une__bas">
                    <div>
                      <p className="une__date">
                        {c.datesLongues}
                        <br />
                        <span className="chiffres">{c.heures}</span>
                      </p>
                      <p className="une__meta">{meta}</p>
                    </div>
                    {s.accroche && <p className="une__accroche">{typo(s.accroche)}</p>}
                    <div className="une__actions">
                      {s.etat === 'en-vente' || s.etat === 'liste-attente' ? (
                        <Link className="btn btn--plein" href={`${href}#reserver`}>
                          {s.etat === 'liste-attente' ? 'Liste d’attente' : 'Réserver'} <Fleche />
                        </Link>
                      ) : null}
                      <Link className="btn btn--trait" href={href}>
                        Le spectacle
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </article>
        )
      })}
    </Carrousel>
  )
}
