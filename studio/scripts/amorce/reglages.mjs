/*
 * Réglages du site : coordonnées, horaires de la billetterie, menu (cinq entrées et leurs
 * sous-rubriques), pied de page, réseaux et avis datés.
 */
import {cle} from './outils.mjs'
import {lien} from './pages.mjs'
import {BOUTIQUE} from './referentiels.mjs'

const entree = (titre, cible, sous = []) => ({...lien(titre, cible, 'menu'), ...(sous.length ? {sousLiens: sous.map(([t, c]) => lien(t, c, `menu-${titre}`))} : {})})

export function ajouterReglages({ajouter}) {
  ajouter(() => ({
    _id: 'reglages',
    _type: 'reglages',
    nom: 'Théâtre Benno Besson',
    rue: 'Rue du Casino 9',
    localite: '1400 Yverdon-les-Bains',
    casePostale: 'Case postale 476, 1401 Yverdon-les-Bains',
    telBilletterie: '024 423 65 84',
    emailBilletterie: 'billetterie@yverdon-les-bains.ch',
    telAdmin: '024 423 65 80',
    emailGeneral: 'tbb@yverdon-les-bains.ch',
    adresseSite: 'https://wearebrothers-ch.github.io/Theatre-',
    lienBilletterie: BOUTIQUE,
    horaires: [
      {_type: 'horaire', _key: cle('h1'), jours: 'Mardi', heures: '10h–12h et 13h30–15h30'},
      {_type: 'horaire', _key: cle('h2'), jours: 'Jeudi', heures: '13h30–15h30'},
      {_type: 'horaire', _key: cle('h3'), jours: 'Vendredi', heures: '13h30–15h30'},
    ],
    noteHoraires: 'et 1h avant chaque spectacle',
    accesTrain: 'À 3 minutes à pied de la gare CFF d’Yverdon-les-Bains.',
    accesBus: 'Lignes 604 et 605, arrêt Théâtre Benno Besson.',
    accesVoiture: 'Parking de l’Ancien-Stand, juste en face du théâtre, avec des places pour les véhicules de personnes à mobilité réduite.',
    accesRestaurer: 'Restaurant-pizzeria La Grange da Antonio, dans le même bâtiment. En face, le bøtanik propose une petite carte de produits frais, locaux et de saison.',
    lienPlan: 'https://www.google.com/maps/place/Benno+Besson/@46.779834,6.642209,15z/data=!4m5!3m4!1s0x0:0x2bee5710721f8915!8m2!3d46.779834!4d6.642209',
    // Les cinq entrées du site (Programme, Billetterie, Jeune public, Le théâtre, Contact),
    // avec les rubriques de l'ancien site rangées dessous.
    menu: [
      entree('Programme', '/programme', [
        ['Spectacles à venir', '/programme'],
        ['Spectacles passés', 'page-spectacles-passes'],
        ['Les grands rendez-vous', 'page-rendez-vous'],
        ['Midi théâtre', 'page-midi-theatre'],
        ['Archives', 'page-archives'],
      ]),
      entree('Billetterie', 'page-billetterie', [
        ['Réservations et horaires', '/billetterie#reservations'],
        ['Tarifs et pass', '/billetterie#tarifs'],
        ['Bon cadeau', '/billetterie#bon-cadeau'],
        ['Échange de billets', '/billetterie#echange'],
        ['Infos pratiques', 'page-infos-pratiques'],
      ]),
      entree('Jeune public', 'page-jeune-public', [
        ['Jeune public', 'page-jeune-public'],
        ['Médiation', 'page-mediation'],
      ]),
      entree('Le théâtre', 'page-le-theatre', [
        ['Histoire', 'page-le-theatre'],
        ['Équipe', 'page-equipe'],
        ['Technique', 'page-technique'],
        ['Partenaires', 'page-partenaires'],
        ['La presse en parle', 'page-presse'],
        ['Ami·es du TBB', 'page-amis'],
        ['Journalistes', 'page-journalistes'],
        ['Professionnel·les', 'page-pro'],
      ]),
      entree('Contact', 'page-contact'),
    ],
    // « Réserver » ouvre la boutique Infomaniak de la saison, comme sur le site actuel.
    boutonMenu: {_type: 'bouton', titre: 'Réserver', url: BOUTIQUE},
    colonnesPied: [
      {_type: 'colonne', _key: cle('p1'), titre: 'Le programme 26–27', liens: [lien('Spectacles à venir', '/programme', 'p1'), lien('Spectacles passés', 'page-spectacles-passes', 'p1'), lien('PDF du programme', 'https://www.theatrebennobesson.ch/_files/ugd/bd258f_b412fe0145d442e5bd9420b210d88263.pdf', 'p1'), lien('Archives', 'page-archives', 'p1'), lien('Les grands rendez-vous', 'page-rendez-vous', 'p1')]},
      {_type: 'colonne', _key: cle('p2'), titre: 'La billetterie', liens: [lien('Réservations et horaires', '/billetterie#reservations', 'p2'), lien('Tarifs', '/billetterie#tarifs', 'p2'), lien('Bon cadeau', '/billetterie#bon-cadeau', 'p2'), lien('Échange de billets', '/billetterie#echange', 'p2')]},
      {_type: 'colonne', _key: cle('p3'), titre: 'Le théâtre', liens: [lien('Histoire', 'page-le-theatre', 'p3'), lien('Équipe', 'page-equipe', 'p3'), lien('Technique', 'page-technique', 'p3'), lien('Partenaires', 'page-partenaires', 'p3'), lien('La presse en parle', 'page-presse', 'p3'), lien('Infos pratiques', 'page-infos-pratiques', 'p3'), lien('Contact & accès', 'page-contact', 'p3')]},
      {_type: 'colonne', _key: cle('p4'), titre: 'Vous', liens: [lien('Journalistes', 'page-journalistes', 'p4'), lien('Ami·es du TBB', 'page-amis', 'p4'), lien('Jeune public', 'page-jeune-public', 'p4'), lien('Médiation', 'page-mediation', 'p4'), lien('Professionnel·les', 'page-pro', 'p4')]},
    ],
    instagram: 'https://www.instagram.com/tbb_yverdon/',
    facebook: 'https://www.facebook.com/tbbyverdon/',
    linkedin: 'https://www.linkedin.com/company/th%C3%A9%C3%A2tre-benno-besson/',
    annonce: {active: false, texte: '', lien: ''},
    avis: [
      {_type: 'avis', _key: cle('avis', 'automne-2026'), titre: 'Vacances d’automne', texte: 'Billetterie fermée durant les vacances scolaires, du 12 au 23 octobre. Réouverture le mardi 27 octobre à 10h. La billetterie en ligne reste ouverte.', du: '2026-10-10', au: '2026-10-26'},
    ],
    seo: {_type: 'seo', titre: 'Théâtre Benno Besson | TBB | Yverdon-les-Bains', description: 'Le Théâtre Benno Besson (TBB) à Yverdon-les-Bains est un théâtre d’accueil et de création : théâtre, danse, humour, musique classique, cirque et jeune public, à 3 minutes de la gare.'},
  }))
}
