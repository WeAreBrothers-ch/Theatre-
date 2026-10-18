'use client'

import {useActionState, useEffect, useRef, useState} from 'react'
import {envoyerMessage, type EtatFormulaire} from '@/app/actions'
import {Coche, Fleche} from '../Icones'

type Props = {sujets: string[]; confirmation: string; secours?: string | null}

/** Formulaire de contact. Les erreurs s'affichent sous chaque champ, les saisies sont conservées. */
export function FormulaireContact(props: Props) {
  const [envoi, setEnvoi] = useState(0)
  return <Formulaire key={envoi} {...props} nouveau={() => setEnvoi((n) => n + 1)} />
}

function Formulaire({sujets, confirmation, secours, nouveau}: Props & {nouveau: () => void}) {
  const [etat, action, enCours] = useActionState<EtatFormulaire, FormData>(envoyerMessage, {statut: 'repos'})
  const debut = useRef<HTMLInputElement>(null)
  const resume = useRef<HTMLDivElement>(null)
  const merci = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (debut.current) debut.current.value = String(Date.now())
  }, [])
  useEffect(() => {
    if (etat.statut === 'erreur') resume.current?.focus()
    if (etat.statut === 'ok') merci.current?.focus()
  }, [etat])

  if (etat.statut === 'ok') {
    return (
      <div className="envoye" role="status" tabIndex={-1} ref={merci}>
        <span className="envoye__coche" aria-hidden="true">
          <Coche />
        </span>
        <p>{confirmation}</p>
        {etat.demo && <p className="t-label">Mode démonstration : le message n’a pas été enregistré.</p>}
        <button type="button" className="btn btn--trait" onClick={nouveau}>
          Écrire un autre message
        </button>
      </div>
    )
  }

  const v = etat.valeurs ?? {}
  const e = etat.erreurs ?? {}
  const champ = (nom: keyof NonNullable<EtatFormulaire['erreurs']>) => ({
    'aria-invalid': e[nom] ? true : undefined,
    'aria-describedby': e[nom] ? `erreur-${nom}` : undefined,
  })

  return (
    <form className="formulaire" action={action} noValidate>
      {etat.statut === 'erreur' && etat.message && (
        <div className="message-erreur" role="alert" tabIndex={-1} ref={resume}>
          {etat.message}
        </div>
      )}

      <fieldset className="sujets champ">
        <legend>Votre message concerne</legend>
        <div className="sujets__liste" {...champ('sujet')}>
          {sujets.map((s, i) => (
            <label key={s} className="sujet">
              <input type="radio" name="sujet" value={s} defaultChecked={v.sujet ? v.sujet === s : false} required={i === 0} />
              <span>{s}</span>
            </label>
          ))}
        </div>
        {e.sujet && (
          <p className="champ__erreur" id="erreur-sujet">
            {e.sujet}
          </p>
        )}
      </fieldset>

      <div className="formulaire__duo">
        <div className="champ">
          <label htmlFor="contact-nom">Nom et prénom</label>
          <input id="contact-nom" name="nom" autoComplete="name" defaultValue={v.nom} required {...champ('nom')} />
          {e.nom && (
            <p className="champ__erreur" id="erreur-nom">
              {e.nom}
            </p>
          )}
        </div>
        <div className="champ">
          <label htmlFor="contact-email">E-mail</label>
          <input id="contact-email" name="email" type="email" inputMode="email" autoComplete="email" defaultValue={v.email} required {...champ('email')} />
          {e.email && (
            <p className="champ__erreur" id="erreur-email">
              {e.email}
            </p>
          )}
        </div>
      </div>

      <div className="champ">
        <label htmlFor="contact-tel">
          Téléphone <span className="champ__facultatif">(facultatif)</span>
        </label>
        <input id="contact-tel" name="telephone" type="tel" inputMode="tel" autoComplete="tel" defaultValue={v.telephone} />
      </div>

      <div className="champ">
        <label htmlFor="contact-message">Message</label>
        <textarea id="contact-message" name="contenu" rows={6} defaultValue={v.contenu} required {...champ('contenu')} />
        {e.contenu && (
          <p className="champ__erreur" id="erreur-contenu">
            {e.contenu}
          </p>
        )}
      </div>

      <div className="piege" aria-hidden="true">
        <label htmlFor="contact-site">Ne pas remplir</label>
        <input id="contact-site" name="site" tabIndex={-1} autoComplete="off" />
      </div>
      <input type="hidden" name="debut" ref={debut} defaultValue="" />
      {secours && <input type="hidden" name="secours" value={secours} />}

      <div className="formulaire__pied">
        <button type="submit" className="btn btn--plein btn--large" disabled={enCours}>
          {enCours ? 'Envoi en cours…' : 'Envoyer le message'} {!enCours && <Fleche />}
        </button>
        <p className="formulaire__mention">Vos coordonnées servent uniquement à vous répondre. Elles ne sont ni partagées, ni utilisées pour de la publicité.</p>
      </div>
    </form>
  )
}
