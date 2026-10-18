/*
 * Lieux, saisons, équipe, partenaires et grands rendez-vous, d'après le site actuel
 * (relevé du 18 octobre 2026). Les identifiants des documents déjà dans Sanity sont gardés.
 */
import {blocs, cle, ref} from './outils.mjs'

const WIX = (id, l, h) => ({id, l, h})
const PDF = (fichier) => `https://www.theatrebennobesson.ch/_files/ugd/${fichier}.pdf`

// ---------------------------------------------------------------------------
// Lieux
// ---------------------------------------------------------------------------
const CARTE_TBB = 'https://www.google.com/maps/place/Benno+Besson/@46.779834,6.642209,15z/data=!4m5!3m4!1s0x0:0x2bee5710721f8915!8m2!3d46.779834!4d6.642209'

export const LIEUX = [
  {
    id: 'lieu-grande-salle', nom: 'Grande Salle', nomComplet: 'Théâtre Benno Besson, Grande Salle', type: 'theatre', adresse: 'Rue du Casino 9, 1400 Yverdon-les-Bains', lienPlan: CARTE_TBB, capacite: 460, ordre: 1,
    description: 'Salle à l’italienne en gradins, derrière les trois arches de la façade.',
    accessibilite: 'Places pour fauteuil roulant à réserver au 024 423 65 84 ; le billet de la personne qui accompagne est offert. Boucle magnétique et appareils auditifs en prêt.',
    caracteristiques: [
      ['Salle', 'À l’italienne, en gradins'],
      ['Construction', '1898, dernière rénovation en 2015'],
      ['Fiche technique', 'Sur demande à tbbtechnique@yverdon-les-bains.ch'],
      ['Plans en DXF', 'Sur demande, par e-mail'],
    ],
    visiteVirtuelle: 'https://archivr-photographe.com/visites-virtuelles/tbb/',
    documents: [
      ['Plan TBB au 50e, coupe', 'https://docs.wixstatic.com/ugd/bb13fe_77d55a1497e14475bbb73b6e3c5beb39.pdf'],
      ['Plan TBB au 50e, dessus passerelle face', PDF('3875d2_117b860b8c9f4fab9c17dd9dc21ca929')],
      ['Plan TBB au 50e, dessus coulisses', PDF('3875d2_16a368aba20c4cecab102ad0128af212')],
      ['Plan TBB au 100e, dessus', PDF('3875d2_e79bae6cbaef40258c9c4d295c1e389f')],
      ['Plan TBB au 100e, coupe', PDF('3875d2_4a9c3e388b6b4c539c9171e73010fe48')],
      ['Numérotation des sièges', PDF('3875d2_78c9255e99214bfa9c148a0af08d4a50')],
    ],
  },
  {
    id: 'lieu-salle-1', nom: 'Salle 1', nomComplet: 'Théâtre Benno Besson, Salle 1', type: 'theatre', adresse: 'Rue du Casino 9, 1400 Yverdon-les-Bains', lienPlan: CARTE_TBB, capacite: 60, ordre: 2,
    description: 'L’ancien foyer du premier étage, devenu en 2020 une deuxième salle pour les petites formes et le Midi théâtre.',
    accessibilite: 'Au premier étage, accessible par un monte-personne. Venez un peu en avance ou prévenez la billetterie.',
  },
  {id: 'lieu-foyer', nom: 'Foyer', nomComplet: 'Théâtre Benno Besson, Foyer', type: 'theatre', adresse: 'Rue du Casino 9, 1400 Yverdon-les-Bains', lienPlan: CARTE_TBB, ordre: 3, description: 'Le foyer du théâtre : avant-spectacles, lectures et petites formes.'},
  {id: 'lieu-temple', nom: 'Temple', nomComplet: 'Temple d’Yverdon-les-Bains', type: 'hors-les-murs', adresse: 'Place Pestalozzi, 1400 Yverdon-les-Bains', ordre: 4},
  {id: 'lieu-eglise-st-pierre', nom: 'Église St-Pierre', nomComplet: 'Église catholique St-Pierre, Yverdon-les-Bains', type: 'hors-les-murs', ordre: 5},
  {id: 'lieu-aula-magna', nom: 'Aula Magna', nomComplet: 'Aula Magna, Yverdon-les-Bains', type: 'hors-les-murs', ordre: 6},
  {id: 'lieu-la-marive', nom: 'La Marive', nomComplet: 'La Marive, Yverdon-les-Bains', type: 'hors-les-murs', ordre: 7},
  {id: 'lieu-echandole', nom: 'L’Echandole', nomComplet: 'Théâtre de L’Echandole, Yverdon-les-Bains', type: 'hors-les-murs', ordre: 8},
  {id: 'lieu-jardins-casino', nom: 'Jardins du Casino', nomComplet: 'Jardins du Casino, à côté du théâtre', type: 'hors-les-murs', ordre: 9},
  {id: 'lieu-parvis', nom: 'Devant le théâtre', nomComplet: 'Devant le Théâtre Benno Besson', type: 'hors-les-murs', ordre: 10},
  {id: 'lieu-sports-5', nom: 'Sports 5', nomComplet: 'Sports 5, Yverdon-les-Bains', type: 'hors-les-murs', ordre: 11},
  {id: 'lieu-quai-de-nogent', nom: 'Quai de Nogent', nomComplet: 'Quai de Nogent, Parc des Rives (La Dérivée)', type: 'hors-les-murs', ordre: 12},
  {id: 'lieu-plage', nom: 'Plage', nomComplet: 'Plage d’Yverdon-les-Bains', type: 'hors-les-murs', ordre: 13},
  {id: 'lieu-vidy', nom: 'Vidy', nomComplet: 'Théâtre Vidy-Lausanne', type: 'hors-les-murs', adresse: 'Avenue Émile-Henri-Jaques-Dalcroze 5, 1007 Lausanne', ordre: 14},
  {id: 'lieu-en-ligne', nom: 'En ligne', nomComplet: 'En ligne, diffusion en direct', type: 'hors-les-murs', ordre: 15},
]

export function ajouterLieux({ajouter, fichier}) {
  for (const l of LIEUX) {
    const {id, caracteristiques, documents, ...champs} = l
    ajouter((img) => ({
      _id: id,
      _type: 'lieu',
      ...champs,
      ...(caracteristiques ? {caracteristiques: caracteristiques.map(([libelle, valeur], i) => ({_type: 'caracteristique', _key: cle(id, 'c', i), libelle, valeur}))} : {}),
      ...(documents ? {documents: documents.map(([titre, url], i) => ({_type: 'fichier', _key: cle(id, 'doc', i), titre, fichier: img(fichier(url))}))} : {}),
    }))
  }
}

// ---------------------------------------------------------------------------
// Saisons
// ---------------------------------------------------------------------------
const AFFICHES = {
  '25-26': WIX('bd258f_f81d10e5953f446ab52c81ee266f36f0~mv2.jpg', 500, 715),
  '24-25': WIX('bd258f_dffb3ba45c4b4e2987432fa6d7262f97~mv2.jpg', 2403, 3437),
  '23-24': WIX('5b81b6_1e8f9b7c03bd4cbca386b721608c6cac~mv2.jpg', 5285, 7559),
  '22-23': WIX('5b81b6_e0b0883f3e6043049dd1e252f990bc95~mv2.jpg', 2480, 3548),
  '21-22': WIX('5b81b6_a80ea4910735401fa41383113969839c~mv2.jpg', 2480, 3508),
  '20-21': WIX('5b81b6_d53963e28a0145de959e30f88ff131a4~mv2.jpg', 1000, 1415),
}
export const BOUTIQUE = 'https://infomaniak.events/fr-ch/shop/tbb-2026-2027-SHAF7H8MML'

export function ajouterSaisons({ajouter, imageWix, fichier}, reprise) {
  for (const s of reprise.saisons) {
    const id = `saison-${s.code}`
    const courante = s.code === '26-27'
    const [a] = s.code.split('-')
    ajouter((img) => ({
      _id: id,
      _type: 'saison',
      titre: s.titre,
      // La saison court de juin (spectacles de l'été) à fin mai, sauf quand les dates disent autre chose.
      debut: courante ? '2026-06-01' : [s.premiere, `20${a}-08-01`].sort()[0],
      fin: courante ? '2027-06-30' : [s.derniere, `20${Number(a) + 1}-06-30`].sort().at(-1),
      courante,
      ...(courante
        ? {
            boutique: BOUTIQUE,
            programmePdf: img(fichier('https://www.theatrebennobesson.ch/_files/ugd/bd258f_b412fe0145d442e5bd9420b210d88263.pdf')),
            afficheHD: img(fichier('https://www.theatrebennobesson.ch/_files/ugd/bd258f_9842d97e21ff4186a4e1bafd77390783.pdf')),
          }
        : {}),
      ...(AFFICHES[s.code] ? {affiche: img(imageWix(AFFICHES[s.code], {extra: {alt: `Affiche de la saison ${s.code.replace('-', '–')} du Théâtre Benno Besson`}}))} : {}),
    }))
  }
}

// ---------------------------------------------------------------------------
// Équipe (page Équipe et contacts, et comité des Ami·es)
// ---------------------------------------------------------------------------
const yv = (x) => `${x}@yverdon-les-bains.ch`
/** [nom, fonction, groupe, e-mail?, téléphone?] — une ligne par personne, dans l'ordre du site. */
const EQUIPE = [
  ['Georges Grbic', 'Direction', 'direction', yv('georges.grbic')],
  ['France Jaton', 'Administration', 'direction', yv('france.jaton')],
  ['Léa Thonney', 'Chargée de projets', 'direction', yv('lea.thonney')],
  ['Francine Ray', 'Intendance', 'direction', yv('francine.ray')],
  ['Anicée Willemin', 'Communication et médiation', 'communication', yv('anicee.willemin'), '024 423 65 88'],
  ['Claudia Saldivia Vega', 'Coordinatrice en médiation scolaire', 'communication', yv('claudia.saldivia')],
  ['Emmanuelle Macaluso-Pahud', 'Billetterie', 'billetterie', yv('billetterie'), '024 423 65 84'],
  ['Léa Thonney', 'Employée de billetterie', 'billetterie', yv('lea.thonney'), null, 'personne-lea-thonney-billetterie'],
  ...['Robin Bessire', 'Nathan Felka', 'Melinda Mesa Martinez', 'Léa Thonney', 'Zoé Segessenmann'].map((n) => [n, 'Auxiliaires billetterie', 'billetterie', null, null, `personne-${cle(n, 'auxiliaire')}`]),
  ['Léa Macaluso', 'Responsable planification des placeuses et placeurs', 'accueil'],
  ...['Mélissa Bovet', 'Nathan Felka', 'Stéphanie Felka', 'Sami Gilliand', 'Léo Lehmann', 'Julie Macaluso', 'Stéphanie Sacramento', 'Audrey Stucker'].map((n) => [n, 'Placeuses et placeurs', 'accueil', null, null, `personne-${cle(n, 'placeur')}`]),
  ['Annina Berney Buri', 'Responsable de la pose des affiches', 'accueil'],
  ...['Léane Andrey', 'Annina Berney Buri', 'Emilie Maeder'].map((n) => [n, 'Habilleuses', 'accueil', null, null, `personne-${cle(n, 'habilleuse')}`]),
  ['Julien Mayor', 'Directeur technique audiovisuel, coordinateur SST et AEAI, responsable de la mutualisation audiovisuelle SCU', 'technique', yv('tbb.technique'), '024 423 65 86'],
  ['Victor Hunziker', 'Régie générale', 'technique', yv('victor.hunziker')],
  ['Samuel Taillet', 'Régie générale', 'technique', yv('samuel.taillet')],
  ['Amir Jdahim', 'Technicien', 'technique', yv('amir.jdahim')],
  ...['Loïti Arratibel', 'Marco Ballerini', 'David Brodard', 'Noyan Cattin', 'Johanna De Blaireville', 'Lorenzo Grauso', 'Myriam Habegger', 'Mélina Küpfer', 'Laurent Magnin', 'Bastien Mérillat', 'Stéphane Murugan', 'Julien Perret', 'Patrick Quiquaz', 'Johan Rochat', 'Margot Rombolotto', 'David Sallin', 'Camille Schulz', 'Rafael Schwander', 'Alexis Sudan', 'Mario Torchio', 'Lionel Varrin', 'Ivan Verda', 'Dorian Wolfcarius'].map((n) => [n, 'Techniciennes et techniciens audiovisuel', 'technique', null, null, `personne-${cle(n, 'technicien')}`]),
  ['Clément Bugnon', 'Coordinateur de la Fête de la Danse', 'autres'],
  ['Marie Cajka, Giorgio Pesce – Atelier Poisson', 'Graphisme', 'prestataires', null, null, 'personne-graphisme'],
  ['Cornaz impressions | emballages SA et Atelier Kinkin', 'Imprimeurs', 'prestataires', null, null, 'personne-imprimeurs'],
  // Comité de l'Association des Ami·es du TBB
  ['Christian Clerc', 'Président', 'comite-amis'],
  ['Martine Burger', 'Vice-présidente', 'comite-amis'],
  ['Xavier Fischer', 'Trésorier', 'comite-amis'],
  ['France Jaton', 'Secrétaire', 'comite-amis', null, null, 'personne-france-jaton-amis'],
  ['Laurence Becquelin-Clerc', 'Vérificatrices des comptes', 'comite-amis'],
  ['Claude-Anne Jacquier', 'Vérificatrices des comptes', 'comite-amis'],
  ['Pascale Fischer', 'Membre', 'comite-amis'],
  ['Georges Grbic', 'Membre consultatif', 'comite-amis', null, null, 'personne-georges-grbic-amis'],
]

const BIO_GRBIC = [
  'Né en 1964, Georges Grbic s’est formé comme comédien au Conservatoire de Lausanne, puis a joué sous la direction de nombreux metteurs en scène suisses, français et belges dont Hervé Loichemol, Simone Audemars, Philippe Sireuil ou Jean-Louis Hourdin. Il a été membre fondateur de la Cie de l’Organon avec laquelle il a joué depuis 1991 une trentaine de spectacles. Il a également présidé le Syndicat suisse romand du spectacle de 2004 à 2007.',
  'Après quelques années d’interventions théâtrales dans les écoles de Ferney-Voltaire, il fonde en 2013 la Cie Champs d’action pour coproduire avec Le petit théâtre de Lausanne et la Bavette à Monthey Les Trois Petits Cochons de Noëlle Revaz. En 2016, il met en scène Perplexe de Marius von Mayenburg, puis Au But de Thomas Bernhard à Lausanne, Vevey et Genève.',
  'En septembre 2017, il succède à Thierry Luisier pour reprendre la direction artistique du Théâtre Benno Besson, et continue en parallèle son travail de mise en scène.',
]

export function ajouterEquipe({ajouter, imageWix}) {
  const vus = new Set()
  EQUIPE.forEach(([nom, fonction, groupe, email, telephone, idImpose], i) => {
    // Les documents déjà créés par la maquette gardent leur identifiant (calculé sur le nom).
    let id = idImpose ?? `personne-${cle(nom)}`
    if (vus.has(id)) id = `personne-${cle(nom, fonction)}`
    vus.add(id)
    ajouter((img) => ({
      _id: id,
      _type: 'personne',
      nom,
      fonction,
      groupe,
      ...(email ? {email} : {}),
      ...(telephone ? {telephone} : {}),
      ordre: (i + 1) * 10,
      ...(nom === 'Georges Grbic' && groupe === 'direction'
        ? {
            bio: blocs(BIO_GRBIC, 'bio-grbic'),
            photo: img(imageWix(WIX('3875d2_9db664f13dc6475d9bda8cd136d5a5c5~mv2.jpg', 668, 1000), {extra: {alt: 'Portrait de Georges Grbic'}})),
          }
        : {}),
    }))
  })
}

// ---------------------------------------------------------------------------
// Partenaires (page Partenaires)
// ---------------------------------------------------------------------------
/** [nom, type, pied de page, adresse, logo?, ancien nom (identifiant de la maquette)] */
const PARTENAIRES = [
  ['Ville d’Yverdon-les-Bains', 'institution', true, 'https://www.yverdon-les-bains.ch', WIX('3875d2_b4c7fda33a1b4a8993d7ab26ca80e01c~mv2.png', 500, 150)],
  ['Canton de Vaud', 'institution', true, 'https://www.vd.ch', WIX('bd258f_b2749efe7210469d9956e505f0e390c6~mv2.jpg', 224, 108)],
  ['Loterie Romande', 'institution', true, 'https://www.entraide.ch'],
  ['Banque Cantonale Vaudoise', 'partenaire', true, 'https://www.bcv.ch', WIX('3875d2_7c8a1121eed9482e887e7caca3cf3f80~mv2.png', 1181, 335)],
  ['Infomaniak', 'partenaire', false, 'https://www.infomaniak.com', WIX('3875d2_d632240eda31440093fbc0a9527392b4~mv2.png', 606, 134)],
  ['Payot Libraire', 'partenaire', false, 'https://www.payot.ch', WIX('3875d2_7215226fa8bc4813a1dc08a1f1f04bd8~mv2.png', 1233, 315)],
  ['La Semeuse', 'partenaire', false, 'https://www.lasemeuse.ch', WIX('3875d2_308d577b324f4ebf8e8282e671bfd0a1~mv2.jpg', 1122, 913)],
  ['L’Echandole', 'culturel', false, 'https://www.echandole.ch', WIX('bd258f_d464ab340f32464ea948f4b9ebe4d20f~mv2.jpg', 284, 104), 'Théâtre de L’Echandole'],
  ['Ecoute Voir', 'culturel', false, 'https://www.ecoute-voir.org', WIX('bd258f_698a9db8243746ab882d9a13c84dbdd4~mv2.jpg', 244, 136)],
  ['Centre d’art contemporain Yverdon (CACY)', 'culturel', false, 'https://www.centre-art-yverdon.ch', null, 'Centre d’art contemporain Yverdon'],
  ['Les Ami·es du TBB', 'culturel', false, '/amis', WIX('bd258f_6a544b3e0f4540cca43904cbd5c8e086~mv2.jpg', 146, 148)],
  ['La Dérivée', 'culturel', false, 'https://www.laderivee.ch'],
  ['Le Castrum', 'culturel', false, 'https://www.le-castrum.ch'],
  ['Nova Jazz', 'culturel', false, 'https://www.novajazz.ch', WIX('3875d2_7e3430afb5ea4c758f9cda41c13ace46~mv2.jpg', 1417, 824)],
  ['Fête de la Danse Yverdon-les-Bains', 'culturel', false, 'https://www.fetedeladanse.ch', WIX('bd258f_077bab81b7784c498a86b463a787d062~mv2.jpg', 1304, 374)],
  ['Le Nord Vaudois', 'media', false, 'https://www.lenordvaudois.ch', WIX('bd258f_22a2e00686da4807bbc0f85c2ee5fbc4~mv2.jpg', 1700, 252), 'La Région Nord vaudois'],
  ['GRRIF', 'media', false, 'https://www.grrif.ch', WIX('bd258f_6f53b061e2dd48f19923a6cee892332d~mv2.jpg', 248, 98)],
  ['L’Agenda, la revue culturelle de l’arc lémanique', 'media', false, 'https://www.l-agenda.ch'],
  ['Comedien.ch', 'media', false, 'https://www.comedien.ch'],
  ['Sept.info', 'media', false, 'https://www.sept.info'],
  ['leprogramme.ch', 'media', false, 'https://www.leprogramme.ch'],
  ['Cornaz impressions – emballages SA', 'prestataire', false, ''],
  ['Atelier Kinkin', 'prestataire', false, '', WIX('bd258f_194e5f9c6332400896b53c6463aed3e4~mv2.jpg', 200, 138)],
  ['Grobet Publicité Sàrl', 'prestataire', false, ''],
  ['Hyperson', 'prestataire', false, ''],
  ['Flash Sound Sàrl', 'prestataire', false, ''],
  ['Hôtel du Théâtre', 'prestataire', false, ''],
  ['Hôtel de La Source', 'prestataire', false, ''],
  ['Restaurant La Grange Da Antonio', 'prestataire', false, 'https://www.resto-lagrange.ch', WIX('bd258f_d72d0dd029d74c4ab676cb13214ea997~mv2.jpg', 192, 152)],
  ['Restaurant Le bøtanik La Ferme', 'prestataire', false, ''],
  ['Boulangerie du Château, chez Sil', 'prestataire', false, ''],
]

export function ajouterPartenaires({ajouter, imageWix}) {
  PARTENAIRES.forEach(([nom, type, piedDePage, url, logo, ancien], i) => {
    ajouter((img) => ({
      _id: `partenaire-${cle(ancien ?? nom)}`,
      _type: 'partenaire',
      nom,
      type,
      piedDePage,
      ...(url ? {url} : {}),
      ...(logo ? {logo: img(imageWix(logo, {extra: {alt: `Logo ${nom}`}}))} : {}),
      ordre: (i + 1) * 10,
    }))
  })
}

// ---------------------------------------------------------------------------
// Grands rendez-vous de la saison, et événements des saisons passées
// ---------------------------------------------------------------------------
const lienSimple = (titre, url, prefixe) => ({_type: 'lien', _key: cle(prefixe, titre), titre, url})

const RENDEZ_VOUS = [
  {
    id: 'rendez-vous-cacy-2026', titre: 'Centre d’art contemporain Yverdon (CACY)', categorie: 'exposition', debut: '2026-06-01', fin: '2026-08-31', periode: 'Été 2026', lieu: 'Escaliers du TBB',
    texte: ['Chaque année depuis 2015, le TBB est très fier de se joindre aux activités du CACY en mettant à disposition une de ses parois intérieures pour accueillir l’œuvre inédite d’un artiste. Cette saison, en collaboration avec le CACY, le TBB a choisi d’occuper l’espace des escaliers avec une œuvre du photographe Matthieu Croizier.'],
    liens: [['www.centre-art-yverdon.ch', 'https://www.centre-art-yverdon.ch']],
  },
  {
    id: 'rendez-vous-la-derivee-2026', titre: 'La Dérivée', categorie: 'festival', debut: '2026-06-05', fin: '2026-08-15', organisateur: 'Association ICI', lieu: 'Quai de Nogent, Parc des Rives',
    texte: ['La Dérivée est un projet participatif et durable porté par l’association ICI. C’est un lieu éphémère sur le quai Nogent au Parc des Rives, qui propose plus de 200 activités aussi bien culturelles que sportives, dans un esprit de cohésion sociale. Plateforme pour des groupes de musique, elle organise aussi des conférences, des ateliers ou des bals pour offrir un lieu de divertissement et de rencontre unique pendant l’été à Yverdon-les-Bains.'],
    liens: [['www.laderivee.ch', 'https://www.laderivee.ch']],
    spectacles: ['les-aventures-de-nasreddine'],
  },
  {
    id: 'rendez-vous-le-castrum-2026', titre: 'Festival Le Castrum', categorie: 'festival', debut: '2026-08-06', fin: '2026-08-09', lieu: 'Yverdon-les-Bains',
    texte: ['Festival pluridisciplinaire et participatif, le Castrum a lieu au cœur de la Ville d’Yverdon-les-Bains depuis 1979. Le festival poursuit sa mission de faire rayonner la culture au sein même de la cité dans une atmosphère festive et conviviale.'],
    liens: [['www.le-castrum.ch', 'https://www.le-castrum.ch']],
    spectacles: ['insan', 'glorious-bodies'],
  },
  {
    id: 'rendez-vous-nova-jazz-2027', titre: 'Nova Jazz', categorie: 'festival', debut: '2027-01-28', fin: '2027-01-31', lieu: 'Yverdon-les-Bains et au TBB',
    texte: ['Créé à l’aube de l’année 2014, le label Nova Jazz a pour but la promotion du jazz actuel dans la région du Nord vaudois. En partenariat avec différents lieux et associations, il propose une programmation régulière et de qualité de concerts de jazz et offre une scène tant à des projets émergents qu’à des artistes confirmés. Cette édition, le thème du festival sera consacré à l’Ukraine, avec LELÉKA comme tête d’affiche au TBB, ainsi que l’HEMU Jazz Orchestra featuring DZ’OB, le samedi 30 janvier 2027.'],
    liens: [['www.novajazz.ch', 'https://www.novajazz.ch']],
    spectacles: ['nova-jazz', 'dakhabrakha'],
  },
  {
    id: 'rendez-vous-fete-de-la-danse-2027', titre: 'Fête de la Danse', categorie: 'festival', debut: '2027-05-21', fin: '2027-05-23', organisateur: 'Reso – Réseau Danse Suisse', lieu: 'Yverdon-les-Bains',
    texte: ['La Fête de la Danse – le plus grand projet de Reso – est un projet de sensibilisation à la danse professionnelle et à la diversité de la danse. Elle offre chaque printemps à un large public un accès ludique et actif à cette discipline et particulièrement à sa pratique professionnelle. Avec ses projets nationaux, elle contribue par ailleurs à faciliter les échanges et renforce ainsi les liens culturels entre les différentes régions participantes.'],
    liens: [['www.fetedeladanse.ch', 'https://www.fetedeladanse.ch']],
  },
  {
    id: 'rendez-vous-shiiink-2027', titre: 'Shiiink – Festival d’improvisation théâtrale', categorie: 'festival', debut: '2027-05-27', fin: '2027-05-30', organisateur: 'Cie du Cachot', lieu: 'Yverdon-les-Bains',
    texte: ['Depuis 2010, la Cie du Cachot organise chaque année un festival d’improvisation théâtrale à Yverdon-les-Bains. La programmation est le fruit d’une carte blanche attribuée par le Théâtre L’Echandole, théâtre qui coproduit et participe activement à l’organisation de cet événement.'],
    liens: [['www.compagnieducachot.ch', 'https://www.compagnieducachot.ch'], ['www.echandole.ch', 'https://www.echandole.ch']],
  },
  // Les pages événementielles encore en ligne sur l'ancien site.
  {
    id: 'rendez-vous-presentation-saison-26-27', titre: 'Soirée de présentation de la saison 26–27', categorie: 'evenement', debut: '2026-06-16', lieu: 'Grande Salle', slug: 'presentation-saison-26-27',
    texte: ['Mardi 16 juin, à 19h dans la Grande Salle : la nouvelle saison présentée par l’équipe du TBB, suivie d’un verre de l’amitié. La soirée de présentation est complète.', 'La mise en vente des billets a commencé le mercredi 17 juin, à 12h.'],
    horaires: [['2026-06-16', '19:00', 'Présentation de la saison']],
    prix: 'Entrée libre, sur inscription',
  },
  {
    id: 'rendez-vous-numerik-games-2023', titre: 'Numerik Games Festival', categorie: 'festival', debut: '2023-08-25', fin: '2023-08-27', lieu: 'Yverdon-les-Bains et au TBB', slug: 'numerik-games-festival-2023',
    texte: ['Festival des cultures numériques d’Yverdon-les-Bains : spectacles, installations et jeux, dont Verba Shadow et Ars Ludendi au TBB.'],
    liens: [['www.numerik-games.ch', 'https://www.numerik-games.ch']],
  },
  {
    id: 'rendez-vous-expo-werner-strub-2023', titre: 'Exposition des masques de Werner Strub', categorie: 'exposition', debut: '2023-08-14', fin: '2023-09-10', lieu: 'Foyer du TBB', slug: 'exposition-masques-werner-strub',
    texte: ['Les masques de Werner Strub, compagnon de route de Benno Besson, exposés au foyer du théâtre, avec un vernissage et des visites.'],
  },
  {
    id: 'rendez-vous-jep-2023', titre: 'Journées européennes du patrimoine', categorie: 'visite', debut: '2023-09-09', fin: '2023-09-10', lieu: 'Théâtre Benno Besson', slug: 'journees-du-patrimoine-2023',
    texte: ['Visites guidées du théâtre, de la salle à l’italienne aux coulisses, pour les Journées européennes du patrimoine.'],
    prix: 'Gratuit, sur inscription',
  },
  {
    id: 'rendez-vous-centenaire-benno-besson-2022', titre: 'Centenaire Benno Besson', categorie: 'evenement', debut: '2022-11-04', fin: '2022-11-04', periode: '2022', lieu: 'Yverdon-les-Bains', slug: 'centenaire-benno-besson',
    texte: [
      'Benno Besson, un artiste suisse pour un théâtre européen. Né à Yverdon-les-Bains en 1922, il fonde à 18 ans une troupe de théâtre amateur, rejoint Brecht au Berliner Ensemble en 1949, dirige la Comédie de Genève à partir de 1982 et y monte L’Oiseau vert.',
      'En 2022, Yverdon-les-Bains et le théâtre qui porte son nom ont célébré le centième anniversaire de sa naissance.',
    ],
  },
]

export function ajouterRendezVous({ajouter}, slugsSpectacles) {
  for (const r of RENDEZ_VOUS) {
    const {id, texte, liens, spectacles, horaires, slug, ...champs} = r
    ajouter(() => ({
      _id: id,
      _type: 'rendezVous',
      ...champs,
      texte: blocs(texte, id),
      ...(liens ? {liens: liens.map(([titre, url]) => lienSimple(titre, url, id))} : {}),
      ...(horaires ? {horaires: horaires.map(([date, heure, precision], i) => ({_key: cle(id, 'h', i), _type: 'horaire', dateHeure: `${date}T${heure}:00+02:00`, precision}))} : {}),
      ...(spectacles ? {spectacles: spectacles.filter((s) => slugsSpectacles.has(s)).map((s) => ({...ref(`spectacle-${s}`), _key: cle(id, s)}))} : {}),
      slug: {_type: 'slug', current: slug ?? id.replace(/^rendez-vous-/, '')},
    }))
  }
}

