import {defineArrayMember, defineField, defineType} from 'sanity'
import {LinkIcon} from '@sanity/icons/Link'
import {STATUTS, dateLisible, libelle} from '../lib/constantes'

/* Petits types réutilisés dans plusieurs documents. */

export const texteRiche = defineType({
  name: 'texteRiche',
  title: 'Texte',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        {title: 'Paragraphe', value: 'normal'},
        {title: 'Intertitre', value: 'h3'},
        {title: 'Citation', value: 'blockquote'},
      ],
      lists: [
        {title: 'Liste à puces', value: 'bullet'},
        {title: 'Liste numérotée', value: 'number'},
      ],
      marks: {
        decorators: [
          {title: 'Gras', value: 'strong'},
          {title: 'Italique', value: 'em'},
        ],
        annotations: [
          defineArrayMember({
            name: 'link',
            type: 'object',
            title: 'Lien',
            icon: LinkIcon,
            fields: [
              defineField({
                name: 'href',
                title: 'Adresse',
                type: 'url',
                description: 'Une adresse complète (https://…), une page du site (/contact), un e-mail (mailto:…) ou un téléphone (tel:…).',
                validation: (r) => r.uri({allowRelative: true, scheme: ['http', 'https', 'mailto', 'tel']}),
              }),
            ],
          }),
        ],
      },
    }),
  ],
})

export const representation = defineType({
  name: 'representation',
  title: 'Représentation',
  type: 'object',
  fields: [
    defineField({
      name: 'dateHeure',
      title: 'Date et heure',
      type: 'datetime',
      options: {dateFormat: 'DD.MM.YYYY', timeFormat: 'HH:mm', timeStep: 15},
      validation: (r) => r.required().error('Indiquez la date et l’heure.'),
    }),
    defineField({
      name: 'statut',
      title: 'Billets',
      type: 'string',
      options: {list: STATUTS, layout: 'radio', direction: 'horizontal'},
      initialValue: 'en-vente',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'lieu',
      title: 'Salle',
      type: 'reference',
      to: [{type: 'lieu'}],
      description: 'À remplir seulement si cette date a lieu ailleurs que dans la salle du spectacle.',
    }),
    defineField({
      name: 'mention',
      title: 'Mention',
      type: 'string',
      description: 'Facultatif. Exemples : Afterwork, Bord de scène, Représentation scolaire.',
    }),
    defineField({
      name: 'lien',
      title: 'Lien de réservation de cette date',
      type: 'url',
      description: 'Facultatif. Sinon, le lien du spectacle ou le lien général de la billetterie est utilisé.',
    }),
  ],
  preview: {
    select: {date: 'dateHeure', statut: 'statut', mention: 'mention', lieu: 'lieu.nom'},
    prepare: ({date, statut, mention, lieu}) => ({
      title: dateLisible(date),
      subtitle: [libelle(STATUTS, statut), lieu, mention].filter(Boolean).join(' · '),
    }),
  },
})

export const imageLegendee = defineType({
  name: 'imageLegendee',
  title: 'Photo',
  type: 'image',
  options: {hotspot: true, metadata: ['lqip', 'palette']},
  fields: [
    defineField({name: 'legende', title: 'Légende', type: 'string'}),
    defineField({name: 'credit', title: 'Crédit photo', type: 'string', description: 'Exemple : Jeanette Bak Huber'}),
    defineField({
      name: 'alt',
      title: 'Description pour les personnes malvoyantes',
      type: 'string',
      description: 'Décrivez ce qu’on voit en une phrase. Laissez vide si la légende suffit.',
    }),
  ],
})

export const blocDistribution = defineType({
  name: 'blocDistribution',
  title: 'Bloc de distribution',
  type: 'object',
  fields: [
    defineField({name: 'titre', title: 'Titre du bloc', type: 'string', description: 'Facultatif. Utile quand il y a deux pièces, par exemple « PLEASE, WASH Mii BRAIN ».'}),
    defineField({
      name: 'lignes',
      title: 'Lignes',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'ligne',
          fields: [
            defineField({name: 'role', title: 'Rôle ou fonction', type: 'string', description: 'Exemple : Mise en scène'}),
            defineField({name: 'noms', title: 'Noms', type: 'string', description: 'Exemple : Clément Bugnon et Matthias Kass'}),
          ],
          preview: {select: {title: 'noms', subtitle: 'role'}},
        }),
      ],
    }),
  ],
  preview: {
    select: {titre: 'titre', lignes: 'lignes'},
    prepare: ({titre, lignes}) => ({title: titre || 'Distribution', subtitle: `${lignes?.length ?? 0} ligne(s)`}),
  },
})

export const lien = defineType({
  name: 'lien',
  title: 'Lien',
  type: 'object',
  icon: LinkIcon,
  fields: [
    defineField({name: 'titre', title: 'Texte affiché', type: 'string', validation: (r) => r.required()}),
    defineField({
      name: 'page',
      title: 'Page du site',
      type: 'reference',
      to: [{type: 'page'}, {type: 'spectacle'}],
      description: 'Choisissez une page…',
    }),
    defineField({
      name: 'url',
      title: '…ou une adresse',
      type: 'string',
      description: 'Exemples : /programme, /programme#jeune-public, https://www.instagram.com/tbb_yverdon/',
    }),
  ],
  validation: (r) =>
    r.custom((v: {page?: unknown; url?: string} | undefined) =>
      v && !v.page && !v.url ? 'Choisissez une page ou indiquez une adresse.' : true,
    ),
  preview: {
    select: {title: 'titre', page: 'page.titre', url: 'url'},
    prepare: ({title, page, url}) => ({title, subtitle: page ? `→ ${page}` : url}),
  },
})

export const seo = defineType({
  name: 'seo',
  title: 'Partage et référencement',
  type: 'object',
  options: {collapsible: true, collapsed: true},
  fields: [
    defineField({name: 'titre', title: 'Titre pour Google', type: 'string', description: 'Facultatif. 60 caractères au plus.', validation: (r) => r.max(70)}),
    defineField({name: 'description', title: 'Description pour Google', type: 'text', rows: 3, description: 'Facultatif. 160 caractères au plus.', validation: (r) => r.max(180)}),
    defineField({name: 'image', title: 'Image de partage', type: 'image', description: 'Facultatif. Image affichée quand la page est partagée (WhatsApp, Facebook…).'}),
  ],
})

export const bouton = defineType({
  name: 'bouton',
  title: 'Bouton',
  type: 'object',
  fields: [
    defineField({name: 'titre', title: 'Texte du bouton', type: 'string'}),
    defineField({name: 'url', title: 'Adresse', type: 'string', description: 'Exemples : /programme, /contact, https://…'}),
  ],
})

export const objets = [texteRiche, representation, imageLegendee, blocDistribution, lien, seo, bouton]
