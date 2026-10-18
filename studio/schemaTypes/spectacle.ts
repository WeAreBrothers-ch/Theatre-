import {defineArrayMember, defineField, defineType} from 'sanity'
import {CalendarIcon} from '@sanity/icons/Calendar'
import {API_VERSION, ETIQUETTES, GENRES, STATUTS, dateLisible, libelle, slugifier} from '../lib/constantes'
import {ChampRepresentations} from '../composants/ChampRepresentations'
import {EtatFiche} from '../composants/EtatFiche'
import {ChampAdresse} from '../composants/ChampAdresse'

type Rep = {_key?: string; dateHeure?: string}

export const spectacle = defineType({
  name: 'spectacle',
  title: 'Spectacle',
  type: 'document',
  icon: CalendarIcon,
  components: {input: EtatFiche},
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
    {name: 'presse', title: 'Presse et écoles'},
    {name: 'seo', title: 'Partage'},
  ],
  fieldsets: [{name: 'billetterie', title: 'Billetterie en ligne', options: {collapsible: true, collapsed: false}}],
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
      description: 'Facultatif. Affichée au-dessus du titre. Exemple : Théâtre documentaire musical (CH)',
    }),
    defineField({
      name: 'etiquettes',
      title: 'Étiquettes',
      type: 'array',
      group: 'essentiel',
      of: [defineArrayMember({type: 'string'})],
      options: {list: ETIQUETTES, layout: 'grid'},
      description:
        '« Création » et « Afterwork » posent un bandeau sur l’affiche. « Midi théâtre » range le spectacle dans le programme de midi. Les étiquettes d’accessibilité apparaissent sur la page Médiation.',
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
          validation: (r) => r.max(160).warning('Une phrase suffit.'),
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
      description: 'Une ou deux phrases qui donnent envie. Affichée sur l’accueil, dans la lettre d’information et en haut de la page du spectacle. 180 caractères au plus.',
      validation: (r) => [r.required().error('Écrivez une accroche.'), r.max(200).warning('Plus court, ce sera plus lisible.')],
    }),
    defineField({
      name: 'saison',
      title: 'Saison',
      type: 'reference',
      to: [{type: 'saison'}],
      group: 'essentiel',
      options: {disableNew: true},
      validation: (r) => r.required().error('Choisissez la saison.'),
    }),

    // Dates et billets
    defineField({
      name: 'representations',
      title: 'Représentations',
      type: 'array',
      group: 'dates',
      of: [defineArrayMember({type: 'representation'})],
      components: {input: ChampRepresentations},
      description: 'Une ligne par date. « Ajouter des dates » crée une série d’un coup (du mardi au samedi à 20h, le dimanche à 17h…).',
      validation: (r) =>
        r
          .required()
          .min(1)
          .error('Ajoutez au moins une date.')
          .custom((reps: Rep[] | undefined) => {
            const vus = new Set<number>()
            for (const x of reps ?? []) {
              if (!x.dateHeure) continue
              const t = new Date(x.dateHeure).getTime()
              if (vus.has(t)) return {message: `Le ${dateLisible(x.dateHeure)} figure deux fois.`, path: [{_key: x._key ?? ''}]}
              vus.add(t)
            }
            return true
          }),
    }),
    defineField({
      name: 'lieu',
      title: 'Salle',
      type: 'reference',
      to: [{type: 'lieu'}],
      group: 'dates',
      options: {disableNew: true},
      description: 'Une date jouée ailleurs se règle sur la date elle-même.',
      validation: (r) => r.required().error('Choisissez la salle.'),
    }),
    defineField({
      name: 'tarifs',
      title: 'Prix',
      type: 'reference',
      to: [{type: 'grilleTarifaire'}],
      group: 'dates',
      options: {disableNew: true},
      description: 'La grille de prix appliquée. Une grille modifiée dans « Tarifs » change tous les spectacles qui l’utilisent.',
    }),
    defineField({
      name: 'noteTarifs',
      title: 'Précision sur les prix',
      type: 'string',
      group: 'dates',
      description: 'Facultatif. Remplace les prix affichés. Exemples : Offert · Entrée libre, collecte à la sortie · Billetterie Le Castrum',
    }),
    defineField({
      name: 'lienBilletterie',
      title: 'Lien de réservation',
      type: 'url',
      group: 'dates',
      fieldset: 'billetterie',
      description: 'Le lien Infomaniak du spectacle (…/event/1635354/ ou …/events/1635366/). Vide : le lien général de la billetterie (Réglages du site).',
    }),
    defineField({
      name: 'libelleBillet',
      title: 'Texte du bouton',
      type: 'string',
      group: 'dates',
      fieldset: 'billetterie',
      description: 'Facultatif. « Réserver » par défaut. Exemples : Inscription · Acheter',
    }),
    defineField({
      name: 'lienListeAttente',
      title: 'Lien de la liste d’attente',
      type: 'url',
      group: 'dates',
      fieldset: 'billetterie',
      description: 'Facultatif. Le formulaire Brevo proposé quand une date est complète ou en liste d’attente. Vide : celui des Réglages du site, sinon le téléphone de la billetterie.',
    }),

    // Texte et photos
    defineField({name: 'texte', title: 'Présentation', type: 'texteRiche', group: 'contenu'}),
    defineField({
      name: 'citations',
      title: 'Citations',
      type: 'array',
      group: 'contenu',
      of: [defineArrayMember({type: 'citationPresse'})],
      description: 'Facultatif. Une phrase de la presse ou de l’artiste, mise en exergue sur la page. Exemple : « …une fête féroce. » Marie-Pierre Genecand, Le Temps',
    }),
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
    defineField({name: 'age', title: 'Public', type: 'string', group: 'pratique', description: 'Exemples : Tout public · Dès 10 ans · Conseillé dès 16 ans'}),
    defineField({name: 'duree', title: 'Durée', type: 'string', group: 'pratique', description: 'Exemple : 1h10 avec entracte. Sert aussi à repérer deux spectacles qui se chevaucheraient dans une salle.'}),
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
      description: 'Facultatif. Exemples : Librairie éphémère Payot le soir du spectacle · Avant-spectacle à 19h au Foyer : lectures du Cercle littéraire · Bord de scène avec l’équipe.',
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
      description: 'Un bloc par pièce : deux blocs pour un programme double.',
    }),
    defineField({name: 'production', title: 'Production et soutiens', type: 'text', rows: 4, group: 'distribution', description: 'Production, coproduction, soutiens, remerciements.'}),
    defineField({name: 'creation', title: 'Création', type: 'string', group: 'distribution', description: 'Facultatif. Exemple : Création le 29 avril 2025 au Petit Théâtre de Lausanne'}),
    defineField({name: 'creditsPhotos', title: 'Crédits photo', type: 'string', group: 'distribution', description: 'Exemple : Photos © Philippe Pache'}),

    // Presse et écoles
    defineField({
      name: 'photosHD',
      title: 'Photos en haute définition',
      type: 'url',
      group: 'presse',
      description: 'Lien vers le dossier de photos pour la presse (Dropbox…). Affiché sur la page du spectacle et sur la page Journalistes.',
    }),
    defineField({name: 'dossierPresse', title: 'Dossier de presse', type: 'file', group: 'presse', options: {accept: 'application/pdf'}}),
    defineField({
      name: 'documents',
      title: 'Autres documents',
      type: 'array',
      group: 'presse',
      of: [defineArrayMember({type: 'fichier'})],
      description: 'Facultatif. Fiche technique, texte FALC, programme de salle…',
    }),
    defineField({
      name: 'scolaire',
      title: 'Avec l’école',
      type: 'text',
      rows: 2,
      group: 'presse',
      description: 'Facultatif. Affiché sur la page du spectacle et la page Jeune public. Exemple : Les élèves de 9-10S d’Yverdon-les-Bains verront ce spectacle avec l’école.',
    }),
    defineField({
      name: 'dossierPedagogique',
      title: 'Dossier pédagogique',
      type: 'file',
      group: 'presse',
      options: {accept: 'application/pdf'},
      description: 'Facultatif. Proposé aux enseignant·es sur la page du spectacle et la page Jeune public.',
    }),

    // Partage
    defineField({
      name: 'slug',
      title: 'Adresse de la page',
      type: 'slug',
      group: 'seo',
      options: {source: 'titre', slugify: slugifier},
      components: {input: ChampAdresse},
      description: 'Exemple : choices donne /spectacles/choices.',
      validation: (r) => r.required().error('L’adresse se remplit toute seule avec le titre.'),
    }),
    defineField({
      name: 'masque',
      title: 'Cacher ce spectacle du site',
      type: 'boolean',
      group: 'seo',
      initialValue: false,
      description: 'La page reste accessible par son adresse, mais le spectacle n’apparaît plus dans le programme, l’agenda ni l’accueil.',
    }),
    defineField({name: 'seo', title: 'Partage et référencement', type: 'seo', group: 'seo'}),
  ],
  orderings: [
    {title: 'Date de la première représentation', name: 'datePremiere', by: [{field: 'representations.0.dateHeure', direction: 'asc'}]},
    {title: 'Date de la première représentation (récents d’abord)', name: 'datePremiereDesc', by: [{field: 'representations.0.dateHeure', direction: 'desc'}]},
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
      masque: 'masque',
    },
    prepare: ({titre, d0, d1, s0, s1, lieu, genre, media, masque}) => {
      const complet = s0 === 'complet' && (!d1 || s1 === 'complet')
      const plus = d1 ? ' (+ autres dates)' : ''
      return {
        title: `${titre || 'Nouveau spectacle'}${masque ? ' (caché)' : ''}`,
        subtitle: [dateLisible(d0) + plus, lieu, libelle(GENRES, genre), complet ? libelle(STATUTS, 'complet').toUpperCase() : '']
          .filter(Boolean)
          .join(' · '),
        media,
      }
    },
  },
})
