import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {projectId: 'pgmabzq0', dataset: 'production'},
  // Adresse du Studio en ligne : https://theatrebennobesson.sanity.studio
  studioHost: 'theatrebennobesson',
  deployment: {autoUpdates: true},
  typegen: {
    path: '../web/**/*.{ts,tsx}',
    schema: '../web/sanity/schema.json',
    generates: '../web/sanity/types.ts',
  },
})
