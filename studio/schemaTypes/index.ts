import {objets} from './objets'
import {spectacle} from './spectacle'
import {grilleTarifaire, lieu, message, partenaire, personne, saison} from './documents'
import {sections} from './sections'
import {accueil, page, reglages} from './pages'

export const SINGLETONS = ['accueil', 'reglages']

export const schemaTypes = [
  spectacle,
  page,
  accueil,
  reglages,
  lieu,
  saison,
  grilleTarifaire,
  personne,
  partenaire,
  message,
  ...sections,
  ...objets,
]
