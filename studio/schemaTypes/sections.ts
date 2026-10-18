import {defineArrayMember, defineField, defineType} from 'sanity'
import {TextIcon} from '@sanity/icons/Text'
import {ThLargeIcon} from '@sanity/icons/ThLarge'
import {BillIcon} from '@sanity/icons/Bill'
import {BlockquoteIcon} from '@sanity/icons/Blockquote'
import {ClockIcon} from '@sanity/icons/Clock'
import {ImagesIcon} from '@sanity/icons/Images'
import {UsersIcon} from '@sanity/icons/Users'
import {HeartIcon} from '@sanity/icons/Heart'
import {PinIcon} from '@sanity/icons/Pin'
import {LaunchIcon} from '@sanity/icons/Launch'
import {ThListIcon} from '@sanity/icons/ThList'
import {HelpCircleIcon} from '@sanity/icons/HelpCircle'
import {EnvelopeIcon} from '@sanity/icons/Envelope'
import {CalendarIcon} from '@sanity/icons/Calendar'
import {TagsIcon} from '@sanity/icons/Tags'
import {ETIQUETTES, GENRES, libelle} from '../lib/constantes'

/*
 * Sections de page. Chaque page (et l'accueil) est une pile de sections que l'équipe
 * ajoute, réordonne et supprime librement. Chaque section a un titre clair et un aperçu.
 */

const titre = defineField({name: 'titre', title: 'Titre de la section', type: 'string'})
const surtitre = defineField({name: 'surtitre', title: 'Surtitre', type: 'string', description: 'Facultatif. Petite ligne au-dessus du titre. Exemple : Infos pratiques'})

export const sectionTexte = defineType({
  name: 'sectionTexte',
  title: 'Texte',
  type: 'object',
  icon: TextIcon,
  fields: [
    surtitre,
    titre,
    defineField({name: 'chapo', title: 'Chapeau', type: 'text', rows: 3, description: 'Facultatif. Première phrase en grand caractère.'}),
    defineField({name: 'texte', title: 'Texte', type: 'texteRiche'}),
    defineField({name: 'image', title: 'Image', type: 'imageLegendee', description: 'Facultatif. Affichée à côté du texte.'}),
  ],
  preview: {select: {title: 'titre', subtitle: 'chapo', media: 'image'}, prepare: ({title, subtitle, media}) => ({title: title || 'Texte', subtitle, media})},
})

export const sectionInfos = defineType({
  name: 'sectionInfos',
  title: 'Blocs d’infos',
  type: 'object',
  icon: ThLargeIcon,
  description: 'Deux à quatre blocs côte à côte : horaires, contacts, accès…',
  fields: [
    surtitre,
    titre,
    defineField({
      name: 'blocs',
      title: 'Blocs',
      type: 'array',
      validation: (r) => r.max(6),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'blocInfo',
          fields: [
            defineField({name: 'titre', title: 'Titre', type: 'string', validation: (r) => r.required()}),
            defineField({name: 'texte', title: 'Texte', type: 'text', rows: 4}),
            defineField({name: 'lien', title: 'Lien', type: 'lien'}),
            defineField({name: 'note', title: 'Note discrète', type: 'string', description: 'Facultatif. En petit, sous le texte.'}),
          ],
          preview: {select: {title: 'titre', subtitle: 'texte'}},
        }),
      ],
    }),
  ],
  preview: {select: {title: 'titre', blocs: 'blocs'}, prepare: ({title, blocs}) => ({title: title || 'Blocs d’infos', subtitle: `${blocs?.length ?? 0} bloc(s)`})},
})

export const sectionTarifs = defineType({
  name: 'sectionTarifs',
  title: 'Tarifs en grand',
  type: 'object',
  icon: BillIcon,
  fields: [
    surtitre,
    titre,
    defineField({name: 'grille', title: 'Grille de prix', type: 'reference', to: [{type: 'grilleTarifaire'}], validation: (r) => r.required()}),
    defineField({
      name: 'notes',
      title: 'Encarts sous les prix',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'noteTarif',
          fields: [
            defineField({name: 'titre', title: 'Titre', type: 'string'}),
            defineField({name: 'texte', title: 'Texte', type: 'text', rows: 3}),
            defineField({name: 'lien', title: 'Lien', type: 'lien'}),
          ],
          preview: {select: {title: 'titre', subtitle: 'texte'}},
        }),
      ],
    }),
  ],
  preview: {select: {title: 'titre', grille: 'grille.nom'}, prepare: ({title, grille}) => ({title: title || 'Tarifs', subtitle: grille})},
})

export const sectionCitation = defineType({
  name: 'sectionCitation',
  title: 'Citation',
  type: 'object',
  icon: BlockquoteIcon,
  fields: [
    surtitre,
    defineField({name: 'citation', title: 'Citation', type: 'text', rows: 3, validation: (r) => r.required()}),
    defineField({name: 'auteur', title: 'Auteur ou autrice', type: 'string'}),
    defineField({name: 'portrait', title: 'Portrait', type: 'imageLegendee'}),
    defineField({name: 'texte', title: 'Texte d’accompagnement', type: 'text', rows: 3}),
    defineField({
      name: 'reperes',
      title: 'Chiffres repères',
      type: 'array',
      validation: (r) => r.max(4),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'repere',
          fields: [
            defineField({name: 'chiffre', title: 'Chiffre', type: 'string', description: 'Exemples : 1898 · 460 · 150 m'}),
            defineField({name: 'texte', title: 'Texte', type: 'string'}),
          ],
          preview: {select: {title: 'chiffre', subtitle: 'texte'}},
        }),
      ],
    }),
    defineField({name: 'lien', title: 'Lien', type: 'lien'}),
    defineField({
      name: 'style',
      title: 'Style',
      type: 'string',
      options: {list: [{title: 'Avec portrait, fond gris', value: 'portrait'}, {title: 'En très grand, fond vert', value: 'affiche'}], layout: 'radio'},
      initialValue: 'portrait',
    }),
  ],
  preview: {select: {title: 'citation', subtitle: 'auteur', media: 'portrait'}},
})

export const sectionFrise = defineType({
  name: 'sectionFrise',
  title: 'Frise chronologique',
  type: 'object',
  icon: ClockIcon,
  fields: [
    surtitre,
    titre,
    defineField({
      name: 'etapes',
      title: 'Étapes',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'etape',
          fields: [
            defineField({name: 'annee', title: 'Année', type: 'string', validation: (r) => r.required()}),
            defineField({name: 'titre', title: 'Titre', type: 'string'}),
            defineField({name: 'texte', title: 'Texte', type: 'text', rows: 3}),
            defineField({name: 'image', title: 'Image', type: 'imageLegendee'}),
          ],
          preview: {select: {title: 'annee', subtitle: 'titre', media: 'image'}},
        }),
      ],
    }),
  ],
  preview: {select: {title: 'titre', etapes: 'etapes'}, prepare: ({title, etapes}) => ({title: title || 'Frise', subtitle: `${etapes?.length ?? 0} étape(s)`})},
})

export const sectionGalerie = defineType({
  name: 'sectionGalerie',
  title: 'Galerie de photos',
  type: 'object',
  icon: ImagesIcon,
  fields: [surtitre, titre, defineField({name: 'images', title: 'Photos', type: 'array', of: [defineArrayMember({type: 'imageLegendee'})], options: {layout: 'grid'}})],
  preview: {select: {title: 'titre', media: 'images.0'}, prepare: ({title, media}) => ({title: title || 'Galerie', media})},
})

export const sectionEquipe = defineType({
  name: 'sectionEquipe',
  title: 'Équipe',
  type: 'object',
  icon: UsersIcon,
  description: 'Affiche automatiquement les personnes de la rubrique « Équipe ».',
  fields: [surtitre, titre, defineField({name: 'texte', title: 'Texte', type: 'text', rows: 3})],
  preview: {select: {title: 'titre'}, prepare: ({title}) => ({title: title || 'Équipe', subtitle: 'Liste automatique'})},
})

export const sectionFormules = defineType({
  name: 'sectionFormules',
  title: 'Formules ou abonnements',
  type: 'object',
  icon: HeartIcon,
  fields: [
    surtitre,
    titre,
    defineField({name: 'texte', title: 'Texte', type: 'text', rows: 3}),
    defineField({
      name: 'formules',
      title: 'Formules',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'formule',
          fields: [
            defineField({name: 'nom', title: 'Nom', type: 'string'}),
            defineField({name: 'prix', title: 'Prix', type: 'string', description: 'Exemples : 50 · libre'}),
            defineField({name: 'periode', title: 'Période', type: 'string', description: 'Exemple : par saison'}),
            defineField({name: 'texte', title: 'Texte', type: 'text', rows: 2}),
          ],
          preview: {select: {title: 'nom', subtitle: 'prix'}},
        }),
      ],
    }),
    defineField({name: 'bouton', title: 'Bouton', type: 'bouton'}),
  ],
  preview: {select: {title: 'titre'}, prepare: ({title}) => ({title: title || 'Formules'})},
})

export const sectionAcces = defineType({
  name: 'sectionAcces',
  title: 'Venir au théâtre',
  type: 'object',
  icon: PinIcon,
  description: 'Schéma d’accès et transports. Les textes se modifient dans « Réglages du site ».',
  fields: [surtitre, titre],
  preview: {select: {title: 'titre'}, prepare: ({title}) => ({title: title || 'Venir au théâtre', subtitle: 'Textes dans Réglages du site'})},
})

export const sectionAppel = defineType({
  name: 'sectionAppel',
  title: 'Appel à l’action',
  type: 'object',
  icon: LaunchIcon,
  fields: [
    titre,
    defineField({name: 'texte', title: 'Texte', type: 'text', rows: 2}),
    defineField({name: 'bouton', title: 'Bouton', type: 'bouton'}),
    defineField({name: 'fond', title: 'Fond', type: 'string', options: {list: [{title: 'Vert TBB', value: 'vert'}, {title: 'Noir', value: 'noir'}, {title: 'Gris', value: 'gris'}], layout: 'radio', direction: 'horizontal'}, initialValue: 'vert'}),
  ],
  preview: {select: {title: 'titre', subtitle: 'texte'}, prepare: ({title, subtitle}) => ({title: title || 'Appel à l’action', subtitle})},
})

export const sectionAffiches = defineType({
  name: 'sectionAffiches',
  title: 'Mur d’affiches',
  type: 'object',
  icon: TagsIcon,
  description: 'Les prochains spectacles, avec un filtre facultatif. Placé sous un agenda, le mur saute les spectacles déjà listés dans l’agenda.',
  fields: [
    surtitre,
    titre,
    defineField({name: 'texte', title: 'Texte', type: 'text', rows: 2}),
    defineField({name: 'genre', title: 'Seulement ce genre', type: 'string', options: {list: GENRES}}),
    defineField({name: 'etiquette', title: 'Seulement cette étiquette', type: 'string', options: {list: ETIQUETTES}}),
    defineField({name: 'filtres', title: 'Afficher les boutons de filtre par genre', type: 'boolean', initialValue: false}),
    defineField({
      name: 'nombre',
      title: 'Nombre d’affiches',
      description: 'Sur ordinateur. Sur téléphone, le site en montre quatre, puis un lien vers tout le programme.',
      type: 'number',
      initialValue: 8,
      validation: (r) => r.min(2).max(40),
    }),
    defineField({name: 'inclurePasses', title: 'Inclure les spectacles passés', type: 'boolean', initialValue: false}),
  ],
  preview: {
    select: {title: 'titre', genre: 'genre', etiquette: 'etiquette', nombre: 'nombre'},
    prepare: ({title, genre, etiquette, nombre}) => ({
      title: title || 'Mur d’affiches',
      subtitle: [libelle(GENRES, genre), libelle(ETIQUETTES, etiquette), nombre ? `${nombre} affiches` : ''].filter(Boolean).join(' · '),
    }),
  },
})

export const sectionAgenda = defineType({
  name: 'sectionAgenda',
  title: 'Agenda des prochaines dates',
  type: 'object',
  icon: CalendarIcon,
  fields: [
    surtitre,
    titre,
    defineField({
      name: 'nombre',
      title: 'Nombre de lignes',
      description: 'Sur ordinateur. Sur téléphone, le site en montre quatre, puis un lien vers toute la saison.',
      type: 'number',
      initialValue: 6,
      validation: (r) => r.min(2).max(20),
    }),
  ],
  preview: {select: {title: 'titre', nombre: 'nombre'}, prepare: ({title, nombre}) => ({title: title || 'Agenda', subtitle: `${nombre ?? 6} prochains spectacles`})},
})

export const sectionFaq = defineType({
  name: 'sectionFaq',
  title: 'Questions fréquentes',
  type: 'object',
  icon: HelpCircleIcon,
  fields: [
    surtitre,
    titre,
    defineField({
      name: 'questions',
      title: 'Questions',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'question',
          fields: [
            defineField({name: 'question', title: 'Question', type: 'string', validation: (r) => r.required()}),
            defineField({name: 'reponse', title: 'Réponse', type: 'text', rows: 4}),
          ],
          preview: {select: {title: 'question', subtitle: 'reponse'}},
        }),
      ],
    }),
  ],
  preview: {select: {title: 'titre', q: 'questions'}, prepare: ({title, q}) => ({title: title || 'Questions fréquentes', subtitle: `${q?.length ?? 0} question(s)`})},
})

export const sectionContact = defineType({
  name: 'sectionContact',
  title: 'Contact : annuaire et formulaire',
  type: 'object',
  icon: EnvelopeIcon,
  fields: [
    surtitre,
    titre,
    defineField({
      name: 'annuaire',
      title: 'Qui contacter',
      type: 'array',
      description: 'Une ligne par service.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'contactService',
          fields: [
            defineField({name: 'service', title: 'Pour…', type: 'string', description: 'Exemple : Proposer un spectacle', validation: (r) => r.required()}),
            defineField({name: 'nom', title: 'Personne', type: 'string'}),
            defineField({name: 'email', title: 'E-mail', type: 'string'}),
            defineField({name: 'telephone', title: 'Téléphone', type: 'string'}),
          ],
          preview: {select: {title: 'service', subtitle: 'email'}},
        }),
      ],
    }),
    defineField({name: 'formulaire', title: 'Afficher le formulaire de contact', type: 'boolean', initialValue: true}),
    defineField({
      name: 'sujets',
      title: 'Sujets proposés dans le formulaire',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      initialValue: ['Billetterie et réservations', 'Proposer un spectacle', 'Presse', 'Écoles et médiation', 'Ami·es du TBB', 'Autre question'],
    }),
    defineField({name: 'confirmation', title: 'Message après envoi', type: 'string', initialValue: 'Merci, votre message est bien arrivé. Nous vous répondons rapidement.'}),
  ],
  preview: {select: {title: 'titre'}, prepare: ({title}) => ({title: title || 'Contact', subtitle: 'Annuaire et formulaire'})},
})

export const sectionLettre = defineType({
  name: 'sectionLettre',
  title: 'Lettre d’information',
  type: 'object',
  icon: ThListIcon,
  fields: [titre, defineField({name: 'texte', title: 'Texte', type: 'text', rows: 2})],
  preview: {select: {title: 'titre'}, prepare: ({title}) => ({title: title || 'Lettre d’information'})},
})

/*
 * Lien direct : chaque section peut recevoir une ancre (« tarifs » → /billetterie#tarifs).
 * Rangée dans un encart replié pour ne pas encombrer le formulaire.
 */
const lienDirect = {name: 'lienDirect', title: 'Lien direct vers cette section', options: {collapsible: true, collapsed: true}}
const ancre = defineField({
  name: 'ancre',
  title: 'Nom de l’ancre',
  type: 'string',
  fieldset: 'lienDirect',
  description: 'Facultatif. Avec « tarifs », le lien /billetterie#tarifs mène directement ici. Sans ancre, le titre de la section sert d’ancre.',
  validation: (r) => r.regex(/^[a-z0-9-]+$/, {name: 'minuscules et tirets'}).warning('Minuscules, chiffres et tirets seulement, sans espace.'),
})

type AvecChamps = {fields: unknown[]; fieldsets?: unknown[]}
const avecAncre = <T extends AvecChamps>(type: T): T => ({...type, fieldsets: [...(type.fieldsets ?? []), lienDirect], fields: [...type.fields, ancre]})

export const sections = [
  sectionTexte,
  sectionInfos,
  sectionTarifs,
  sectionCitation,
  sectionFrise,
  sectionGalerie,
  sectionEquipe,
  sectionFormules,
  sectionAcces,
  sectionAppel,
  sectionAffiches,
  sectionAgenda,
  sectionFaq,
  sectionContact,
  sectionLettre,
].map(avecAncre)

/** Sections proposées sur les pages et sur l'accueil. */
export const SECTIONS_PAGE = [
  'sectionTexte', 'sectionInfos', 'sectionTarifs', 'sectionCitation', 'sectionFrise', 'sectionGalerie', 'sectionEquipe',
  'sectionFormules', 'sectionAcces', 'sectionAppel', 'sectionAffiches', 'sectionAgenda', 'sectionFaq', 'sectionContact', 'sectionLettre',
]
