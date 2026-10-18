import type {Metadata} from 'next'
import {notFound} from 'next/navigation'
import {stegaClean} from 'next-sanity'
import {Affiche} from '@/components/Affiche'
import {Externe, Fleche} from '@/components/Icones'
import {LienSite} from '@/components/LienSite'
import {Rubrique} from '@/components/Rubrique'
import {Scene} from '@/components/Scene'
import {TetePage} from '@/components/TetePage'
import {TexteRiche} from '@/components/TexteRiche'
import {horaireRendezVous, libellePeriode} from '@/components/sections/Annexes'
import {CATEGORIES_RENDEZ_VOUS, libelle} from '@/lib/constantes'
import {hrefLien, hrefPropre} from '@/lib/liens'
import {versCarte, versSpectacle} from '@/lib/spectacles'
import {maintenant} from '@/lib/temps'
import {typo} from '@/lib/typo'
import {charger} from '@/sanity/charger'
import {REQ_RENDEZ_VOUS, REQ_SLUGS_RENDEZ_VOUS} from '@/sanity/requetes'
import type {RendezVousBrut} from '@/sanity/types'

type Props = {params: Promise<{slug: string}>}

const chargerRendezVous = (slug: string) => charger<RendezVousBrut | null>(REQ_RENDEZ_VOUS, {params: {slug}})

/* La page d'un rendez-vous qui a un texte : présentation de saison, exposition, journées du patrimoine… */

// Sans aucun rendez-vous à page, l'export statique demande tout de même une adresse : elle mène à la page 404.
const AUCUN = '_'

export async function generateStaticParams() {
  const slugs = (await charger<string[]>(REQ_SLUGS_RENDEZ_VOUS, {publie: true})) ?? []
  return (slugs.length ? slugs : [AUCUN]).map((slug) => ({slug}))
}

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {slug} = await params
  const r = slug === AUCUN ? null : await chargerRendezVous(slug)
  if (!r) return {}
  return {title: stegaClean(r.titre), alternates: {canonical: `/rendez-vous/${slug}`}}
}

export default async function PageRendezVous({params}: Props) {
  const {slug} = await params
  const r = slug === AUCUN ? null : await chargerRendezVous(slug)
  if (!r) notFound()
  const instant = maintenant()
  const spectacles = (r.spectacles ?? []).filter(Boolean).map((c) => versCarte(versSpectacle(c, instant)))
  const horaires = (r.horaires ?? []).filter((h) => h.dateHeure)
  return (
    <Scene>
      <TetePage
        titre={r.titre}
        surtitre={libelle(CATEGORIES_RENDEZ_VOUS, stegaClean(r.categorie)) || 'Rendez-vous'}
        intro={[libellePeriode(r), r.lieu, r.organisateur].filter(Boolean).join(' · ')}
        image={r.image}
        enPlus={
          <p className="rdv__liens" style={{marginTop: 14}}>
            {r.prix && <span className="rdv__prix">{typo(r.prix)}</span>}
            {hrefPropre(r.inscription) && (
              <a className="btn btn--plein" href={hrefPropre(r.inscription)!} target="_blank" rel="noopener noreferrer">
                S’inscrire <Externe />
              </a>
            )}
          </p>
        }
      />
      <section className="section bande">
        <div className="cadre fiche-corps">
          <div className="fiche-corps__texte">
            <TexteRiche valeur={r.texte} />
          </div>
          {(horaires.length > 0 || (r.liens ?? []).length > 0) && (
            <aside className="fiche-corps__aside">
              {horaires.length > 0 && (
                <>
                  <h2 className="fiche-corps__titre t-label">Horaires</h2>
                  <ul className="horaires">
                    {horaires.map((h) => (
                      <li key={h._key}>
                        <span className="chiffres">{horaireRendezVous(stegaClean(h.dateHeure)!)}</span>
                        {h.precision && <span>{typo(h.precision)}</span>}
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {(r.liens ?? []).map((l) => {
                const href = hrefLien(l)
                return href && l.titre ? (
                  <p key={l._key}>
                    <LienSite className="lien-fleche" href={href} nouvelOnglet>
                      {l.titre} <Fleche />
                    </LienSite>
                  </p>
                ) : null
              })}
            </aside>
          )}
        </div>
      </section>
      {spectacles.length > 0 && (
        <section className="section bande">
          <div className="cadre">
            <Rubrique titre="Les spectacles" taille="l" />
            <div className="mur">
              {spectacles.map((c) => (
                <Affiche key={c.slug} carte={c} />
              ))}
            </div>
          </div>
        </section>
      )}
    </Scene>
  )
}
