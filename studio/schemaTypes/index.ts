import {objets} from './objets'
import {spectacle} from './spectacle'
import {articlePresse, grilleTarifaire, lieu, message, partenaire, personne, rendezVous, saison} from './documents'
import {sections} from './sections'
import {accueil, page, reglages} from './pages'

export const SINGLETONS = ['accueil', 'reglages']

export const schemaTypes = [
  spectacle,
  rendezVous,
  page,
  accueil,
  reglages,
  articlePresse,
  lieu,
  saison,
  grilleTarifaire,
  personne,
  partenaire,
  message,
  ...sections,
  ...objets,
]
