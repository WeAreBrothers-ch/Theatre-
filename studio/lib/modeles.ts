import type {InitialValueResolverContext, Template} from 'sanity'
import {API_VERSION} from './constantes'

/*
 * Les modèles du bouton « + » : un spectacle ordinaire, un Midi théâtre, un spectacle jeune
 * public. Chacun arrive pré-rempli (saison en cours, salle, grille de prix, durée…) :
 * il ne reste que ce qui change d'un spectacle à l'autre.
 *
 * La salle et la grille se retrouvent par leur nom ; si elles ont été renommées, le champ
 * reste vide et se remplit à la main.
 */

type Ids = {saison?: string; salle?: string; grille?: string}

const ref = (id?: string) => (id ? {_type: 'reference', _ref: id} : undefined)

const REQUETE = /* groq */ `{
  "saison": *[_type == "saison" && courante == true && !(_id in path("drafts.**"))][0]._id,
  "salle": *[_type == "lieu" && !(_id in path("drafts.**")) && nom match $salle] | order(ordre asc)[0]._id,
  "grille": *[_type == "grilleTarifaire" && !(_id in path("drafts.**")) && nom match $grille][0]._id
}`

export const modeles: Template[] = [
  {
    id: 'spectacle-midi-theatre',
    title: 'Midi théâtre',
    schemaType: 'spectacle',
    value: async (_params: unknown, {getClient}: InitialValueResolverContext) => {
      const ids = await getClient({apiVersion: API_VERSION}).fetch<Ids>(REQUETE, {salle: 'Salle 1', grille: 'Midi*'})
      return {
        genre: 'theatre',
        etiquettes: ['midi-theatre'],
        impression: 'auto',
        duree: '1h (avec repas)',
        saison: ref(ids.saison),
        lieu: ref(ids.salle),
        tarifs: ref(ids.grille),
      }
    },
  },
  {
    id: 'spectacle-jeune-public',
    title: 'Spectacle jeune public',
    schemaType: 'spectacle',
    value: async (_params: unknown, {getClient}: InitialValueResolverContext) => {
      const ids = await getClient({apiVersion: API_VERSION}).fetch<Ids>(REQUETE, {salle: 'Grande Salle', grille: 'Jeune*'})
      return {
        genre: 'jeune-public',
        etiquettes: [],
        impression: 'auto',
        saison: ref(ids.saison),
        lieu: ref(ids.salle),
        tarifs: ref(ids.grille),
      }
    },
  },
  {
    id: 'spectacle-saison-musicale',
    title: 'Concert de la saison musicale',
    schemaType: 'spectacle',
    value: async (_params: unknown, {getClient}: InitialValueResolverContext) => {
      const ids = await getClient({apiVersion: API_VERSION}).fetch<Ids>(REQUETE, {salle: 'Temple', grille: 'Grande Salle'})
      return {
        genre: 'musique',
        etiquettes: ['saison-musicale'],
        impression: 'auto',
        saison: ref(ids.saison),
        lieu: ref(ids.salle),
        tarifs: ref(ids.grille),
      }
    },
  },
]
