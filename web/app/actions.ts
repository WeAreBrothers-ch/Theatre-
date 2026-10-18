'use server'

import {createClient} from 'next-sanity'
import {
  ERREUR_EMAIL,
  EMAIL,
  adresseSecours,
  champPiegeRempli,
  lire,
  lireMessage,
  tropRapide,
  validerMessage,
  type EtatFormulaire,
} from '@/lib/formulaires'
import {apiVersion, dataset, projectId, tokenEcriture} from '@/sanity/env'

/*
 * Formulaires du site. Les messages arrivent dans le Studio, rubrique
 * « Messages reçus », grâce au jeton d'écriture SANITY_API_WRITE_TOKEN
 * (droits « Editor », gardé côté serveur).
 * La version statique du site (GitHub Pages) remplace ce fichier par statique/actions.ts.
 */

async function enregistrer(doc: Record<string, unknown>): Promise<'enregistre' | 'demo' | 'indisponible'> {
  if (!tokenEcriture) return process.env.NODE_ENV === 'production' ? 'indisponible' : 'demo'
  const client = createClient({projectId, dataset, apiVersion, token: tokenEcriture, useCdn: false})
  await client.create({_type: 'message', statut: 'nouveau', recuLe: new Date().toISOString(), ...doc})
  return 'enregistre'
}

export async function envoyerMessage(_precedent: EtatFormulaire, formData: FormData): Promise<EtatFormulaire> {
  if (champPiegeRempli(formData)) return {statut: 'ok'}
  const valeurs = lireMessage(formData)
  const erreur = validerMessage(valeurs)
  if (erreur) return erreur
  if (tropRapide(formData)) return {statut: 'ok'}
  try {
    const resultat = await enregistrer(valeurs)
    if (resultat === 'indisponible') {
      return {statut: 'erreur', valeurs, message: `Le formulaire est momentanément indisponible. Écrivez-nous directement à ${adresseSecours(formData)}.`}
    }
    return {statut: 'ok', demo: resultat === 'demo'}
  } catch {
    return {statut: 'erreur', valeurs, message: `Votre message n’a pas pu partir. Réessayez dans un instant ou écrivez à ${adresseSecours(formData)}.`}
  }
}

export async function inscrireLettre(_precedent: EtatFormulaire, formData: FormData): Promise<EtatFormulaire> {
  if (champPiegeRempli(formData)) return {statut: 'ok'}
  const email = lire(formData, 'email', 160)
  if (!EMAIL.test(email)) return {statut: 'erreur', valeurs: {email}, erreurs: {email: ERREUR_EMAIL}}
  if (tropRapide(formData)) return {statut: 'ok'}
  try {
    const resultat = await enregistrer({sujet: 'Inscription à la lettre d’information', email, contenu: 'Merci de m’inscrire à la lettre du TBB.'})
    if (resultat === 'indisponible') return {statut: 'erreur', valeurs: {email}, message: `Inscription momentanément indisponible. Écrivez à ${adresseSecours(formData)}.`}
    return {statut: 'ok', demo: resultat === 'demo'}
  } catch {
    return {statut: 'erreur', valeurs: {email}, message: 'L’inscription n’a pas pu être enregistrée. Réessayez dans un instant.'}
  }
}
