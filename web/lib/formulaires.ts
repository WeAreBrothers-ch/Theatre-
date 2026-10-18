/* Règles communes aux formulaires, côté serveur comme dans la version statique du site. */

export type EtatFormulaire = {
  statut: 'repos' | 'ok' | 'erreur'
  message?: string
  erreurs?: Partial<Record<'sujet' | 'nom' | 'email' | 'contenu', string>>
  valeurs?: Record<string, string>
  /** Message non enregistré (démonstration locale). */
  demo?: boolean
  /** Version statique : la messagerie de la personne s'est ouverte avec le message prêt. */
  courriel?: boolean
}

export const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export const lire = (formData: FormData, nom: string, max: number) => String(formData.get(nom) ?? '').trim().slice(0, max)

/** Les robots remplissent le champ piège… */
export const champPiegeRempli = (formData: FormData) => !!lire(formData, 'site', 200)

/** …ou envoient un formulaire complet moins de deux secondes après l'affichage. */
export function tropRapide(formData: FormData): boolean {
  const debut = Number(formData.get('debut'))
  return Number.isFinite(debut) && debut > 0 && Date.now() - debut < 2000
}

export function adresseSecours(formData: FormData): string {
  const adresse = lire(formData, 'secours', 120)
  return EMAIL.test(adresse) ? adresse : 'tbb@yverdon-les-bains.ch'
}

export function lireMessage(formData: FormData) {
  return {
    sujet: lire(formData, 'sujet', 120),
    nom: lire(formData, 'nom', 120),
    email: lire(formData, 'email', 160),
    telephone: lire(formData, 'telephone', 40),
    contenu: lire(formData, 'contenu', 5000),
  }
}

export function validerMessage(valeurs: ReturnType<typeof lireMessage>): EtatFormulaire | null {
  const erreurs: EtatFormulaire['erreurs'] = {}
  if (!valeurs.sujet) erreurs.sujet = 'Choisissez le sujet de votre message.'
  if (!valeurs.nom) erreurs.nom = 'Indiquez votre nom.'
  if (!EMAIL.test(valeurs.email)) erreurs.email = 'Indiquez une adresse e-mail valide, par exemple prenom@exemple.ch.'
  if (valeurs.contenu.length < 5) erreurs.contenu = 'Écrivez votre message.'
  if (!Object.keys(erreurs).length) return null
  return {statut: 'erreur', erreurs, valeurs, message: 'Il manque une information : les champs concernés sont signalés.'}
}

export const ERREUR_EMAIL = 'Indiquez une adresse e-mail valide, par exemple prenom@exemple.ch.'
