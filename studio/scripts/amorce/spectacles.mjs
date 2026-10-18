/*
 * Les spectacles : les 41 fiches de la saison en cours et les 345 des saisons passées,
 * repris du site Wix (studio/donnees/reprise.json).
 *
 * Pour les 35 spectacles que la maquette avait déjà mis en forme, on garde ce qu'elle a
 * soigné (titre court, accroche, couleur, visuel déjà dans Sanity) ; tout ce qui est un
 * fait (dates, heures, salle, prix, âge, durée, liens, textes, distribution) vient du site.
 */
import {accrocheDe, blocsReprise, cle, ref, zurichVersIso} from './outils.mjs'

const GENRE_MAQUETTE = {'Théâtre': 'theatre', 'Danse': 'danse', 'Humour': 'humour', 'Musique': 'musique', 'Jeune public': 'jeune-public'}
const ETIQUETTE_MAQUETTE = {'Création': 'creation', 'Coproduction': 'coproduction', 'Midi théâtre': 'midi-theatre', 'Afterwork 18h': 'afterwork', 'Hors saison': 'hors-saison'}

/** Notes scolaires de la page Jeune Public (saison en cours). */
const SCOLAIRE = {
  cosimo: 'Les élèves de 9-10S d’Yverdon-les-Bains verront ce spectacle avec l’école.',
  gaetan: 'Les élèves de 1-2P et de 3-4P d’Yverdon-les-Bains verront ce spectacle avec l’école.',
  'au-diapason': 'Les élèves de 7-8P d’Yverdon-les-Bains verront ce spectacle avec l’école.',
  cendrillon: 'Les élèves de 5-6P d’Yverdon-les-Bains verront ce spectacle avec l’école.',
  manekine: 'Les élèves de 9-10S d’Yverdon-les-Bains verront ce spectacle avec l’école.',
}
/** Spectacles et concerts signalés aux personnes malentendantes (page Médiation). */
const MALENTENDANTS = new Set(['diakoff', 'au-diapason', 'fratres', 'alard', 'prevert', 'gaetan', 'nova-jazz', 'manuel', 'akmi', 'manekine'])

// ---------------------------------------------------------------------------
// Grilles de prix : une par combinaison de la saison en cours
// ---------------------------------------------------------------------------
const ORDRE_CATEGORIES = ['Plein tarif', 'Tarif réduit', 'Moins de 26 ans', 'Moins de 16 ans', 'Moins de 12 ans', 'Prix unique']
const rang = (c) => {
  const i = ORDRE_CATEGORIES.findIndex((x) => c.startsWith(x))
  return i < 0 ? 50 : i
}
const signature = (tarifs) => [...tarifs].sort((a, b) => rang(a.categorie) - rang(b.categorie)).map((t) => `${t.categorie}=${t.prix}`).join('|')

export function preparerGrilles(fiches) {
  const grilles = new Map()
  for (const f of fiches.filter((x) => x.saison === '26-27' && x.tarifs.length)) {
    const sig = signature(f.tarifs)
    if (!grilles.has(sig)) grilles.set(sig, {tarifs: [...f.tarifs].sort((a, b) => rang(a.categorie) - rang(b.categorie)), fiches: []})
    grilles.get(sig).fiches.push(f)
  }
  const prises = new Set()
  for (const [sig, g] of grilles) {
    const tous = (test) => g.fiches.every(test)
    const unique = g.tarifs.find((t) => t.categorie === 'Prix unique')?.prix
    let nom
    let id
    if (sig === 'Plein tarif=40|Tarif réduit=35|Moins de 26 ans=25|Moins de 16 ans=15') [nom, id] = ['Grande Salle', 'tarifs-grande-salle']
    else if (tous((f) => f.etiquettes.includes('midi-theatre'))) [nom, id] = [`Midi théâtre`, 'tarifs-midi-theatre']
    else if (tous((f) => f.genre === 'jeune-public')) [nom, id] = [unique ? `Jeune public, prix unique ${unique}.–` : 'Jeune public', unique ? `tarifs-jeune-public-${unique}` : 'tarifs-jeune-public']
    else if (tous((f) => f.etiquettes.includes('nova-jazz'))) [nom, id] = ['Nova Jazz', 'tarifs-nova-jazz']
    // Les autres grilles portent leurs prix : « 45 / 40 / 25 / 15 ».
    else [nom, id] = [g.tarifs.map((t) => `${t.prix}.–`).join(' / '), `tarifs-${g.tarifs.map((t) => t.prix).join('-')}`]
    while (prises.has(id)) id += '-b'
    prises.add(id)
    Object.assign(g, {nom, id})
  }
  return grilles
}

export function ajouterGrilles({ajouter}, grilles) {
  for (const g of grilles.values()) {
    ajouter(() => ({
      _id: g.id,
      _type: 'grilleTarifaire',
      nom: g.nom,
      tarifs: g.tarifs.map((t, i) => ({_type: 'tarif', _key: cle(g.id, i, t.categorie), categorie: t.categorie, prix: t.prix, ...(t.precision ? {precision: t.precision} : {})})),
      note: `Utilisée par : ${g.fiches.map((f) => f.titre).join(', ')}.`,
    }))
  }
}

// ---------------------------------------------------------------------------
// Les fiches
// ---------------------------------------------------------------------------
export function ajouterSpectacles(recueil, {reprise, maquette, grilles}) {
  const {ajouter, image, imageWix, fichier} = recueil
  const parSlug = new Map(maquette.spectacles.map((s) => [s.slug, s]))
  const grilleDe = (f) => (f.tarifs.length ? grilles.get(signature(f.tarifs))?.id : null)

  for (const f of reprise.fiches) {
    const m = f.saison === '26-27' ? parSlug.get(f.slug) : null
    const id = `spectacle-${f.slug}`
    const etiquettes = new Set(f.etiquettes)
    if (m) for (const t of m.tags) if (ETIQUETTE_MAQUETTE[t]) etiquettes.add(ETIQUETTE_MAQUETTE[t])
    if (f.saison === '26-27' && MALENTENDANTS.has(f.slug)) etiquettes.add('malentendants')

    // Le visuel : celui de la maquette (déjà dans Sanity), sinon celui du site.
    const visuel = m
      ? image(f.slug === 'choices' ? 'choices/choices-portrait.jpg' : `shows/${f.slug}.jpg`, {gris: f.slug === 'choices' ? 'choices/n/choices-portrait.jpg' : `shows/n/${f.slug}.jpg`, palette: m.encre, extra: {alt: `Visuel du spectacle ${m.titre}`}})
      : f.visuel
        ? imageWix(f.visuel, {extra: {alt: `Visuel du spectacle ${f.titre}`}})
        : null
    // Galerie : toutes les photos pour la saison en cours, aucune pour les archives (le visuel suffit).
    const galerie = f.saison === '26-27' ? f.galerie : []

    const grille = f.saison === '26-27' ? grilleDe(f) : null
    const prixEnTexte = f.tarifs.map((t) => `${t.categorie} ${t.prix ? `CHF ${t.prix}.–` : 'gratuit'}`)
    const noteTarifs = grille ? f.notesTarifs.join(' · ') : [...prixEnTexte, ...f.notesTarifs].join(' · ')

    const texte = [...blocsReprise(f.chapeau, `${id}-chapeau`), ...blocsReprise(f.texte, `${id}-texte`)]
    const dossierEstDossier = f.dossier && /dossier|\bdp\b|presse/i.test(f.dossier.nom) && /\.pdf/i.test(f.dossier.url)

    ajouter((img) => ({
      _id: id,
      _type: 'spectacle',
      titre: m?.titre ?? f.titre,
      ...((m?.sousTitre || f.sousTitre) ? {sousTitre: m?.sousTitre || f.sousTitre} : {}),
      ...((m?.par || f.compagnie) ? {compagnie: m?.par || f.compagnie} : {}),
      genre: m ? GENRE_MAQUETTE[m.genre] : f.genre,
      ...((f.precision || m?.precision) ? {precision: f.precision || m.precision} : {}),
      etiquettes: [...etiquettes],
      ...(visuel ? {visuel: img(visuel)} : {}),
      ...(m ? {encre: {_type: 'color', hex: m.encre}} : {}),
      // « Automatique » : noir ou blanc selon la clarté réelle du visuel (les visuels de la saison sont des trames colorées).
      impression: 'auto',
      accroche: m?.accroche ?? accrocheDe(f.accroche || f.seo || ''),
      saison: ref(`saison-${f.saison}`),
      representations: f.representations.map((r, i) => {
        const statut = r.libre ? 'en-vente' : f.statut || 'en-vente'
        const mention = r.mention || f.mentionLieu
        return {
          _type: 'representation',
          _key: cle(f.slug, 'r', r.date, r.heure, i),
          dateHeure: zurichVersIso(r.date, r.heure),
          statut,
          ...(mention ? {mention} : {}),
          ...(r.heureAConfirmer ? {heureAConfirmer: true} : {}),
        }
      }),
      lieu: ref(f.lieu),
      ...(grille ? {tarifs: ref(grille)} : {}),
      ...(noteTarifs ? {noteTarifs} : {}),
      ...(f.lienBilletterie ? {lienBilletterie: f.lienBilletterie} : {}),
      ...(f.libelleBillet ? {libelleBillet: f.libelleBillet} : {}),
      ...(f.lienListeAttente ? {lienListeAttente: f.lienListeAttente} : {}),
      ...(texte.length ? {texte} : m ? {texte: m.texte.map((t, i) => ({_type: 'block', _key: cle(id, 'm', i), style: 'normal', markDefs: [], children: [{_type: 'span', _key: cle(id, 'ms', i), text: t, marks: []}]}))} : {}),
      ...(f.citations.length ? {citations: f.citations.map((c, i) => ({_type: 'citationPresse', _key: cle(id, 'cit', i), citation: c.citation, ...(c.auteur ? {auteur: c.auteur} : {}), ...(c.media ? {media: c.media} : {})}))} : {}),
      ...(galerie.length
        ? {
            photos: galerie.map((g, i) => ({
              _key: cle(id, 'photo', i),
              ...img(imageWix(g, {type: 'imageLegendee', extra: {alt: `${m?.titre ?? f.titre}, photo ${i + 1}`, ...(g.credit ? {credit: g.credit} : {}), ...(g.legende ? {legende: g.legende} : {})}})),
            })),
          }
        : {}),
      ...(f.video ? {video: f.video} : {}),
      ...((f.age || m?.age) ? {age: f.age || m.age} : {}),
      ...((f.duree || m?.duree) ? {duree: f.duree || m.duree} : {}),
      ...(f.deroule.length ? {deroule: f.deroule.map((d, i) => ({_type: 'etapeDeroule', _key: cle(id, 'd', i), titre: d.titre, duree: d.duree}))} : {}),
      ...((f.avertissement || m?.note) ? {avertissement: f.avertissement || m.note} : {}),
      ...((f.autour.length || m?.autour) ? {autour: f.autour.length ? f.autour : [m.autour]} : {}),
      ...((f.distinction || m?.distinction) ? {distinction: f.distinction || m.distinction} : {}),
      ...(f.distribution.length
        ? {
            distribution: f.distribution.map((b, i) => ({
              _type: 'blocDistribution',
              _key: cle(id, 'dist', i),
              ...(b.titre ? {titre: b.titre} : {}),
              lignes: b.lignes.map((l, j) => ({_type: 'ligne', _key: cle(id, 'l', i, j), role: l.role, noms: l.noms})),
            })),
          }
        : {}),
      ...(f.production.length ? {production: f.production.join('\n')} : {}),
      ...(f.creation ? {creation: f.creation} : {}),
      ...(f.creditsPhotos ? {creditsPhotos: `Photos © ${f.creditsPhotos}`} : {}),
      ...(f.photosHD ? {photosHD: f.photosHD} : {}),
      ...(dossierEstDossier ? {dossierPresse: img(fichier(f.dossier.url))} : {}),
      ...(f.dossier && !dossierEstDossier
        ? {documents: [{_type: 'fichier', _key: cle(id, 'doc'), titre: f.dossier.nom ? f.dossier.nom.replace(/\.[a-z]+$/i, '').replace(/[_-]+/g, ' ') : 'Revue de presse', ...(/_files\/ugd/.test(f.dossier.url) ? {fichier: img(fichier(f.dossier.url))} : {url: f.dossier.url})}]}
        : {}),
      ...((SCOLAIRE[f.slug] && f.saison === '26-27') || f.scolaire ? {scolaire: (f.saison === '26-27' && SCOLAIRE[f.slug]) || `Classes : ${f.scolaire}`} : {}),
      slug: {_type: 'slug', current: f.slug},
      ...(f.seo ? {seo: {_type: 'seo', description: accrocheDe(f.seo, 160)}} : {}),
    }))
  }
}

// ---------------------------------------------------------------------------
// La presse en parle : revues de presse des fiches et page Presse
// ---------------------------------------------------------------------------
const cleTitre = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '')
const typeDe = (url) => {
  if (!url) return 'article'
  if (/audio-podcast|play\/radio|lfm\.ch\/podcasts|radionv/.test(url)) return 'radio'
  if (/play\/tv|canalalpha|lemanbleu/.test(url)) return 'tv'
  if (/_files\/ugd|dropbox|calameo|\.pdf/.test(url)) return 'article'
  return 'web'
}

export function ajouterPresse({ajouter, fichier}, reprise) {
  const articles = new Map()
  const ajouterArticle = (a, spectacle, dateParDefaut) => {
    const date = a.date ?? dateParDefaut
    if (!date || !a.titre || !a.media) return
    const k = cleTitre(a.titre)
    const deja = articles.get(k)
    if (deja) {
      if (!deja.spectacle && spectacle) deja.spectacle = spectacle
      if (!deja.lien && a.lien) deja.lien = a.lien
      return
    }
    articles.set(k, {...a, date, spectacle})
  }
  for (const f of reprise.fiches) for (const a of f.revue) ajouterArticle(a, f.slug, f.representations[0]?.date)
  for (const a of reprise.presse) ajouterArticle(a, a.spectacle, null)

  for (const a of articles.values()) {
    const id = `article-${cle(a.titre, a.date)}`
    // Les PDF hébergés par l'ancien site disparaîtront avec lui : on les reprend dans Sanity.
    const surWix = a.lien && /theatrebennobesson\.ch\/_files\/ugd\//.test(a.lien)
    ajouter((img) => ({
      _id: id,
      _type: 'articlePresse',
      titre: a.titre,
      media: a.media,
      ...(a.auteur ? {auteur: a.auteur} : {}),
      date: a.date,
      type: a.type ?? typeDe(a.lien),
      ...(a.lien && !surWix ? {lien: a.lien} : {}),
      ...(surWix ? {fichier: img(fichier(a.lien.replace(/\?.*$/, '')))} : {}),
      ...(a.spectacle ? {spectacle: ref(`spectacle-${a.spectacle}`)} : {}),
      ...(a.extrait ? {extrait: a.extrait} : {}),
    }))
  }
  return articles.size
}
