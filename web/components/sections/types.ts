import type {Spectacle} from '@/lib/spectacles'
import type {ArticlePresse, Bloc, Bouton, Fichier, Grille, Img, Lien, Lieu, PartenaireLogo, Personne, RendezVous, SaisonArchive, Section, Site} from '@/sanity/types'

/** Ce que chaque section reçoit : ses données, son ancre et le contexte de la page. */
export type Contexte = {
  site: Site
  spectacles: Spectacle[]
  instant: Date
  /** Spectacles déjà listés plus haut sur la page (l'agenda), pour éviter les doublons. */
  dejaMontres: Set<string>
}

export type ProprietesSection<T extends Section = Section> = {section: T; id: string; titreId: string; contexte: Contexte}

export type SectionTexte = Section & {chapo?: string | null; texte?: Bloc[] | null; image?: Img | null}
export type SectionInfos = Section & {blocs?: {_key: string; titre?: string | null; texte?: string | null; lien?: Lien | null; note?: string | null}[] | null}
export type SectionTarifs = Section & {grille?: Grille | null; notes?: {_key: string; titre?: string | null; texte?: string | null; lien?: Lien | null}[] | null}
export type SectionCitation = Section & {
  citation?: string | null
  auteur?: string | null
  portrait?: Img | null
  texte?: string | null
  reperes?: {_key: string; chiffre?: string | null; texte?: string | null}[] | null
  lien?: Lien | null
  style?: string | null
}
export type SectionFrise = Section & {etapes?: {_key: string; annee?: string | null; titre?: string | null; texte?: string | null; image?: Img | null}[] | null}
export type SectionGalerie = Section & {images?: (Img & {_key: string})[] | null}
export type SectionEquipe = Section & {texte?: string | null; personnes?: Personne[] | null; groupes?: string[] | null; biographies?: boolean | null}
export type SectionFormules = Section & {
  texte?: string | null
  formules?: {_key: string; nom?: string | null; prix?: string | null; periode?: string | null; texte?: string | null; bouton?: Bouton | null}[] | null
  bouton?: Bouton | null
}
export type SectionAppel = Section & {texte?: string | null; bouton?: Bouton | null; fond?: string | null}
export type SectionAffiches = Section & {
  texte?: string | null
  genre?: string | null
  etiquette?: string | null
  filtres?: boolean | null
  nombre?: number | null
  quand?: 'avenir' | 'passes' | 'tous' | null
  inclurePasses?: boolean | null
}
export type SectionAgenda = Section & {nombre?: number | null}
export type SectionFaq = Section & {questions?: {_key: string; question?: string | null; reponse?: string | null}[] | null}
export type SectionContact = Section & {
  annuaire?: {_key: string; service?: string | null; nom?: string | null; email?: string | null; telephone?: string | null}[] | null
  formulaire?: boolean | null
  sujets?: string[] | null
  confirmation?: string | null
}
export type SectionLettre = Section & {texte?: string | null}
export type SectionDocuments = Section & {texte?: string | null; documents?: Fichier[] | null}
export type SectionPartenaires = Section & {texte?: string | null; types?: string[] | null; partenaires?: PartenaireLogo[] | null}
export type SectionPresse = Section & {texte?: string | null; nombre?: number | null; articles?: ArticlePresse[] | null}
export type SectionRendezVous = Section & {texte?: string | null; categories?: string[] | null; inclurePasses?: boolean | null; rendezVous?: RendezVous[] | null}
export type SectionLieux = Section & {texte?: string | null; lieux?: Lieu[] | null}
export type SectionArchives = Section & {texte?: string | null; saisons?: SaisonArchive[] | null}
export type SectionVideo = Section & {url?: string | null; legende?: string | null}
export type SectionListe = Section & {
  texte?: string | null
  elements?: {_key: string; surtitre?: string | null; titre?: string | null; sousTitre?: string | null; texte?: string | null; image?: Img | null; lien?: Lien | null}[] | null
  bouton?: Bouton | null
}
export type SectionAvis = Section
