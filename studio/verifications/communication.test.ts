import {test} from 'node:test'
import assert from 'node:assert/strict'
import {entrees, lettreHtml, objet} from '../lib/communication/lettre.ts'
import {agendaImprime, feuilleDeSalle, lignesAgenda} from '../lib/communication/impression.ts'
import {texteReseaux, VARIANTES} from '../lib/communication/reseaux.ts'
import {csv, exportRepresentations} from '../lib/communication/export.ts'
import {echapper, urlImage, type SpectacleCom} from '../lib/communication/commun.ts'

const ctx = {projectId: 'pgmabzq0', dataset: 'production', site: 'https://www.theatrebennobesson.ch'}
const reglages = {nom: 'Théâtre Benno Besson', telBilletterie: '024 423 65 84', emailBilletterie: 'billetterie@yverdon-les-bains.ch', rue: 'Rue du Casino 9', localite: '1400 Yverdon-les-Bains'}

const choices: SpectacleCom = {
  _id: 'spectacle-choices',
  titre: 'Choices',
  compagnie: 'Clément Bugnon & Matthias Kass / company Idem',
  genre: 'danse',
  genreLibelle: 'Danse',
  accroche: 'Le public choisit, les danseurs obéissent.',
  slug: 'choices',
  encre: '#e2462f',
  visuel: {ref: 'image-a1b2c3-1600x2286-jpg', hotspot: {x: 0.5, y: 0.3}},
  lieu: 'Grande Salle',
  representations: [
    {_key: '1', dateHeure: '2026-10-29T19:00:00Z', statut: 'en-vente'},
    {_key: '2', dateHeure: '2026-10-30T19:00:00Z', statut: 'complet'},
    {_key: '3', dateHeure: '2026-10-30T08:00:00Z', statut: 'en-vente', scolaire: true},
  ],
  prix: [{categorie: 'Plein tarif', prix: 40}, {categorie: 'Moins de 16 ans', prix: 15}],
  distribution: [{titre: 'Choices', lignes: [{role: 'Chorégraphie', noms: 'Clément Bugnon'}]}],
}
const midi: SpectacleCom = {_id: 'spectacle-tavolo', titre: 'Tavolo <Pour> Drü', slug: 'tavolo', lieu: 'Salle 1', representations: [{_key: '1', dateHeure: '2026-11-06T11:15:00Z'}]}

test('la lettre : période, ordre, scolaires écartées, HTML échappé', () => {
  const o = {debut: '2026-10-26', semaines: 2}
  const liste = entrees([midi, choices], o)
  assert.deepEqual(liste.map((e) => e.spectacle._id), ['spectacle-choices', 'spectacle-tavolo'])
  assert.equal(liste[0].reps.length, 2) // la scolaire n'y est pas
  const html = lettreHtml(ctx, reglages, [midi, choices], o)
  assert.match(html, /CHOICES/) // capitales écrites dans le texte
  assert.match(html, /TAVOLO &lt;POUR&gt; DRÜ/)
  assert.match(html, /https:\/\/www\.theatrebennobesson\.ch\/spectacles\/choices/)
  assert.match(html, /COMPLET/)
  assert.doesNotMatch(html, /<script/)
  assert.match(objet([midi, choices], o), /^Au TBB en octobre : Choices, Tavolo/)
})

test('une lettre sans complets', () => {
  const tout = {...choices, representations: [{_key: '2', dateHeure: '2026-10-30T19:00:00Z', statut: 'complet'}]}
  assert.equal(entrees([tout], {debut: '2026-10-26', semaines: 2, inclureComplets: false}).length, 0)
})

test('les images du CDN, recadrées sur le point important', () => {
  const url = urlImage(ctx, choices.visuel, {largeur: 280, hauteur: 400})!
  assert.match(url, /^https:\/\/cdn\.sanity\.io\/images\/pgmabzq0\/production\/a1b2c3-1600x2286\.jpg\?/)
  assert.match(url, /fp-y=0\.300/)
  assert.equal(urlImage(ctx, {ref: 'nimporte'}, {largeur: 10}), null)
})

test('la feuille de salle et l’agenda du mois', () => {
  const feuille = feuilleDeSalle(ctx, reglages, choices, {format: 'A4', prochains: [midi]})
  assert.match(feuille, /@page \{ size: A4 portrait/)
  assert.match(feuille, /Chorégraphie/)
  assert.match(feuille, /Tavolo &lt;Pour&gt; Drü/)
  const lignes = lignesAgenda([choices, midi], {format: 'A4', mois: '2026-10'})
  assert.equal(lignes.length, 2) // pas la scolaire, pas novembre
  assert.match(agendaImprime(ctx, reglages, [choices, midi], {format: 'A4', mois: '2026-11'}), /novembre 2026/)
})

test('les textes pour les réseaux', () => {
  for (const v of VARIANTES) {
    const t = texteReseaux(ctx, reglages, choices, v.valeur, {emojis: false, aujourdhui: '2026-10-25'})
    assert.ok(t.includes('CHOICES'), v.valeur)
    assert.ok(!/undefined|null/.test(t), `${v.valeur} : ${t}`)
  }
  assert.match(texteReseaux(ctx, reglages, choices, 'complet', {emojis: false, aujourdhui: '2026-10-25'}), /affiche complet le vendredi 30 octobre/)
})

test('export CSV pour Excel', () => {
  const c = exportRepresentations(ctx, [choices])
  assert.ok(c.startsWith('﻿Date;Jour;Heure'))
  assert.match(c, /29\.10\.2026;jeudi;20h;Choices/)
  assert.equal(csv([['a;b', 'c"d']]), '﻿"a;b";"c""d"\r\n')
  assert.equal(echapper('<a href="x">'), '&lt;a href=&quot;x&quot;&gt;')
})
