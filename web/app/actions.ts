'use server'

import {createClient} from 'next-sanity'
import {apiVersion, dataset, projectId, tokenEcriture} from '@/sanity/env'

/*
 * Formulaires du site. Les messages arrivent dans le Studio, rubrique
 * « Messages reçus », grâce au jeton d'écriture SANITY_API_WRITE_TOKEN
 * (droits « Editor », gardé côté serveur).
 */

export type EtatFormulaire = {
  statut: 'repos' | 'ok' | 'erreur'
  message?: string
  erreurs?: Partial<Record<'sujet' | 'nom' | 'email' | 'contenu', string>>
  valeurs?: Record<string, string>
  demo?: boolean
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const lire = (formData: FormData, nom: string, max: number) => String(formData.get(nom) ?? '').trim().slice(0, max)

/** Les robots remplissent le champ piège… */
const champPiegeRempli = (formData: FormData) => !!lire(formData, 'site', 200)

/** …ou envoient un formulaire complet moins de deux secondes après l'affichage. */
function tropRapide(formData: FormData): boolean {
  const debut = Number(formData.get('debut'))
  return Number.isFinite(debut) && debut > 0 && Date.now() - debut < 2000
}

async function enregistrer(doc: Record<string, unknown>): Promise<'enregistre' | 'demo' | 'indisponible'> {
  if (!tokenEcriture) return process.env.NODE_ENV === 'production' ? 'indisponible' : 'demo'
  const client = createClient({projectId, dataset, apiVersion, token: tokenEcriture, useCdn: false})
  await client.create({_type: 'message', statut: 'nouveau', recuLe: new Date().toISOString(), ...doc})
  return 'enregistre'
}

function secours(formData: FormData): string {
  const adresse = lire(formData, 'secours', 120)
  return EMAIL.test(adresse) ? adresse : 'tbb@yverdon-les-bains.ch'
}

export async function envoyerMessage(_precedent: EtatFormulaire, formData: FormData): Promise<EtatFormulaire> {
  if (champPiegeRempli(formData)) return {statut: 'ok'}
  const valeurs = {
    sujet: lire(formData, 'sujet', 120),
    nom: lire(formData, 'nom', 120),
    email: lire(formData, 'email', 160),
    telephone: lire(formData, 'telephone', 40),
    contenu: lire(formData, 'contenu', 5000),
  }
  const erreurs: EtatFormulaire['erreurs'] = {}
  if (!valeurs.sujet) erreurs.sujet = 'Choisissez le sujet de votre message.'
  if (!valeurs.nom) erreurs.nom = 'Indiquez votre nom.'
  if (!EMAIL.test(valeurs.email)) erreurs.email = 'Indiquez une adresse e-mail valide, par exemple prenom@exemple.ch.'
  if (valeurs.contenu.length < 5) erreurs.contenu = 'Écrivez votre message.'
  if (Object.keys(erreurs).length) {
    return {statut: 'erreur', erreurs, valeurs, message: 'Il manque une information : les champs concernés sont signalés.'}
  }
  if (tropRapide(formData)) return {statut: 'ok'}
  try {
    const resultat = await enregistrer(valeurs)
    if (resultat === 'indisponible') {
      return {statut: 'erreur', valeurs, message: `Le formulaire est momentanément indisponible. Écrivez-nous directement à ${secours(formData)}.`}
    }
    return {statut: 'ok', demo: resultat === 'demo'}
  } catch {
    return {statut: 'erreur', valeurs, message: `Votre message n’a pas pu partir. Réessayez dans un instant ou écrivez à ${secours(formData)}.`}
  }
}

export async function inscrireLettre(_precedent: EtatFormulaire, formData: FormData): Promise<EtatFormulaire> {
  if (champPiegeRempli(formData)) return {statut: 'ok'}
  const email = lire(formData, 'email', 160)
  if (!EMAIL.test(email)) {
    return {statut: 'erreur', valeurs: {email}, erreurs: {email: 'Indiquez une adresse e-mail valide, par exemple prenom@exemple.ch.'}}
  }
  if (tropRapide(formData)) return {statut: 'ok'}
  try {
    const resultat = await enregistrer({sujet: 'Inscription à la lettre d’information', email, contenu: 'Merci de m’inscrire à la lettre du TBB.'})
    if (resultat === 'indisponible') return {statut: 'erreur', valeurs: {email}, message: `Inscription momentanément indisponible. Écrivez à ${secours(formData)}.`}
    return {statut: 'ok', demo: resultat === 'demo'}
  } catch {
    return {statut: 'erreur', valeurs: {email}, message: 'L’inscription n’a pas pu être enregistrée. Réessayez dans un instant.'}
  }
}
