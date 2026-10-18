import {test} from 'node:test'
import assert from 'node:assert/strict'
import {aujourdhui, dateLongue, grilleMois, heureLisible, local, lundi, minutesDuree, plusMois, versIso} from '../lib/temps.ts'

/* L'heure de Zurich, été comme hiver, quel que soit le fuseau de l'ordinateur. */

test('20h à Zurich, en été et en hiver', () => {
  assert.equal(versIso('2026-10-24', '20:00'), '2026-10-24T18:00:00.000Z') // heure d'été
  assert.equal(versIso('2026-10-26', '20:00'), '2026-10-26T19:00:00.000Z') // heure d'hiver
  assert.equal(versIso('2027-03-28', '17:00'), '2027-03-28T15:00:00.000Z') // jour du passage à l'heure d'été
})

test('lecture d’un instant à Zurich', () => {
  const l = local('2026-10-29T19:00:00Z')
  assert.equal(l.date, '2026-10-29')
  assert.equal(l.heure, '20:00')
  assert.equal(l.semaine, 4) // jeudi
  // Minuit passé à Zurich, encore la veille en temps universel.
  assert.equal(local('2026-12-31T23:30:00Z').date, '2027-01-01')
  assert.equal(aujourdhui(new Date('2026-12-31T23:30:00Z')), '2027-01-01')
})

test('calendrier', () => {
  assert.equal(lundi('2026-10-29'), '2026-10-26')
  const g = grilleMois('2026-11')
  assert.equal(g[0], '2026-10-26')
  assert.equal(g.length % 7, 0)
  assert.equal(g[g.length - 1], '2026-12-06')
  assert.equal(plusMois('2026-12', 1), '2027-01')
  assert.equal(dateLongue('2026-11-01'), 'dimanche 1er novembre')
  assert.equal(heureLisible('12:15'), '12h15')
  assert.equal(heureLisible('20:00'), '20h')
})

test('durées saisies librement', () => {
  assert.equal(minutesDuree('1h10 avec entracte'), 70)
  assert.equal(minutesDuree('Durée estimée : 1h45'), 105)
  assert.equal(minutesDuree('50 min'), 50)
  assert.equal(minutesDuree('3h40 (avec entracte)'), 220)
  assert.equal(minutesDuree('env. 1h'), 60)
  assert.equal(minutesDuree('Tout public'), null)
  assert.equal(minutesDuree(undefined), null)
})
