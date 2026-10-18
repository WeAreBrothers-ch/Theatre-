import {local, heureLisible, dateLongue, JOURS} from '../temps.ts'
import {STATUTS, dureeCourte, paragraphes, prixEnLigne, repsPubliques, urlSpectacle, type Contexte, type SpectacleCom} from './commun.ts'

/*
 * La saison en tableau, pour la graphiste de la brochure, la presse ou la comptabilité.
 * Fichiers CSV à séparateur point-virgule et avec BOM : Excel les ouvre directement,
 * accents compris, sur les ordinateurs réglés en français.
 */

function cellule(v: unknown): string {
  const t = v === null || v === undefined ? '' : String(v)
  return /[;"\n\r]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t
}

export function csv(lignes: unknown[][]): string {
  return '﻿' + lignes.map((l) => l.map(cellule).join(';')).join('\r\n') + '\r\n'
}

/** Une ligne par représentation. */
export function exportRepresentations(ctx: Contexte, spectacles: SpectacleCom[]): string {
  const lignes: unknown[][] = [['Date', 'Jour', 'Heure', 'Titre', 'Compagnie', 'Genre', 'Lieu', 'État', 'Mention', 'Scolaire', 'Durée', 'Public', 'Prix', 'Page']]
  const reps = spectacles.flatMap((s) => (s.representations ?? []).filter((r) => r.dateHeure).map((r) => ({s, r})))
  reps.sort((a, b) => a.r.dateHeure.localeCompare(b.r.dateHeure))
  for (const {s, r} of reps) {
    const l = local(r.dateHeure)
    lignes.push([
      l.date.split('-').reverse().join('.'),
      JOURS[l.semaine],
      r.heureAConfirmer ? 'à confirmer' : heureLisible(l.heure),
      s.titre,
      s.compagnie,
      s.precision || s.genreLibelle,
      r.lieu || s.lieu,
      STATUTS[r.statut ?? ''] || 'En vente',
      r.mention,
      r.scolaire ? 'oui' : '',
      dureeCourte(s.duree),
      s.age,
      prixEnLigne(s),
      urlSpectacle(ctx, s),
    ])
  }
  return csv(lignes)
}

/** Une ligne par spectacle, avec ses textes : la matière de la brochure. */
export function exportSpectacles(ctx: Contexte, spectacles: SpectacleCom[]): string {
  const lignes: unknown[][] = [
    ['Titre', 'Sous-titre', 'Compagnie', 'Genre', 'Étiquettes', 'Dates', 'Lieu', 'Durée', 'Public', 'Prix', 'Accroche', 'Présentation', 'Distribution', 'Production', 'Page'],
  ]
  const tries = [...spectacles].sort((a, b) => (repsPubliques(a)[0]?.dateHeure ?? '9').localeCompare(repsPubliques(b)[0]?.dateHeure ?? '9'))
  for (const s of tries) {
    const dates = repsPubliques(s)
      .map((r) => {
        const l = local(r.dateHeure)
        return `${dateLongue(l.date, true)}${r.heureAConfirmer ? '' : ` ${heureLisible(l.heure)}`}`
      })
      .join(', ')
    const distribution = (s.distribution ?? [])
      .map((b) => [b.titre, ...(b.lignes ?? []).map((x) => `${x.role} : ${x.noms}`)].filter(Boolean).join('\n'))
      .join('\n\n')
    lignes.push([
      s.titre,
      s.sousTitre,
      s.compagnie,
      s.precision || s.genreLibelle,
      (s.etiquettes ?? []).join(', '),
      dates,
      s.lieuComplet || s.lieu,
      dureeCourte(s.duree),
      s.age,
      prixEnLigne(s),
      s.accroche,
      paragraphes(s.texte)
        .map((p) => p.texte)
        .join('\n\n'),
      distribution,
      s.production,
      urlSpectacle(ctx, s),
    ])
  }
  return csv(lignes)
}
