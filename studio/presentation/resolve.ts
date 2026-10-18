import {defineDocuments, defineLocations, type PresentationPluginOptions} from 'sanity/presentation'

/* Relie chaque document à sa page sur le site, pour l'aperçu en direct. */
export const resolve: PresentationPluginOptions['resolve'] = {
  mainDocuments: defineDocuments([
    {route: '/', filter: `_id == "accueil"`},
    {route: '/spectacles/:slug', filter: `_type == "spectacle" && slug.current == $slug`},
    {route: '/:slug', filter: `_type == "page" && slug.current == $slug`},
  ]),
  locations: {
    accueil: defineLocations({message: 'Page d’accueil', tone: 'positive', locations: [{title: 'Accueil', href: '/'}]}),
    reglages: defineLocations({message: 'Utilisé sur toutes les pages', tone: 'positive', locations: [{title: 'Accueil', href: '/'}]}),
    spectacle: defineLocations({
      select: {titre: 'titre', slug: 'slug.current'},
      resolve: (doc) => ({
        locations: [
          {title: doc?.titre || 'Spectacle', href: `/spectacles/${doc?.slug}`},
          {title: 'Programme', href: '/programme'},
          {title: 'Accueil', href: '/'},
        ],
      }),
    }),
    page: defineLocations({
      select: {titre: 'titre', slug: 'slug.current'},
      resolve: (doc) => ({locations: [{title: doc?.titre || 'Page', href: `/${doc?.slug}`}]}),
    }),
  },
}
