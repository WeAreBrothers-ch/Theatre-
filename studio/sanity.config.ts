import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {presentationTool} from 'sanity/presentation'
import {visionTool} from '@sanity/vision'
import {colorInput} from '@sanity/color-input'
import {frFRLocale} from '@sanity/locale-fr-fr'
import {SINGLETONS, schemaTypes} from './schemaTypes'
import {structure} from './structure'
import {resolve} from './presentation/resolve'
import {tableauDeBord} from './outils/TableauDeBord'
import {BadgeSpectacle} from './outils/badges'
import {Logo} from './outils/Logo'
import {API_VERSION, DATASET, PROJECT_ID, URL_SITE} from './lib/constantes'

const NON_CREABLES = [...SINGLETONS, 'message']

export default defineConfig({
  name: 'tbb',
  title: 'Théâtre Benno Besson',
  icon: Logo,
  projectId: PROJECT_ID,
  dataset: DATASET,

  plugins: [
    structureTool({title: 'Contenu', structure}),
    presentationTool({
      title: 'Aperçu du site',
      previewUrl: {
        origin: URL_SITE,
        previewMode: {enable: '/api/draft-mode/enable'},
      },
      resolve,
    }),
    colorInput(),
    frFRLocale(),
    visionTool({title: 'Requêtes', defaultApiVersion: API_VERSION}),
  ],

  // Le tableau de bord s'ouvre en premier ; l'outil de requêtes reste réservé aux développeurs.
  tools: (outils, {currentUser}) => {
    const technique = currentUser?.roles.some((r) => r.name === 'administrator' || r.name === 'developer')
    return [tableauDeBord, ...(technique ? outils : outils.filter((t) => t.name !== 'vision'))]
  },

  schema: {
    types: schemaTypes,
    templates: (modeles) => modeles.filter((m) => !NON_CREABLES.includes(m.schemaType)),
  },

  document: {
    newDocumentOptions: (options) => options.filter((o) => !NON_CREABLES.includes(o.templateId)),
    actions: (actions, {schemaType}) =>
      SINGLETONS.includes(schemaType)
        ? actions.filter((a) => !['unpublish', 'delete', 'duplicate'].includes(a.action ?? ''))
        : actions,
    badges: (badges, {schemaType}) => (schemaType === 'spectacle' ? [...badges, BadgeSpectacle] : badges),
  },
})
