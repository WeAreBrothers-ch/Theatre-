import {defineArrayMember, defineField, defineType} from 'sanity'
import {PinIcon} from '@sanity/icons/Pin'
import {StackIcon} from '@sanity/icons/Stack'
import {BillIcon} from '@sanity/icons/Bill'
import {UserIcon} from '@sanity/icons/User'
import {HeartIcon} from '@sanity/icons/Heart'
import {EnvelopeIcon} from '@sanity/icons/Envelope'
import {dateLisible} from '../lib/constantes'

export const lieu = defineType({
  name: 'lieu',
  title: 'Lieu',
  type: 'document',
  icon: PinIcon,
  fields: [
    defineField({name: 'nom', title: 'Nom', type: 'string', description: 'Exemples : Grande Salle, Salle 1, Temple d’Yverdon-les-Bains', validation: (r) => r.required()}),
    defineField({name: 'nomComplet', title: 'Nom complet', type: 'string', description: 'Affiché sur la page du spectacle. Exemple : Théâtre Benno Besson, Grande Salle'}),
    defineField({name: 'adresse', title: 'Adresse', type: 'string', description: 'Exemple : Rue du Casino 9, 1400 Yverdon-les-Bains'}),
    defineField({name: 'capacite', title: 'Nombre de places', type: 'number'}),
    defineField({name: 'description', title: 'Description', type: 'text', rows: 2}),
    defineField({name: 'accessibilite', title: 'Accessibilité', type: 'text', rows: 3, description: 'Affiché sur la page de chaque spectacle joué dans ce lieu.'}),
    defineField({name: 'ordre', title: 'Ordre d’affichage', type: 'number', initialValue: 10}),
  ],
  orderings: [{title: 'Ordre', name: 'ordre', by: [{field: 'ordre', direction: 'asc'}]}],
  preview: {
    select: {title: 'nom', capacite: 'capacite', adresse: 'adresse'},
    prepare: ({title, capacite, adresse}) => ({title, subtitle: [capacite ? `${capacite} places` : '', adresse].filter(Boolean).join(' · ')}),
  },
})

export const saison = defineType({
  name: 'saison',
  title: 'Saison',
  type: 'document',
  icon: StackIcon,
  fields: [
    defineField({name: 'titre', title: 'Titre', type: 'string', description: 'Exemple : Saison 26–27', validation: (r) => r.required()}),
    defineField({name: 'debut', title: 'Début', type: 'date', options: {dateFormat: 'DD.MM.YYYY'}}),
    defineField({name: 'fin', title: 'Fin', type: 'date', options: {dateFormat: 'DD.MM.YYYY'}}),
    defineField({name: 'courante', title: 'Saison en cours', type: 'boolean', initialValue: false, description: 'Une seule saison à la fois. C’est elle que le programme affiche.'}),
    defineField({name: 'programmePdf', title: 'Programme en PDF', type: 'file', options: {accept: 'application/pdf'}}),
    defineField({name: 'edito', title: 'Édito', type: 'texteRiche'}),
  ],
  preview: {
    select: {title: 'titre', courante: 'courante'},
    prepare: ({title, courante}) => ({title, subtitle: courante ? 'Saison en cours' : ''}),
  },
})

export const grilleTarifaire = defineType({
  name: 'grilleTarifaire',
  title: 'Tarifs',
  type: 'document',
  icon: BillIcon,
  fields: [
    defineField({name: 'nom', title: 'Nom de la grille', type: 'string', description: 'Exemples : Grande Salle, Midi théâtre, Concert au Temple', validation: (r) => r.required()}),
    defineField({
      name: 'tarifs',
      title: 'Prix',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'tarif',
          fields: [
            defineField({name: 'categorie', title: 'Catégorie', type: 'string', description: 'Exemple : Moins de 26 ans', validation: (r) => r.required()}),
            defineField({name: 'prix', title: 'Prix en francs', type: 'number', validation: (r) => r.required().min(0)}),
            defineField({name: 'precision', title: 'Précision', type: 'string', description: 'Facultatif. Exemple : AVS, AI, étudiant·es, sur justificatif'}),
          ],
          preview: {
            select: {categorie: 'categorie', prix: 'prix', precision: 'precision'},
            prepare: ({categorie, prix, precision}) => ({title: `${categorie} : ${prix}.–`, subtitle: precision}),
          },
        }),
      ],
    }),
    defineField({name: 'note', title: 'Note', type: 'text', rows: 2}),
  ],
  preview: {
    select: {title: 'nom', tarifs: 'tarifs'},
    prepare: ({title, tarifs}) => ({
      title,
      subtitle: (tarifs || []).map((t: {prix: number}) => `${t.prix}.–`).join(' / '),
    }),
  },
})

export const personne = defineType({
  name: 'personne',
  title: 'Personne',
  type: 'document',
  icon: UserIcon,
  fields: [
    defineField({name: 'nom', title: 'Prénom et nom', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'fonction', title: 'Fonction', type: 'string', description: 'Exemple : Communication et médiation'}),
    defineField({name: 'email', title: 'E-mail', type: 'string'}),
    defineField({name: 'telephone', title: 'Téléphone', type: 'string'}),
    defineField({name: 'photo', title: 'Photo', type: 'image', options: {hotspot: true}}),
    defineField({name: 'ordre', title: 'Ordre d’affichage', type: 'number', initialValue: 10}),
  ],
  orderings: [{title: 'Ordre', name: 'ordre', by: [{field: 'ordre', direction: 'asc'}]}],
  preview: {select: {title: 'nom', subtitle: 'fonction', media: 'photo'}},
})

export const partenaire = defineType({
  name: 'partenaire',
  title: 'Partenaire',
  type: 'document',
  icon: HeartIcon,
  fields: [
    defineField({name: 'nom', title: 'Nom', type: 'string', validation: (r) => r.required()}),
    defineField({
      name: 'type',
      title: 'Type',
      type: 'string',
      options: {list: [{title: 'Institution', value: 'institution'}, {title: 'Partenaire', value: 'partenaire'}, {title: 'Média', value: 'media'}], layout: 'radio', direction: 'horizontal'},
      initialValue: 'partenaire',
    }),
    defineField({name: 'logo', title: 'Logo', type: 'image'}),
    defineField({name: 'url', title: 'Site internet', type: 'url'}),
    defineField({name: 'piedDePage', title: 'Afficher dans le pied de page', type: 'boolean', initialValue: false}),
    defineField({name: 'ordre', title: 'Ordre d’affichage', type: 'number', initialValue: 10}),
  ],
  orderings: [{title: 'Ordre', name: 'ordre', by: [{field: 'ordre', direction: 'asc'}]}],
  preview: {select: {title: 'nom', subtitle: 'type', media: 'logo'}},
})

export const message = defineType({
  name: 'message',
  title: 'Message',
  type: 'document',
  icon: EnvelopeIcon,
  fields: [
    defineField({
      name: 'statut',
      title: 'Suivi',
      type: 'string',
      options: {list: [{title: 'Nouveau', value: 'nouveau'}, {title: 'Traité', value: 'traite'}], layout: 'radio', direction: 'horizontal'},
      initialValue: 'nouveau',
    }),
    defineField({name: 'sujet', title: 'Sujet', type: 'string', readOnly: true}),
    defineField({name: 'nom', title: 'Nom', type: 'string', readOnly: true}),
    defineField({name: 'email', title: 'E-mail', type: 'string', readOnly: true}),
    defineField({name: 'telephone', title: 'Téléphone', type: 'string', readOnly: true}),
    defineField({name: 'contenu', title: 'Message', type: 'text', rows: 8, readOnly: true}),
    defineField({name: 'recuLe', title: 'Reçu le', type: 'datetime', readOnly: true}),
    defineField({name: 'note', title: 'Note interne', type: 'text', rows: 3, description: 'Visible seulement dans le Studio.'}),
  ],
  orderings: [{title: 'Plus récents', name: 'recents', by: [{field: 'recuLe', direction: 'desc'}]}],
  preview: {
    select: {sujet: 'sujet', nom: 'nom', recuLe: 'recuLe', statut: 'statut'},
    prepare: ({sujet, nom, recuLe, statut}) => ({
      title: `${statut === 'nouveau' ? '● ' : ''}${sujet || 'Message'}`,
      subtitle: [nom, dateLisible(recuLe)].filter(Boolean).join(' · '),
    }),
  },
})
