import {defineArrayMember, defineField, defineType} from 'sanity'
import {PinIcon} from '@sanity/icons/Pin'
import {StackIcon} from '@sanity/icons/Stack'
import {BillIcon} from '@sanity/icons/Bill'
import {UserIcon} from '@sanity/icons/User'
import {HeartIcon} from '@sanity/icons/Heart'
import {EnvelopeIcon} from '@sanity/icons/Envelope'
import {DocumentTextIcon} from '@sanity/icons/DocumentText'
import {SparklesIcon} from '@sanity/icons/Sparkles'
import {API_VERSION, CATEGORIES_RENDEZ_VOUS, GROUPES_EQUIPE, TYPES_PARTENAIRES, TYPES_PRESSE, dateLisible, libelle, slugifier} from '../lib/constantes'
import {ChampAdresse} from '../composants/ChampAdresse'

/** Une date de fin antérieure au début du document. */
function finAvantDebut(fin: string, doc: unknown): boolean {
  const debut = (doc as {debut?: string} | undefined)?.debut
  return !!debut && fin < debut
}

export const lieu = defineType({
  name: 'lieu',
  title: 'Lieu',
  type: 'document',
  icon: PinIcon,
  groups: [
    {name: 'essentiel', title: 'Essentiel', default: true},
    {name: 'technique', title: 'Technique'},
  ],
  fields: [
    defineField({name: 'nom', title: 'Nom', type: 'string', group: 'essentiel', description: 'Court : il s’affiche partout. Exemples : Grande Salle, Salle 1, Temple', validation: (r) => r.required()}),
    defineField({name: 'nomComplet', title: 'Nom complet', type: 'string', group: 'essentiel', description: 'Affiché sur la page du spectacle. Exemple : Théâtre Benno Besson, Grande Salle'}),
    defineField({
      name: 'type',
      title: 'Où',
      type: 'string',
      group: 'essentiel',
      options: {list: [{title: 'Au théâtre', value: 'theatre'}, {title: 'Hors les murs', value: 'hors-les-murs'}], layout: 'radio', direction: 'horizontal'},
      initialValue: 'theatre',
    }),
    defineField({name: 'adresse', title: 'Adresse', type: 'string', group: 'essentiel', description: 'Exemple : Rue du Casino 9, 1400 Yverdon-les-Bains'}),
    defineField({name: 'lienPlan', title: 'Lien vers le plan', type: 'url', group: 'essentiel', description: 'Facultatif. Pour les lieux hors les murs : un lien Google Maps ou map.geo.admin.ch.'}),
    defineField({name: 'capacite', title: 'Nombre de places', type: 'number', group: 'essentiel'}),
    defineField({name: 'description', title: 'Description', type: 'text', rows: 2, group: 'essentiel'}),
    defineField({name: 'accessibilite', title: 'Accessibilité', type: 'text', rows: 3, group: 'essentiel', description: 'Affiché sur la page de chaque spectacle joué dans ce lieu.'}),
    defineField({name: 'photos', title: 'Photos', type: 'array', group: 'essentiel', of: [defineArrayMember({type: 'imageLegendee'})], options: {layout: 'grid'}}),
    defineField({
      name: 'caracteristiques',
      title: 'Caractéristiques',
      type: 'array',
      group: 'technique',
      of: [defineArrayMember({type: 'caracteristique'})],
      description: 'Pour la page Technique. Exemples : Salle — à l’italienne, en gradins · Construction — 1898, rénovée en 2015',
    }),
    defineField({
      name: 'documents',
      title: 'Plans et fiches techniques',
      type: 'array',
      group: 'technique',
      of: [defineArrayMember({type: 'fichier'})],
    }),
    defineField({name: 'visiteVirtuelle', title: 'Visite virtuelle', type: 'url', group: 'technique'}),
    defineField({name: 'ordre', title: 'Ordre d’affichage', type: 'number', group: 'essentiel', initialValue: 10}),
  ],
  orderings: [{title: 'Ordre', name: 'ordre', by: [{field: 'ordre', direction: 'asc'}]}],
  preview: {
    select: {title: 'nom', capacite: 'capacite', adresse: 'adresse', type: 'type', media: 'photos.0'},
    prepare: ({title, capacite, adresse, type, media}) => ({
      title,
      subtitle: [type === 'hors-les-murs' ? 'Hors les murs' : '', capacite ? `${capacite} places` : '', adresse].filter(Boolean).join(' · '),
      media,
    }),
  },
})

export const saison = defineType({
  name: 'saison',
  title: 'Saison',
  type: 'document',
  icon: StackIcon,
  fields: [
    defineField({name: 'titre', title: 'Titre', type: 'string', description: 'Exemple : Saison 26–27', validation: (r) => r.required()}),
    defineField({name: 'debut', title: 'Début', type: 'date', options: {dateFormat: 'DD.MM.YYYY'}, description: 'Les spectacles de l’été qui précède la rentrée peuvent en faire partie.'}),
    defineField({
      name: 'fin',
      title: 'Fin',
      type: 'date',
      options: {dateFormat: 'DD.MM.YYYY'},
      validation: (r) => r.custom((fin, ctx) => (fin && finAvantDebut(fin, ctx.document) ? 'La fin précède le début.' : true)),
    }),
    defineField({
      name: 'courante',
      title: 'Saison en cours',
      type: 'boolean',
      initialValue: false,
      description: 'Une seule saison à la fois : c’est elle que le programme affiche. Pour changer de saison, utilisez « Faire de cette saison la saison en cours » (menu en bas de la fiche).',
      validation: (r) =>
        r.custom(async (courante, ctx) => {
          if (!courante) return true
          const id = (ctx.document?._id ?? '').replace(/^drafts\./, '')
          const autres = await ctx.getClient({apiVersion: API_VERSION}).fetch<string[]>(`*[_type == "saison" && courante == true && !(_id in [$id, $brouillon]) && !(_id in path("drafts.**"))].titre`, {id, brouillon: `drafts.${id}`})
          return autres.length ? `« ${autres.join(', ')} » est déjà la saison en cours. Utilisez l’action « Faire de cette saison la saison en cours ».` : true
        }),
    }),
    defineField({name: 'boutique', title: 'Boutique de la billetterie', type: 'url', description: 'La boutique Infomaniak de la saison. Elle devient le lien général « Réserver » du site tant que la saison est en cours.'}),
    defineField({name: 'programmePdf', title: 'Programme en PDF', type: 'file', options: {accept: 'application/pdf'}}),
    defineField({name: 'affiche', title: 'Affiche de la saison', type: 'image', options: {hotspot: true}, description: 'Montrée dans les archives.', fields: [defineField({name: 'alt', title: 'Description', type: 'string'})]}),
    defineField({name: 'afficheHD', title: 'Affiche en haute définition', type: 'file', description: 'Pour la presse (page Journalistes).'}),
    defineField({name: 'edito', title: 'Édito', type: 'texteRiche'}),
  ],
  orderings: [{title: 'Récentes d’abord', name: 'debutDesc', by: [{field: 'debut', direction: 'desc'}]}],
  preview: {
    select: {title: 'titre', courante: 'courante', media: 'affiche'},
    prepare: ({title, courante, media}) => ({title, subtitle: courante ? 'Saison en cours' : '', media}),
  },
})

export const grilleTarifaire = defineType({
  name: 'grilleTarifaire',
  title: 'Tarifs',
  type: 'document',
  icon: BillIcon,
  fields: [
    defineField({name: 'nom', title: 'Nom de la grille', type: 'string', description: 'Exemples : Grande Salle, Midi théâtre, Jeune public, Humour', validation: (r) => r.required()}),
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
    defineField({
      name: 'fonction',
      title: 'Fonction',
      type: 'string',
      description: 'Exemple : Communication et médiation. Plusieurs personnes de même fonction sont regroupées sur une ligne (Placeuses et placeurs : …).',
    }),
    defineField({name: 'groupe', title: 'Équipe', type: 'string', options: {list: GROUPES_EQUIPE}, initialValue: 'direction'}),
    defineField({name: 'email', title: 'E-mail', type: 'string', validation: (r) => r.email().warning('Adresse e-mail à vérifier.')}),
    defineField({name: 'telephone', title: 'Téléphone', type: 'string'}),
    defineField({name: 'photo', title: 'Photo', type: 'image', options: {hotspot: true}}),
    defineField({name: 'bio', title: 'Biographie', type: 'texteRiche', description: 'Facultatif. Pour la direction : affichée sur la page Histoire ou Équipe.'}),
    defineField({name: 'ordre', title: 'Ordre d’affichage', type: 'number', initialValue: 10}),
  ],
  orderings: [{title: 'Ordre', name: 'ordre', by: [{field: 'ordre', direction: 'asc'}]}],
  preview: {
    select: {title: 'nom', fonction: 'fonction', groupe: 'groupe', media: 'photo'},
    prepare: ({title, fonction, groupe, media}) => ({title, subtitle: [fonction, libelle(GROUPES_EQUIPE, groupe)].filter(Boolean).join(' · '), media}),
  },
})

export const partenaire = defineType({
  name: 'partenaire',
  title: 'Partenaire',
  type: 'document',
  icon: HeartIcon,
  fields: [
    defineField({name: 'nom', title: 'Nom', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'type', title: 'Type', type: 'string', options: {list: TYPES_PARTENAIRES, layout: 'radio'}, initialValue: 'partenaire'}),
    defineField({name: 'logo', title: 'Logo', type: 'image', description: 'De préférence en PNG ou SVG, sur fond transparent.'}),
    defineField({name: 'url', title: 'Site internet', type: 'url'}),
    defineField({name: 'piedDePage', title: 'Afficher dans le pied de page', type: 'boolean', initialValue: false}),
    defineField({name: 'ordre', title: 'Ordre d’affichage', type: 'number', initialValue: 10}),
  ],
  orderings: [{title: 'Ordre', name: 'ordre', by: [{field: 'ordre', direction: 'asc'}]}],
  preview: {
    select: {title: 'nom', type: 'type', media: 'logo', pied: 'piedDePage'},
    prepare: ({title, type, media, pied}) => ({title, subtitle: [libelle(TYPES_PARTENAIRES, type), pied ? 'pied de page' : ''].filter(Boolean).join(' · '), media}),
  },
})

export const articlePresse = defineType({
  name: 'articlePresse',
  title: 'Article de presse',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    defineField({name: 'titre', title: 'Titre de l’article', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'media', title: 'Média', type: 'string', description: 'Exemples : Le Temps · RTS La 1ère, Vertigo · 24 heures', validation: (r) => r.required()}),
    defineField({name: 'auteur', title: 'Auteur ou autrice', type: 'string'}),
    defineField({name: 'date', title: 'Date', type: 'date', options: {dateFormat: 'DD.MM.YYYY'}, validation: (r) => r.required()}),
    defineField({name: 'type', title: 'Support', type: 'string', options: {list: TYPES_PRESSE, layout: 'radio', direction: 'horizontal'}, initialValue: 'article'}),
    defineField({name: 'lien', title: 'Lien', type: 'url', description: 'L’article en ligne, le podcast…'}),
    defineField({name: 'fichier', title: '…ou le fichier', type: 'file', description: 'Le PDF de l’article, s’il n’est pas en ligne.'}),
    defineField({
      name: 'spectacle',
      title: 'Spectacle concerné',
      type: 'reference',
      to: [{type: 'spectacle'}],
      options: {disableNew: true},
      description: 'Facultatif. L’article apparaît alors aussi sur la page du spectacle.',
    }),
    defineField({name: 'extrait', title: 'Extrait', type: 'text', rows: 3, description: 'Facultatif. Une phrase de l’article, sans guillemets.'}),
  ],
  validation: (r) =>
    r.custom((d) => {
      const a = d as {lien?: string; fichier?: {asset?: unknown}} | undefined
      return a && !a.lien && !a.fichier?.asset ? 'Ajoutez le lien de l’article ou son fichier.' : true
    }),
  orderings: [{title: 'Plus récents', name: 'dateDesc', by: [{field: 'date', direction: 'desc'}]}],
  preview: {
    select: {title: 'titre', media: 'media', date: 'date', spectacle: 'spectacle.titre'},
    prepare: ({title, media, date, spectacle}) => ({
      title,
      subtitle: [media, date ? date.split('-').reverse().join('.') : '', spectacle ? `(${spectacle})` : ''].filter(Boolean).join(' · '),
    }),
  },
})

export const rendezVous = defineType({
  name: 'rendezVous',
  title: 'Rendez-vous',
  type: 'document',
  icon: SparklesIcon,
  groups: [
    {name: 'essentiel', title: 'Essentiel', default: true},
    {name: 'plus', title: 'Horaires et liens'},
  ],
  fields: [
    defineField({name: 'titre', title: 'Titre', type: 'string', group: 'essentiel', validation: (r) => r.required()}),
    defineField({name: 'categorie', title: 'Catégorie', type: 'string', group: 'essentiel', options: {list: CATEGORIES_RENDEZ_VOUS, layout: 'radio'}, initialValue: 'festival', validation: (r) => r.required()}),
    defineField({name: 'debut', title: 'Premier jour', type: 'date', group: 'essentiel', options: {dateFormat: 'DD.MM.YYYY'}, validation: (r) => r.required().error('Indiquez au moins le premier jour.')}),
    defineField({
      name: 'fin',
      title: 'Dernier jour',
      type: 'date',
      group: 'essentiel',
      options: {dateFormat: 'DD.MM.YYYY'},
      description: 'Vide pour un rendez-vous d’un jour.',
      validation: (r) => r.custom((fin, ctx) => (fin && finAvantDebut(fin, ctx.document) ? 'Le dernier jour précède le premier.' : true)),
    }),
    defineField({name: 'periode', title: 'Période en toutes lettres', type: 'string', group: 'essentiel', description: 'Facultatif. Remplace les dates affichées. Exemple : Été 2026 · Tous les mardis de mars'}),
    defineField({name: 'organisateur', title: 'Organisé par', type: 'string', group: 'essentiel', description: 'Facultatif. Exemple : Association ICI · Cie du Cachot'}),
    defineField({name: 'lieu', title: 'Lieu', type: 'string', group: 'essentiel', description: 'Exemples : Foyer du TBB · Quai de Nogent, Parc des Rives'}),
    defineField({name: 'texte', title: 'Texte', type: 'texteRiche', group: 'essentiel'}),
    defineField({name: 'image', title: 'Image', type: 'imageLegendee', group: 'essentiel'}),
    defineField({
      name: 'horaires',
      title: 'Horaires détaillés',
      type: 'array',
      group: 'plus',
      description: 'Facultatif. Une ligne par séance (visites, ateliers…).',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'horaire',
          fields: [
            defineField({name: 'dateHeure', title: 'Date et heure', type: 'datetime', options: {dateFormat: 'DD.MM.YYYY', timeFormat: 'HH:mm', timeStep: 15}}),
            defineField({name: 'precision', title: 'Précision', type: 'string', description: 'Exemple : Visite guidée en famille'}),
          ],
          preview: {select: {date: 'dateHeure', precision: 'precision'}, prepare: ({date, precision}) => ({title: dateLisible(date), subtitle: precision})},
        }),
      ],
    }),
    defineField({name: 'prix', title: 'Prix', type: 'string', group: 'plus', description: 'Exemples : Entrée libre · CHF 100.– · Gratuit sur inscription'}),
    defineField({name: 'inscription', title: 'Lien d’inscription ou de billetterie', type: 'url', group: 'plus', validation: (r) => r.uri({scheme: ['http', 'https', 'mailto']})}),
    defineField({name: 'liens', title: 'Liens', type: 'array', group: 'plus', of: [defineArrayMember({type: 'lien'})], description: 'Exemple : www.laderivee.ch'}),
    defineField({name: 'spectacles', title: 'Spectacles liés', type: 'array', group: 'plus', of: [defineArrayMember({type: 'reference', to: [{type: 'spectacle'}], options: {disableNew: true}})]}),
    defineField({
      name: 'slug',
      title: 'Page dédiée',
      type: 'slug',
      group: 'plus',
      options: {source: 'titre', slugify: slugifier},
      components: {input: ChampAdresse},
      description: 'Le rendez-vous a sa page : /rendez-vous/adresse. Elle n’est montrée que s’il y a un texte.',
    }),
  ],
  orderings: [{title: 'Date', name: 'debut', by: [{field: 'debut', direction: 'asc'}]}],
  preview: {
    select: {title: 'titre', categorie: 'categorie', debut: 'debut', fin: 'fin', periode: 'periode', media: 'image'},
    prepare: ({title, categorie, debut, fin, periode, media}) => {
      const d = (x?: string) => (x ? x.split('-').reverse().join('.') : '')
      return {title, subtitle: [periode || (fin && fin !== debut ? `${d(debut)} → ${d(fin)}` : d(debut)), libelle(CATEGORIES_RENDEZ_VOUS, categorie)].filter(Boolean).join(' · '), media}
    },
  },
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
