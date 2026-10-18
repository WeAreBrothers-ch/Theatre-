import {test} from 'node:test'
import assert from 'node:assert/strict'
import {aplatir, conflits, devinerAnnee, genererSerie, lireListe, trier} from '../lib/representations.ts'
import {local} from '../lib/temps.ts'

const heures = (isos: string[]) => isos.map((i) => {
  const l = local(i)
  return `${l.date} ${l.heure}`
})

test('une série : du mardi au samedi à 20h, le dimanche à 17h, avec relâche', () => {
  const isos = genererSerie({du: '2026-11-03', au: '2026-11-15', heures: {2: '20:00', 3: '20:00', 4: '20:00', 5: '20:00', 6: '20:00', 0: '17:00'}, sauf: ['2026-11-11']})
  assert.deepEqual(heures(isos), [
    '2026-11-03 20:00', '2026-11-04 20:00', '2026-11-05 20:00', '2026-11-06 20:00', '2026-11-07 20:00', '2026-11-08 17:00',
    '2026-11-10 20:00', '2026-11-12 20:00', '2026-11-13 20:00', '2026-11-14 20:00', '2026-11-15 17:00',
  ])
  assert.deepEqual(genererSerie({du: '2026-11-10', au: '2026-11-01', heures: {2: '20:00'}}), [])
})

test('une liste collée depuis un e-mail', () => {
  const {isos, incomprises} = lireListe('Je 29.10 – 20h\nve 30 octobre à 19h30, 1.11.2026 17:00\n2027-01-15\n31.02\nà définir', '2026-09-01')
  assert.deepEqual(heures(isos), ['2026-10-29 20:00', '2026-10-30 19:30', '2026-11-01 17:00', '2027-01-15 20:00'])
  assert.deepEqual(incomprises, ['31.02', 'à définir'])
})

test('l’année d’une date sans année suit la saison', () => {
  assert.equal(devinerAnnee(10, 29, '2026-09-01'), 2026)
  assert.equal(devinerAnnee(3, 5, '2026-09-01'), 2027)
  assert.equal(devinerAnnee(6, 20, '2026-09-01'), 2027)
  assert.equal(devinerAnnee(8, 10, '2026-09-01'), 2026) // juste avant la saison : toléré
})

test('les chevauchements dans une même salle', () => {
  const reps = aplatir([
    {_id: 'a', titre: 'A', duree: '1h30', lieu: {_ref: 'gs'}, representations: [{_key: '1', dateHeure: '2026-11-05T19:00:00Z'}]},
    {_id: 'b', titre: 'B', duree: '1h', lieu: {_ref: 'gs'}, representations: [{_key: '1', dateHeure: '2026-11-05T20:00:00Z'}, {_key: '2', dateHeure: '2026-11-06T20:30:00Z'}]},
    {_id: 'c', titre: 'C', lieu: {_ref: 's1'}, representations: [{_key: '1', dateHeure: '2026-11-05T19:00:00Z'}]},
    {_id: 'd', titre: 'D', duree: '1h', lieu: {_ref: 'gs'}, representations: [{_key: '1', dateHeure: '2026-11-06T19:30:00Z', statut: 'annule'}]},
  ])
  const trouves = conflits(reps).map((c) => `${c.a.titre}/${c.b.titre}`)
  // A (20h → 21h30) chevauche B (21h) ; C est dans une autre salle ; D est annulé.
  assert.deepEqual(trouves, ['A/B'])
})

test('deux spectacles qui s’enchaînent sans se toucher ne sont pas en conflit', () => {
  const reps = aplatir([
    {_id: 'a', titre: 'A', duree: '1h', lieu: {_ref: 'gs'}, representations: [{_key: '1', dateHeure: '2026-11-05T11:15:00Z'}]},
    {_id: 'b', titre: 'B', duree: '1h', lieu: {_ref: 'gs'}, representations: [{_key: '1', dateHeure: '2026-11-05T12:15:00Z'}]},
  ])
  assert.deepEqual(conflits(reps), [])
})

test('une date jouée ailleurs que dans la salle du spectacle', () => {
  const [r] = aplatir([{_id: 'a', titre: 'A', lieu: {_ref: 'gs'}, representations: [{_key: '1', dateHeure: '2026-11-05T19:00:00Z', lieu: {_ref: 'temple'}}]}])
  assert.equal(r.lieuId, 'temple')
})

test('tri des représentations', () => {
  assert.deepEqual(trier([{dateHeure: '2026-11-02'}, {}, {dateHeure: '2026-11-01'}]).map((r) => r.dateHeure), ['2026-11-01', '2026-11-02', undefined])
})
