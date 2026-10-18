import Link from 'next/link'
import {stegaClean} from 'next-sanity'
import {CATEGORIES_RENDEZ_VOUS, GROUPES_EQUIPE, TYPES_PARTENAIRES, libelle} from '@/lib/constantes'
import {dateComplete, heure, majuscule, midi, moment, periode} from '@/lib/dates'
import {sourceImage} from '@/lib/image'
import {hrefLien, hrefPropre} from '@/lib/liens'
import {lienTel, typo} from '@/lib/typo'
import {integration} from '@/lib/video'
import type {Personne, RendezVous} from '@/sanity/types'
import {Depliant} from '../Depliant'
import {Enveloppe, Externe, Fleche, Telephone} from '../Icones'
import {LienSite} from '../LienSite'
import {Rubrique} from '../Rubrique'
import {TexteRiche} from '../TexteRiche'
import {Photo} from '../Visuels'
import {Documents} from './Documents'
import type {
  ProprietesSection,
  SectionArchives as TArchives,
  SectionAvis as TAvis,
  SectionEquipe as TEquipe,
  SectionLieux as TLieux,
  SectionListe as TListe,
  SectionPartenaires as TPartenaires,
  SectionPresse as TPresse,
  SectionRendezVous as TRendezVous,
  SectionVideo as TVideo,
} from './types'

/*
 * Les sections qui se remplissent d'elles-mêmes à partir des listes du Studio
 * (équipe, partenaires, presse, rendez-vous, lieux, saisons passées), et quelques blocs simples.
 */

const jourZurich = (instant: Date) => moment(instant.toISOString()).cleJour

/** L'équipe, par équipe puis par fonction : « Placeuses et placeurs : A, B, C ». */
export function SectionEquipe({section, id, titreId}: ProprietesSection<TEquipe>) {
  const personnes = section.personnes ?? []
  if (!personnes.length) return null
  const groupes = GROUPES_EQUIPE.map((g) => ({...g, membres: personnes.filter((p) => (stegaClean(p.groupe) || 'direction') === g.value)})).filter((g) => g.membres.length)
  const plusieurs = groupes.length > 1
  // Les personnes de même fonction se suivent sur une seule ligne.
  const lignes = (membres: Personne[]) => {
    const res: {fonction: string; personnes: Personne[]}[] = []
    for (const p of membres) {
      const f = stegaClean(p.fonction) || ''
      const derniere = res[res.length - 1]
      if (derniere && derniere.fonction === f && f) derniere.personnes.push(p)
      else res.push({fonction: f, personnes: [p]})
    }
    return res
  }
  return (
    <section className="section bande" id={id} aria-labelledby={section.titre ? titreId : undefined}>
      <div className="cadre">
        <Rubrique surtitre={section.surtitre} titre={section.titre} texte={section.texte} id={titreId} />
        {groupes.map((g) => (
          <div key={g.value} className="equipe-groupe">
            {plusieurs && <h3 className="t-label equipe-groupe__titre">{g.title}</h3>}
            <Depliant className="equipe" balise="ul" visibles={6} libelle={`Toute l’équipe ${g.title.toLowerCase()}`}>
              {lignes(g.membres).map((l) => (
                <li key={l.personnes[0]._id}>
                  {l.fonction && <span className="equipe__fonction">{typo(l.fonction)}</span>}
                  <span className="equipe__nom">{l.personnes.map((p) => p.nom).join(', ')}</span>
                  {l.personnes.length === 1 && (l.personnes[0].email || l.personnes[0].telephone) && (
                    <span className="equipe__liens">
                      {l.personnes[0].email && (
                        <a href={`mailto:${stegaClean(l.personnes[0].email)}`}>
                          <Enveloppe /> <span className="equipe__texte">{l.personnes[0].email}</span>
                        </a>
                      )}
                      {l.personnes[0].telephone && (
                        <a className="chiffres" href={lienTel(stegaClean(l.personnes[0].telephone)!)}>
                          <Telephone /> <span className="equipe__texte">{l.personnes[0].telephone}</span>
                        </a>
                      )}
                    </span>
                  )}
                </li>
              ))}
            </Depliant>
          </div>
        ))}
        {section.biographies &&
          personnes
            .filter((p) => p.bio?.length)
            .map((p) => {
              const photo = sourceImage(p.photo, {ratio: 4 / 5, max: 720})
              return (
                <article key={p._id} className="biographie">
                  {photo && <Photo source={photo} sizes="(min-width: 1024px) 22vw, 60vw" alt={stegaClean(p.photo?.alt) || `Portrait de ${stegaClean(p.nom)}`} />}
                  <div>
                    <h3 className="t-affiche t-m">{typo(p.nom)}</h3>
                    {p.fonction && <p className="t-label">{typo(p.fonction)}</p>}
                    <TexteRiche valeur={p.bio} />
                  </div>
                </article>
              )
            })}
      </div>
    </section>
  )
}

/** Les partenaires, par type, avec leur logo (ou leur nom quand il n'y a pas de logo). */
export function SectionPartenaires({section, id, titreId}: ProprietesSection<TPartenaires>) {
  const partenaires = section.partenaires ?? []
  if (!partenaires.length) return null
  const types = TYPES_PARTENAIRES.map((t) => ({...t, liste: partenaires.filter((p) => (stegaClean(p.type) || 'partenaire') === t.value)})).filter((t) => t.liste.length)
  return (
    <section className="section bande" id={id} aria-labelledby={section.titre ? titreId : undefined}>
      <div className="cadre">
        <Rubrique surtitre={section.surtitre} titre={section.titre} texte={section.texte} id={titreId} />
        {types.map((t) => (
          <div key={t.value} className="partenaires">
            {types.length > 1 && <h3 className="t-label">{t.title}</h3>}
            <ul className="logos">
              {t.liste.map((p) => {
                const logo = sourceImage(p.logo, {max: 480})
                const contenu = logo ? <img src={logo.src} alt={stegaClean(p.nom)} loading="lazy" width={logo.width} height={logo.height} /> : <span>{typo(p.nom)}</span>
                const url = hrefPropre(p.url)
                return (
                  <li key={p._id} className={logo ? 'logo' : 'logo logo--nom'}>
                    {url ? (
                      <a href={url} target="_blank" rel="noopener noreferrer" title={stegaClean(p.nom)}>
                        {contenu}
                      </a>
                    ) : (
                      contenu
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}

/** La presse en parle : les articles, du plus récent au plus ancien. */
export function SectionPresse({section, id, titreId}: ProprietesSection<TPresse>) {
  const articles = section.articles ?? []
  if (!articles.length) return null
  const nombre = Math.max(1, Number(stegaClean(section.nombre)) || 30)
  return (
    <section className="section bande" id={id} aria-labelledby={section.titre ? titreId : undefined}>
      <div className="cadre">
        <Rubrique surtitre={section.surtitre} titre={section.titre} texte={section.texte} id={titreId} taille="l" />
        <Depliant className="presse" balise="ul" visibles={6} libelle="Tous les articles">
          {articles.slice(0, Math.max(nombre, 6)).map((a) => (
            <li key={a._id}>
              {a.url ? (
                <a href={stegaClean(a.url)} target="_blank" rel="noopener noreferrer">
                  {typo(a.titre)} <Externe />
                </a>
              ) : (
                <span>{typo(a.titre)}</span>
              )}
              <span className="presse__source">
                {typo([a.media, a.auteur, a.date ? dateComplete(midi(stegaClean(a.date)!)) : null].filter(Boolean).join(' · '))}
                {a.spectacle?.slug && (
                  <>
                    {' · '}
                    <Link href={`/spectacles/${stegaClean(a.spectacle.slug)}`}>{typo(a.spectacle.titre)}</Link>
                  </>
                )}
              </span>
              {a.extrait && <span className="presse__extrait">« {typo(a.extrait)} »</span>}
            </li>
          ))}
        </Depliant>
      </div>
    </section>
  )
}

export function libellePeriode(r: Pick<RendezVous, 'periode' | 'debut' | 'fin'>): string {
  return stegaClean(r.periode) || majuscule(periode(stegaClean(r.debut), stegaClean(r.fin)))
}

/** Les rendez-vous : festivals partenaires, événements, ateliers… à venir (et passés de la saison si voulu). */
export function SectionRendezVous({section, id, titreId, contexte}: ProprietesSection<TRendezVous>) {
  const auj = jourZurich(contexte.instant)
  const liste = (section.rendezVous ?? []).filter((r) => section.inclurePasses || (stegaClean(r.fin) || stegaClean(r.debut) || '9999') >= auj)
  if (!liste.length) return null
  return (
    <section className="section bande" id={id} aria-labelledby={section.titre ? titreId : undefined}>
      <div className="cadre">
        <Rubrique surtitre={section.surtitre} titre={section.titre} texte={section.texte} id={titreId} />
        <ul className="rdv">
          {liste.map((r) => {
            const image = sourceImage(r.image, {ratio: 3 / 2, max: 960})
            const passe = (stegaClean(r.fin) || stegaClean(r.debut) || '9999') < auj
            const page = r.slug && r.texte?.length ? `/rendez-vous/${stegaClean(r.slug)}` : null
            return (
              <li key={r._id} className={`rdv__element${passe ? ' rdv__element--passe' : ''}`}>
                <p className="rdv__quand t-label">{libellePeriode(r)}</p>
                <div className="rdv__corps">
                  <p className="rdv__categorie">{[libelle(CATEGORIES_RENDEZ_VOUS, stegaClean(r.categorie)), r.organisateur, r.lieu].filter(Boolean).join(' · ')}</p>
                  <h3 className="t-affiche t-m">{page ? <Link href={page}>{typo(r.titre)}</Link> : typo(r.titre)}</h3>
                  {!page && r.texte?.length ? <TexteRiche valeur={r.texte} /> : null}
                  {r.prix && <p className="rdv__prix">{typo(r.prix)}</p>}
                  <p className="rdv__liens">
                    {page && (
                      <Link className="lien-fleche" href={page}>
                        Tout savoir <Fleche />
                      </Link>
                    )}
                    {hrefPropre(r.inscription) && (
                      <a className="lien-fleche" href={hrefPropre(r.inscription)!} target="_blank" rel="noopener noreferrer">
                        S’inscrire <Externe />
                      </a>
                    )}
                    {(r.liens ?? []).map((l) => {
                      const href = hrefLien(l)
                      return href && l.titre ? (
                        <LienSite key={l._key} className="lien-fleche" href={href} nouvelOnglet>
                          {l.titre} <Fleche />
                        </LienSite>
                      ) : null
                    })}
                  </p>
                </div>
                {image && <Photo className="rdv__image" source={image} sizes="(min-width: 1024px) 26vw, 88vw" alt={stegaClean(r.image?.alt) || ''} />}
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

/** Les salles : places, caractéristiques, photos, plans et visite virtuelle (page Technique). */
export function SectionLieux({section, id, titreId}: ProprietesSection<TLieux>) {
  const lieux = section.lieux ?? []
  if (!lieux.length) return null
  return (
    <section className="section bande" id={id} aria-labelledby={section.titre ? titreId : undefined}>
      <div className="cadre">
        <Rubrique surtitre={section.surtitre} titre={section.titre} texte={section.texte} id={titreId} />
        <div className="lieux">
          {lieux.map((l) => {
            const photo = sourceImage(l.photos?.[0], {ratio: 3 / 2, max: 1280})
            return (
              <article key={l._id} className="lieu">
                {photo && <Photo source={photo} sizes="(min-width: 1024px) 40vw, 88vw" alt={stegaClean(l.photos?.[0]?.alt) || ''} />}
                <div className="lieu__texte">
                  <h3 className="t-affiche t-l">{typo(l.nom)}</h3>
                  {l.description && <p>{typo(l.description)}</p>}
                  <dl className="caracteristiques">
                    {l.capacite ? (
                      <div>
                        <dt>Places</dt>
                        <dd className="chiffres">{l.capacite}</dd>
                      </div>
                    ) : null}
                    {(l.caracteristiques ?? []).map((c) => (
                      <div key={c._key}>
                        <dt>{typo(c.libelle)}</dt>
                        <dd>{typo(c.valeur)}</dd>
                      </div>
                    ))}
                    {l.adresse && (
                      <div>
                        <dt>Adresse</dt>
                        <dd>{typo(l.adresse)}</dd>
                      </div>
                    )}
                  </dl>
                  {hrefPropre(l.visiteVirtuelle) && (
                    <p>
                      <a className="lien-fleche" href={hrefPropre(l.visiteVirtuelle)!} target="_blank" rel="noopener noreferrer">
                        Visite virtuelle de la salle <Externe />
                      </a>
                    </p>
                  )}
                  {l.documents?.length ? <Documents documents={l.documents} /> : null}
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/** Les archives : chaque saison passée, son affiche et ses spectacles. Rien à faire au changement de saison. */
export function SectionArchives({section, id, titreId}: ProprietesSection<TArchives>) {
  const saisons = (section.saisons ?? []).filter((s) => s.spectacles?.length || s.affiche)
  if (!saisons.length) return null
  return (
    <section className="section bande" id={id} aria-labelledby={section.titre ? titreId : undefined}>
      <div className="cadre">
        <Rubrique surtitre={section.surtitre} titre={section.titre} texte={section.texte} id={titreId} />
        <div className="archives">
          {saisons.map((s, i) => {
            const affiche = sourceImage(s.affiche, {ratio: 895 / 1280, max: 720})
            return (
              <details key={s._id} className="archive" open={i === 0}>
                <summary>
                  <h3 className="t-affiche t-l">{typo(s.titre)}</h3>
                  <span className="archive__nombre chiffres">{s.spectacles?.length ?? 0} spectacles</span>
                </summary>
                <div className="archive__corps">
                  {affiche && <Photo className="archive__affiche" source={affiche} sizes="(min-width: 1024px) 18vw, 50vw" alt={stegaClean(s.affiche?.alt) || `Affiche de la ${stegaClean(s.titre)}`} />}
                  <ul className="archive__liste">
                    {(s.spectacles ?? []).map((x) => (
                      <li key={x._id}>
                        <Link href={`/spectacles/${stegaClean(x.slug)}`}>
                          <span className="archive__titre">{typo(x.titre)}</span>
                          {x.compagnie && <span className="archive__compagnie">{typo(x.compagnie)}</span>}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </details>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export function SectionVideo({section, id, titreId}: ProprietesSection<TVideo>) {
  const src = integration(section.url)
  if (!src) return null
  return (
    <section className="section bande" id={id} aria-labelledby={section.titre ? titreId : undefined}>
      <div className="cadre">
        <Rubrique surtitre={section.surtitre} titre={section.titre} id={titreId} taille="l" />
        <figure className="video-bloc">
          <div className="video">
            <iframe src={src} title={stegaClean(section.legende) || stegaClean(section.titre) || 'Vidéo'} loading="lazy" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" />
          </div>
          {section.legende && <figcaption>{typo(section.legende)}</figcaption>}
        </figure>
      </div>
    </section>
  )
}

/** Une liste libre : spectacles d'un théâtre partenaire, consignes, directions successives… */
export function SectionListe({section, id, titreId}: ProprietesSection<TListe>) {
  const elements = section.elements ?? []
  if (!elements.length) return null
  const bouton = hrefPropre(section.bouton?.url)
  return (
    <section className="section bande" id={id} aria-labelledby={section.titre ? titreId : undefined}>
      <div className="cadre">
        <Rubrique surtitre={section.surtitre} titre={section.titre} texte={section.texte} id={titreId} />
        <ul className="liste-elements">
          {elements.map((e) => {
            const image = sourceImage(e.image, {ratio: 4 / 3, max: 720})
            const href = hrefLien(e.lien)
            return (
              <li key={e._key} className={image ? 'avec-image' : undefined}>
                {image && <Photo source={image} sizes="(min-width: 1024px) 18vw, 40vw" alt={stegaClean(e.image?.alt) || ''} />}
                <div>
                  {e.surtitre && <p className="t-label">{typo(e.surtitre)}</p>}
                  <h3 className="t-affiche t-m">{href ? <LienSite href={href} nouvelOnglet>{typo(e.titre)}</LienSite> : typo(e.titre)}</h3>
                  {e.sousTitre && <p className="liste-elements__sous">{typo(e.sousTitre)}</p>}
                  {e.texte && <p>{typo(e.texte)}</p>}
                  {href && e.lien?.titre && stegaClean(e.lien.titre) !== stegaClean(e.titre) && (
                    <LienSite className="lien-fleche" href={href} nouvelOnglet>
                      {e.lien.titre} <Fleche />
                    </LienSite>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
        {bouton && section.bouton?.titre && (
          <p style={{marginTop: 24}}>
            <LienSite className="btn btn--trait" href={bouton} nouvelOnglet>
              {section.bouton.titre} <Fleche />
            </LienSite>
          </p>
        )}
      </div>
    </section>
  )
}

/** Les avis en cours des Réglages : fermetures, permanences. Ils disparaissent seuls à leur date. */
export function SectionAvis({section, id, titreId, contexte}: ProprietesSection<TAvis>) {
  const auj = jourZurich(contexte.instant)
  const avis = (contexte.site.reglages?.avis ?? []).filter((a) => a.texte && (!a.du || stegaClean(a.du)! <= auj) && (!a.au || stegaClean(a.au)! >= auj))
  if (!avis.length) return null
  return (
    <section className="section bande section--serree" id={id} aria-labelledby={section.titre ? titreId : undefined}>
      <div className="cadre">
        <Rubrique surtitre={section.surtitre} titre={section.titre} id={titreId} taille="m" />
        <div className="avis">
          {avis.map((a) => (
            <p key={a._key} className="alerte">
              {a.titre && <strong>{typo(a.titre)}. </strong>}
              {typo(a.texte)}
            </p>
          ))}
        </div>
      </div>
    </section>
  )
}

/** Une heure de rendez-vous : « samedi 9 septembre 2023 · 14h ». */
export function horaireRendezVous(iso: string): string {
  return `${dateComplete(iso)} · ${heure(iso)}`
}
