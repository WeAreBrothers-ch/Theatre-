import Link from 'next/link'
import type {Carte} from '@/lib/spectacles'
import {styleEncre} from '@/lib/encre'
import {Fleche} from './Icones'
import {ImageImprimee} from './Visuels'

/** Une ligne de l'agenda : la date en grand, le titre, l'heure, la salle, l'état des billets. */
export function Ligne({carte, titreNiveau = 3}: {carte: Carte; titreNiveau?: 2 | 3}) {
  const Titre = titreNiveau === 2 ? 'h2' : 'h3'
  const tags = carte.etiquettes.filter((e) => e.valeur !== 'afterwork' && e.valeur !== 'coproduction')
  return (
    <Link className="ligne" href={`/spectacles/${carte.slug}`} style={styleEncre(carte.encre)}>
      <div className="ligne__date">
        <span className="ligne__jour">{carte.jour}</span>
        <span className="ligne__num">{carte.numero}</span>
        {carte.autres && <span className="ligne__autres">{carte.autres}</span>}
      </div>
      <div className="ligne__principal">
        <Titre className="ligne__titre t-affiche">{carte.titre}</Titre>
        <p className="ligne__par">
          {carte.sousTitre ? `${carte.sousTitre} · ` : ''}
          {carte.compagnie}
        </p>
        {tags.length > 0 && (
          <div className="ligne__tags">
            {tags.map((t) => (
              <span key={t.valeur} className="etiquette etiquette--trait">
                {t.libelle}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="ligne__infos">
        <span className="chiffres">{carte.heures}</span>
        {carte.lieu && <span>{carte.lieu}</span>}
        <span className="ligne__genre-court">{carte.midi ? 'Midi théâtre' : carte.genreLibelle}</span>
      </div>
      <div className="ligne__genre">
        {carte.precision || carte.genreLibelle}
        {carte.age && <span>{carte.age}</span>}
      </div>
      <div className="ligne__action">
        <EtatBillets etat={carte.etat} />
      </div>
      <div className="ligne__vignette" aria-hidden="true">
        <ImageImprimee source={carte.image} sizes="128px" alt="" encre={carte.encre} impression={carte.impression} />
      </div>
    </Link>
  )
}

export function EtatBillets({etat}: {etat: Carte['etat']}) {
  if (etat === 'complet') return <span className="statut">Complet</span>
  if (etat === 'liste-attente') return <span className="statut statut--attente">Liste d’attente</span>
  if (etat === 'annule') return <span className="statut statut--annule">Annulé</span>
  if (etat === 'passe') return <span className="statut statut--passe">Passé</span>
  return (
    <span className="btn btn--trait btn--petit">
      Réserver <Fleche />
    </span>
  )
}
