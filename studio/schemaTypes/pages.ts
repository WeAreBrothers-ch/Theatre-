import {defineArrayMember, defineField, defineType} from 'sanity'
import {ChampAdresse} from '../composants/ChampAdresse'
import {DocumentsIcon} from '@sanity/icons/Documents'
import {HomeIcon} from '@sanity/icons/Home'
import {CogIcon} from '@sanity/icons/Cog'
import {SECTIONS_PAGE} from './sections'
import {SLUGS_RESERVES, slugifier} from '../lib/constantes'

const sectionsField = defineField({
  name: 'sections',
  title: 'Sections',
  type: 'array',
  description: 'Ajoutez, déplacez (poignée à gauche) ou supprimez des sections. La page se construit dans cet ordre.',
  of: SECTIONS_PAGE.map((type) => defineArrayMember({type})),
  options: {
    insertMenu: {
      views: [{name: 'grid'}, {name: 'list'}],
    },
  },
})

export const page = defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  icon: DocumentsIcon,
  groups: [
    {name: 'contenu', title: 'Contenu', default: true},
    {name: 'seo', title: 'Partage'},
  ],
  fields: [
    defineField({name: 'titre', title: 'Titre', type: 'string', group: 'contenu', description: 'Affiché en très grand en haut de la page. Exemple : Billetterie', validation: (r) => r.required()}),
    defineField({name: 'intro', title: 'Introduction', type: 'text', rows: 3, group: 'contenu', description: 'Une ou deux phrases à côté du titre.'}),
    defineField({
      name: 'image',
      title: 'Image d’en-tête',
      type: 'image',
      group: 'contenu',
      options: {hotspot: true, metadata: ['lqip', 'palette']},
      description: 'Facultatif. Imprimée en vert TBB sous le titre, comme une affiche.',
      fields: [defineField({name: 'alt', title: 'Description pour les personnes malvoyantes', type: 'string'}), defineField({name: 'legende', title: 'Légende', type: 'string'})],
    }),
    sectionsField,
    defineField({
      name: 'slug',
      title: 'Adresse de la page',
      type: 'slug',
      group: 'seo',
      options: {source: 'titre', slugify: slugifier},
      components: {input: ChampAdresse},
      description: 'Exemple : billetterie donne theatrebennobesson.ch/billetterie',
      validation: (r) =>
        r.required().custom((v) => (v?.current && SLUGS_RESERVES.includes(v.current) ? 'Cette adresse est réservée par le site, choisissez-en une autre.' : true)),
    }),
    defineField({name: 'seo', title: 'Partage et référencement', type: 'seo', group: 'seo'}),
  ],
  preview: {
    select: {title: 'titre', slug: 'slug.current'},
    prepare: ({title, slug}) => ({title, subtitle: slug ? `/${slug}` : ''}),
  },
})

export const accueil = defineType({
  name: 'accueil',
  title: 'Accueil',
  type: 'document',
  icon: HomeIcon,
  fields: [
    defineField({
      name: 'aLaffiche',
      title: 'À l’affiche',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'spectacle'}]})],
      validation: (r) => r.max(5),
      description: 'Les spectacles mis en avant en haut de l’accueil. Laissez vide pour afficher automatiquement les trois prochains spectacles en vente.',
    }),
    sectionsField,
    defineField({name: 'seo', title: 'Partage et référencement', type: 'seo'}),
  ],
  preview: {prepare: () => ({title: 'Accueil'})},
})

export const reglages = defineType({
  name: 'reglages',
  title: 'Réglages du site',
  type: 'document',
  icon: CogIcon,
  groups: [
    {name: 'coordonnees', title: 'Coordonnées', default: true},
    {name: 'billetterie', title: 'Billetterie'},
    {name: 'acces', title: 'Accès'},
    {name: 'navigation', title: 'Menu'},
    {name: 'pied', title: 'Pied de page'},
    {name: 'annonce', title: 'Annonce'},
    {name: 'seo', title: 'Partage'},
  ],
  fields: [
    defineField({name: 'nom', title: 'Nom du théâtre', type: 'string', group: 'coordonnees', initialValue: 'Théâtre Benno Besson'}),
    defineField({name: 'rue', title: 'Rue', type: 'string', group: 'coordonnees'}),
    defineField({name: 'localite', title: 'NPA et localité', type: 'string', group: 'coordonnees'}),
    defineField({name: 'casePostale', title: 'Case postale', type: 'string', group: 'coordonnees', description: 'Facultatif. Exemple : Case postale 476, 1401 Yverdon-les-Bains'}),
    defineField({name: 'telBilletterie', title: 'Téléphone de la billetterie', type: 'string', group: 'coordonnees'}),
    defineField({name: 'emailBilletterie', title: 'E-mail de la billetterie', type: 'string', group: 'coordonnees'}),
    defineField({name: 'telAdmin', title: 'Téléphone de l’administration', type: 'string', group: 'coordonnees'}),
    defineField({name: 'emailGeneral', title: 'E-mail général', type: 'string', group: 'coordonnees'}),
    defineField({
      name: 'adresseSite',
      title: 'Adresse du site',
      type: 'url',
      group: 'coordonnees',
      description: 'L’adresse publique du site (https://www.theatrebennobesson.ch). Sert aux liens de la lettre d’information et des textes pour les réseaux.',
    }),

    defineField({
      name: 'lienBilletterie',
      title: 'Billetterie en ligne',
      type: 'url',
      group: 'billetterie',
      description: 'Lien général vers la billetterie en ligne, utilisé quand un spectacle n’a pas son propre lien. La boutique de la saison en cours (fiche Saison) passe avant.',
    }),
    defineField({
      name: 'lienListeAttente',
      title: 'Liste d’attente',
      type: 'url',
      group: 'billetterie',
      description: 'Facultatif. Le formulaire d’inscription à la liste d’attente (Brevo), proposé sur les dates complètes. Vide : le site propose d’appeler la billetterie.',
    }),
    defineField({
      name: 'horaires',
      title: 'Horaires du guichet',
      type: 'array',
      group: 'billetterie',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'horaire',
          fields: [
            defineField({name: 'jours', title: 'Jours', type: 'string', description: 'Exemple : Mardi à vendredi'}),
            defineField({name: 'heures', title: 'Heures', type: 'string', description: 'Exemple : 14h–18h'}),
          ],
          preview: {select: {title: 'jours', subtitle: 'heures'}},
        }),
      ],
    }),
    defineField({name: 'noteHoraires', title: 'Précision sur les horaires', type: 'string', group: 'billetterie', description: 'Exemple : et une heure avant chaque représentation'}),

    defineField({name: 'accesTrain', title: 'En train', type: 'text', rows: 2, group: 'acces'}),
    defineField({name: 'accesBus', title: 'En bus', type: 'text', rows: 2, group: 'acces'}),
    defineField({name: 'accesVoiture', title: 'En voiture', type: 'text', rows: 2, group: 'acces'}),
    defineField({name: 'accesRestaurer', title: 'Se restaurer', type: 'text', rows: 3, group: 'acces'}),
    defineField({name: 'lienPlan', title: 'Lien vers le plan', type: 'url', group: 'acces'}),

    defineField({
      name: 'menu',
      title: 'Menu principal',
      type: 'array',
      group: 'navigation',
      of: [defineArrayMember({type: 'lien'})],
      validation: (r) => r.max(7).warning('Au-delà de 6 entrées, le menu devient difficile à lire.'),
      description: 'Les entrées du menu, dans l’ordre. 6 au plus. Une entrée peut avoir des sous-rubriques (Le théâtre → Histoire, Équipe, Technique…).',
    }),
    defineField({name: 'boutonMenu', title: 'Bouton du menu', type: 'bouton', group: 'navigation', description: 'Le bouton noir en haut à droite. Exemple : Réserver → /programme'}),

    defineField({
      name: 'colonnesPied',
      title: 'Colonnes de liens',
      type: 'array',
      group: 'pied',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'colonne',
          fields: [
            defineField({name: 'titre', title: 'Titre', type: 'string'}),
            defineField({name: 'liens', title: 'Liens', type: 'array', of: [defineArrayMember({type: 'lien'})]}),
          ],
          preview: {select: {title: 'titre', liens: 'liens'}, prepare: ({title, liens}) => ({title, subtitle: `${liens?.length ?? 0} lien(s)`})},
        }),
      ],
    }),
    defineField({
      name: 'lettre',
      title: 'Lettre d’information',
      type: 'object',
      group: 'pied',
      options: {collapsible: true, collapsed: false},
      fields: [
        defineField({
          name: 'lienInscription',
          title: 'Lien du formulaire d’inscription',
          type: 'url',
          description: 'Facultatif. Le formulaire Brevo. Vide : les inscriptions arrivent dans « Messages reçus ».',
        }),
        defineField({name: 'lienPreferences', title: 'Lien « Gérer mes préférences »', type: 'url'}),
      ],
    }),
    defineField({name: 'instagram', title: 'Instagram', type: 'url', group: 'pied'}),
    defineField({name: 'facebook', title: 'Facebook', type: 'url', group: 'pied'}),
    defineField({name: 'linkedin', title: 'LinkedIn', type: 'url', group: 'pied'}),
    defineField({name: 'credit', title: 'Mention en bas de page', type: 'string', group: 'pied', description: 'Facultatif. Exemple : Graphisme : Atelier Poisson'}),

    defineField({
      name: 'annonce',
      title: 'Bandeau d’annonce',
      type: 'object',
      group: 'annonce',
      description: 'Une ligne tout en haut du site, pour une information urgente : fermeture, changement d’horaire…',
      fields: [
        defineField({name: 'active', title: 'Afficher le bandeau', type: 'boolean', initialValue: false}),
        defineField({name: 'texte', title: 'Texte', type: 'string'}),
        defineField({name: 'lien', title: 'Lien', type: 'string'}),
        defineField({
          name: 'jusquau',
          title: 'Retirer le bandeau le',
          type: 'datetime',
          options: {dateFormat: 'DD.MM.YYYY', timeFormat: 'HH:mm'},
          description: 'Facultatif. Passé ce moment, le bandeau disparaît tout seul, même si la case reste cochée.',
        }),
      ],
    }),
    defineField({
      name: 'avis',
      title: 'Avis datés',
      type: 'array',
      group: 'annonce',
      description: 'Fermetures de la billetterie, permanences, horaires spéciaux. Chacun s’affiche du premier au dernier jour, dans la section « Avis datés » d’une page (la Billetterie par exemple), puis disparaît seul.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'avis',
          fields: [
            defineField({name: 'titre', title: 'Titre', type: 'string', description: 'Exemple : Vacances d’automne'}),
            defineField({name: 'texte', title: 'Texte', type: 'text', rows: 2, validation: (r) => r.required(), description: 'Exemple : Billetterie fermée du 12 au 23 octobre. Réouverture le mardi 27 octobre à 10h.'}),
            defineField({name: 'du', title: 'Afficher à partir du', type: 'date', options: {dateFormat: 'DD.MM.YYYY'}}),
            defineField({name: 'au', title: 'Jusqu’au (inclus)', type: 'date', options: {dateFormat: 'DD.MM.YYYY'}, validation: (r) => r.required().error('Indiquez le dernier jour : l’avis disparaîtra seul.')}),
          ],
          preview: {
            select: {titre: 'titre', texte: 'texte', du: 'du', au: 'au'},
            prepare: ({titre, texte, du, au}) => {
              const d = (x?: string) => (x ? x.split('-').reverse().join('.') : '')
              return {title: titre || texte, subtitle: [du ? `du ${d(du)}` : '', au ? `au ${d(au)}` : ''].filter(Boolean).join(' ')}
            },
          },
        }),
      ],
    }),

    defineField({name: 'seo', title: 'Partage et référencement par défaut', type: 'seo', group: 'seo'}),
  ],
  preview: {prepare: () => ({title: 'Réglages du site'})},
})
