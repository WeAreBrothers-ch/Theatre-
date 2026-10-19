import type {CSSProperties} from 'react'
import {stegaClean} from 'next-sanity'
import {hrefLien, hrefPropre} from '@/lib/liens'
import {sourceImage} from '@/lib/image'
import {lienTel, typo} from '@/lib/typo'
import {Depliant} from '../Depliant'
import {Enveloppe, Fleche, Telephone} from '../Icones'
import {LienSite} from '../LienSite'
import {Mots} from '../Mots'
import {Rubrique} from '../Rubrique'
import {TexteRiche} from '../TexteRiche'
import {Photo} from '../Visuels'
import type {
  ProprietesSection,
  SectionAppel as TAppel,
  SectionCitation as TCitation,
  SectionEquipe as TEquipe,
  SectionFaq as TFaq,
  SectionFormules as TFormules,
  SectionFrise as TFrise,
  SectionGalerie as TGalerie,
  SectionInfos as TInfos,
  SectionTexte as TTexte,
} from './types'

export function SectionTexte({section, id, titreId}: ProprietesSection<TTexte>) {
  // L'image garde ses proportions : un bon cadeau, un plan ou une affiche ne sont jamais recadrés.
  const image = sourceImage(section.image, {max: 1080})
  return (
    <section className="section bande" id={id} aria-labelledby={section.titre ? titreId : undefined}>
      <div className="cadre">
        <Rubrique surtitre={section.surtitre} titre={section.titre} id={titreId} />
        <div className={`texte-bloc${image ? '' : ' texte-bloc--seul'}`}>
          <div className="texte-bloc__corps">
            {section.chapo && <p className="texte-bloc__chapo">{typo(section.chapo)}</p>}
            <TexteRiche valeur={section.texte} />
          </div>
          {image && (
            <figure className="texte-bloc__image">
              <Photo source={image} sizes="(min-width: 1024px) 30vw, 70vw" alt={stegaClean(section.image?.alt) || stegaClean(section.image?.legende) || ''} />
              {section.image?.legende && <figcaption>{section.image.legende}</figcaption>}
            </figure>
          )}
        </div>
      </div>
    </section>
  )
}

export function SectionInfos({section, id, titreId}: ProprietesSection<TInfos>) {
  const blocs = section.blocs ?? []
  return (
    <section className="section bande" id={id} aria-labelledby={section.titre ? titreId : undefined}>
      <div className="cadre">
        <Rubrique surtitre={section.surtitre} titre={section.titre} id={titreId} taille="l" />
        <div className="blocs" data-nombre={blocs.length}>
          {blocs.map((b) => {
            const href = hrefLien(b.lien)
            return (
              <div className="bloc" key={b._key}>
                {b.titre && <h3 className="t-affiche">{typo(b.titre)}</h3>}
                {b.texte && <p>{typo(b.texte)}</p>}
                {b.note && <p className="bloc__note">{typo(b.note)}</p>}
                {href && b.lien?.titre && (
                  <LienSite className="lien-fleche" href={href}>
                    {b.lien.titre} <Fleche />
                  </LienSite>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export function SectionCitation({section, id, titreId}: ProprietesSection<TCitation>) {
  const affiche = stegaClean(section.style) === 'affiche'
  const portrait = affiche ? null : sourceImage(section.portrait, {ratio: 4 / 5, max: 1080})
  const href = hrefLien(section.lien)
  const reperes = section.reperes ?? []
  return (
    <section className={`section bande ${affiche ? 'fond-vert' : 'fond-gris'}`} id={id} aria-labelledby={titreId}>
      <div className={`cadre citation${affiche ? ' citation--affiche' : ''}`}>
        {portrait && (
          <figure className="citation__portrait">
            <Photo source={portrait} sizes="(min-width: 1024px) 30vw, 360px" alt={stegaClean(section.portrait?.alt) || ''} />
            {section.portrait?.legende && <figcaption>{section.portrait.legende}</figcaption>}
          </figure>
        )}
        <div className="citation__texte">
          {section.surtitre && <p className="t-label">{typo(section.surtitre)}</p>}
          <figure>
            <blockquote id={titreId}>
              <p>{affiche ? <Mots texte={`«\u00a0${typo(section.citation)}\u00a0»`} /> : `« ${typo(section.citation)} »`}</p>
            </blockquote>
            {section.auteur && (
              <figcaption className="citation__auteur" style={{marginTop: 18}}>
                <cite>{section.auteur}</cite>
              </figcaption>
            )}
          </figure>
          {section.texte && <p className="t-lead" style={{maxWidth: '52ch'}}>{typo(section.texte)}</p>}
          {reperes.length > 0 && (
            <div className="reperes">
              {reperes.map((r) => (
                <div className="repere" key={r._key}>
                  <span className="repere__chiffre">{r.chiffre}</span>
                  <p>{typo(r.texte)}</p>
                </div>
              ))}
            </div>
          )}
          {href && section.lien?.titre && (
            <LienSite className="lien-fleche" href={href}>
              {section.lien.titre} <Fleche />
            </LienSite>
          )}
        </div>
      </div>
    </section>
  )
}

/**
 * La frise : chaque date est une carte qui monte et se pose sur la précédente
 * (d'après « Stacking Cards », 21st.dev), en CSS seul : position collante et animation
 * liée au défilement. On lit l'histoire en descendant, sans glisser sur le côté.
 */
export function SectionFrise({section, id, titreId}: ProprietesSection<TFrise>) {
  const etapes = section.etapes ?? []
  return (
    <section className="section bande" id={id} aria-labelledby={section.titre ? titreId : undefined}>
      <div className="cadre">
        <Rubrique surtitre={section.surtitre} titre={section.titre} id={titreId} />
        <ol className="frise" style={{'--n': etapes.length} as CSSProperties}>
          {etapes.map((e, i) => {
            const image = sourceImage(e.image, {ratio: 3 / 2, max: 1080})
            return (
              <li className="etape" key={e._key} style={{'--i': i} as CSSProperties}>
                <p className="etape__annee chiffres">{e.annee}</p>
                <div className="etape__texte">
                  {e.titre && <h3 className="t-affiche">{typo(e.titre)}</h3>}
                  {e.texte && <p>{typo(e.texte)}</p>}
                </div>
                {image && <Photo source={image} sizes="(min-width: 1024px) 30vw, 88vw" alt={stegaClean(e.image?.alt) || ''} />}
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}

export function SectionGalerie({section, id, titreId}: ProprietesSection<TGalerie>) {
  const images = section.images ?? []
  return (
    <section className="section bande" id={id} aria-labelledby={section.titre ? titreId : undefined}>
      <div className="cadre">
        <Rubrique surtitre={section.surtitre} titre={section.titre} id={titreId} />
        <div className="galerie">
          {images.map((img, i) => {
            const source = sourceImage(img, {max: 1920})
            return (
              <figure key={img._key}>
                <Photo source={source} sizes={i === 0 ? '(min-width: 1024px) 64vw, 70vw' : '(min-width: 1024px) 32vw, 70vw'} alt={stegaClean(img.alt) || stegaClean(img.legende) || ''} />
                {(img.legende || img.credit) && (
                  <figcaption>
                    {typo(img.legende)}
                    {img.credit ? ` Photo : ${img.credit}` : ''}
                  </figcaption>
                )}
              </figure>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export function SectionEquipe({section, id, titreId}: ProprietesSection<TEquipe>) {
  return (
    <section className="section bande" id={id} aria-labelledby={section.titre ? titreId : undefined}>
      <div className="cadre">
        <Rubrique surtitre={section.surtitre} titre={section.titre} texte={section.texte} id={titreId} />
        <Depliant className="equipe" balise="ul" visibles={6} libelle="Toute l’équipe">
          {(section.personnes ?? []).map((p) => (
            <li key={p._id}>
              {p.fonction && <span className="equipe__fonction">{p.fonction}</span>}
              <span className="equipe__nom">{p.nom}</span>
              {(p.email || p.telephone) && (
                <span className="equipe__liens">
                  {p.email && (
                    <a href={`mailto:${stegaClean(p.email)}`}>
                      <Enveloppe /> <span className="equipe__texte">{p.email}</span>
                    </a>
                  )}
                  {p.telephone && (
                    <a className="chiffres" href={lienTel(stegaClean(p.telephone))}>
                      <Telephone /> <span className="equipe__texte">{p.telephone}</span>
                    </a>
                  )}
                </span>
              )}
            </li>
          ))}
        </Depliant>
      </div>
    </section>
  )
}

export function SectionFormules({section, id, titreId}: ProprietesSection<TFormules>) {
  const href = hrefPropre(section.bouton?.url)
  return (
    <section className="section bande" id={id} aria-labelledby={section.titre ? titreId : undefined}>
      <div className="cadre">
        <Rubrique surtitre={section.surtitre} titre={section.titre} texte={section.texte} id={titreId} />
        <div className="formules">
          {(section.formules ?? []).map((f) => {
            const prix = stegaClean(f.prix) ?? ''
            const nombre = /^\d+$/.test(prix)
            return (
              <div className="formule" key={f._key}>
                {f.nom && <h3 className="t-affiche t-m">{typo(f.nom)}</h3>}
                {f.prix && (
                  <p className="formule__prix">
                    {f.prix}
                    {nombre && <small>.–</small>}
                  </p>
                )}
                {f.periode && <p className="formule__periode">{f.periode}</p>}
                {f.texte && <p>{typo(f.texte)}</p>}
              </div>
            )
          })}
        </div>
        {href && section.bouton?.titre && (
          <div className="formules__pied">
            <LienSite className="btn btn--plein" href={href}>
              {section.bouton.titre} <Fleche />
            </LienSite>
          </div>
        )}
      </div>
    </section>
  )
}

export function SectionAppel({section, id, titreId}: ProprietesSection<TAppel>) {
  const fond = stegaClean(section.fond) || 'vert'
  const href = hrefPropre(section.bouton?.url)
  return (
    <section className={`section bande appel fond-${fond}`} id={id} aria-labelledby={titreId}>
      <div className="cadre">
        {section.titre && (
          <h2 className="t-affiche" id={titreId}>
            <Mots texte={typo(section.titre)} />
          </h2>
        )}
        <div className="appel__texte">
          {section.texte && <p>{typo(section.texte)}</p>}
          {href && section.bouton?.titre && (
            <LienSite className="btn btn--plein" href={href}>
              {section.bouton.titre} <Fleche />
            </LienSite>
          )}
        </div>
      </div>
    </section>
  )
}

export function SectionFaq({section, id, titreId}: ProprietesSection<TFaq>) {
  return (
    <section className="section bande" id={id} aria-labelledby={section.titre ? titreId : undefined}>
      <div className="cadre">
        <Rubrique surtitre={section.surtitre} titre={section.titre} id={titreId} taille="l" />
        <div className="faq">
          {(section.questions ?? []).map((q) => (
            <details key={q._key} name={`faq-${id}`}>
              <summary>{typo(q.question)}</summary>
              <p>{typo(q.reponse)}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
