/*
 * L'accueil et toutes les pages du site, avec les textes du site actuel
 * (relevé du 18 octobre 2026). Les adresses reprennent celles de l'ancien site.
 */
import {blocs, cle, ref} from './outils.mjs'

const PDF = (fichier) => `https://www.theatrebennobesson.ch/_files/ugd/${fichier}.pdf`

export const lien = (titre, cible, prefixe) => ({
  _type: 'lien',
  _key: cle(prefixe, titre),
  titre,
  ...(cible.startsWith('page-') ? {page: ref(cible)} : {url: cible}),
})
const section = (type, champs, prefixe) => ({_type: type, _key: cle(prefixe, type, champs.titre || champs.surtitre || champs.ancre || ''), ...champs})
const bloc = (titre, texte, prefixe, extra = {}) => ({_type: 'blocInfo', _key: cle(prefixe, titre), titre, ...(texte ? {texte} : {}), ...extra})
const element = (prefixe, champs) => ({_type: 'elementListe', _key: cle(prefixe, champs.titre, champs.surtitre ?? ''), ...champs})
const bouton = (titre, url) => ({_type: 'bouton', titre, url})

export function ajouterPages(recueil) {
  const {ajouter, image, imageWix, fichier} = recueil
  const document = (titre, url, prefixe, description) => (img) => ({
    _type: 'fichier',
    _key: cle(prefixe, titre),
    titre,
    ...(/theatrebennobesson\.ch\/_files|wixstatic\.com\/ugd/.test(url) ? {fichier: img(fichier(url))} : {url}),
    ...(description ? {description} : {}),
  })
  const page = (id, slug, titre, intro, sections, extra = () => ({})) =>
    ajouter((img) => ({_id: id, _type: 'page', titre, slug: {_type: 'slug', current: slug}, ...(intro ? {intro} : {}), ...extra(img), sections: sections(img)}))

  // -------------------------------------------------------------------------
  // Accueil : la mise en page de la maquette, avec le spectacle à la une du site.
  // -------------------------------------------------------------------------
  const besson = image('theatre/benno-besson.jpg', {type: 'imageLegendee', palette: '#4e554f', extra: {legende: 'Benno Besson (1922–2006), né à Yverdon-les-Bains.', alt: 'Portrait de Benno Besson, cigarette à la main'}})
  ajouter((img) => ({
    _id: 'accueil',
    _type: 'accueil',
    aLaffiche: [{...ref('spectacle-choices'), _key: cle('accueil', 'choices')}],
    sections: [
      section('sectionAgenda', {surtitre: 'Les prochaines dates', titre: 'Prochainement', nombre: 7, ancre: 'prochainement'}, 'acc'),
      section('sectionAffiches', {surtitre: 'Théâtre, danse, humour, musique, jeune public', titre: 'La saison en affiches', filtres: true, nombre: 8, ancre: 'affiches'}, 'acc'),
      section('sectionTarifs', {
        surtitre: 'Une place au TBB, Grande Salle',
        titre: 'Pour toutes et tous',
        grille: ref('tarifs-grande-salle'),
        notes: [
          {_type: 'noteTarif', _key: cle('acc', 'n1'), titre: 'Midi théâtre', texte: 'Six spectacles d’une heure avec repas, à 12h15 en Salle 1 au premier étage. Prix unique CHF 35.–.', lien: lien('Le Midi théâtre', 'page-midi-theatre', 'acc-n1')},
          {_type: 'noteTarif', _key: cle('acc', 'n2'), titre: 'Afterwork 18h', texte: 'Swiss Maker et Lionel Frésard rencontre Royale Cattin se jouent aussi à 18h, en sortant du travail.'},
          {_type: 'noteTarif', _key: cle('acc', 'n3'), titre: 'Pass Solo', texte: 'CHF 30.– pour la saison : CHF 5.– de moins sur chaque billet plein tarif ou tarif réduit.', lien: lien('Tarifs et pass', '/billetterie#tarifs', 'acc-n3')},
        ],
      }, 'acc'),
      section('sectionAffiches', {surtitre: 'Avec le Théâtre de L’Echandole', titre: 'Jeune public', texte: '2 théâtres, 11 spectacles, 1 billetterie. Dès 4 ans, en famille ou avec l’école.', genre: 'jeune-public', nombre: 5}, 'acc-jp'),
      section('sectionCitation', {
        surtitre: 'Le théâtre',
        citation: 'Le théâtre n’a pas de sens si ce n’est un plaisir, un plaisir à la vie.',
        auteur: 'Benno Besson',
        portrait: img(besson),
        texte: 'Il découvre Brecht au Schauspielhaus de Zurich, le suit au Berliner Ensemble, puis dirige la Comédie de Genève. Le théâtre de sa ville porte son nom depuis 1998.',
        reperes: [
          {_type: 'repere', _key: cle('acc', 'r1'), chiffre: '1898', texte: 'Le Casino d’Yverdon ouvre ses portes : bals, soirées et sociétés locales.'},
          {_type: 'repere', _key: cle('acc', 'r2'), chiffre: '460', texte: 'places dans une salle à l’italienne, derrière les trois arches de la façade.'},
          {_type: 'repere', _key: cle('acc', 'r3'), chiffre: '150 m', texte: 'de la gare CFF, sur la place piétonne, avec terrasse au rez-de-chaussée.'},
        ],
        lien: lien('L’histoire du théâtre', 'page-le-theatre', 'acc-cit'),
        style: 'portrait',
      }, 'acc'),
      section('sectionRendezVous', {surtitre: 'À Yverdon-les-Bains', titre: 'Les grands rendez-vous de la saison', categories: ['festival'], ancre: 'rendez-vous'}, 'acc'),
      section('sectionAcces', {surtitre: 'Infos pratiques', titre: 'Venir au TBB', ancre: 'venir'}, 'acc'),
      section('sectionLettre', {titre: 'La lettre du TBB', texte: 'Les spectacles à venir, les dernières places et les bords de scène, directement dans votre boîte.'}, 'acc'),
    ],
  }))

  // -------------------------------------------------------------------------
  // Saison : spectacles passés, archives, grands rendez-vous, Midi théâtre
  // -------------------------------------------------------------------------
  page('page-spectacles-passes', 'spectacles-passes', 'Spectacles passés', 'Les spectacles de la saison qui nous ont déjà ravis au TBB.', () => [
    section('sectionAffiches', {titre: 'Déjà joués cette saison', quand: 'passes', nombre: 60}, 'passes'),
    section('sectionAppel', {titre: 'Et la suite ?', texte: 'Tous les spectacles à venir de la saison, à réserver en ligne.', bouton: bouton('Toute la saison', '/programme'), fond: 'vert'}, 'passes'),
  ])

  page('page-archives', 'archives', 'Archives', 'Les saisons passées du Théâtre Benno Besson, de la plus récente à la plus ancienne.', () => [
    section('sectionArchives', {titre: 'Les saisons précédentes'}, 'arch'),
    section('sectionRendezVous', {surtitre: 'Événements', titre: 'Festivals, expositions et fêtes', categories: ['evenement', 'exposition', 'visite'], inclurePasses: true}, 'arch'),
  ])

  page('page-rendez-vous', 'rendez-vous-de-la-saison', 'Les grands rendez-vous de la saison', 'Festivals, expositions et fêtes à Yverdon-les-Bains, avec le TBB ou ses voisins.', () => [
    section('sectionRendezVous', {titre: 'Saison 26–27', categories: ['festival', 'exposition', 'evenement'], inclurePasses: true}, 'rdv'),
  ])

  page('page-midi-theatre', 'midi-theatre', 'Midi théâtre', 'Six spectacles d’une heure, avec un repas, pendant la pause de midi.', () => [
    section('sectionTexte', {
      chapo: 'Une heure de théâtre et un repas, à 12h15 en Salle 1 : on y vient du bureau, on repart à l’heure.',
      texte: blocs([
        'Le Midi théâtre est un réseau de théâtres romands qui créent et font tourner, chaque saison, de courtes pièces à voir pendant la pause de midi. Le TBB en fait partie depuis 2012.',
        'Prix unique CHF 35.–, repas compris (places limitées). Le Pass Solo ne s’applique pas au Midi théâtre. Certains spectacles se jouent aussi en afterwork, à 18h.',
        'La Salle 1 est au premier étage : un monte-personne en garantit l’accès. Venez un peu en avance, ou prenez rendez-vous avec la billetterie.',
      ], 'midi-texte'),
    }, 'midi'),
    section('sectionAffiches', {titre: 'Les Midi théâtre de la saison', etiquette: 'midi-theatre', nombre: 12, quand: 'tous'}, 'midi'),
  ])

  // -------------------------------------------------------------------------
  // Billetterie
  // -------------------------------------------------------------------------
  const boutique = 'https://infomaniak.events/fr-ch/shop/tbb-2026-2027-SHAF7H8MML'
  page('page-billetterie', 'billetterie', 'La billetterie', 'Réservations et horaires, tarifs, pass, bon cadeau et échange de billets.', (img) => [
    section('sectionAvis', {titre: 'À savoir'}, 'bil'),
    section('sectionInfos', {titre: 'Réservations et horaires', ancre: 'reservations', blocs: [
      bloc('En ligne 24/24', 'Paiement sécurisé par cartes bancaires, PostFinance et TWINT. Les billets peuvent être présentés sur votre smartphone à l’entrée du spectacle, ou être imprimés à la maison.', 'bil', {lien: lien('Billetterie en ligne', boutique, 'bil-ligne')}),
      bloc('À la billetterie ou par téléphone', 'Rue du Casino 9, 1400 Yverdon-les-Bains\n+41 24 423 65 84\nbilletterie@yverdon-les-bains.ch', 'bil', {note: 'Horaires ci-dessous. La billetterie est aussi ouverte 1h avant chaque spectacle.'}),
      bloc('Horaires d’ouverture', 'Mardi 10h00 – 12h00 et 13h30 – 15h30\nJeudi 13h30 – 15h30\nVendredi 13h30 – 15h30', 'bil', {note: 'Durant les vacances scolaires, horaires spéciaux ou fermetures.'}),
    ]}, 'bil'),
    section('sectionDocuments', {surtitre: 'Besoin d’aide ?', titre: 'Marches à suivre', texte: 'Pour acheter un billet ou un Pass TBB en ligne, pas à pas.', documents: [
      document('Acheter des billets individuels', PDF('3875d2_9f95f0de02f54c4d92335df7a68287f5'), 'bil-doc')(img),
      document('Acheter un Pass Solo', PDF('3875d2_ee0d2d511a374bfea902bd72b1a4ab30'), 'bil-doc')(img),
      document('Ajouter un billet', PDF('3875d2_1f3caf428f2745429b2774715d9c92ec'), 'bil-doc')(img),
    ]}, 'bil'),
    section('sectionTarifs', {surtitre: 'Grande Salle, la plupart des spectacles', titre: 'Tarifs', ancre: 'tarifs', grille: ref('tarifs-grande-salle'), texte: 'Chaque spectacle a ses prix, indiqués sur sa page.', notes: [
      {_type: 'noteTarif', _key: cle('bil', 'n1'), titre: 'CarteCulture (Caritas)', texte: 'Tarif unique adulte CHF 20.–, moins de 16 ans CHF 10.–.'},
      {_type: 'noteTarif', _key: cle('bil', 'n2'), titre: 'Passculture', texte: 'Apprenti·es, gymnase, école professionnelle ou de la transition : tarif unique CHF 5.– sur tous les spectacles.'},
      {_type: 'noteTarif', _key: cle('bil', 'n3'), titre: 'Professionnel·les du spectacle', texte: 'Artos, SSRS, SSA, étudiant·es en écoles de théâtre, comédien·nes, musicien·nes : tarif unique CHF 15.–.'},
      {_type: 'noteTarif', _key: cle('bil', 'n4'), titre: 'Accompagnant·e', texte: 'Le billet de la personne qui accompagne un·e spectateur·ice en fauteuil roulant est offert.'},
    ]}, 'bil'),
    section('sectionFormules', {surtitre: 'Pour toute la saison', titre: 'Pass et réductions', ancre: 'pass', formules: [
      {_type: 'formule', _key: cle('bil', 'f1'), nom: 'Pass Solo', prix: '30', periode: 'par saison', texte: 'Nominatif, valable pour une personne : CHF 5.– de réduction sur chaque billet plein tarif et tarif réduit. Toute la saison, sauf Midi théâtre, Jeune public, CLY, concerts Nova Jazz et hors saison.', bouton: bouton('Acheter', `${boutique}/abo/5802729`)},
      {_type: 'formule', _key: cle('bil', 'f2'), nom: 'Autres réductions', prix: '', periode: 'en ligne et à la billetterie', texte: 'CarteCulture, Passculture, professionnel·les du spectacle : les tarifs ci-dessus.', bouton: bouton('Acheter', `${boutique}/abo/5802731`)},
    ]}, 'bil'),
    section('sectionTexte', {surtitre: 'Offrez du théâtre !', titre: 'Bon cadeau', ancre: 'bon-cadeau', chapo: 'Envie de faire un cadeau 100% recyclable ? Les émotions, ça reste.',
      texte: blocs(['Pétillant et festif, le joli Bon Cadeau du TBB est valable un an. Vous choisissez le montant et la personne s’en sert quand elle le souhaite pour payer ses spectacles en ligne ou au guichet.'], 'bil-cadeau'),
      image: img(imageWix({id: 'bd258f_16dd940654ff4e87b47fa3b8e465c115~mv2.jpg', l: 1002, h: 690}, {type: 'imageLegendee', extra: {alt: 'Le bon cadeau du TBB, saison 26–27'}})),
    }, 'bil'),
    section('sectionAppel', {titre: 'Acheter un bon cadeau', texte: 'En ligne, dans la boutique de la saison, ou au guichet.', bouton: bouton('Bon cadeau', boutique), fond: 'vert'}, 'bil-cadeau'),
    section('sectionTexte', {titre: 'Échange de billets', ancre: 'echange',
      texte: blocs([
        'Grâce à votre compte client, il vous est possible d’échanger vos billets pour un montant égal ou supérieur à votre commande, dans le cas où vous souhaitez changer de date de représentation pour un même spectacle, ou si vous êtes en possession de billets pour un événement qui est annulé.',
      ], 'bil-echange'),
    }, 'bil'),
    section('sectionDocuments', {titre: 'Comment échanger vos billets en ligne', documents: [document('Échanger ses billets en ligne', PDF('3875d2_1dc2d4d2a41248718c09bc07f2d22393'), 'bil-ech')(img)]}, 'bil-ech'),
    section('sectionFaq', {titre: 'Conditions', ancre: 'conditions', questions: [
      {_type: 'question', _key: cle('bil', 'q1'), question: 'Quand la billetterie est-elle ouverte le soir ?', reponse: 'La billetterie est ouverte 1h avant chaque spectacle.'},
      {_type: 'question', _key: cle('bil', 'q2'), question: 'Et pendant les vacances scolaires ?', reponse: 'Horaires spéciaux ou fermetures : ils sont annoncés en haut de cette page.'},
      {_type: 'question', _key: cle('bil', 'q3'), question: 'J’ai réservé par téléphone : que dois-je faire ?', reponse: 'Les billets réservés par téléphone doivent être retirés et réglés dans les 10 jours, sous peine d’annulation de la commande sans préavis.'},
      {_type: 'question', _key: cle('bil', 'q4'), question: 'Les billets sont-ils remboursés ?', reponse: 'Non, mais ils peuvent être échangés depuis votre compte client pour une autre date du même spectacle, ou si l’événement est annulé (voir « Échange de billets »).'},
      {_type: 'question', _key: cle('bil', 'q5'), question: 'Et si j’arrive en retard ?', reponse: 'Le spectacle commence à l’heure indiquée sur le billet. Les personnes retardataires n’auront pas accès à la salle. Aucun remboursement ni échange en cas de retard.'},
      {_type: 'question', _key: cle('bil', 'q6'), question: 'Je suis peu à l’aise avec l’informatique.', reponse: 'Appelez la billetterie au 024 423 65 84 : elle vous aide à acheter vos pass et billets. Des permanences sont aussi organisées avant l’ouverture de la saison.'},
    ]}, 'bil'),
  ])

  // -------------------------------------------------------------------------
  // Le théâtre : Histoire, Équipe, Technique, Partenaires, Presse
  // -------------------------------------------------------------------------
  const etapes = [
    ['1898', 'Le Casino', 'Yverdon inaugure son Casino néo-baroque, avec ses dômes d’ardoise et ses trois grandes baies. On y danse, on y donne des concerts et les soirées des sociétés locales.', 'theatre/casino-1898.jpg', 'Le Casino d’Yverdon vers 1900, carte postale ancienne'],
    ['1922', 'Naissance de Benno Besson', 'Né à Yverdon-les-Bains, il fonde à 18 ans une troupe de théâtre amateur. En 1942, il part étudier les lettres à l’Université de Zurich.', null],
    ['1949', 'Le Berliner Ensemble', 'Au Schauspielhaus de Zurich, il assiste à la création des œuvres de Brecht, qu’il rencontre en 1947. En 1949, Brecht l’engage au Berliner Ensemble comme comédien et assistant metteur en scène.', null],
    ['1982', 'L’Oiseau vert', 'Après le Deutsches Theater, la Volksbühne et trois spectacles au Festival d’Avignon, Besson dirige la Comédie de Genève, où son Oiseau vert rencontre un succès retentissant.', 'theatre/benno-besson.jpg', 'Benno Besson'],
    ['1998', 'Théâtre Benno Besson', 'Pour le centenaire du bâtiment, la grande salle de fête du Casino devient une salle de théâtre et prend le nom de l’enfant du pays.', 'theatre/carte-postale.jpg', 'Le Casino d’Yverdon sur une carte postale colorisée'],
    ['2020', 'La Salle 1', 'Le foyer du premier étage devient une deuxième salle d’une soixantaine de places, pour les petites formes et le Midi théâtre.', null],
  ]
  const galerie = [
    ['theatre/salle.jpg', 'La Grande Salle.', 'La Grande Salle vue du balcon, fauteuils rouges et arcs de la salle à l’italienne'],
    ['theatre/plateau-enfants.jpg', 'Vue depuis le plateau.', 'Deux enfants sur le plateau, face aux fauteuils rouges'],
    ['theatre/loge.jpg', 'Une loge.', 'Miroir de loge entouré d’ampoules'],
    ['theatre/silence.jpg', 'Côté coulisses.', 'Panneau Silence en coulisses'],
    ['theatre/gelatines.jpg', 'Les gélatines de la régie lumière.', 'Filtres de couleur pour les projecteurs'],
  ]
  const facade = image('theatre/n/facade.jpg', {palette: '#019e35', extra: {alt: 'La façade néo-baroque du théâtre et ses trois grandes baies cintrées', legende: 'La façade de la rue du Casino. Ses trois baies cintrées ont donné leur forme au logo.'}})
  const grbic = image('theatre/georges-grbic.jpg', {type: 'imageLegendee', extra: {legende: 'Georges Grbic, directeur', alt: 'Portrait de Georges Grbic'}})

  page('page-le-theatre', 'histoire', 'Le théâtre Benno Besson', 'Un casino de 1898, une salle à l’italienne, et le nom d’un enfant d’Yverdon devenu un maître du théâtre européen.', (img) => [
    section('sectionTexte', {
      chapo: 'Construit en 1898 sous le nom de Casino d’Yverdon-les-Bains et rebaptisé un siècle plus tard en hommage au grand homme de théâtre originaire du Nord vaudois, le TBB est une salle de spectacle d’envergure de la région et un théâtre de référence dans le canton.',
      texte: blocs([
        'Ce beau bâtiment néo-baroque a été plusieurs fois rénové avant de devenir, pour le centenaire de sa fondation, une salle de spectacle confortable de 460 places, nantie d’une âme qui ravit artistes et spectateurs. Dès 2020, le foyer du premier étage a été réaménagé en deuxième salle de spectacle destinée aux petites formes, pouvant accueillir une soixantaine de spectateurs. À 150 mètres de la gare, donnant sur une grande place piétonne et logeant une conviviale pizzeria avec terrasse au rez-de-chaussée, La Grange da Antonio, le TBB est un rendez-vous prisé des spectateurs de la région.',
        '## Un théâtre d’accueil et de création',
        'Après avoir abrité bals et soirées de sociétés locales, les saisons de ce théâtre municipal se sont de plus en plus structurées au long des trente dernières années sous les directions de Christiane Vincent (1981-1991), Pierre Bauer (1992-2012) et Thierry Luisier (2012-2017). Georges Grbic a repris la direction artistique du lieu et continue à proposer une programmation variée et de qualité.',
      ], 'th-texte'),
      image: img(grbic),
    }, 'th'),
    section('sectionCitation', {
      citation: 'Depuis ma nomination, j’entends poursuivre le travail de mes prédécesseurs en faisant du TBB un théâtre municipal de proximité, dont la programmation éclectique et relativement dense (une cinquantaine de propositions par saison) ne laisse personne au bord de la route : théâtre, humour, musique classique, danse, cirque, spectacles jeune public… Par ailleurs, conscient du développement toujours croissant en quantité et en qualité des arts de la scène en Suisse romande, je souhaite développer son rôle d’antenne pour la création contemporaine à l’échelle romande, tout en confirmant sa position de relai incontournable pour la diffusion de spectacles internationaux de renom.',
      auteur: 'Georges Grbic, 2018',
      style: 'portrait',
    }, 'th-grbic'),
    section('sectionFrise', {surtitre: 'De 1898 à aujourd’hui', titre: 'Histoire', ancre: 'histoire', etapes: etapes.map(([annee, titre, texte, chemin, alt], i) => ({
      _type: 'etape', _key: cle('th', 'e', i), annee, titre, texte,
      ...(chemin ? {image: img(image(chemin, {type: 'imageLegendee', extra: {alt}}))} : {}),
    }))}, 'th'),
    section('sectionEquipe', {titre: 'Biographies', ancre: 'biographies', groupes: ['direction'], biographies: true}, 'th-bio'),
    section('sectionTexte', {titre: 'Benno Besson', texte: blocs([
      'Né en 1922 à Yverdon-les-Bains, Benno Besson fonde à 18 ans une troupe de théâtre amateur. En 1942, il part étudier les lettres à l’Université de Zurich. Au Schauspielhaus, il assiste à la création des œuvres de Brecht qu’il rencontre en 1947. En 1949, Brecht l’engage au Berliner Ensemble, qui vient d’être créé, comme comédien et assistant metteur en scène. Là, Benno Besson est très impressionné par la formidable ouverture de Brecht et par la relecture qu’il fait des grands auteurs. C’est ainsi qu’il peut dire : « Pour mon compte, c’est du vivant de Brecht que je lui ai volé ce que je lui ai volé. »',
      'En 1958, deux ans après la mort de Brecht, il rejoint Wolfgang Langhoff au Deutsches Theater. Entre 1974 et 1978, il revient à la langue française et met en scène trois spectacles au Festival d’Avignon et, en 1982, il est appelé à diriger La Comédie de Genève, où il monte L’Oiseau Vert qui rencontre un succès retentissant. Pour lui, « le théâtre n’a pas de sens si ce n’est un plaisir, un plaisir à la vie. »',
    ], 'th-besson')}, 'th-besson'),
    section('sectionVideo', {titre: 'À voir', url: 'https://vimeo.com/129322454', legende: 'Benno Besson, metteur en scène, Plans-Fixes, 2002'}, 'th'),
    section('sectionGalerie', {surtitre: '460 places à l’italienne, dernière rénovation en 2015', titre: 'La salle', ancre: 'salle', images: galerie.map(([chemin, legende, alt], i) => ({
      _key: cle('th', 'g', i), ...img(image(chemin, {type: 'imageLegendee', extra: {legende, alt}})),
    }))}, 'th'),
    section('sectionDocuments', {titre: 'Images libres de droit', texte: 'Moyennant la mention du copyright intégral.', ancre: 'images', documents: [
      document('Logo du TBB', 'https://www.dropbox.com/sh/s6lwent9udu6nj9/AAAChwZ1E9frlhjPW6hPi3ada?dl=0', 'th-img', 'Dossier Dropbox')(img),
      document('Photos du théâtre en haute définition', 'https://www.dropbox.com/sh/x6r0rs58sykpcsm/AACK35HKloBW8t_dqfOSkDpia?dl=0', 'th-img', 'Dossier Dropbox')(img),
    ]}, 'th'),
  ], (img) => ({image: img(facade)}))

  page('page-equipe', 'equipe', 'Équipe et contacts', 'Les personnes qui font le TBB, et comment les joindre.', () => [
    section('sectionEquipe', {titre: 'L’équipe', groupes: ['direction', 'communication', 'billetterie', 'accueil', 'technique', 'prestataires', 'autres'], texte: 'Administration 024 423 65 80 · Billetterie 024 423 65 84 · Technique 024 423 65 86 · Communication 024 423 65 88'}, 'eq'),
    section('sectionAppel', {titre: 'Écrire au théâtre', texte: 'Une question, une demande particulière, recevoir le programme imprimé ? Le formulaire de contact est là pour ça.', bouton: bouton('Contact & accès', '/contact'), fond: 'vert'}, 'eq'),
  ])

  page('page-technique', 'technique', 'Technique', 'Équipes en tournée : retrouvez toutes les informations techniques ou pratiques ici.', () => [
    section('sectionLieux', {titre: 'Les salles', quels: 'theatre'}, 'tech'),
    section('sectionInfos', {titre: 'Contact technique', ancre: 'contact', blocs: [
      bloc('Horaires', 'Lundi à vendredi\n9h – 12h et 13h30 – 17h', 'tech'),
      bloc('Joindre la technique', 'tbbtechnique@yverdon-les-bains.ch\n+41 (0)24 423 65 86', 'tech', {note: 'Fiche technique et plans en DXF sur demande.'}),
      bloc('Direction technique', 'Julien Mayor', 'tech'),
    ]}, 'tech'),
  ])

  page('page-partenaires', 'partenaires', 'Partenaires', 'Le Théâtre Benno Besson remercie chaleureusement ses partenaires pour leur précieux soutien. Grâce à leurs contributions, la saison du TBB se décline dans de vastes directions artistiques de qualité.', () => [
    section('sectionPartenaires', {titre: 'Avec le soutien de', types: ['institution', 'partenaire']}, 'part-1'),
    section('sectionPartenaires', {titre: 'Partenaires culturels', types: ['culturel']}, 'part-2'),
    section('sectionPartenaires', {titre: 'Les médias culturels', texte: 'Un grand merci aux médias culturels qui suivent notre actualité et nous soutiennent.', types: ['media']}, 'part-3'),
    section('sectionPartenaires', {titre: 'Prestataires et commerces', types: ['prestataire']}, 'part-4'),
    section('sectionListe', {titre: 'Liens pratiques', elements: [
      element('part-l', {titre: 'Emoi', sousTitre: 'www.emoi.ch', lien: lien('www.emoi.ch', 'https://www.emoi.ch', 'part-l1')}),
      element('part-l', {titre: 'La Grange da Antonio', sousTitre: 'Restaurant-pizzeria, dans le même bâtiment', lien: lien('www.resto-lagrange.ch', 'https://www.resto-lagrange.ch', 'part-l2')}),
    ]}, 'part'),
  ])

  page('page-presse', 'presse', 'La presse en parle', 'Les échos du Théâtre Benno Besson dans les médias : articles de presse, radio, télévision.', () => [
    section('sectionPresse', {titre: 'Articles et émissions', nombre: 60}, 'presse'),
  ])

  // -------------------------------------------------------------------------
  // Infos pratiques, Contact
  // -------------------------------------------------------------------------
  page('page-infos-pratiques', 'infos-pratiques', 'Infos pratiques', 'Venir au théâtre, se restaurer, accessibilité.', () => [
    section('sectionAcces', {titre: 'Venir au théâtre', ancre: 'venir'}, 'ip'),
    section('sectionInfos', {titre: 'Se restaurer', ancre: 'restaurer', blocs: [
      bloc('La Grange da Antonio', 'Prendre un verre au bar ou déguster des mets italiens au restaurant-pizzeria, à côté du théâtre, dans le même bâtiment.', 'ip', {lien: lien('www.resto-lagrange.ch', 'https://www.resto-lagrange.ch', 'ip-grange')}),
      bloc('Le bøtanik', 'En face du théâtre : une petite carte de mets végétariens ou avec viandes et poissons, à base de produits frais, locaux et de saison, 100% suisses.', 'ip'),
    ]}, 'ip'),
    section('sectionTexte', {titre: 'Accessibilité', ancre: 'accessibilite', texte: blocs(['Le Théâtre Benno Besson est sensible à l’accessibilité des spectacles pour toutes et tous. Les actions d’inclusion et d’accessibilité sont actualisées au fil de la saison. Certains spectacles y sont présentés en FALC (langue facile à lire et à comprendre).'], 'ip-acc')}, 'ip'),
    section('sectionInfos', {titre: 'Confort d’accès et d’écoute', blocs: [
      bloc('Personnes en situation de handicap', 'Dans la Grande Salle, quelques places sont accessibles pour les personnes en chaise roulante. À réserver au préalable à la billetterie au 024 423 65 84 ou via billetterie@yverdon-les-bains.ch.', 'ip', {note: 'Le billet des accompagnant·es est offert.'}),
      bloc('Monte-personne', 'Les représentations de Midi théâtre ont lieu au premier étage, dans la Salle 1 : un monte-personne vous en garantit l’accès. Venez assez tôt, ou prenez rendez-vous au préalable avec la billetterie.', 'ip'),
      bloc('Personnes malentendantes', 'La Grande Salle est équipée d’une boucle magnétique et des appareils auditifs sont disponibles pour le prêt. Renseignements à la billetterie.', 'ip'),
    ]}, 'ip-acc'),
  ])

  page('page-contact', 'contact', 'Contact & accès', 'Une question ou une demande particulière ? Écrivez-nous, appelez ou passez au guichet. Au plaisir de vous accueillir prochainement.', (img) => [
    section('sectionContact', {
      titre: 'Contact',
      annuaire: [
        ['Administration', '', 'tbb@yverdon-les-bains.ch', '024 423 65 80'],
        ['Billetterie', 'Emmanuelle Macaluso-Pahud', 'billetterie@yverdon-les-bains.ch', '024 423 65 84'],
        ['Technique', 'Julien Mayor', 'tbb.technique@yverdon-les-bains.ch', '024 423 65 86'],
        ['Communication', 'Anicée Willemin', 'communication.bennobesson@yverdon-les-bains.ch', '024 423 65 88'],
        ['Proposer un spectacle', '', 'programmation@yverdon-les-bains.ch', ''],
        ['Inviter la direction', '', 'invitation@yverdon-les-bains.ch', ''],
        ['Écoles et médiation', 'Claudia Saldivia Vega', 'claudia.saldivia@yverdon-les-bains.ch', ''],
      ].map(([service, nom, email, telephone], i) => ({_type: 'contactService', _key: cle('ct', i), service, ...(nom ? {nom} : {}), ...(email ? {email} : {}), ...(telephone ? {telephone} : {})})),
      formulaire: true,
      sujets: ['Billetterie et réservations', 'Recevoir le programme imprimé', 'Proposer un spectacle', 'Presse', 'Écoles et médiation', 'Ami·es du TBB', 'Autre question'],
      confirmation: 'Merci, votre message est bien arrivé. Nous vous répondons rapidement.',
    }, 'ct'),
    section('sectionAcces', {surtitre: 'Théâtre Benno Besson, Rue du Casino 9, case postale 476, 1401 Yverdon-les-Bains', titre: 'Venir au TBB', ancre: 'venir'}, 'ct'),
    section('sectionDocuments', {titre: 'Plan du bâtiment', documents: [document('Plan d’accès du Théâtre Benno Besson', 'https://www.theatrebennobesson.ch/_files/ugd/bd258f_a6a8cc51313e4e21a61ef7cf219fa7ea.pdf', 'ct-plan')(img)]}, 'ct'),
  ])

  // -------------------------------------------------------------------------
  // Vous : Journalistes, Ami·es, Jeune public, Médiation, Professionnel·les
  // -------------------------------------------------------------------------
  page('page-journalistes', 'journalistes', 'Journalistes', 'Professionnel·les de la presse et des médias, retrouvez ici le dossier de presse de saison et toutes les informations dont vous avez besoin.', (img) => [
    section('sectionFaq', {titre: 'Vos questions', questions: [
      {_type: 'question', _key: cle('jo', 'q1'), question: 'Des informations sur un spectacle ?', reponse: 'Vous trouverez un dossier de presse et des images en haute définition libres de droit, à télécharger sur chaque page spectacle.'},
      {_type: 'question', _key: cle('jo', 'q2'), question: 'Des informations sur le Théâtre Benno Besson ?', reponse: 'Des textes et des images en haute définition libres de droit sont à télécharger sur la page consacrée à l’histoire du TBB.'},
      {_type: 'question', _key: cle('jo', 'q3'), question: 'Une rencontre avec un artiste ou le directeur Georges Grbic ?', reponse: 'N’hésitez pas à nous contacter !'},
    ]}, 'jo'),
    section('sectionDocuments', {titre: 'À télécharger', documents: [
      document('Affiche de la saison 26–27 en haute définition', 'https://www.theatrebennobesson.ch/_files/ugd/bd258f_9842d97e21ff4186a4e1bafd77390783.pdf', 'jo-doc')(img),
      document('Logo du TBB', 'https://www.dropbox.com/scl/fi/5es67dzyknhn3m2r6h9dy/swisstransfer_6ba3ee31-b47f-4f79-a741-9ab9a19aa0a4.zip?rlkey=n7bxzvzjyggj6301y73c88kus&st=gtexv581&dl=0', 'jo-doc', 'Archive ZIP')(img),
    ]}, 'jo'),
    section('sectionContact', {titre: 'Contact presse', annuaire: [{_type: 'contactService', _key: cle('jo', 'c'), service: 'Chargée de communication', nom: 'Anicée Willemin', email: 'communication.bennobesson@yverdon-les-bains.ch', telephone: '024 423 65 88'}], formulaire: false}, 'jo'),
    section('sectionPresse', {titre: 'La presse en parle', nombre: 8}, 'jo'),
  ])

  const amis = [
    ['3875d2_1ed37cd4f0cf49c8a85d2c77d74ef014~mv2.jpg', 2016, 1512, 'Salle 1, Théâtre Benno Besson, le 30 mars 2026', 'Les Ami·es du TBB avec Simon Romang'],
    ['3875d2_064e692b534445d3819352c798db63d5~mv2.jpg', 1512, 2016, 'Salle 1, Théâtre Benno Besson, le 30 mars 2026', 'Les Ami·es du TBB'],
    ['3875d2_bace9f70a2ef449aa83feb87bd4ac92f~mv2.jpg', 2016, 1512, 'Opéra de Lausanne, le 9 mars 2026', 'Les Ami·es du TBB à l’Opéra de Lausanne'],
    ['3875d2_33e5ea2cfd3a414392e0c4bcb079d629~mv2.jpg', 2016, 1512, 'Musée romain d’Avenches, le 28 septembre 2024', 'Les Ami·es du TBB à Avenches'],
    ['3875d2_20e32e661366409ba0cfe03ccd64088a~mv2.jpg', 2016, 1512, 'L’Heure bleue, La Chaux-de-Fonds, le 18 mars 2023', 'Les Ami·es du TBB à L’Heure bleue'],
    ['3875d2_8fb8d80dad714808a9acceac44c60327~mv2.jpg', 1512, 2016, 'La Salle de musique, La Chaux-de-Fonds, le 18 mars 2023', 'Les Ami·es du TBB à la Salle de musique'],
    ['3875d2_f26e76df0f434224ab69f703044f5e6d~mv2.jpg', 2048, 1536, 'Centre Dürrenmatt, Neuchâtel, le 18 novembre 2022', 'Visite du Centre Dürrenmatt'],
    ['3875d2_2eeb37ccd3654b77ba0e4c22ec51e559~mv2.jpg', 2048, 1536, 'Centre Dürrenmatt, Neuchâtel, le 18 novembre 2022', 'Visite du Centre Dürrenmatt'],
    ['3875d2_7a9a8f58e7a6469399bfab624a7ae480~mv2.jpg', 1024, 768, 'Centre Dürrenmatt, Neuchâtel, le 18 novembre 2022', 'Visite du Centre Dürrenmatt'],
  ]
  page('page-amis', 'amis', 'Association des Ami·es du TBB', 'Parce que c’est nous… parce que c’est vous !', (img) => [
    section('sectionTexte', {chapo: 'L’Association des Ami·es du TBB rassemble des personnes actives et passionnées qui ont à cœur de participer au rayonnement du théâtre et au développement de ses activités. S’impliquer, soutenir, participer, partager… Autant de mots clés pour définir cette belle amitié.'}, 'amis'),
    section('sectionListe', {titre: 'Être Ami·e du TBB', elements: [
      element('amis-av', {surtitre: 'Plusieurs fois par saison', titre: 'Assistez', texte: 'En primeur, à des répétitions de spectacles en création ou à des générales.'}),
      element('amis-av', {surtitre: 'Une fois par saison', titre: 'Découvrez', texte: 'En compagnie du directeur Georges Grbic, le théâtre et ses coulisses.'}),
      element('amis-av', {surtitre: 'Au mois de mai', titre: 'Participez', texte: 'À l’assemblée générale des Ami·es du TBB, suivie d’une rencontre festive.'}),
    ]}, 'amis'),
    section('sectionFormules', {titre: 'Adhérer', ancre: 'adherer', texte: 'Grâce à votre adhésion, vous apportez votre soutien à la diffusion et à la promotion des activités du TBB, et vous participez à la vie d’une institution phare de la Ville d’Yverdon-les-Bains. Profitez d’une priorité pour l’achat de l’Abonnement Général. Adhésion en ligne ou par téléphone au +41 24 423 65 80.', formules: [
      {_type: 'formule', _key: cle('amis', 'f1'), nom: 'Bon copain·ine', prix: '50', periode: 'par saison'},
      {_type: 'formule', _key: cle('amis', 'f2'), nom: 'Ami·e de longue date', prix: '150', periode: 'par saison'},
      {_type: 'formule', _key: cle('amis', 'f3'), nom: 'Ami·e pour la vie', prix: 'libre', periode: 'le montant de votre choix'},
    ], bouton: bouton('Envoyer mon adhésion', '/contact')}, 'amis'),
    section('sectionEquipe', {titre: 'Comité de l’AATBB', groupes: ['comite-amis']}, 'amis'),
    section('sectionTexte', {titre: 'Nos dernières activités', texte: blocs([
      'La dernière Assemblée générale des Ami·es du TBB s’est terminée par la visite amicale et gourmande de Simon Romang, qui nous a parlé de son dernier spectacle Planchette !',
      'Prochaines activités (dates à préciser) : visite du Théâtre de Carouge, rencontre avec la Cie Kokodyniack, conférence musicale. Devenez membre pour ne rien rater !',
    ], 'amis-act')}, 'amis'),
    section('sectionGalerie', {titre: 'En images', images: amis.map(([id, l, h, legende, alt], i) => ({_key: cle('amis', 'g', i), ...img(imageWix({id, l, h}, {type: 'imageLegendee', extra: {legende, alt}}))}))}, 'amis'),
  ])

  const echandole = [
    ['Théâtre d’objets', 'Boum Tschak', 'Compagnie Chamar bell clochette', 'Di 27 septembre 2026', 'dès 3 ans', null],
    ['Théâtre', 'La Tente', 'Les filles d’Artémis', 'Sa 31 octobre 2026', 'dès 5 ans', null],
    ['Théâtre', 'Dégueu', 'Compagnie Mokett', 'Sa 12 décembre 2026', 'dès 9 ans', null],
    ['Théâtre d’objets', 'Au fil du temps (variation 3)', 'Théâtre L’Articule', 'Di 24 janvier 2027', 'dès 4 ans', 'Les élèves de 3-4P d’Yverdon-les-Bains verront ce spectacle avec l’école.'],
    ['Théâtre d’improvisation', 'Autour du feu', 'Compagnie Prédüm', 'Di 21 février 2027', 'dès 6 ans', 'Les élèves de 5-6P d’Yverdon-les-Bains verront ce spectacle avec l’école.'],
    ['Théâtre d’objets', 'Bestiarium', 'Annina Mosimann', 'Di 25 avril 2027', 'dès 5 ans', null],
  ]
  page('page-jeune-public', 'jeune-public', 'Saison Jeune Public', '2 théâtres, 11 spectacles, 1 billetterie. Dès 3 ans, en famille ou avec l’école, avec le Théâtre de L’Echandole.', () => [
    section('sectionAffiches', {titre: 'Les spectacles du TBB', genre: 'jeune-public', nombre: 12, quand: 'tous'}, 'jp'),
    section('sectionListe', {surtitre: 'À L’Echandole', titre: 'Les spectacles de L’Echandole', elements: echandole.map(([genre, titre, cie, date, age, ecole]) => element('jp-ech', {surtitre: `${genre} · ${date}`, titre, sousTitre: `${cie} · ${age}`, ...(ecole ? {texte: ecole} : {})})), bouton: bouton('Programme détaillé de L’Echandole', 'https://www.echandole.ch')}, 'jp'),
    section('sectionTexte', {titre: 'Des ateliers et des rencontres', texte: blocs(['Au fil de la saison, avec les classes ou de manière extrascolaire, des ateliers et des rencontres sont organisés pour le jeune public. Dates à venir prochainement.'], 'jp-ateliers')}, 'jp'),
    section('sectionRendezVous', {titre: 'Les prochains ateliers', categories: ['atelier']}, 'jp'),
    section('sectionAppel', {titre: 'Envie d’aller plus loin ?', texte: 'Solliciter un bord plateau avec les artistes, mettre sur pied une visite du théâtre en compagnie du directeur, organiser un atelier dans vos classes ou au théâtre : tout est envisageable. N’hésitez pas à nous contacter pour en discuter !', bouton: bouton('Écrire à la médiation', '/contact'), fond: 'vert'}, 'jp'),
    section('sectionDocuments', {titre: 'Dossiers pédagogiques', texte: 'Retrouvez ici au fil de la saison les dossiers pédagogiques à télécharger pour préparer votre venue avec votre classe. Ils sont aussi sur la page de chaque spectacle.', documents: []}, 'jp'),
  ])

  page('page-mediation', 'mediation', 'Médiation', 'Médiation, personnes à mobilité réduite, aveugles ou malvoyantes, sourdes ou malentendantes : retrouvez toutes les informations dont vous avez besoin ici.', () => [
    section('sectionTexte', {titre: 'En partenariat avec Ecoute Voir', texte: blocs([
      'Le TBB favorise l’accessibilité autour de certains spectacles, en collaboration avec l’association Ecoute Voir. Cette dernière a pour mission de favoriser l’accès des spectacles vivants aux personnes en situation de handicap sensoriel : en organisant des activités sur mesure, en apportant un soutien aux lieux qui les accueillent, en constituant un pôle de sensibilisation et de conseils.',
    ], 'med-ev')}, 'med'),
    section('sectionAffiches', {titre: 'Personnes sourdes et malentendantes', texte: 'Le TBB met à votre disposition des appareils auditifs portables, disponibles sur demande à la billetterie avant le spectacle. Durant la saison 26–27, ces spectacles et concerts vous sont particulièrement recommandés.', etiquette: 'malentendants', nombre: 12, quand: 'tous'}, 'med-mal'),
    section('sectionAffiches', {titre: 'Spectateurs aveugles et malvoyants', etiquette: 'audiodescription', nombre: 12, quand: 'tous'}, 'med-av'),
    section('sectionTexte', {titre: 'Bord plateau', texte: blocs(['Après certains spectacles, les bords plateau offrent la possibilité d’engager une discussion libre et à chaud avec l’équipe artistique, dans la salle, à l’issue de la représentation. Entrée libre, sans réservation.'], 'med-bp')}, 'med'),
    section('sectionAffiches', {titre: 'Avec un bord de scène', etiquette: 'bord-de-scene', nombre: 12, quand: 'tous'}, 'med-bds'),
    section('sectionTexte', {titre: 'En marge', texte: blocs(['Des actions de médiation autour de certains spectacles vous sont proposées ponctuellement. Ces propositions font écho aux thématiques fortes comme aux sujets décalés afin de pouvoir les creuser, en débattre ou les aborder avec un regard différent. Les informations détaillées sont communiquées en temps voulu sur ce site et sur nos réseaux sociaux.'], 'med-marge')}, 'med'),
    section('sectionRendezVous', {titre: 'Rencontres et ateliers', categories: ['rencontre', 'atelier']}, 'med'),
  ])

  page('page-pro', 'pro', 'Professionnel·les', 'Saison 26–27 : vous souhaitez proposer votre spectacle ou votre production au TBB, ou nous inviter à découvrir votre travail ?', () => [
    section('sectionTexte', {surtitre: 'Mon spectacle au TBB !', titre: 'Avant de déposer votre proposition', chapo: 'Merci de lire les quelques informations importantes ci-dessous.'}, 'pro'),
    section('sectionListe', {elements: [
      element('pro', {titre: 'Nous inviter', texte: 'Pour nous inviter à une représentation ou une étape de travail, merci d’adresser un e-mail à invitation@yverdon-les-bains.ch.', lien: lien('invitation@yverdon-les-bains.ch', 'mailto:invitation@yverdon-les-bains.ch', 'pro-1')}),
      element('pro', {titre: 'Proposer un spectacle', texte: 'Pour nous adresser vos dossiers, propositions de spectacles et documents de promotion, merci d’adresser un e-mail à programmation@yverdon-les-bains.ch.', lien: lien('programmation@yverdon-les-bains.ch', 'mailto:programmation@yverdon-les-bains.ch', 'pro-2')}),
      element('pro', {titre: 'Notre ligne', texte: 'Le TBB est un théâtre communal qui accueille essentiellement des spectacles de théâtre, de danse, de cirque et de musique classique. Il met un accent sur le jeune public, en proposant une programmation pour les écoles d’Yverdon-les-Bains, en partenariat avec le Théâtre de L’Echandole.'}),
      element('pro', {titre: 'Notre public', texte: 'À travers une programmation généraliste, accessible et sensible, il propose à la population d’Yverdon-les-Bains et au public du Nord vaudois des spectacles rendant compte de la créativité des arts vivants en Suisse et en Europe.'}),
      element('pro', {titre: 'Coproductions et résidences', texte: 'Soutenu par le Canton de Vaud, le TBB peut également coproduire quelques productions vaudoises, et accueille en ses murs deux compagnies en résidence, actuellement la company Idem et la Cie Kokodyniack.'}),
      element('pro', {titre: 'Fiches techniques', texte: 'Les plans et informations techniques du TBB sont sur la page Technique.', lien: lien('Technique', 'page-technique', 'pro-6')}),
      element('pro', {titre: 'Et ensuite ?', texte: 'Les propositions sont nombreuses et nous ne pourrons certainement pas répondre à toutes. Si vous n’avez pas de réponse de notre part 3 mois après votre dépôt, il vous faut considérer votre proposition artistique comme déclinée. Merci de votre compréhension.'}),
    ]}, 'pro'),
  ])


}
