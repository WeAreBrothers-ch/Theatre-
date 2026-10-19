import type {Metadata} from 'next'
import Link from 'next/link'
import {notFound} from 'next/navigation'
import {stegaClean} from 'next-sanity'
import {Affiche} from '@/components/Affiche'
import {Alerte, Externe, Fleche} from '@/components/Icones'
import {Mots} from '@/components/Mots'
import {Rubrique} from '@/components/Rubrique'
import {Scene} from '@/components/Scene'
import {BarreReserver} from '@/components/spectacle/BarreReserver'
import {Reservation} from '@/components/spectacle/Reservation'
import {Video} from '@/components/spectacle/Video'
import {TexteRiche} from '@/components/TexteRiche'
import {Bandeau, ImageImprimee, Photo} from '@/components/Visuels'
import {dateComplete, dateCourte, heure, heuresResume, jourCourt, majuscule, resumeDates} from '@/lib/dates'
import {chargerSite, chargerSpectacles} from '@/lib/donnees'
import {styleEncre} from '@/lib/encre'
import {sourceImage} from '@/lib/image'
import {lienListeAttente, lienReservation, NOUVEL_ONGLET} from '@/lib/billetterie'
import {hrefPropre} from '@/lib/liens'
import {estAVenir, versCarte, versSpectacle} from '@/lib/spectacles'
import {maintenant} from '@/lib/temps'
import {lienTel, longueur, typo} from '@/lib/typo'
import {charger} from '@/sanity/charger'
import {REQ_SLUGS_SPECTACLES, REQ_SPECTACLE} from '@/sanity/requetes'
import type {SpectacleBrut} from '@/sanity/types'

type Props = {params: Promise<{slug: string}>}

const chargerSpectacle = (slug: string) => charger<SpectacleBrut | null>(REQ_SPECTACLE, {params: {slug}})

export async function generateStaticParams() {
  const slugs = (await charger<string[]>(REQ_SLUGS_SPECTACLES, {publie: true})) ?? []
  return slugs.map((slug) => ({slug}))
}

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {slug} = await params
  const s = await chargerSpectacle(slug)
  if (!s) return {}
  const image = sourceImage(s.seo?.image ?? s.visuel, {ratio: 1200 / 630, max: 1200})
  return {
    title: stegaClean(s.seo?.titre) || stegaClean(s.titre),
    description: stegaClean(s.seo?.description) || stegaClean(s.accroche) || undefined,
    alternates: {canonical: `/spectacles/${slug}`},
    openGraph: {type: 'article', ...(image ? {images: [{url: image.src, width: 1200, height: 630}]} : {})},
  }
}

/** Lien vers la billetterie : Infomaniak dans un nouvel onglet, ou un numéro à appeler. */
function LienBillet({href, externe, className, children}: {href: string; externe: boolean; className: string; children: React.ReactNode}) {
  return (
    <a className={className} href={href} {...(externe ? NOUVEL_ONGLET : {})}>
      {children} {externe ? <Externe /> : <Fleche />}
      {externe && <span className="visuellement-cache"> (billetterie en ligne, nouvel onglet)</span>}
    </a>
  )
}

/** Lien YouTube ou Vimeo vers son adresse d'intégration. */
function integration(url?: string | null): string | null {
  const u = stegaClean(url)
  if (!u) return null
  const yt = u.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/)
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}`
  const vimeo = u.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}?dnt=1`
  return null
}

export default async function PageSpectacle({params}: Props) {
  const {slug} = await params
  const [brut, site, spectacles] = await Promise.all([chargerSpectacle(slug), chargerSite(), chargerSpectacles()])
  if (!brut) notFound()

  const instant = maintenant()
  const s = versSpectacle(brut, instant)
  const r = site.reglages ?? {}
  const tel = stegaClean(r.telBilletterie)
  const isos = (s.aVenir.length ? s.aVenir : s.representations).map((x) => x.iso)
  // Billetterie Infomaniak : le lien du spectacle, sinon la boutique de la saison.
  const lienEnLigne = lienReservation(s, site)
  const lienAttente = lienListeAttente(s, site)
  const prix = (brut.tarifs?.tarifs ?? []).map((t) => ({cle: t._key, categorie: t.categorie, prix: t.prix, precision: t.precision}))
  const texteTarifs = s.etat === 'complet' ? 'Complet' : stegaClean(brut.noteTarifs) || (prix.length ? prix.map((p) => `${p.prix}.–`).join(' / ') : null)
  const accessibilite = brut.accessibilite || brut.lieu?.accessibilite
  const video = integration(brut.video)
  const photos = brut.photos ?? []
  const distribution = brut.distribution ?? []

  const infos: [string, string | null | undefined][] = [
    ['Dates', majuscule(resumeDates(isos, true))],
    ['Heure', heuresResume(isos)],
    ['Lieu', s.lieuComplet],
    ['Genre', s.precision || s.genreLibelle],
    ['Public', s.age],
    ['Durée', s.duree],
    ['Prix', texteTarifs],
  ]

  const proches = [...spectacles.filter((x) => x.slug !== s.slug && estAVenir(x) && x.genre === s.genre), ...spectacles.filter((x) => x.slug !== s.slug && estAVenir(x) && x.genre !== s.genre)].slice(
    0,
    4,
  )

  const encarts: {titre: string; contenu: React.ReactNode}[] = []
  if (brut.deroule?.length)
    encarts.push({
      titre: 'Déroulé',
      contenu: (
        <ul>
          {brut.deroule.map((d) => (
            <li key={d._key}>
              {typo(d.titre)}
              {d.duree ? ` : ${d.duree}` : ''}
            </li>
          ))}
        </ul>
      ),
    })
  if (brut.autour?.length)
    encarts.push({
      titre: 'Autour du spectacle',
      contenu: (
        <ul>
          {brut.autour.map((x, i) => (
            <li key={i}>{typo(x)}</li>
          ))}
        </ul>
      ),
    })
  if (brut.distinction) encarts.push({titre: 'Distinction', contenu: <p>{typo(brut.distinction)}</p>})
  if (accessibilite) encarts.push({titre: 'Accessibilité', contenu: <p>{typo(accessibilite)}</p>})
  encarts.push({
    titre: 'Venir',
    contenu: (
      <>
        <p>{typo(brut.lieu?.adresse || [r.rue, r.localite].filter(Boolean).join(', '))}</p>
        {r.accesTrain && <p>{typo(r.accesTrain)}</p>}
        {hrefPropre(r.lienPlan) && (
          <a className="lien-fleche" href={hrefPropre(r.lienPlan)!} target="_blank" rel="noopener noreferrer">
            Itinéraire <Fleche />
          </a>
        )}
      </>
    ),
  })
  if (tel)
    encarts.push({
      titre: 'Billetterie',
      contenu: (
        <p>
          <a className="chiffres" href={lienTel(tel)}>
            {r.telBilletterie}
          </a>
          {r.emailBilletterie && (
            <>
              <br />
              <a href={`mailto:${stegaClean(r.emailBilletterie)}`}>{r.emailBilletterie}</a>
            </>
          )}
        </p>
      ),
    })

  const reservable = s.etat === 'en-vente' || s.etat === 'liste-attente'
  const actionLibelle = s.etat === 'liste-attente' ? 'Liste d’attente' : s.libelleBillet
  // Le bouton principal : la billetterie en ligne (nouvel onglet) ; pour la liste d'attente,
  // son formulaire, sinon le téléphone. Sans aucun lien, le tiroir propose téléphone et e-mail.
  const action: {href: string; externe: boolean} | null =
    s.etat === 'en-vente' && lienEnLigne
      ? {href: lienEnLigne, externe: true}
      : s.etat === 'liste-attente' && lienAttente
        ? {href: lienAttente, externe: true}
        : s.etat === 'liste-attente' && tel
          ? {href: lienTel(tel), externe: false}
          : null
  const tiroir = reservable && !action

  return (
    // L'ancre « reserver » (lien « Réserver » de l'accueil) garde la page en haut ; le tiroir s'ouvre par-dessus.
    <Scene>
      <article id="reserver">
        <header className="fiche-tete bande" style={styleEncre(s.encre)}>
          <div className="cadre">
            <nav aria-label="Fil d’Ariane">
              <ol className="fil-ariane">
                <li>
                  <Link href="/">Accueil</Link>
                </li>
                <li>
                  <Link href="/programme">Programme</Link>
                </li>
                <li>
                  <Link href={`/programme#${s.genre}`}>{s.genreLibelle}</Link>
                </li>
              </ol>
            </nav>
            <div className="fiche-tete__titre">
              <h1 className="t-affiche mots-entree" data-longueur={longueur(stegaClean(s.titre))}>
                <Mots texte={typo(s.titre)} />
              </h1>
              {(s.sousTitre || s.compagnie) && (
                <p className="fiche-tete__par">
                  {s.sousTitre ? `${typo(s.sousTitre)} · ` : ''}
                  {typo(s.compagnie)}
                </p>
              )}
            </div>
            <div className="fiche-tete__visuel">
              <ImageImprimee
                source={sourceImage(brut.visuel, {ratio: 3 / 2, gris: true, max: 1200})}
                variante={{media: '(min-width: 1024px)', source: sourceImage(brut.visuel, {ratio: 895 / 1280, gris: true, max: 1440}), sizes: '38vw'}}
                sizes="72vw"
                priorite
                alt={stegaClean(brut.visuel?.alt) || `Visuel du spectacle ${stegaClean(s.titre)}`}
                impression={s.impression}
                trame
              />
              {s.bandeau && <Bandeau {...s.bandeau} />}
            </div>
            <div className="fiche-tete__infos">
              {s.accroche && <p className="fiche-tete__accroche">{typo(s.accroche)}</p>}
              <dl className="infos-liste">
                {infos
                  .filter(([, v]) => v)
                  .map(([cle, valeur]) => (
                    <div key={cle} className="info">
                      <dt>{cle}</dt>
                      <dd>{typo(valeur)}</dd>
                    </div>
                  ))}
              </dl>
              {brut.avertissement && (
                <p className="alerte">
                  <Alerte /> {typo(brut.avertissement)}
                </p>
              )}
              {s.etat === 'complet' && <p className="alerte">Complet. Des places se libèrent parfois : appelez la billetterie{tel ? ` au ${tel}` : ''}.</p>}
              {s.etat === 'annule' && <p className="alerte">Ce spectacle est annulé. Les billets sont remboursés à la billetterie.</p>}
              {s.etat === 'passe' && <p className="alerte">Ce spectacle a eu lieu. Retrouvez les prochains rendez-vous dans le programme.</p>}
              <div className="fiche-tete__actions" id="action-reserver">
                {action ? (
                  <LienBillet className="btn btn--plein" href={action.href} externe={action.externe}>
                    {actionLibelle}
                  </LienBillet>
                ) : (
                  tiroir && (
                    <a className="btn btn--plein" href="#dates" data-reserver="">
                      {actionLibelle} <Fleche />
                    </a>
                  )
                )}
                {s.etat === 'passe' ? (
                  <Link className="btn btn--trait" href="/programme">
                    Le programme
                  </Link>
                ) : (
                  <a className="btn btn--trait" href="#dates">
                    Toutes les dates
                  </a>
                )}
              </div>
            </div>
          </div>
        </header>

        <section className="section bande" id="presentation" aria-label="Présentation">
          <div className="cadre fiche-corps">
            <div className="fiche-corps__texte">
              {brut.texte?.length ? <TexteRiche valeur={brut.texte} /> : <p>{typo(s.accroche)}</p>}
              {video && (
                <Video src={video} titre={`Bande-annonce de ${stegaClean(s.titre)}`}>
                  <ImageImprimee source={sourceImage(photos[0] ?? brut.visuel, {ratio: 16 / 9, gris: true, max: 1200})} sizes="(min-width: 1024px) 60vw, 100vw" alt="" encre={s.encre} impression={s.impression} />
                </Video>
              )}
            </div>
            <aside className="fiche-corps__aside" id="infos" aria-labelledby="titre-infos">
              <h2 className="fiche-corps__titre t-label" id="titre-infos">
                Infos pratiques
              </h2>
              {encarts.map((e) => (
                <details key={e.titre} className="encart" name="infos-pratiques">
                  <summary>
                    <h3>{e.titre}</h3>
                  </summary>
                  <div className="encart__corps">{e.contenu}</div>
                </details>
              ))}
            </aside>
          </div>
        </section>

        {photos.length > 0 && (
          <section className="section bande" id="photos" aria-labelledby="titre-photos">
            <div className="cadre">
              <Rubrique titre="Photos" id="titre-photos" taille="l" />
              <div className="photos">
                {photos.map((p, i) => (
                  <figure key={p._key ?? i}>
                    <Photo
                      source={sourceImage(p, {max: 1600})}
                      sizes={i === 0 ? '(min-width: 1024px) 64vw, 70vw' : '(min-width: 1024px) 32vw, 70vw'}
                      alt={stegaClean(p.alt) || stegaClean(p.legende) || ''}
                    />
                    {(p.legende || p.credit) && (
                      <figcaption>
                        {typo(p.legende)}
                        {p.credit ? ` · Photo : ${p.credit}` : ''}
                      </figcaption>
                    )}
                  </figure>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="section bande" id="dates" aria-labelledby="titre-dates">
          <div className="cadre">
            <Rubrique titre="Dates" id="titre-dates" taille="l" surtitre={s.lieuComplet} />
            <div className="representations">
              {s.representations.map((rep) => (
                <div key={rep.cle} className={`representation${rep.passee ? ' representation--passee' : ''}`}>
                  <span className="representation__date chiffres">
                    {jourCourt(rep.iso)} {dateCourte(rep.iso)} · {heure(rep.iso)}
                  </span>
                  <span className="representation__lieu">{[rep.lieu || s.lieu, rep.mention].filter(Boolean).join(' · ')}</span>
                  <span className="representation__action">
                    {rep.passee ? (
                      <span className="statut statut--passe">Passé</span>
                    ) : rep.statut === 'complet' ? (
                      <span className="statut">Complet</span>
                    ) : rep.statut === 'annule' ? (
                      <span className="statut statut--annule">Annulé</span>
                    ) : rep.statut === 'liste-attente' ? (
                      lienAttente || tel ? (
                        <LienBillet className="btn btn--trait btn--petit" href={lienAttente || lienTel(tel!)} externe={!!lienAttente}>
                          Liste d’attente
                        </LienBillet>
                      ) : (
                        <span className="statut statut--attente">Liste d’attente</span>
                      )
                    ) : rep.lien || lienEnLigne ? (
                      <LienBillet className="btn btn--trait btn--petit" href={(rep.lien || lienEnLigne)!} externe>
                        {s.libelleBillet}
                      </LienBillet>
                    ) : (
                      <a className="btn btn--trait btn--petit" href="#dates" data-reserver="" data-date={rep.cle}>
                        {s.libelleBillet} <Fleche />
                      </a>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {distribution.length > 0 && (
          <section className="section bande" id="distribution" aria-labelledby="titre-distribution">
            <div className="cadre">
              <Rubrique titre="Distribution" id="titre-distribution" taille="l" />
              <div className="distribution">
                {distribution.map((bloc, i) => (
                  <details key={bloc._key} className="distribution__bloc" name="distribution" open={i === 0}>
                    <summary>
                      <h3 className="t-affiche">{typo(bloc.titre) || 'Distribution'}</h3>
                    </summary>
                    <dl>
                      {(bloc.lignes ?? []).map((l) => (
                        <div key={l._key} className="distribution__ligne">
                          <dt>{typo(l.role)}</dt>
                          <dd>{typo(l.noms)}</dd>
                        </div>
                      ))}
                    </dl>
                  </details>
                ))}
                {brut.production && <p className="distribution__production">{typo(brut.production)}</p>}
              </div>
            </div>
          </section>
        )}

        {proches.length > 0 && (
          <section className="section bande" aria-labelledby="titre-proches">
            <div className="cadre">
              <Rubrique
                surtitre="À voir aussi"
                titre="Dans la même veine"
                id="titre-proches"
                taille="l"
                action={
                  <Link className="lien-fleche" href="/programme">
                    Tout le programme <Fleche />
                  </Link>
                }
              />
              <div className="mur">
                {proches.map((x) => (
                  <Affiche key={x.id} carte={versCarte(x)} />
                ))}
              </div>
            </div>
          </section>
        )}

        {tiroir && (
          <Reservation
            titre={typo(stegaClean(s.titre))}
            lieu={s.lieuComplet}
            encre={s.encre}
            dates={s.aVenir.map((rep) => ({
              cle: rep.cle,
              libelle: `${dateComplete(rep.iso)} · ${heure(rep.iso)}`,
              statut: rep.statut,
              mention: rep.mention,
              lien: rep.lien,
              lieu: rep.lieu && rep.lieu !== s.lieu ? rep.lieu : null,
            }))}
            prix={prix}
            notePrix={stegaClean(brut.noteTarifs) || stegaClean(brut.tarifs?.note)}
            lien={lienEnLigne}
            tel={r.telBilletterie}
            lienTel={tel ? lienTel(tel) : null}
            email={stegaClean(r.emailBilletterie)}
          />
        )}
        {reservable && (
          <BarreReserver
            titre={typo(stegaClean(s.titre))}
            quand={s.reference ? `${jourCourt(s.reference.iso)} ${dateCourte(s.reference.iso)} · ${heure(s.reference.iso)}` : null}
            action={actionLibelle}
            href={action?.href}
            externe={action?.externe}
          />
        )}
      </article>
    </Scene>
  )
}
