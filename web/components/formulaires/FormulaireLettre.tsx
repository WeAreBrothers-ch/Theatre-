'use client'

import {useActionState, useEffect, useRef} from 'react'
import {inscrireLettre} from '@/app/actions'
import type {EtatFormulaire} from '@/lib/formulaires'
import {Coche} from '../Icones'

/** Inscription à la lettre d'information, en un champ. */
export function FormulaireLettre({secours}: {secours?: string | null}) {
  const [etat, action, enCours] = useActionState<EtatFormulaire, FormData>(inscrireLettre, {statut: 'repos'})
  const debut = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (debut.current) debut.current.value = String(Date.now())
  }, [])

  if (etat.statut === 'ok') {
    return (
      <p className="message-ok" role="status">
        <Coche />
        <span>
          {etat.courriel ? 'Votre messagerie s’est ouverte : envoyez le message pour confirmer l’inscription.' : 'Inscription enregistrée. À bientôt dans votre boîte aux lettres.'}
          {etat.demo && <span className="t-label" style={{display: 'block', marginTop: 6}}>Mode démonstration : rien n’a été enregistré.</span>}
        </span>
      </p>
    )
  }

  const erreur = etat.erreurs?.email || etat.message
  return (
    <form action={action} noValidate className="champ">
      <label htmlFor="lettre-email">Votre e-mail</label>
      <div className="champ--ligne">
        <input
          id="lettre-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="prenom@exemple.ch"
          defaultValue={etat.valeurs?.email}
          aria-invalid={erreur ? true : undefined}
          aria-describedby={erreur ? 'lettre-erreur' : undefined}
          required
        />
        <button type="submit" className="btn btn--plein" disabled={enCours}>
          {enCours ? 'Un instant…' : 'Je m’inscris'}
        </button>
      </div>
      {erreur && (
        <p className="champ__erreur" id="lettre-erreur" role="alert">
          {erreur}
        </p>
      )}
      <div className="piege" aria-hidden="true">
        <input name="site" tabIndex={-1} autoComplete="off" />
      </div>
      <input type="hidden" name="debut" ref={debut} defaultValue="" />
      {secours && <input type="hidden" name="secours" value={secours} />}
    </form>
  )
}
