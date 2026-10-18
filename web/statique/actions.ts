/*
 * Version statique des formulaires (GitHub Pages, sans serveur) : copiée sur
 * app/actions.ts par scripts/preparer-statique.mjs au moment de la construction.
 * Après vérification des champs, la messagerie de la personne s'ouvre avec le
 * message prêt à partir vers l'adresse du théâtre.
 */
import {
  ERREUR_EMAIL,
  EMAIL,
  adresseSecours,
  champPiegeRempli,
  lire,
  lireMessage,
  validerMessage,
  type EtatFormulaire,
} from '@/lib/formulaires'

function ouvrirMessagerie(destinataire: string, sujet: string, corps: string) {
  window.location.href = `mailto:${destinataire}?subject=${encodeURIComponent(sujet)}&body=${encodeURIComponent(corps)}`
}

export async function envoyerMessage(_precedent: EtatFormulaire, formData: FormData): Promise<EtatFormulaire> {
  if (champPiegeRempli(formData)) return {statut: 'ok'}
  const valeurs = lireMessage(formData)
  const erreur = validerMessage(valeurs)
  if (erreur) return erreur
  const corps = [valeurs.contenu, '', `${valeurs.nom}`, valeurs.email, valeurs.telephone].filter((l, i) => i < 2 || l).join('\n')
  ouvrirMessagerie(adresseSecours(formData), `${valeurs.sujet} : message de ${valeurs.nom}`, corps)
  return {statut: 'ok', courriel: true}
}

export async function inscrireLettre(_precedent: EtatFormulaire, formData: FormData): Promise<EtatFormulaire> {
  if (champPiegeRempli(formData)) return {statut: 'ok'}
  const email = lire(formData, 'email', 160)
  if (!EMAIL.test(email)) return {statut: 'erreur', valeurs: {email}, erreurs: {email: ERREUR_EMAIL}}
  ouvrirMessagerie(adresseSecours(formData), 'Inscription à la lettre du TBB', `Merci d’inscrire l’adresse ${email} à la lettre d’information du TBB.`)
  return {statut: 'ok', courriel: true}
}
