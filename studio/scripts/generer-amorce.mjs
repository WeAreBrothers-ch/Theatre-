#!/usr/bin/env node
/*
 * Contenus d'amorçage du Studio, tirés de la maquette (maquette/assets/js/data.js).
 *
 * Produit deux fichiers à partir des mêmes documents :
 *   studio/amorce/import.ndjson   → `sanity dataset import` (les images sont téléversées)
 *   web/sanity/amorce.json        → jeu local lu en GROQ par le site tant que Sanity est vide
 *
 * Usage : node scripts/generer-amorce.mjs
 */
import {createHash} from 'node:crypto'
import {mkdirSync, readFileSync, writeFileSync} from 'node:fs'
import {dirname, join, resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import vm from 'node:vm'

const ICI = dirname(fileURLToPath(import.meta.url))
const RACINE = resolve(ICI, '../..')
const IMG = join(RACINE, 'maquette/assets/img')

// ---------------------------------------------------------------------------
// Données de la maquette
// ---------------------------------------------------------------------------
const bac = {window: {}}
vm.createContext(bac)
vm.runInContext(readFileSync(join(RACINE, 'maquette/assets/js/data.js'), 'utf8').replace(/window\.TBB = window\.TBB \|\| \{\};/, 'var TBB = window.TBB = {};'), bac)
const TBB = bac.window.TBB

// ---------------------------------------------------------------------------
// Outils
// ---------------------------------------------------------------------------
const cle = (...parties) => createHash('sha1').update(parties.join('|')).digest('hex').slice(0, 12)
const ref = (id) => ({_type: 'reference', _ref: id})
const avecCles = (liste, prefixe) => liste.map((x, i) => ({_key: cle(prefixe, i, JSON.stringify(x).slice(0, 80)), ...x}))

/** Paragraphe → bloc Portable Text. */
const blocs = (paragraphes, prefixe) =>
  paragraphes.map((texte, i) => ({
    _type: 'block',
    _key: cle(prefixe, 'b', i),
    style: 'normal',
    markDefs: [],
    children: [{_type: 'span', _key: cle(prefixe, 's', i), text: texte, marks: []}],
  }))

/** Décalage horaire de Zurich (minutes) à un instant donné. */
function decalageZurich(ts) {
  const p = new Intl.DateTimeFormat('en-US', {timeZone: 'Europe/Zurich', hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'})
    .formatToParts(new Date(ts))
    .reduce((o, x) => ((o[x.type] = x.value), o), {})
  return (Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute) - ts) / 60000
}
/** « 2026-10-29 » + « 20:00 » heure de Zurich → ISO UTC. */
function zurichVersIso(date, heure) {
  const [a, m, j] = date.split('-').map(Number)
  const [h, mi] = heure.split(':').map(Number)
  const local = Date.UTC(a, m - 1, j, h, mi)
  let ts = local - 60 * 60000
  for (let i = 0; i < 3; i++) ts = local - decalageZurich(ts) * 60000
  return new Date(ts).toISOString()
}

/** Dimensions d'un JPEG ou d'un PNG, sans dépendance. */
function dimensions(fichier) {
  const b = readFileSync(fichier)
  if (b[0] === 0x89 && b[1] === 0x50) return {width: b.readUInt32BE(16), height: b.readUInt32BE(20)}
  let i = 2
  while (i < b.length) {
    if (b[i] !== 0xff) { i++; continue }
    const marqueur = b[i + 1]
    const taille = b.readUInt16BE(i + 2)
    if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marqueur)) {
      return {height: b.readUInt16BE(i + 5), width: b.readUInt16BE(i + 7)}
    }
    i += 2 + taille
  }
  throw new Error('Dimensions introuvables : ' + fichier)
}

// Les images : un champ image pour l'import, un document d'asset pour le jeu local.
const assetsLocaux = new Map()
function image(chemin, {gris, palette, type = 'image', extra = {}} = {}) {
  const fichier = join(IMG, chemin)
  const {width, height} = dimensions(fichier)
  const id = `image-${createHash('sha1').update(chemin).digest('hex')}-${width}x${height}-jpg`
  if (!assetsLocaux.has(id)) {
    assetsLocaux.set(id, {
      _id: id,
      _type: 'sanity.imageAsset',
      url: `/amorce/${chemin}`,
      urlGris: gris ? `/amorce/${gris}` : null,
      metadata: {
        dimensions: {width, height, aspectRatio: width / height},
        palette: palette ? {dominant: {background: palette}, vibrant: {background: palette}} : null,
        lqip: null,
      },
    })
  }
  return {
    pourImport: {_type: type, _sanityAsset: `image@file://${fichier}`, ...extra},
    pourLocal: {_type: type, asset: ref(id), ...extra},
  }
}

// Chaque document existe en deux versions : avec téléversement (import) et avec référence locale.
const docsImport = []
const docsLocaux = []
/** Ajoute un document ; `fabrique(img)` reçoit la fonction qui choisit la bonne variante d'image. */
function ajouter(fabrique) {
  docsImport.push(fabrique((x) => x.pourImport))
  docsLocaux.push(fabrique((x) => x.pourLocal))
}

// ---------------------------------------------------------------------------
// Référentiels
// ---------------------------------------------------------------------------
const LIEUX = [
  {id: 'lieu-grande-salle', nom: 'Grande Salle', nomComplet: 'Théâtre Benno Besson, Grande Salle', adresse: 'Rue du Casino 9, 1400 Yverdon-les-Bains', capacite: 460, ordre: 1,
    description: 'Salle à l’italienne en gradins, derrière les trois arches de la façade.',
    accessibilite: 'Places pour fauteuil roulant à réserver au 024 423 65 84 ; le billet de la personne qui accompagne est offert. Boucle magnétique et appareils auditifs en prêt.'},
  {id: 'lieu-salle-1', nom: 'Salle 1', nomComplet: 'Théâtre Benno Besson, Salle 1', adresse: 'Rue du Casino 9, 1400 Yverdon-les-Bains', capacite: 60, ordre: 2,
    description: 'L’ancien foyer du premier étage, pour les petites formes et le Midi théâtre.',
    accessibilite: 'Au premier étage, accessible par un monte-personne. Venez un peu en avance ou prévenez la billetterie.'},
  {id: 'lieu-temple', nom: 'Temple', nomComplet: 'Temple d’Yverdon-les-Bains', adresse: 'Place Pestalozzi, 1400 Yverdon-les-Bains', ordre: 3},
  {id: 'lieu-eglise-st-pierre', nom: 'Église St-Pierre', nomComplet: 'Église catholique St-Pierre, Yverdon-les-Bains', ordre: 4},
  {id: 'lieu-aula-magna', nom: 'Aula Magna', nomComplet: 'Aula Magna, Yverdon-les-Bains', ordre: 5},
  {id: 'lieu-la-marive', nom: 'La Marive', nomComplet: 'La Marive, Yverdon-les-Bains', ordre: 6},
]
const LIEU_PAR_NOM = Object.fromEntries(LIEUX.map((l) => [l.nom, l.id]))
for (const l of LIEUX) {
  const {id, ...champs} = l
  ajouter(() => ({_id: id, _type: 'lieu', ...champs}))
}

ajouter(() => ({_id: 'saison-26-27', _type: 'saison', titre: 'Saison 26–27', debut: '2026-09-01', fin: '2027-06-30', courante: true}))

ajouter(() => ({
  _id: 'tarifs-grande-salle',
  _type: 'grilleTarifaire',
  nom: 'Grande Salle',
  tarifs: avecCles([
    {_type: 'tarif', categorie: 'Moins de 16 ans', prix: 15},
    {_type: 'tarif', categorie: 'Moins de 26 ans', prix: 25},
    {_type: 'tarif', categorie: 'Tarif réduit', prix: 35, precision: 'AVS, AI, étudiant·es et apprenti·es, sur justificatif'},
    {_type: 'tarif', categorie: 'Plein tarif', prix: 40},
  ], 'tarifs-gs'),
  note: 'Prix d’une place pour la plupart des spectacles en Grande Salle. Catégories du tarif réduit à confirmer.',
}))

// ---------------------------------------------------------------------------
// Spectacles
// ---------------------------------------------------------------------------
const GENRE = {'Théâtre': 'theatre', 'Danse': 'danse', 'Humour': 'humour', 'Musique': 'musique', 'Jeune public': 'jeune-public'}
const ETIQUETTE = {'Création': 'creation', 'Coproduction': 'coproduction', 'Midi théâtre': 'midi-theatre', 'Afterwork 18h': 'afterwork', 'Hors saison': 'hors-saison'}
const STATUT = {complet: 'complet', attente: 'liste-attente'}
const sombres = new Set(TBB.fondsSombres || [])
const fiche = TBB.fiches.choices

for (const s of TBB.spectacles) {
  const etiquettes = s.tags.map((t) => ETIQUETTE[t]).filter(Boolean)
  if (s.autour && /payot/i.test(s.autour)) etiquettes.push('librairie')
  if (/résidence/i.test(s.par)) etiquettes.push('residence')
  const grandeSalle = s.lieu === 'Grande Salle' && !['Musique', 'Jeune public'].includes(s.genre) && !s.tags.includes('Midi théâtre')
  const visuelChemin = s.slug === 'choices' ? 'choices/choices-portrait.jpg' : `shows/${s.slug}.jpg`
  const grisChemin = s.slug === 'choices' ? 'choices/n/choices-portrait.jpg' : `shows/n/${s.slug}.jpg`
  const visuel = image(visuelChemin, {gris: grisChemin, palette: s.encre, extra: {alt: `Visuel du spectacle ${s.titre}`}})

  ajouter((img) => {
    const doc = {
      _id: `spectacle-${s.slug}`,
      _type: 'spectacle',
      titre: s.titre,
      ...(s.sousTitre ? {sousTitre: s.sousTitre} : {}),
      compagnie: s.par,
      genre: GENRE[s.genre],
      precision: s.precision,
      etiquettes: [...new Set(etiquettes)],
      visuel: img(visuel),
      encre: {_type: 'color', hex: s.encre},
      impression: sombres.has(s.slug) ? 'blanc' : 'noir',
      accroche: s.accroche,
      saison: ref('saison-26-27'),
      representations: s.dates.map(([date, heure], i) => ({
        _type: 'representation',
        _key: cle(s.slug, 'r', i),
        dateHeure: zurichVersIso(date, heure),
        statut: STATUT[s.statut] || 'en-vente',
        ...(heure === '18:00' && s.tags.includes('Afterwork 18h') ? {mention: 'Afterwork'} : {}),
      })),
      lieu: ref(LIEU_PAR_NOM[s.lieu]),
      ...(grandeSalle ? {tarifs: ref('tarifs-grande-salle')} : {}),
      texte: blocs(s.texte, s.slug),
      age: s.age,
      ...(s.duree ? {duree: s.duree} : {}),
      ...(s.note ? {avertissement: s.note} : {}),
      ...(s.autour ? {autour: [s.autour]} : {}),
      ...(s.distinction ? {distinction: s.distinction} : {}),
      slug: {_type: 'slug', current: s.slug},
    }
    if (s.slug === 'choices') {
      doc.photos = fiche.galerie.map((g, i) => ({
        _key: cle('choices', 'photo', i),
        ...img(image(g.src.replace('assets/img/', ''), {type: 'imageLegendee', extra: {legende: g.legende, credit: g.credit}})),
      }))
      doc.deroule = fiche.duree.map(([titre, duree], i) => ({_type: 'etapeDeroule', _key: cle('choices', 'd', i), titre, duree}))
      doc.distribution = fiche.distribution.map((b, i) => ({
        _type: 'blocDistribution',
        _key: cle('choices', 'dist', i),
        titre: b.titre,
        lignes: b.lignes.map(([role, noms], j) => ({_type: 'ligne', _key: cle('choices', 'l', i, j), role, noms})),
      }))
      doc.production = `${fiche.creation}\nSoutiens : ${fiche.soutiens}`
    }
    return doc
  })
}

// ---------------------------------------------------------------------------
// Équipe et partenaires
// ---------------------------------------------------------------------------
const EQUIPE = [
  ['Georges Grbic', 'Direction', 'georges.grbic@yverdon-les-bains.ch'],
  ['France Jaton', 'Administration', 'france.jaton@yverdon-les-bains.ch'],
  ['Anicée Willemin', 'Communication et médiation', 'anicee.willemin@yverdon-les-bains.ch'],
  ['Julien Mayor', 'Direction technique', 'julien.mayor@yverdon-les-bains.ch'],
  ['Victor Hunziker', 'Régie générale', 'victor.hunziker@yverdon-les-bains.ch'],
  ['Samuel Taillet', 'Régie générale', 'samuel.taillet@yverdon-les-bains.ch'],
  ['Amir Jdahim', 'Technique', 'amir.jdahim@yverdon-les-bains.ch'],
  ['Léa Thonney', 'Chargée de projets', 'lea.thonney@yverdon-les-bains.ch'],
  ['Claudia Saldivia Vega', 'Médiation scolaire', 'claudia.saldivia@yverdon-les-bains.ch'],
  ['Emmanuelle Macaluso-Pahud', 'Billetterie', 'emmanuelle.macaluso-pahud@yverdon-les-bains.ch'],
  ['Francine Ray', 'Intendance', 'francine.ray@yverdon-les-bains.ch'],
  ['Léa Macaluso', 'Placeuses et placeurs', ''],
]
EQUIPE.forEach(([nom, fonction, email], i) => {
  ajouter(() => ({_id: `personne-${cle(nom)}`, _type: 'personne', nom, fonction, ...(email ? {email} : {}), ordre: i + 1}))
})

const PARTENAIRES = [
  ['Ville d’Yverdon-les-Bains', 'institution', true, 'https://www.yverdon-les-bains.ch'],
  ['Canton de Vaud', 'institution', true, 'https://www.vd.ch'],
  ['Loterie Romande', 'institution', true, 'https://www.entraide.ch'],
  ['Banque Cantonale Vaudoise', 'partenaire', true, 'https://www.bcv.ch'],
  ['Théâtre de L’Echandole', 'partenaire', false, 'https://www.echandole.ch'],
  ['Payot Libraire', 'partenaire', false, 'https://www.payot.ch'],
  ['Ecoute Voir', 'partenaire', false, ''],
  ['Centre d’art contemporain Yverdon', 'partenaire', false, 'https://www.centre-art-yverdon.ch'],
  ['GRRIF', 'media', false, ''],
  ['La Région Nord vaudois', 'media', false, ''],
]
PARTENAIRES.forEach(([nom, type, piedDePage, url], i) => {
  ajouter(() => ({_id: `partenaire-${cle(nom)}`, _type: 'partenaire', nom, type, piedDePage, ...(url ? {url} : {}), ordre: i + 1}))
})

// ---------------------------------------------------------------------------
// Pages
// ---------------------------------------------------------------------------
const lien = (titre, cible, prefixe) => ({
  _type: 'lien',
  _key: cle(prefixe, titre),
  titre,
  ...(cible.startsWith('page-') ? {page: ref(cible)} : {url: cible}),
})
const section = (type, champs, prefixe) => ({_type: type, _key: cle(prefixe, type, champs.titre || champs.surtitre || ''), ...champs})

const besson = image('theatre/benno-besson.jpg', {type: 'imageLegendee', palette: '#4e554f', extra: {legende: 'Benno Besson (1922–2006), né à Yverdon-les-Bains.', alt: 'Portrait de Benno Besson, cigarette à la main'}})

ajouter((img) => ({
  _id: 'accueil',
  _type: 'accueil',
  aLaffiche: [],
  sections: [
    section('sectionAgenda', {surtitre: 'Les prochaines dates', titre: 'Prochainement', nombre: 7, ancre: 'prochainement'}, 'acc'),
    section('sectionAffiches', {surtitre: 'Théâtre, danse, humour, musique, jeune public', titre: 'La saison en affiches', filtres: true, nombre: 8, ancre: 'affiches'}, 'acc'),
    section('sectionTarifs', {
      surtitre: 'Une place au TBB, Grande Salle',
      titre: 'Pour toutes et tous',
      grille: ref('tarifs-grande-salle'),
      notes: [
        {_type: 'noteTarif', _key: cle('acc', 'n1'), titre: 'Midi théâtre', texte: 'Six spectacles courts pendant la pause de midi, en Salle 1 au premier étage. On y vient du bureau, on repart à l’heure.', lien: lien('Les 6 rendez-vous', '/programme#midi-theatre', 'acc-n1')},
        {_type: 'noteTarif', _key: cle('acc', 'n2'), titre: 'Afterwork 18h', texte: 'Swiss Maker et Lionel Frésard rencontre Royale Cattin se jouent aussi à 18h, en sortant du travail.'},
        {_type: 'noteTarif', _key: cle('acc', 'n3'), titre: 'Accompagnant·e offert', texte: 'Le billet de la personne qui accompagne un·e spectateur·ice en fauteuil roulant est offert. Places à réserver au 024 423 65 84.'},
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
    section('sectionAcces', {surtitre: 'Infos pratiques', titre: 'Venir au TBB', ancre: 'venir'}, 'acc'),
    section('sectionLettre', {titre: 'La lettre du TBB', texte: 'Une fois par mois : les spectacles à venir, les dernières places et les bords de scène.'}, 'acc'),
  ],
}))

ajouter(() => ({
  _id: 'page-billetterie',
  _type: 'page',
  titre: 'Billetterie',
  slug: {_type: 'slug', current: 'billetterie'},
  intro: 'Réserver, payer moins cher avant 26 ans, venir en train, en bus ou en fauteuil roulant : tout est ici.',
  sections: [
    section('sectionInfos', {titre: 'Horaires et réservations', ancre: 'reserver', blocs: [
      {_type: 'blocInfo', _key: cle('bil', 'b1'), titre: 'En ligne', texte: 'Jour et nuit, depuis la page de chaque spectacle.', lien: lien('Choisir un spectacle', '/programme', 'bil-b1')},
      {_type: 'blocInfo', _key: cle('bil', 'b2'), titre: 'Au téléphone', texte: '024 423 65 84\nbilletterie@yverdon-les-bains.ch', note: 'Horaires du guichet ci-dessous.'},
      {_type: 'blocInfo', _key: cle('bil', 'b3'), titre: 'Au guichet', texte: 'Rue du Casino 9, aux heures d’ouverture, et une heure avant chaque représentation.'},
    ]}, 'bil'),
    section('sectionTarifs', {surtitre: 'Grande Salle, la plupart des spectacles', titre: 'Tarifs', ancre: 'tarifs', grille: ref('tarifs-grande-salle'), notes: [
      {_type: 'noteTarif', _key: cle('bil', 'n1'), titre: 'Tarif réduit', texte: 'AVS, AI, étudiant·es et apprenti·es, sur présentation d’un justificatif à l’entrée.'},
      {_type: 'noteTarif', _key: cle('bil', 'n2'), titre: 'Accompagnant·e', texte: 'Le billet de la personne qui accompagne un·e spectateur·ice en fauteuil roulant est offert.'},
      {_type: 'noteTarif', _key: cle('bil', 'n3'), titre: 'Ami·es du TBB', texte: 'Priorité pour l’achat de l’Abonnement général et invitations aux répétitions.', lien: lien('Devenir Ami·e', 'page-le-theatre', 'bil-n3')},
    ]}, 'bil'),
    section('sectionInfos', {titre: 'Bon cadeau et échange', ancre: 'cadeau', blocs: [
      {_type: 'blocInfo', _key: cle('bil', 'c1'), titre: 'Bon cadeau', texte: 'Offrez une soirée au théâtre. Le montant est libre, le bon vaut pour tous les spectacles de la saison. En vente au guichet et par téléphone.', note: 'Conditions à valider avec le TBB.'},
      {_type: 'blocInfo', _key: cle('bil', 'c2'), titre: 'Échange de billets', texte: 'Un empêchement ? Contactez la billetterie avant la représentation pour changer de date ou de spectacle. Les billets ne sont pas remboursés, sauf annulation du spectacle.', note: 'Conditions à valider avec le TBB.'},
    ]}, 'bil-c'),
    section('sectionAcces', {surtitre: 'Rue du Casino 9, 1400 Yverdon-les-Bains', titre: 'Venir au TBB', ancre: 'venir'}, 'bil'),
    section('sectionInfos', {surtitre: 'Les salles', titre: 'Accessibilité', ancre: 'accessibilite', blocs: [
      {_type: 'blocInfo', _key: cle('bil', 'a1'), titre: 'Grande Salle', texte: '460 places, salle à l’italienne en gradins. Places pour fauteuil roulant à réserver au 024 423 65 84. Boucle magnétique et appareils auditifs en prêt.'},
      {_type: 'blocInfo', _key: cle('bil', 'a2'), titre: 'Salle 1', texte: 'Une soixantaine de places au premier étage, dans l’ancien foyer. Accès par un monte-personne.'},
      {_type: 'blocInfo', _key: cle('bil', 'a3'), titre: 'Bords de scène', texte: 'Entrée libre, sans réservation. Après certains spectacles, l’équipe artistique reste dans la salle pour parler avec le public.'},
    ]}, 'bil-a'),
    section('sectionFaq', {titre: 'Questions fréquentes', ancre: 'questions', questions: [
      {_type: 'question', _key: cle('bil', 'q1'), question: 'Y a-t-il un prix pour les jeunes ?', reponse: 'Oui : 25 francs avant 26 ans et 15 francs avant 16 ans, pour la plupart des spectacles en Grande Salle.'},
      {_type: 'question', _key: cle('bil', 'q2'), question: 'Puis-je venir en fauteuil roulant ?', reponse: 'Oui. Réservez une place adaptée au 024 423 65 84 ; le billet de la personne qui vous accompagne est offert.'},
      {_type: 'question', _key: cle('bil', 'q3'), question: 'Où me garer ?', reponse: 'Au parking de l’Ancien-Stand, juste en face du théâtre. Il compte des places pour personnes à mobilité réduite.'},
      {_type: 'question', _key: cle('bil', 'q4'), question: 'Que faire si un spectacle est complet ?', reponse: 'Appelez la billetterie : des places se libèrent parfois, et certains spectacles ont une liste d’attente.'},
    ]}, 'bil'),
  ],
}))

const etapes = [
  ['1898', 'Le Casino', 'Yverdon inaugure son Casino néo-baroque, avec ses dômes d’ardoise et ses trois grandes baies. On y danse, on y donne des concerts et les soirées des sociétés locales.', 'theatre/casino-1898.jpg', 'Le Casino d’Yverdon vers 1900, carte postale ancienne'],
  ['1922', 'Naissance de Benno Besson', 'À 18 ans, il fonde à Yverdon une troupe de théâtre amateur. En 1942, il part étudier les lettres à l’Université de Zurich.', null],
  ['1947', 'Brecht, à Zurich', 'Au Schauspielhaus de Zurich, Besson assiste aux créations des pièces de Brecht et le rencontre. Deux ans plus tard, Brecht l’engage au Berliner Ensemble, comme comédien et assistant.', null],
  ['1982', 'L’Oiseau vert', 'Après le Deutsches Theater de Berlin et trois spectacles au Festival d’Avignon, Besson prend la direction de la Comédie de Genève. Son Oiseau vert, d’après Gozzi, y rencontre un succès retentissant.', 'theatre/benno-besson.jpg', 'Benno Besson'],
  ['1998', 'Théâtre Benno Besson', 'Pour son centenaire, le Casino rénové devient une salle de 460 places et prend le nom de l’enfant du pays.', 'theatre/carte-postale.jpg', 'Le Casino d’Yverdon sur une carte postale colorisée'],
  ['2020', 'La Salle 1', 'L’ancien foyer du premier étage devient une deuxième salle d’une soixantaine de places, pour les petites formes et le Midi théâtre.', null],
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

ajouter((img) => ({
  _id: 'page-le-theatre',
  _type: 'page',
  titre: 'Le théâtre',
  slug: {_type: 'slug', current: 'le-theatre'},
  intro: 'Un casino de 1898, une salle à l’italienne, et le nom d’un enfant d’Yverdon devenu un maître du théâtre européen.',
  image: img(facade),
  sections: [
    section('sectionTexte', {
      chapo: 'Construit en 1898 sous le nom de Casino d’Yverdon-les-Bains, rebaptisé un siècle plus tard en hommage au grand homme de théâtre originaire du Nord vaudois, le TBB est un théâtre de référence dans le canton.',
      texte: blocs([
        'Après avoir abrité bals et soirées de sociétés locales, le théâtre municipal a structuré ses saisons sous les directions de Christiane Vincent (1981–1991), Pierre Bauer (1992–2012) et Thierry Luisier (2012–2017). Georges Grbic en assure la direction artistique depuis 2017.',
        'Une cinquantaine de propositions par saison, du théâtre au cirque, de l’humour à la musique classique, avec une place forte pour le jeune public et la création romande. Deux compagnies sont en résidence : la company Idem et la Cie Kokodyniack.',
      ], 'th-texte'),
      image: img(grbic),
    }, 'th'),
    section('sectionFrise', {surtitre: 'De 1898 à aujourd’hui', titre: 'Histoire', ancre: 'histoire', etapes: etapes.map(([annee, titre, texte, chemin, alt], i) => ({
      _type: 'etape', _key: cle('th', 'e', i), annee, titre, texte,
      ...(chemin ? {image: img(image(chemin, {type: 'imageLegendee', extra: {alt}}))} : {}),
    }))}, 'th'),
    section('sectionCitation', {citation: 'Le théâtre n’a pas de sens si ce n’est un plaisir, un plaisir à la vie.', auteur: 'Benno Besson (1922–2006)', style: 'affiche'}, 'th'),
    section('sectionGalerie', {surtitre: '460 places à l’italienne, dernière rénovation en 2015', titre: 'La salle', ancre: 'salle', images: galerie.map(([chemin, legende, alt], i) => ({
      _key: cle('th', 'g', i), ...img(image(chemin, {type: 'imageLegendee', extra: {legende, alt}})),
    }))}, 'th'),
    section('sectionEquipe', {surtitre: 'Les personnes qui font le TBB', titre: 'Équipe', ancre: 'equipe', texte: 'Administration 024 423 65 80. Technique 024 423 65 86, tbbtechnique@yverdon-les-bains.ch.'}, 'th'),
    section('sectionFormules', {
      surtitre: 'Association des Ami·es du TBB',
      titre: 'Ami·es du TBB',
      ancre: 'amis',
      texte: 'Assister aux répétitions, visiter les coulisses avec le directeur, acheter son abonnement en priorité.',
      formules: [
        {_type: 'formule', _key: cle('th', 'f1'), nom: 'Bon copain·ine', prix: '50', periode: 'par saison'},
        {_type: 'formule', _key: cle('th', 'f2'), nom: 'Ami·e de longue date', prix: '150', periode: 'par saison'},
        {_type: 'formule', _key: cle('th', 'f3'), nom: 'Ami·e pour la vie', prix: 'libre', periode: 'le montant de votre choix'},
      ],
      bouton: {_type: 'bouton', titre: 'Adhérer', url: '/contact'},
    }, 'th'),
  ],
}))

ajouter(() => ({
  _id: 'page-contact',
  _type: 'page',
  titre: 'Contact',
  slug: {_type: 'slug', current: 'contact'},
  intro: 'Une question sur un spectacle, une réservation, une proposition artistique ? Écrivez-nous, appelez ou passez au guichet.',
  sections: [
    section('sectionContact', {
      titre: 'Qui contacter',
      annuaire: [
        ['Billetterie et réservations', 'Emmanuelle Macaluso-Pahud', 'billetterie@yverdon-les-bains.ch', '024 423 65 84'],
        ['Administration', 'France Jaton', 'tbb@yverdon-les-bains.ch', '024 423 65 80'],
        ['Proposer un spectacle', '', 'programmation@yverdon-les-bains.ch', ''],
        ['Inviter la direction à une représentation', '', 'invitation@yverdon-les-bains.ch', ''],
        ['Presse et communication', 'Anicée Willemin', 'anicee.willemin@yverdon-les-bains.ch', ''],
        ['Écoles et médiation', 'Claudia Saldivia Vega', 'claudia.saldivia@yverdon-les-bains.ch', ''],
        ['Technique et accueil des compagnies', 'Julien Mayor', 'tbbtechnique@yverdon-les-bains.ch', '024 423 65 86'],
        ['Ami·es du TBB', 'Association des Ami·es', '', '024 423 65 80'],
      ].map(([service, nom, email, telephone], i) => ({_type: 'contactService', _key: cle('ct', i), service, ...(nom ? {nom} : {}), ...(email ? {email} : {}), ...(telephone ? {telephone} : {})})),
      formulaire: true,
      sujets: ['Billetterie et réservations', 'Proposer un spectacle', 'Presse', 'Écoles et médiation', 'Ami·es du TBB', 'Autre question'],
      confirmation: 'Merci, votre message est bien arrivé. Nous vous répondons rapidement.',
    }, 'ct'),
    section('sectionAcces', {surtitre: 'Rue du Casino 9, 1400 Yverdon-les-Bains', titre: 'Venir au TBB', ancre: 'venir'}, 'ct'),
  ],
}))

ajouter(() => ({
  _id: 'page-jeune-public',
  _type: 'page',
  titre: 'Jeune public',
  slug: {_type: 'slug', current: 'jeune-public'},
  intro: '2 théâtres, 11 spectacles, 1 billetterie. Dès 4 ans, en famille ou avec l’école, avec le Théâtre de L’Echandole.',
  sections: [
    section('sectionAffiches', {titre: 'Les spectacles du TBB', genre: 'jeune-public', nombre: 12}, 'jp'),
    section('sectionTexte', {surtitre: 'Avec l’école', titre: 'Les classes d’Yverdon au théâtre', texte: blocs([
      'Chaque spectacle jeune public du TBB est aussi vu par les élèves d’Yverdon-les-Bains, de la 1-2P à la 9-10S, avec leur enseignant·e.',
      'Les enseignant·es qui souhaitent préparer la venue de leur classe peuvent contacter la médiation scolaire.',
    ], 'jp-texte')}, 'jp'),
    section('sectionAppel', {titre: 'Venir avec sa classe', texte: 'La médiation scolaire vous aide à préparer la sortie et propose des pistes pour en parler en classe.', bouton: {_type: 'bouton', titre: 'Écrire à la médiation', url: '/contact'}, fond: 'vert'}, 'jp'),
  ],
}))

// ---------------------------------------------------------------------------
// Réglages du site
// ---------------------------------------------------------------------------
ajouter(() => ({
  _id: 'reglages',
  _type: 'reglages',
  nom: 'Théâtre Benno Besson',
  rue: 'Rue du Casino 9',
  localite: '1400 Yverdon-les-Bains',
  telBilletterie: '024 423 65 84',
  emailBilletterie: 'billetterie@yverdon-les-bains.ch',
  telAdmin: '024 423 65 80',
  emailGeneral: 'tbb@yverdon-les-bains.ch',
  horaires: [
    {_type: 'horaire', _key: cle('h1'), jours: 'Mardi à vendredi', heures: '14h–18h'},
    {_type: 'horaire', _key: cle('h2'), jours: 'Samedi', heures: '10h–12h'},
  ],
  noteHoraires: 'et une heure avant chaque représentation (horaires à confirmer)',
  accesTrain: 'Gare CFF d’Yverdon-les-Bains à 3 minutes à pied.',
  accesBus: 'Lignes 604 et 605, arrêt Théâtre Benno Besson.',
  accesVoiture: 'Parking de l’Ancien-Stand, juste en face du théâtre, avec des places pour personnes à mobilité réduite.',
  accesRestaurer: 'Pizzeria La Grange da Antonio, dans le même bâtiment, avec terrasse. En face, le bøtanik propose une petite carte locale et de saison.',
  lienPlan: 'https://map.geo.admin.ch/?swisssearch=Rue%20du%20Casino%209%20Yverdon-les-Bains',
  menu: [
    lien('Programme', '/programme', 'menu'),
    lien('Billetterie', 'page-billetterie', 'menu'),
    lien('Jeune public', 'page-jeune-public', 'menu'),
    lien('Le théâtre', 'page-le-theatre', 'menu'),
    lien('Contact', 'page-contact', 'menu'),
  ],
  boutonMenu: {_type: 'bouton', titre: 'Réserver', url: '/programme'},
  colonnesPied: [
    {_type: 'colonne', _key: cle('p1'), titre: 'Programme 26–27', liens: [lien('Spectacles à venir', '/programme', 'p1'), lien('Jeune public', 'page-jeune-public', 'p1'), lien('Midi théâtre', '/programme#midi-theatre', 'p1')]},
    {_type: 'colonne', _key: cle('p2'), titre: 'Billetterie', liens: [lien('Horaires et réservations', 'page-billetterie', 'p2'), lien('Tarifs', '/billetterie#tarifs', 'p2'), lien('Venir au TBB', '/billetterie#venir', 'p2')]},
    {_type: 'colonne', _key: cle('p3'), titre: 'Le théâtre', liens: [lien('Histoire', 'page-le-theatre', 'p3'), lien('Équipe', '/le-theatre#equipe', 'p3'), lien('Ami·es du TBB', '/le-theatre#amis', 'p3')]},
    {_type: 'colonne', _key: cle('p4'), titre: 'Vous', liens: [lien('Contact', 'page-contact', 'p4'), lien('Accessibilité', '/billetterie#accessibilite', 'p4'), lien('Proposer un spectacle', 'page-contact', 'p4')]},
  ],
  instagram: 'https://www.instagram.com/tbb_yverdon/',
  facebook: 'https://www.facebook.com/tbbyverdon/',
  linkedin: 'https://www.linkedin.com/company/th%C3%A9%C3%A2tre-benno-besson/',
  annonce: {active: false, texte: '', lien: ''},
  seo: {_type: 'seo', titre: 'Théâtre Benno Besson, Yverdon-les-Bains', description: 'Théâtre, danse, humour, musique et jeune public au Théâtre Benno Besson, à 3 minutes de la gare d’Yverdon-les-Bains.'},
}))

// ---------------------------------------------------------------------------
// Écriture
// ---------------------------------------------------------------------------
mkdirSync(join(ICI, '../amorce'), {recursive: true})
writeFileSync(join(ICI, '../amorce/import.ndjson'), docsImport.map((d) => JSON.stringify(d)).join('\n') + '\n')
mkdirSync(join(RACINE, 'web/sanity'), {recursive: true})
writeFileSync(join(RACINE, 'web/sanity/amorce.json'), JSON.stringify([...docsLocaux, ...assetsLocaux.values()]))
console.log(`${docsImport.length} documents, ${assetsLocaux.size} images`)
console.log('→ studio/amorce/import.ndjson')
console.log('→ web/sanity/amorce.json')
