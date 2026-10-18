import {defineArrayMember, defineField, defineType} from 'sanity'
import {LinkIcon} from '@sanity/icons/Link'
import {DocumentPdfIcon} from '@sanity/icons/DocumentPdf'
import {BlockquoteIcon} from '@sanity/icons/Blockquote'
import {STATUTS, dateLisible, libelle} from '../lib/constantes'
import {LigneRepresentation} from '../composants/ChampRepresentations'

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
      description: 'Facultatif. Exemples : Afterwork, Bord de scène, Supplémentaire.',
    }),
    defineField({
      name: 'heureAConfirmer',
      title: 'Heure à confirmer',
      type: 'boolean',
      description: 'Le site écrit « heure à confirmer » au lieu de l’heure. Le tableau de bord rappelle de la confirmer.',
    }),
    defineField({
      name: 'scolaire',
      title: 'Représentation scolaire',
      type: 'boolean',
      description: 'Réservée aux classes : la date est affichée sans bouton Réserver et n’entre pas dans la lettre d’information.',
    }),
    defineField({
      name: 'lien',
      title: 'Lien de réservation de cette date',
      type: 'url',
      description: 'Facultatif. Sinon, le lien du spectacle ou le lien général de la billetterie est utilisé.',
    }),
  ],
  components: {item: LigneRepresentation},
  preview: {
    select: {date: 'dateHeure', statut: 'statut', mention: 'mention', lieu: 'lieu.nom', aConfirmer: 'heureAConfirmer', scolaire: 'scolaire'},
    prepare: ({date, statut, mention, lieu, aConfirmer, scolaire}) => ({
      title: aConfirmer ? dateLisible(date).replace(/ · .*$/, ' · heure à confirmer') : dateLisible(date),
      subtitle: [libelle(STATUTS, statut), lieu, scolaire ? 'Scolaire' : '', mention].filter(Boolean).join(' · '),
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
    defineField({
      name: 'sousLiens',
      title: 'Sous-rubriques',
      type: 'array',
      of: [defineArrayMember({type: 'lien'})],
      description: 'Facultatif. Les pages de cette rubrique : elles s’affichent sous l’entrée dans le menu, et en haut de chacune de ces pages.',
      // Seulement dans le menu principal : ailleurs, un lien reste un lien.
      hidden: ({path}) => !(path[0] === 'menu' && path.length === 3),
    }),
  ],
  validation: (r) =>
    r.custom((v: {page?: unknown; url?: string} | undefined) =>
      v && !v.page && !v.url ? 'Choisissez une page ou indiquez une adresse.' : true,
    ),
  preview: {
    select: {title: 'titre', page: 'page.titre', url: 'url', sous: 'sousLiens'},
    prepare: ({title, page, url, sous}) => ({
      title,
      subtitle: [page ? `→ ${page}` : url, sous?.length ? `${sous.length} sous-rubrique${sous.length > 1 ? 's' : ''}` : ''].filter(Boolean).join(' · '),
    }),
  },
})

/** Un fichier à télécharger (PDF, plan, dossier) ou un lien vers un dossier en ligne. */
export const fichier = defineType({
  name: 'fichier',
  title: 'Document',
  type: 'object',
  icon: DocumentPdfIcon,
  fields: [
    defineField({name: 'titre', title: 'Titre', type: 'string', description: 'Exemple : Plan de la salle (PDF)', validation: (r) => r.required().error('Donnez un titre au document.')}),
    defineField({name: 'fichier', title: 'Fichier', type: 'file', description: 'Un PDF de préférence.'}),
    defineField({name: 'url', title: '…ou une adresse', type: 'url', description: 'Pour un dossier en ligne (Dropbox, SwissTransfer…).', validation: (r) => r.uri({allowRelative: true, scheme: ['http', 'https', 'mailto']})}),
    defineField({name: 'description', title: 'Précision', type: 'string', description: 'Facultatif. Exemple : Coupe au 50e, mise à jour 2025'}),
  ],
  validation: (r) => r.custom((v: {fichier?: {asset?: unknown}; url?: string} | undefined) => (v && !v.fichier?.asset && !v.url ? 'Ajoutez un fichier ou une adresse.' : true)),
  preview: {
    select: {title: 'titre', description: 'description', nom: 'fichier.asset.originalFilename', url: 'url'},
    prepare: ({title, description, nom, url}) => ({title, subtitle: [description, nom || url].filter(Boolean).join(' · ')}),
  },
})

/** Une citation de presse ou d'artiste, affichée en exergue. */
export const citationPresse = defineType({
  name: 'citationPresse',
  title: 'Citation',
  type: 'object',
  icon: BlockquoteIcon,
  fields: [
    defineField({name: 'citation', title: 'Citation', type: 'text', rows: 3, description: 'Sans les guillemets : le site les pose.', validation: (r) => r.required()}),
    defineField({name: 'auteur', title: 'Auteur ou autrice', type: 'string', description: 'Exemple : Marie-Pierre Genecand'}),
    defineField({name: 'media', title: 'Média', type: 'string', description: 'Exemple : Le Temps. Vide pour une citation de l’artiste.'}),
  ],
  preview: {
    select: {title: 'citation', auteur: 'auteur', media: 'media'},
    prepare: ({title, auteur, media}) => ({title: `« ${title ?? ''} »`, subtitle: [auteur, media].filter(Boolean).join(', ')}),
  },
})

/** Une ligne « libellé : valeur » (caractéristiques d'une salle, chiffres). */
export const caracteristique = defineType({
  name: 'caracteristique',
  title: 'Caractéristique',
  type: 'object',
  fields: [
    defineField({name: 'libelle', title: 'Libellé', type: 'string', description: 'Exemple : Ouverture du cadre de scène'}),
    defineField({name: 'valeur', title: 'Valeur', type: 'string', description: 'Exemple : 10,40 m'}),
  ],
  preview: {select: {title: 'libelle', subtitle: 'valeur'}},
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

export const objets = [texteRiche, representation, imageLegendee, blocDistribution, lien, fichier, citationPresse, caracteristique, seo, bouton]
