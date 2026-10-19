'use client'

import {useCallback, useEffect, useRef, useState, type MouseEvent} from 'react'
import type {Encre} from '@/lib/encre'
import type {Statut} from '@/lib/spectacles'
import {styleEncre} from '@/lib/encre'
import {NOUVEL_ONGLET, sortDuSite} from '@/lib/liens'
import {Croix, Externe, Fleche, Telephone} from '../Icones'

export type DateReservation = {cle: string; libelle: string; statut: Statut; mention?: string | null; lien?: string | null; lieu?: string | null}
export type Prix = {cle: string; categorie: string; prix: number; precision?: string | null}

type Props = {
  titre: string
  lieu?: string | null
  encre: Encre
  dates: DateReservation[]
  prix: Prix[]
  notePrix?: string | null
  lien?: string | null
  tel?: string | null
  lienTel?: string | null
  email?: string | null
}

const LIBELLES: Record<Statut, string> = {'en-vente': '', complet: 'Complet', 'liste-attente': 'Liste d’attente', annule: 'Annulé'}

/*
 * Réserver : le choix de la date et les prix, puis la billetterie en ligne.
 * Feuille qui monte du bas sur téléphone, tiroir à droite sur ordinateur.
 * <dialog> natif : focus, Échap et arrière-plan inerte sont gérés par le navigateur.
 * S'ouvre depuis tout lien [data-reserver] de la page, ou à l'arrivée avec #reserver.
 */
export function Reservation({titre, lieu, encre, dates, prix, notePrix, lien, tel, lienTel, email}: Props) {
  const dialogue = useRef<HTMLDialogElement>(null)
  const titreRef = useRef<HTMLHeadingElement>(null)
  const premiereLibre = dates.find((d) => d.statut === 'en-vente' || d.statut === 'liste-attente')?.cle ?? ''
  const [choix, setChoix] = useState(premiereLibre)

  const ouvrir = useCallback(
    (cle?: string | null) => {
      const d = dialogue.current
      if (!d) return
      const voulue = dates.find((x) => x.cle === cle && (x.statut === 'en-vente' || x.statut === 'liste-attente'))
      setChoix(voulue?.cle ?? premiereLibre)
      if (!d.open) d.showModal()
      // Le focus va au titre : le lecteur d'écran l'annonce, sans anneau de focus sur le bouton Fermer.
      titreRef.current?.focus({preventScroll: true})
    },
    [dates, premiereLibre],
  )

  useEffect(() => {
    const surClic = (e: globalThis.MouseEvent) => {
      const declencheur = (e.target as Element | null)?.closest?.('[data-reserver]')
      if (!declencheur) return
      e.preventDefault()
      ouvrir(declencheur.getAttribute('data-date'))
    }
    document.addEventListener('click', surClic)
    if (window.location.hash === '#reserver') {
      window.history.replaceState(window.history.state, '', window.location.pathname + window.location.search)
      ouvrir()
    }
    return () => document.removeEventListener('click', surClic)
  }, [ouvrir])

  const fermer = () => dialogue.current?.close()

  // Un toucher hors de la feuille la referme.
  const surClicDialogue = (e: MouseEvent<HTMLDialogElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const dehors = e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom
    if (dehors && e.target === e.currentTarget) fermer()
  }

  const date = dates.find((d) => d.cle === choix)
  const cible = date?.lien || lien
  const attente = date?.statut === 'liste-attente'
  const sujet = encodeURIComponent(`${attente ? 'Liste d’attente' : 'Réservation'} : ${titre}${date ? `, ${date.libelle}` : ''}`)

  return (
    <dialog ref={dialogue} className="reservation" aria-labelledby="reservation-titre" onClick={surClicDialogue}>
      <div className="reservation__tete" style={styleEncre(encre)}>
        <p className="t-label">Réserver</p>
        <h2 className="t-affiche" id="reservation-titre" ref={titreRef} tabIndex={-1}>
          {titre}
        </h2>
        {lieu && <p>{lieu}</p>}
        <button type="button" className="reservation__fermer" onClick={fermer} aria-label="Fermer">
          <Croix />
        </button>
      </div>

      <div className="reservation__corps">
        {dates.length > 0 ? (
          <fieldset className="choix-date">
            <legend className="t-label">1. Choisissez une date</legend>
            {dates.map((d) => {
              const indisponible = d.statut === 'complet' || d.statut === 'annule'
              return (
                <label key={d.cle}>
                  <span>
                    {d.libelle}
                    {(LIBELLES[d.statut] || d.mention || d.lieu) && <small>{[LIBELLES[d.statut], d.mention, d.lieu].filter(Boolean).join(' · ')}</small>}
                  </span>
                  <input type="radio" name="date" value={d.cle} checked={choix === d.cle} disabled={indisponible} onChange={() => setChoix(d.cle)} />
                </label>
              )
            })}
          </fieldset>
        ) : (
          <p>Aucune date à venir pour ce spectacle.</p>
        )}

        {prix.length > 0 && (
          <div>
            <p className="t-label" style={{marginBottom: 10}}>
              2. Les prix
            </p>
            <ul className="prix-liste">
              {prix.map((p) => (
                <li key={p.cle}>
                  <span>
                    {p.categorie}
                    {p.precision && <small>{p.precision}</small>}
                  </span>
                  <strong>{p.prix}.–</strong>
                </li>
              ))}
            </ul>
          </div>
        )}
        {notePrix && <p style={{fontSize: 'var(--t-petit)'}}>{notePrix}</p>}
      </div>

      <div className="reservation__pied">
        {date && cible && !attente ? (
          <>
            <a className="btn btn--plein btn--large" href={cible} {...(sortDuSite(cible) ? NOUVEL_ONGLET : {})}>
              Continuer sur la billetterie <Externe />
              <span className="visuellement-cache"> (nouvel onglet)</span>
            </a>
            <p>Vous choisirez vos places et paierez sur la billetterie en ligne du TBB.</p>
          </>
        ) : date && lienTel ? (
          <>
            <a className="btn btn--plein btn--large" href={lienTel}>
              <Telephone /> {attente ? 'Liste d’attente' : 'Réserver'} au {tel}
            </a>
            {email && (
              <a className="btn btn--trait btn--large" href={`mailto:${email}?subject=${sujet}`}>
                Ou par e-mail <Fleche />
              </a>
            )}
          </>
        ) : (
          <button type="button" className="btn btn--trait btn--large" onClick={fermer}>
            Fermer
          </button>
        )}
      </div>
    </dialog>
  )
}
