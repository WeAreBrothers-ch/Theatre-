import {stegaClean} from 'next-sanity'
import {typo} from '@/lib/typo'
import type {Fichier} from '@/sanity/types'
import {Externe} from '../Icones'
import {Rubrique} from '../Rubrique'
import type {ProprietesSection, SectionDocuments as TDocuments} from './types'

/** « PDF, 1,2 Mo » */
function format(d: Pick<Fichier, 'extension' | 'taille' | 'url'>): string {
  const ext = stegaClean(d.extension) || (stegaClean(d.url)?.match(/\.(pdf|docx?|zip|dxf|jpe?g|png)(\?|$)/i)?.[1] ?? '')
  const taille = d.taille ? (d.taille > 1e6 ? `${(d.taille / 1e6).toFixed(1).replace('.', ',')} Mo` : `${Math.max(1, Math.round(d.taille / 1e3))} ko`) : ''
  return [ext.toUpperCase(), taille].filter(Boolean).join(', ')
}

/** Une liste de fichiers à télécharger ou de dossiers en ligne. */
export function Documents({documents}: {documents: Pick<Fichier, '_key' | 'titre' | 'description' | 'url' | 'taille' | 'extension'>[]}) {
  const utiles = documents.filter((d) => stegaClean(d.url))
  if (!utiles.length) return null
  return (
    <ul className="documents">
      {utiles.map((d) => {
        const url = stegaClean(d.url)!
        const fichier = url.startsWith('https://cdn.sanity.io/files/')
        const infos = format(d)
        return (
          <li key={d._key}>
            <a className="document" href={fichier ? `${url}?dl=` : url} {...(fichier ? {} : {target: '_blank', rel: 'noopener noreferrer'})}>
              <span className="document__titre">{typo(d.titre)}</span>
              {(d.description || infos) && <span className="document__infos">{typo([d.description, infos].filter(Boolean).join(' · '))}</span>}
              <span className="document__icone" aria-hidden="true">
                {fichier ? '↓' : <Externe />}
              </span>
            </a>
          </li>
        )
      })}
    </ul>
  )
}

export function SectionDocuments({section, id, titreId}: ProprietesSection<TDocuments>) {
  if (!section.documents?.length) return null
  return (
    <section className="section bande" id={id} aria-labelledby={section.titre ? titreId : undefined}>
      <div className="cadre">
        <Rubrique surtitre={section.surtitre} titre={section.titre} texte={section.texte} id={titreId} taille="l" />
        <Documents documents={section.documents} />
      </div>
    </section>
  )
}
