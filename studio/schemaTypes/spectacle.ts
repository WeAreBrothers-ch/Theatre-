import {defineArrayMember, defineField, defineType} from 'sanity'
import {CalendarIcon} from '@sanity/icons/Calendar'
import {API_VERSION, ETIQUETTES, GENRES, STATUTS, dateLisible, libelle, slugifier} from '../lib/constantes'

export const spectacle = defineType({
  name: 'spectacle',
  title: 'Spectacle',
  type: 'document',
  icon: CalendarIcon,
  // Un nouveau spectacle est rangé dans la saison en cours, en Grande Salle, au tarif standard.
  initialValue: async (_params, {getClient}) => {
    const client = getClient({apiVersion: API_VERSION})
    const ids = await client.fetch<{saison?: string; lieu?: string; tarifs?: string}>(`{
      "saison": *[_type == "saison" && courante == true && !(_id in path("drafts.**"))][0]._id,
      "lieu": *[_type == "lieu" && !(_id in path("drafts.**"))] | order(ordre asc)[0]._id,
      "tarifs": *[_type == "grilleTarifaire" && !(_id in path("drafts.**"))] | order(_createdAt asc)[0]._id
    }`)
    const ref = (id?: string) => (id ? {_type: 'reference', _ref: id} : undefined)
    return {impression: 'auto', etiquettes: [], saison: ref(ids.saison), lieu: ref(ids.lieu), tarifs: ref(ids.tarifs)}
  },
  groups: [
    {name: 'essentiel', title: 'Essentiel', default: true},
    {name: 'dates', title: 'Dates et billets'},
    {name: 'contenu', title: 'Texte et photos'},
    {name: 'pratique', title: 'Infos pratiques'},
    {name: 'distribution', title: 'Distribution'},
    {name: 'seo', title: 'Partage'},
  ],
  fields: [
    defineField({
      name: 'titre',
      title: 'Titre',
      type: 'string',
      group: 'essentiel',
      description: 'Tel qu’il apparaît sur l’affiche. Exemple : Un air de famille',
      validation: (r) => r.required().error('Le titre est obligatoire.'),
    }),
    defineField({
      name: 'sousTitre',
      title: 'Sous-titre',
      type: 'string',
      group: 'essentiel',
      description: 'Facultatif. Exemples : d’après Moscou-Petouchki de Venedikt Erofeïev · précédé de PLEASE, WASH Mii BRAIN',
    }),
    defineField({
      name: 'compagnie',
      title: 'Artistes ou compagnie',
      type: 'string',
      group: 'essentiel',
      description: 'Exemple : Jean-Yves Ruf / Cie L’Oiseau à Ressort',
      validation: (r) => r.required().error('Indiquez les artistes ou la compagnie.'),
    }),
    defineField({
      name: 'genre',
      title: 'Genre',
      type: 'string',
      group: 'essentiel',
      options: {list: GENRES, layout: 'radio', direction: 'horizontal'},
      description: 'Sert aux filtres du programme.',
      validation: (r) => r.required().error('Choisissez un genre.'),
    }),
    defineField({
      name: 'precision',
      title: 'Précision du genre',
      type: 'string',
      group: 'essentiel',
      description: 'Facultatif. Exemple : Théâtre documentaire musical (CH)',
    }),
    defineField({
      name: 'etiquettes',
      title: 'Étiquettes',
      type: 'array',
      group: 'essentiel',
      of: [defineArrayMember({type: 'string'})],
      options: {list: ETIQUETTES, layout: 'grid'},
      description: '« Création » et « Afterwork » posent un bandeau sur l’affiche. « Midi théâtre » range le spectacle dans le programme de midi.',
    }),
    defineField({
      name: 'visuel',
      title: 'Visuel de l’affiche',
      type: 'image',
      group: 'essentiel',
      options: {hotspot: true, metadata: ['lqip', 'palette']},
      description: 'Une photo du spectacle, en couleur, 1600 px de large au moins. Le site l’imprime automatiquement dans la couleur de l’affiche. Cliquez sur le crayon pour choisir le point important de l’image.',
      fields: [
        defineField({
          name: 'alt',
          title: 'Description pour les personnes malvoyantes',
          type: 'string',
          description: 'Une phrase. Exemple : Trois danseurs en équilibre sur un plateau noir.',
        }),
      ],
      validation: (r) => r.required().error('Ajoutez un visuel : c’est l’affiche du spectacle.'),
    }),
    defineField({
      name: 'encre',
      title: 'Couleur de l’affiche',
      type: 'color',
      group: 'essentiel',
      options: {disableAlpha: true},
      description: 'Facultatif. Laissez vide : la couleur est prise automatiquement dans le visuel.',
    }),
    defineField({
      name: 'impression',
      title: 'Impression du visuel',
      type: 'string',
      group: 'essentiel',
      options: {
        list: [
          {title: 'Automatique', value: 'auto'},
          {title: 'Photo claire : imprimer en noir', value: 'noir'},
          {title: 'Photo sombre : imprimer en blanc', value: 'blanc'},
        ],
        layout: 'radio',
      },
      initialValue: 'auto',
      description: 'Changez seulement si l’image est peu lisible sur l’affiche.',
    }),
    defineField({
      name: 'accroche',
      title: 'Accroche',
      type: 'text',
      rows: 2,
      group: 'essentiel',
      description: 'Une ou deux phrases qui donnent envie. Affichée sur l’accueil et en haut de la page du spectacle. 180 caractères au plus.',
      validation: (r) => [r.required().error('Écrivez une accroche.'), r.max(200).warning('Plus court, ce sera plus lisible.')],
    }),
    defineField({
      name: 'saison',
      title: 'Saison',
      type: 'reference',
      to: [{type: 'saison'}],
      group: 'essentiel',
      validation: (r) => r.required().error('Choisissez la saison.'),
    }),

    // Dates et billets
    defineField({
      name: 'representations',
      title: 'Représentations',
      type: 'array',
      group: 'dates',
      of: [defineArrayMember({type: 'representation'})],
      description: 'Une ligne par date. Pour une date complète, choisissez « Complet » : le site l’affiche tout de suite.',
      validation: (r) => r.required().min(1).error('Ajoutez au moins une date.'),
    }),
    defineField({
      name: 'lieu',
      title: 'Salle',
      type: 'reference',
      to: [{type: 'lieu'}],
      group: 'dates',
      validation: (r) => r.required().error('Choisissez la salle.'),
    }),
    defineField({
      name: 'tarifs',
      title: 'Prix',
      type: 'reference',
      to: [{type: 'grilleTarifaire'}],
      group: 'dates',
      description: 'La grille de prix appliquée. Modifiez les grilles dans « Tarifs ».',
    }),
    defineField({
      name: 'noteTarifs',
      title: 'Précision sur les prix',
      type: 'string',
      group: 'dates',
      description: 'Facultatif. Exemple : Entrée libre, collecte à la sortie',
    }),
    defineField({
      name: 'lienBilletterie',
      title: 'Lien de réservation',
      type: 'url',
      group: 'dates',
      description: 'Facultatif. Sinon, le lien général de la billetterie (Réglages du site) est utilisé.',
    }),

    // Texte et photos
    defineField({name: 'texte', title: 'Présentation', type: 'texteRiche', group: 'contenu'}),
    defineField({
      name: 'photos',
      title: 'Photos',
      type: 'array',
      group: 'contenu',
      of: [defineArrayMember({type: 'imageLegendee'})],
      options: {layout: 'grid'},
      description: 'Photos de scène en couleur. La première s’affiche en grand.',
    }),
    defineField({name: 'video', title: 'Bande-annonce', type: 'url', group: 'contenu', description: 'Facultatif. Lien YouTube ou Vimeo.'}),

    // Infos pratiques
    defineField({name: 'age', title: 'Public', type: 'string', group: 'pratique', description: 'Exemples : Tout public · Dès 10 ans'}),
    defineField({name: 'duree', title: 'Durée', type: 'string', group: 'pratique', description: 'Exemple : 1h10 avec entracte'}),
    defineField({
      name: 'deroule',
      title: 'Déroulé',
      type: 'array',
      group: 'pratique',
      description: 'Facultatif. Exemple : Première partie, 20 min.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'etapeDeroule',
          fields: [
            defineField({name: 'titre', title: 'Partie', type: 'string'}),
            defineField({name: 'duree', title: 'Durée', type: 'string'}),
          ],
          preview: {select: {title: 'titre', subtitle: 'duree'}},
        }),
      ],
    }),
    defineField({name: 'avertissement', title: 'Avertissement', type: 'string', group: 'pratique', description: 'Facultatif. Exemple : Effets stroboscopiques dans la première partie'}),
    defineField({
      name: 'autour',
      title: 'Autour du spectacle',
      type: 'array',
      group: 'pratique',
      of: [defineArrayMember({type: 'string'})],
      description: 'Facultatif. Exemples : Librairie éphémère Payot le soir du spectacle · Bord de scène avec l’équipe.',
    }),
    defineField({name: 'distinction', title: 'Distinction', type: 'string', group: 'pratique', description: 'Facultatif. Exemple : Prix des lycéens, Festival Impatience 2024'}),
    defineField({name: 'accessibilite', title: 'Accessibilité', type: 'text', rows: 2, group: 'pratique', description: 'Facultatif. Remplace le texte d’accessibilité de la salle pour ce spectacle.'}),

    // Distribution
    defineField({
      name: 'distribution',
      title: 'Distribution',
      type: 'array',
      group: 'distribution',
      of: [defineArrayMember({type: 'blocDistribution'})],
    }),
    defineField({name: 'production', title: 'Production et soutiens', type: 'text', rows: 4, group: 'distribution'}),

    // Partage
    defineField({
      name: 'slug',
      title: 'Adresse de la page',
      type: 'slug',
      group: 'seo',
      options: {source: 'titre', slugify: slugifier},
      description: 'Générée depuis le titre avec le bouton « Générer ». Évitez de la changer une fois le spectacle publié.',
      validation: (r) => r.required().error('Cliquez sur « Générer » pour créer l’adresse.'),
    }),
    defineField({name: 'seo', title: 'Partage et référencement', type: 'seo', group: 'seo'}),
  ],
  orderings: [
    {title: 'Date de la première représentation', name: 'datePremiere', by: [{field: 'representations.0.dateHeure', direction: 'asc'}]},
    {title: 'Titre', name: 'titre', by: [{field: 'titre', direction: 'asc'}]},
  ],
  preview: {
    select: {
      titre: 'titre',
      d0: 'representations.0.dateHeure',
      s0: 'representations.0.statut',
      s1: 'representations.1.statut',
      d1: 'representations.1.dateHeure',
      lieu: 'lieu.nom',
      genre: 'genre',
      media: 'visuel',
    },
    prepare: ({titre, d0, d1, s0, s1, lieu, genre, media}) => {
      const complet = s0 === 'complet' && (!d1 || s1 === 'complet')
      const plus = d1 ? ' (+ autres dates)' : ''
      return {
        title: titre || 'Nouveau spectacle',
        subtitle: [dateLisible(d0) + plus, lieu, libelle(GENRES, genre), complet ? libelle(STATUTS, 'complet').toUpperCase() : '']
          .filter(Boolean)
          .join(' · '),
        media,
      }
    },
  },
})
