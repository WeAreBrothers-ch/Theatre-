/* Formes des données renvoyées par les requêtes GROQ (sanity/requetes.ts). */

export type Hotspot = {x: number; y: number; height?: number; width?: number}
export type Crop = {top: number; bottom: number; left: number; right: number}

export type Img = {
  ref?: string | null
  url?: string | null
  /** Version en niveaux de gris préparée (contenus d'amorçage seulement). */
  gris?: string | null
  l?: number | null
  h?: number | null
  lqip?: string | null
  dominante?: string | null
  vibrante?: string | null
  hotspot?: Hotspot | null
  crop?: Crop | null
  alt?: string | null
  legende?: string | null
  credit?: string | null
}

export type Bloc = {_type: string; _key: string; [cle: string]: unknown}

export type Lien = {
  titre?: string | null
  url?: string | null
  page?: {_type: string; slug?: string | null} | null
}

export type EntreeMenu = Lien & {_key: string; sousLiens?: (Lien & {_key: string})[] | null}

/** Un document à télécharger (fichier téléversé ou adresse). */
export type Fichier = {_key: string; titre?: string | null; description?: string | null; url?: string | null; taille?: number | null; extension?: string | null}

export type Bouton = {titre?: string | null; url?: string | null}

export type Seo = {titre?: string | null; description?: string | null; image?: Img | null}

export type Grille = {
  nom?: string | null
  tarifs?: {_key: string; categorie: string; prix: number; precision?: string | null}[] | null
  note?: string | null
}

export type RepresentationBrute = {
  _key: string
  dateHeure: string
  statut?: string | null
  mention?: string | null
  lien?: string | null
  lieu?: string | null
  heureAConfirmer?: boolean | null
  scolaire?: boolean | null
}

export type CarteBrute = {
  _id: string
  titre: string
  sousTitre?: string | null
  compagnie?: string | null
  genre?: string | null
  precision?: string | null
  etiquettes?: string[] | null
  slug: string
  encre?: string | null
  impression?: string | null
  accroche?: string | null
  age?: string | null
  duree?: string | null
  visuel?: Img | null
  lieu?: {nom?: string | null; nomComplet?: string | null; adresse?: string | null; accessibilite?: string | null; lienPlan?: string | null} | null
  saison?: {titre?: string | null; courante?: boolean | null; boutique?: string | null} | null
  representations?: RepresentationBrute[] | null
  lienBilletterie?: string | null
  libelleBillet?: string | null
  lienListeAttente?: string | null
}

export type Citation = {_key: string; citation?: string | null; auteur?: string | null; media?: string | null}

export type ArticlePresse = {
  _id: string
  titre: string
  media?: string | null
  auteur?: string | null
  date?: string | null
  type?: string | null
  extrait?: string | null
  url?: string | null
  spectacle?: {titre?: string | null; slug?: string | null} | null
}

export type SpectacleBrut = CarteBrute & {
  texte?: Bloc[] | null
  photos?: (Img & {_key: string})[] | null
  video?: string | null
  deroule?: {_key: string; titre?: string | null; duree?: string | null}[] | null
  avertissement?: string | null
  autour?: string[] | null
  distinction?: string | null
  accessibilite?: string | null
  distribution?: {_key: string; titre?: string | null; lignes?: {_key: string; role?: string | null; noms?: string | null}[] | null}[] | null
  production?: string | null
  creation?: string | null
  creditsPhotos?: string | null
  tarifs?: Grille | null
  noteTarifs?: string | null
  citations?: Citation[] | null
  photosHD?: string | null
  dossierPresse?: string | null
  dossierPedagogique?: string | null
  scolaire?: string | null
  documents?: Fichier[] | null
  articles?: ArticlePresse[] | null
  rendezVous?: {_id: string; titre: string; debut?: string | null; fin?: string | null; periode?: string | null; lieu?: string | null; slug?: string | null; aTexte?: boolean | null}[] | null
  seo?: Seo | null
}

export type Reglages = {
  nom?: string | null
  rue?: string | null
  localite?: string | null
  telBilletterie?: string | null
  emailBilletterie?: string | null
  telAdmin?: string | null
  emailGeneral?: string | null
  lienBilletterie?: string | null
  horaires?: {_key: string; jours?: string | null; heures?: string | null}[] | null
  noteHoraires?: string | null
  accesTrain?: string | null
  accesBus?: string | null
  accesVoiture?: string | null
  accesRestaurer?: string | null
  lienPlan?: string | null
  menu?: EntreeMenu[] | null
  boutonMenu?: Bouton | null
  colonnesPied?: {_key: string; titre?: string | null; liens?: (Lien & {_key: string})[] | null}[] | null
  instagram?: string | null
  facebook?: string | null
  linkedin?: string | null
  annonce?: {active?: boolean | null; texte?: string | null; lien?: string | null; jusquau?: string | null} | null
  avis?: {_key: string; titre?: string | null; texte?: string | null; du?: string | null; au?: string | null}[] | null
  lettre?: {lienInscription?: string | null; lienPreferences?: string | null} | null
  lienListeAttente?: string | null
  casePostale?: string | null
  adresseSite?: string | null
  credit?: string | null
  seo?: Seo | null
}

export type Partenaire = {_id: string; nom: string; url?: string | null; type?: string | null}

export type Personne = {_id: string; nom: string; fonction?: string | null; groupe?: string | null; email?: string | null; telephone?: string | null; bio?: Bloc[] | null; photo?: Img | null}

export type PartenaireLogo = {_id: string; nom: string; type?: string | null; url?: string | null; logo?: Img | null}

export type RendezVous = {
  _id: string
  titre: string
  categorie?: string | null
  debut?: string | null
  fin?: string | null
  periode?: string | null
  organisateur?: string | null
  lieu?: string | null
  prix?: string | null
  inscription?: string | null
  texte?: Bloc[] | null
  horaires?: {_key: string; dateHeure?: string | null; precision?: string | null}[] | null
  slug?: string | null
  image?: Img | null
  liens?: (Lien & {_key: string})[] | null
}

export type RendezVousBrut = RendezVous & {spectacles?: CarteBrute[] | null}

export type Lieu = {
  _id: string
  nom: string
  nomComplet?: string | null
  capacite?: number | null
  description?: string | null
  adresse?: string | null
  visiteVirtuelle?: string | null
  caracteristiques?: {_key: string; libelle?: string | null; valeur?: string | null}[] | null
  photos?: (Img & {_key: string})[] | null
  documents?: Fichier[] | null
}

export type SaisonArchive = {
  _id: string
  titre: string
  debut?: string | null
  affiche?: Img | null
  spectacles?: {_id: string; titre: string; compagnie?: string | null; slug: string; premiere?: string | null}[] | null
}

export type Site = {
  reglages: Reglages | null
  partenaires: Partenaire[]
  saison: {titre?: string | null; boutique?: string | null; programmePdf?: string | null; afficheHD?: string | null} | null
}

/** Une section de page : le champ `_type` dit laquelle. */
export type Section = {_type: string; _key: string; ancre?: string | null; surtitre?: string | null; titre?: string | null; [cle: string]: unknown}

export type PageBrute = {
  _id: string
  titre: string
  slug: string
  intro?: string | null
  image?: Img | null
  sections?: Section[] | null
  seo?: Seo | null
}

export type AccueilBrut = {
  aLaffiche?: string[] | null
  sections?: Section[] | null
  seo?: Seo | null
}
