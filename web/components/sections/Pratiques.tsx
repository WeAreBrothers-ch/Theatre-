import {stegaClean} from 'next-sanity'
import {hrefLien, hrefPropre} from '@/lib/liens'
import {lienTel, typo} from '@/lib/typo'
import type {Reglages} from '@/sanity/types'
import {Bus, Couverts, Enveloppe, Fleche, Horloge, Parking, Repere, Telephone, Train} from '../Icones'
import {LienSite} from '../LienSite'
import {Mots} from '../Mots'
import {Rubrique} from '../Rubrique'
import {FormulaireContact} from '../formulaires/FormulaireContact'
import {FormulaireLettre} from '../formulaires/FormulaireLettre'
import {OngletsAcces, type MoyenAcces} from './OngletsAcces'
import type {ProprietesSection, SectionContact as TContact, SectionLettre as TLettre, SectionTarifs as TTarifs} from './types'

export function SectionTarifs({section, id, titreId}: ProprietesSection<TTarifs>) {
  const tarifs = section.grille?.tarifs ?? []
  const notes = section.notes ?? []
  return (
    <section className="section bande fond-vert" id={id} aria-labelledby={titreId}>
      <div className="cadre">
        <Rubrique surtitre={section.surtitre} titre={section.titre || section.grille?.nom || 'Tarifs'} id={titreId} />
        {tarifs.length > 0 && (
          <div className="tarifs__grille" style={{'--colonnes': Math.min(tarifs.length, 4)} as React.CSSProperties}>
            {tarifs.map((t) => (
              <div className="tarif" key={t._key}>
                <p className="tarif__prix">
                  {t.prix}
                  <small>.–</small>
                </p>
                <p className="tarif__nom">{typo(t.categorie)}</p>
                {t.precision && <p className="tarif__precision">{typo(t.precision)}</p>}
              </div>
            ))}
          </div>
        )}
        {section.grille?.note && <p className="tarifs__note">{typo(section.grille.note)}</p>}
        {notes.length > 0 && (
          <div className="tarifs__pied">
            {notes.map((n) => {
              const href = hrefLien(n.lien)
              return (
                <div key={n._key}>
                  {n.titre && <h3 className="t-affiche">{typo(n.titre)}</h3>}
                  {n.texte && <p>{typo(n.texte)}</p>}
                  {href && n.lien?.titre && (
                    <LienSite className="lien-fleche" href={href}>
                      {n.lien.titre} <Fleche />
                    </LienSite>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

/** Schéma d'accès : la gare, le théâtre, le bus et le parking. Volontairement simple. */
function PlanAcces() {
  return (
    <figure className="plan">
      <svg viewBox="0 0 800 420" role="img" aria-labelledby="plan-titre plan-desc">
        <title id="plan-titre">Schéma d’accès au théâtre</title>
        <desc id="plan-desc">
          La gare CFF est à 150 mètres du théâtre, soit 3 minutes à pied. Les bus 604 et 605 s’arrêtent à l’arrêt Théâtre Benno Besson. Le parking de l’Ancien-Stand est en face du théâtre.
        </desc>
        <line x1="150" y1="210" x2="560" y2="210" stroke="#0d0d0c" strokeWidth="4" strokeDasharray="2 12" strokeLinecap="round" />
        <rect x="40" y="168" width="140" height="84" fill="#0d0d0c" />
        <text x="110" y="205" textAnchor="middle" fill="#fff" fontWeight="800" fontSize="26" style={{fontStretch: '62%', fontFamily: 'var(--f-affiche)'}}>
          GARE CFF
        </text>
        <text x="110" y="232" textAnchor="middle" fill="#fff" fontSize="14" style={{fontFamily: 'var(--f-texte)'}}>
          Yverdon-les-Bains
        </text>
        <rect x="268" y="176" width="200" height="34" fill="currentColor" style={{color: 'var(--plan-fond, #eef0ed)'}} />
        <text x="368" y="200" textAnchor="middle" fill="#0d0d0c" fontWeight="700" fontSize="17" style={{fontFamily: 'var(--f-texte)'}}>
          150 m · 3 min à pied
        </text>
        <g transform="translate(560 120) scale(0.15)">
          <path d="M0 1122V276A215 215 0 0 1 410.01 185.47A248 248 0 0 1 889.99 185.47A215 215 0 0 1 1300 276V1122Z" fill="#019e35" />
        </g>
        <text x="657" y="236" textAnchor="middle" fill="#0d0d0c" fontWeight="800" fontSize="26" style={{fontStretch: '62%', fontFamily: 'var(--f-affiche)'}}>
          TBB
        </text>
        <text x="657" y="258" textAnchor="middle" fill="#0d0d0c" fontSize="13" style={{fontFamily: 'var(--f-texte)'}}>
          Rue du Casino 9
        </text>
        <line x1="657" y1="290" x2="657" y2="330" stroke="#0d0d0c" strokeWidth="3" />
        <rect x="560" y="330" width="194" height="58" fill="#fff" stroke="#0d0d0c" strokeWidth="3" />
        <text x="657" y="356" textAnchor="middle" fill="#0d0d0c" fontWeight="800" fontSize="20" style={{fontStretch: '62%', fontFamily: 'var(--f-affiche)'}}>
          BUS 604 · 605
        </text>
        <text x="657" y="376" textAnchor="middle" fill="#0d0d0c" fontSize="13" style={{fontFamily: 'var(--f-texte)'}}>
          arrêt Théâtre Benno Besson
        </text>
        <line x1="657" y1="120" x2="657" y2="86" stroke="#0d0d0c" strokeWidth="3" />
        <rect x="560" y="28" width="194" height="58" fill="#fff" stroke="#0d0d0c" strokeWidth="3" />
        <rect x="572" y="40" width="34" height="34" fill="#0d0d0c" />
        <text x="589" y="66" textAnchor="middle" fill="#fff" fontWeight="800" fontSize="24" style={{fontFamily: 'var(--f-texte)'}}>
          P
        </text>
        <text x="684" y="54" textAnchor="middle" fill="#0d0d0c" fontWeight="700" fontSize="14" style={{fontFamily: 'var(--f-texte)'}}>
          Ancien-Stand
        </text>
        <text x="684" y="72" textAnchor="middle" fill="#0d0d0c" fontSize="13" style={{fontFamily: 'var(--f-texte)'}}>
          en face du théâtre
        </text>
      </svg>
      <figcaption>Schéma, pas à l’échelle.</figcaption>
    </figure>
  )
}

export function SectionAcces({section, id, titreId, contexte}: ProprietesSection) {
  const r: Reglages = contexte.site.reglages ?? {}
  const lignes: MoyenAcces[] = [
    {titre: 'En train', court: 'Train', texte: r.accesTrain, icone: <Train />},
    {titre: 'En bus', court: 'Bus', texte: r.accesBus, icone: <Bus />},
    {titre: 'En voiture', court: 'Voiture', texte: r.accesVoiture, icone: <Parking />},
    {titre: 'Se restaurer', court: 'Manger', texte: r.accesRestaurer, icone: <Couverts />},
  ]
    .filter((l) => l.texte)
    .map((l) => ({...l, texte: typo(l.texte as string)}))
  const plan = hrefPropre(r.lienPlan)
  return (
    <section className="section bande fond-gris" id={id} aria-labelledby={titreId} style={{'--plan-fond': '#fff'} as React.CSSProperties}>
      <div className="cadre">
        <Rubrique surtitre={section.surtitre} titre={section.titre || 'Venir au TBB'} id={titreId} />
        <div className="acces">
          <PlanAcces />
          <div className="acces__infos">
            <OngletsAcces moyens={lignes} />
            <div className="acces__actions">
              {plan && (
                <a className="btn btn--plein" href={plan} target="_blank" rel="noopener noreferrer">
                  Itinéraire <Fleche />
                </a>
              )}
              {r.telBilletterie && (
                <a className="btn btn--trait" href={lienTel(stegaClean(r.telBilletterie))}>
                  <Telephone /> {r.telBilletterie}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function SectionContact({section, id, titreId, contexte}: ProprietesSection<TContact>) {
  const r: Reglages = contexte.site.reglages ?? {}
  const tel = stegaClean(r.telBilletterie)
  const email = stegaClean(r.emailGeneral)
  const plan = hrefPropre(r.lienPlan)
  const horaires = [(r.horaires ?? []).map((h) => `${h.jours} ${h.heures}`).join(' · '), stegaClean(r.noteHoraires)].filter(Boolean).join(', ')
  const annuaire = section.annuaire ?? []
  const sujets = (section.sujets ?? []).map((s) => stegaClean(s)).filter(Boolean)

  return (
    <>
      <section className="section bande section--serre" aria-label="Nous joindre">
        <div className="cadre">
          <div className="contact-rapide">
            {tel && (
              <a className="carte-contact" href={lienTel(tel)}>
                <span className="carte-contact__icone" aria-hidden="true">
                  <Telephone />
                </span>
                <span className="carte-contact__quoi t-label">
                  <span className="carte-contact__court">Appeler</span>
                  <span className="carte-contact__long">Appeler la billetterie</span>
                </span>
                <span className="carte-contact__valeur chiffres">{r.telBilletterie}</span>
                {horaires && <span className="carte-contact__detail">{typo(horaires)}</span>}
                <Fleche />
              </a>
            )}
            {email && (
              <a className="carte-contact" href={`mailto:${email}`}>
                <span className="carte-contact__icone" aria-hidden="true">
                  <Enveloppe />
                </span>
                <span className="carte-contact__quoi t-label">
                  <span className="carte-contact__court">Écrire</span>
                  <span className="carte-contact__long">Écrire un e-mail</span>
                </span>
                <span className="carte-contact__valeur carte-contact__valeur--long">{r.emailGeneral}</span>
                <span className="carte-contact__detail">Réponse sous deux jours ouvrables.</span>
                <Fleche />
              </a>
            )}
            {r.rue && (
              <a className="carte-contact" href={plan ?? '#venir'} {...(plan ? {target: '_blank', rel: 'noopener noreferrer'} : {})}>
                <span className="carte-contact__icone" aria-hidden="true">
                  <Repere />
                </span>
                <span className="carte-contact__quoi t-label">
                  <span className="carte-contact__court">Venir</span>
                  <span className="carte-contact__long">Passer au guichet</span>
                </span>
                <span className="carte-contact__valeur">{r.rue}</span>
                <span className="carte-contact__detail">
                  {r.localite}
                  {r.accesTrain ? `. ${typo(r.accesTrain)}` : ''}
                </span>
                <Fleche />
              </a>
            )}
          </div>
        </div>
      </section>

      {annuaire.length > 0 && (
        <section className="section bande" id={id} aria-labelledby={titreId}>
          <div className="cadre">
            <Rubrique surtitre={section.surtitre} titre={section.titre || 'Qui contacter'} id={titreId} />
            <ul className="annuaire">
              {annuaire.map((c) => (
                <li key={c._key}>
                  <div>
                    <h3 className="annuaire__service">{typo(c.service)}</h3>
                    {c.nom && <p className="annuaire__nom">{c.nom}</p>}
                  </div>
                  <div className="annuaire__actions">
                    {c.email && (
                      <a className="pastille" href={`mailto:${stegaClean(c.email)}`}>
                        <Enveloppe /> <span className="pastille__texte">{c.email}</span>
                      </a>
                    )}
                    {c.telephone && (
                      <a className="pastille chiffres" href={lienTel(stegaClean(c.telephone))}>
                        <Telephone /> <span className="pastille__texte">{c.telephone}</span>
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {section.formulaire !== false && (
        <section className="section bande fond-gris" id="ecrire" aria-labelledby="ecrire-titre">
          <div className="cadre ecrire">
            <div className="ecrire__intro">
              <h2 className="t-affiche t-xl" id="ecrire-titre">
                <Mots texte="Écrire au TBB" />
              </h2>
              <p>{typo('Une question, une proposition, une demande pour une classe ? Le bon service vous répond.')}</p>
              <ul className="ecrire__promesse">
                <li>
                  <Horloge /> Réponse sous deux jours ouvrables
                </li>
                {tel && (
                  <li>
                    <Telephone /> {typo(`Urgent, ce soir ? Appelez le ${r.telBilletterie}`)}
                  </li>
                )}
              </ul>
            </div>
            <div className="ecrire__corps">
              <FormulaireContact
                sujets={sujets.length ? sujets : ['Billetterie et réservations', 'Autre question']}
                confirmation={stegaClean(section.confirmation) || 'Merci, votre message est bien arrivé. Nous vous répondons rapidement.'}
                secours={email}
              />
            </div>
          </div>
        </section>
      )}
    </>
  )
}

export function SectionLettre({section, id, titreId, contexte}: ProprietesSection<TLettre>) {
  return (
    <section className="section bande fond-gris lettre" id={id} aria-labelledby={titreId}>
      <div className="cadre">
        <div className="lettre__texte">
          <h2 className="t-affiche t-xl" id={titreId}>
            <Mots texte={typo(section.titre || 'La lettre du TBB')} />
          </h2>
          {section.texte && <p className="t-lead">{typo(section.texte)}</p>}
        </div>
        <FormulaireLettre secours={stegaClean(contexte.site.reglages?.emailGeneral)} />
      </div>
    </section>
  )
}
