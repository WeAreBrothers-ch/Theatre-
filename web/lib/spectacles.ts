import 'server-only'
import {stegaClean} from 'next-sanity'
import type {CarteBrute} from '@/sanity/types'
import {ETIQUETTES, GENRES, libelle} from './constantes'
import {dateCourte, heuresResume, jourCourt, moment, resumeDates} from './dates'
import {encre, impression, type Encre} from './encre'
import {sourceImage, type SourceImage} from './image'
import {typo} from './typo'

/*
 * Le spectacle tel que le site l'affiche : états calculés à l'instant du rendu
 * (à venir, complet, passé…), encre, bandeau et résumés de dates.
 */

export type Statut = 'en-vente' | 'complet' | 'liste-attente' | 'annule'
export type Etat = Statut | 'passe'
export type Ton = 'rouge' | 'papier' | 'encre' | 'vert'

export type Representation = {
  cle: string
  iso: string
  statut: Statut
  mention?: string | null
  lien?: string | null
  lieu?: string | null
  passee: boolean
}

export type Spectacle = {
  id: string
  slug: string
  titre: string
  sousTitre?: string | null
  compagnie?: string | null
  genre: string
  genreLibelle: string
  precision?: string | null
  etiquettes: string[]
  midi: boolean
  encre: Encre
  impression: 'noir' | 'blanc'
  brut: CarteBrute
  accroche?: string | null
  age?: string | null
  duree?: string | null
  lieu?: string | null
  lieuComplet?: string | null
  representations: Representation[]
  aVenir: Representation[]
  /** La prochaine représentation, ou la première si tout est passé. */
  reference: Representation | null
  etat: Etat
  bandeau: {texte: string; ton: Ton} | null
  lienBilletterie?: string | null
}

const STATUTS_CONNUS: Statut[] = ['en-vente', 'complet', 'liste-attente', 'annule']

export function versSpectacle(c: CarteBrute, instant: Date): Spectacle {
  const t = instant.getTime()
  const representations: Representation[] = (c.representations ?? [])
    .filter((r) => r?.dateHeure)
    .map((r) => {
      const statut = stegaClean(r.statut) as Statut
      return {
        cle: r._key,
        iso: stegaClean(r.dateHeure),
        statut: STATUTS_CONNUS.includes(statut) ? statut : 'en-vente',
        mention: r.mention,
        lien: stegaClean(r.lien) || null,
        lieu: r.lieu,
        passee: new Date(stegaClean(r.dateHeure)).getTime() < t,
      }
    })
    .sort((a, b) => a.iso.localeCompare(b.iso))
  const aVenir = representations.filter((r) => !r.passee)
  const actives = aVenir.filter((r) => r.statut !== 'annule')

  let etat: Etat = 'en-vente'
  if (!aVenir.length) etat = 'passe'
  else if (!actives.length) etat = 'annule'
  else if (actives.every((r) => r.statut === 'complet')) etat = 'complet'
  else if (actives.every((r) => r.statut === 'complet' || r.statut === 'liste-attente')) etat = 'liste-attente'

  const etiquettes = (c.etiquettes ?? []).map((e) => stegaClean(e))
  const genre = stegaClean(c.genre) || 'theatre'

  let bandeau: Spectacle['bandeau'] = null
  if (etat === 'complet') bandeau = {texte: 'Complet', ton: 'rouge'}
  else if (etat === 'liste-attente') bandeau = {texte: 'Liste d’attente', ton: 'papier'}
  else if (etat === 'annule') bandeau = {texte: 'Annulé', ton: 'encre'}
  else if (etiquettes.includes('creation')) bandeau = {texte: 'Création', ton: 'encre'}
  else if (etiquettes.includes('afterwork')) bandeau = {texte: 'Afterwork', ton: 'vert'}

  return {
    id: c._id,
    slug: stegaClean(c.slug),
    titre: c.titre,
    sousTitre: c.sousTitre,
    compagnie: c.compagnie,
    genre,
    genreLibelle: libelle(GENRES, genre),
    precision: c.precision,
    etiquettes,
    midi: etiquettes.includes('midi-theatre'),
    encre: encre(stegaClean(c.encre), stegaClean(c.visuel?.vibrante), stegaClean(c.visuel?.dominante)),
    impression: impression(stegaClean(c.impression), stegaClean(c.visuel?.dominante)),
    brut: c,
    accroche: c.accroche,
    age: c.age,
    duree: c.duree,
    lieu: c.lieu?.nom,
    lieuComplet: c.lieu?.nomComplet || c.lieu?.nom,
    representations,
    aVenir,
    reference: aVenir.find((r) => r.statut !== 'annule') ?? aVenir[0] ?? representations[0] ?? null,
    etat,
    bandeau,
    lienBilletterie: stegaClean(c.lienBilletterie) || null,
  }
}

/** Ordre du programme : date de la prochaine représentation, puis de la première. */
export function parDate(a: Spectacle, b: Spectacle): number {
  return (a.reference?.iso ?? '9999').localeCompare(b.reference?.iso ?? '9999')
}

export const estAVenir = (s: Spectacle) => s.etat !== 'passe'

/* ---------------------------------------------------------------------------
 * Carte : ce qu'il faut pour afficher une affiche ou une ligne d'agenda,
 * sérialisable pour les composants client (programme, filtres).
 * ------------------------------------------------------------------------- */

export type Carte = {
  slug: string
  titre: string
  sousTitre?: string | null
  compagnie?: string | null
  compagnieCourte?: string | null
  genre: string
  genreLibelle: string
  precision?: string | null
  etiquettes: {valeur: string; libelle: string}[]
  midi: boolean
  etat: Etat
  encre: Encre
  impression: 'noir' | 'blanc'
  image: SourceImage | null
  datesCourtes: string
  datesLongues: string
  heures: string
  jour: string
  numero: string
  autres: string
  cleMois: string
  lieu?: string | null
  age?: string | null
  bandeau: Spectacle['bandeau']
  libelleAccessible: string
  recherche: string
}

export function versCarte(s: Spectacle): Carte {
  const isos = (s.aVenir.length ? s.aVenir : s.representations).map((r) => r.iso)
  const ref = s.reference?.iso
  const jours = [...new Set(isos.map((iso) => moment(iso).cleJour))]
  let autres = ''
  if (jours.length === 2) {
    const second = isos.find((iso) => moment(iso).cleJour === jours[1])!
    autres = `et ${jourCourt(second).toLowerCase()} ${dateCourte(second)}`
  } else if (jours.length > 2) autres = `+ ${jours.length - 1} dates`

  const etatTexte = s.etat === 'complet' ? ', complet' : s.etat === 'liste-attente' ? ', liste d’attente' : s.etat === 'annule' ? ', annulé' : ''
  const compagnie = s.compagnie ? stegaClean(s.compagnie) : ''

  return {
    slug: s.slug,
    titre: typo(s.titre),
    sousTitre: typo(s.sousTitre),
    compagnie: typo(s.compagnie),
    compagnieCourte: typo(compagnie.split(' / ')[0]),
    genre: s.genre,
    genreLibelle: s.genreLibelle,
    precision: s.precision,
    etiquettes: s.etiquettes.map((valeur) => ({valeur, libelle: libelle(ETIQUETTES, valeur)})).filter((e) => e.libelle),
    midi: s.midi,
    etat: s.etat,
    encre: s.encre,
    impression: s.impression,
    image: sourceImage(s.brut.visuel, {ratio: 895 / 1280, gris: true, max: 1080}),
    datesCourtes: resumeDates(isos),
    datesLongues: resumeDates(isos, true),
    heures: heuresResume(isos),
    jour: ref ? jourCourt(ref) : '',
    numero: ref ? dateCourte(ref) : '',
    autres,
    cleMois: ref ? moment(ref).cleMois : '',
    lieu: s.lieu,
    age: s.age,
    bandeau: s.bandeau,
    libelleAccessible: `${stegaClean(s.titre)}, ${resumeDates(isos, true)}, ${s.genreLibelle}${etatTexte}`,
    recherche: [s.titre, s.sousTitre, s.compagnie, s.precision, s.genreLibelle]
      .map((x) => stegaClean(x) ?? '')
      .join(' ')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase(),
  }
}
