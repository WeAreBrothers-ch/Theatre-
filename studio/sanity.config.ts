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
import {agenda} from './outils/agenda/Agenda'
import {communication} from './outils/communication/Communication'
import {BadgeSpectacle} from './outils/badges'
import {
  BadgeMessage,
  BadgeRendezVous,
  dupliquerPourReprise,
  imprimerFeuille,
  marquerTraite,
  rendreCourante,
  repondre,
  textesReseaux,
  voirAccueil,
  voirSurLeSite,
} from './outils/actions'
import {Logo} from './outils/Logo'
import {modeles} from './lib/modeles'
import {API_VERSION, DATASET, PROJECT_ID, URL_SITE} from './lib/constantes'

const NON_CREABLES = [...SINGLETONS, 'message']
const APERCU = process.env.SANITY_STUDIO_APERCU !== '0'

export default defineConfig({
  name: 'tbb',
  title: 'Théâtre Benno Besson',
  icon: Logo,
  projectId: PROJECT_ID,
  dataset: DATASET,

  plugins: [
    structureTool({title: 'Contenu', structure}),
    // L'aperçu en direct demande un site avec serveur (Vercel…) ; désactivé pour la version GitHub Pages.
    ...(APERCU
      ? [
          presentationTool({
            title: 'Aperçu du site',
            previewUrl: {
              origin: URL_SITE,
              previewMode: {enable: '/api/draft-mode/enable'},
            },
            resolve,
          }),
        ]
      : []),
    colorInput(),
    frFRLocale(),
    visionTool({title: 'Requêtes', defaultApiVersion: API_VERSION}),
  ],

  // Le tableau de bord s'ouvre en premier, puis l'agenda et la communication ;
  // l'outil de requêtes reste réservé aux développeurs.
  tools: (outils, {currentUser}) => {
    const technique = currentUser?.roles.some((r) => r.name === 'administrator' || r.name === 'developer')
    return [tableauDeBord, agenda, ...outils.filter((t) => t.name !== 'vision'), communication, ...(technique ? outils.filter((t) => t.name === 'vision') : [])]
  },

  schema: {
    types: schemaTypes,
    templates: (existants) => [...existants.filter((m) => !NON_CREABLES.includes(m.schemaType)), ...modeles],
  },

  document: {
    newDocumentOptions: (options) => options.filter((o) => !NON_CREABLES.includes(o.templateId)),
    actions: (actions, {schemaType}) => {
      if (SINGLETONS.includes(schemaType)) {
        const sansSuppression = actions.filter((a) => !['unpublish', 'delete', 'duplicate'].includes(a.action ?? ''))
        return schemaType === 'accueil' ? [...sansSuppression, voirAccueil] : sansSuppression
      }
      switch (schemaType) {
        case 'spectacle':
          return [...actions, voirSurLeSite, imprimerFeuille, textesReseaux, dupliquerPourReprise]
        case 'page':
        case 'rendezVous':
          return [...actions, voirSurLeSite]
        case 'saison':
          return [...actions, rendreCourante]
        case 'message':
          return [repondre, marquerTraite, ...actions]
        default:
          return actions
      }
    },
    badges: (badges, {schemaType}) => {
      if (schemaType === 'spectacle') return [...badges, BadgeSpectacle]
      if (schemaType === 'message') return [...badges, BadgeMessage]
      if (schemaType === 'rendezVous') return [...badges, BadgeRendezVous]
      return badges
    },
  },
})
