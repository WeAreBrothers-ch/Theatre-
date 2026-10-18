import {useCallback, useMemo} from 'react'
import {useClient} from 'sanity'
import {API_VERSION} from '../../lib/constantes'
import {modifierRepresentations} from '../../lib/ecriture'
import {aplatir, clesEnConflit, conflits, nouvelleCle, type Rep, type RepresentationBrute, type Statut} from '../../lib/representations'
import {local, quand, versIso} from '../../lib/temps'
import {etat} from '../commun/statuts'
import {useHistorique} from '../commun/historique'
import {useRequete} from '../commun/donnees'

/*
 * Les données de l'agenda et les gestes qu'on y fait. Chaque geste est publié tout de suite
 * (le site suit dans le quart d'heure) et peut être annulé.
 */

export type SpectacleAgenda = {
  _id: string
  titre?: string
  duree?: string
  genre?: string
  etiquettes?: string[]
  encre?: string
  saison?: string
  lieu?: {_ref?: string} | null
  representations?: RepresentationBrute[] | null
  /** Seulement en brouillon : rien n'est encore sur le site. */
  nonPublie?: boolean
  /** Des modifications attendent d'être publiées dans la fiche. */
  brouillon?: boolean
}

export type Lieu = {_id: string; nom: string; capacite?: number}
export type Saison = {_id: string; titre: string; debut?: string; fin?: string; courante?: boolean}

export type RepAgenda = Rep & {encre?: string; nonPublie?: boolean; lieuNom?: string}

const REQUETE = /* groq */ `{
  "spectacles": *[_type == "spectacle"]{
    _id, titre, duree, genre, etiquettes, lieu, representations, "saison": saison._ref,
    "encre": coalesce(encre.hex, visuel.asset->metadata.palette.vibrant.background, visuel.asset->metadata.palette.dominant.background)
  },
  "lieux": *[_type == "lieu" && !(_id in path("drafts.**"))] | order(ordre asc, nom asc){_id, nom, capacite},
  "saisons": *[_type == "saison" && !(_id in path("drafts.**"))] | order(debut desc){_id, titre, debut, fin, courante}
}`

type Brut = {spectacles: SpectacleAgenda[]; lieux: Lieu[]; saisons: Saison[]}

/** Une fiche par spectacle : la version publiée si elle existe, sinon le brouillon. */
function fusionner(docs: SpectacleAgenda[]): SpectacleAgenda[] {
  const parId = new Map<string, {publie?: SpectacleAgenda; brouillon?: SpectacleAgenda}>()
  for (const d of docs) {
    if (d._id.startsWith('versions.')) continue
    const id = d._id.replace(/^drafts\./, '')
    const e = parId.get(id) ?? {}
    if (d._id.startsWith('drafts.')) e.brouillon = d
    else e.publie = d
    parId.set(id, e)
  }
  return [...parId.entries()].map(([id, {publie, brouillon}]) => ({
    ...(publie ?? brouillon)!,
    _id: id,
    nonPublie: !publie,
    brouillon: !!publie && !!brouillon,
  }))
}

export function useAgenda() {
  const client = useClient({apiVersion: API_VERSION})
  const historique = useHistorique()
  const {donnees, erreur, chargement, recharger} = useRequete<Brut>(REQUETE, {}, ['spectacle', 'lieu', 'saison'])

  const spectacles = useMemo(() => (donnees ? fusionner(donnees.spectacles).sort((a, b) => (a.titre ?? '').localeCompare(b.titre ?? '', 'fr')) : []), [donnees])
  const lieux = useMemo(() => donnees?.lieux ?? [], [donnees])
  const saisons = useMemo(() => donnees?.saisons ?? [], [donnees])
  const nomsLieux = useMemo(() => new Map(lieux.map((l) => [l._id, l.nom])), [lieux])

  const reps: RepAgenda[] = useMemo(() => {
    const parId = new Map(spectacles.map((s) => [s._id, s]))
    return aplatir(spectacles).map((r) => {
      const s = parId.get(r.spectacleId)
      return {...r, encre: s?.encre, nonPublie: s?.nonPublie, lieuNom: r.lieuId ? nomsLieux.get(r.lieuId) : undefined}
    })
  }, [spectacles, nomsLieux])

  const listeConflits = useMemo(() => conflits(reps), [reps])
  const enConflit = useMemo(() => clesEnConflit(listeConflits), [listeConflits])

  const apres = useCallback(
    async (ok: boolean) => {
      if (ok) recharger()
      return ok
    },
    [recharger],
  )

  const changerStatut = useCallback(
    (r: RepAgenda, statut: Statut) =>
      historique
        .geste(
          `${r.titre}, ${quand(r.iso)} : ${etat(statut).titre.toLowerCase()}`,
          [r.spectacleId],
          () => modifierRepresentations(client, r.spectacleId, (liste) => liste.map((x) => (x._key === r.cle ? {...x, statut} : x))),
          {
            title: `« ${r.titre} », ${quand(r.iso)} : ${etat(statut).titre}`,
            description: r.nonPublie ? 'Enregistré dans le brouillon de la fiche.' : 'Publié. Le site suit dans le quart d’heure.',
          },
        )
        .then(apres),
    [client, historique, apres],
  )

  /** Remplace une date par une version modifiée (jour, heure, salle, mention…). */
  const modifier = useCallback(
    (r: RepAgenda, champs: Partial<ChampsDate>, libelle = 'modifier une date') =>
      historique
        .geste(
          `${r.titre} : ${libelle}`,
          [r.spectacleId],
          () =>
            modifierRepresentations(client, r.spectacleId, (liste) =>
              liste.map((x) => (x._key === r.cle ? appliquer(x, champs, spectacles.find((s) => s._id === r.spectacleId)) : x)),
            ),
          {title: `« ${r.titre} » : ${libelle}`, description: r.nonPublie ? 'Enregistré dans le brouillon de la fiche.' : 'Publié. Le site suit dans le quart d’heure.'},
        )
        .then(apres),
    [client, historique, apres, spectacles],
  )

  const supprimer = useCallback(
    (r: RepAgenda) =>
      historique
        .geste(
          `${r.titre} : supprimer la date du ${quand(r.iso)}`,
          [r.spectacleId],
          () => modifierRepresentations(client, r.spectacleId, (liste) => liste.filter((x) => x._key !== r.cle)),
          {title: `Date supprimée : « ${r.titre} », ${quand(r.iso)}`, description: 'Le bouton Annuler la remet.'},
        )
        .then(apres),
    [client, historique, apres],
  )

  const ajouter = useCallback(
    (spectacleId: string, champs: ChampsDate) => {
      const s = spectacles.find((x) => x._id === spectacleId)
      const nouvelle = appliquer({_key: nouvelleCle(), _type: 'representation', statut: 'en-vente'}, champs, s)
      return historique
        .geste(
          `${s?.titre ?? 'Spectacle'} : ajouter le ${quand(nouvelle.dateHeure!)}`,
          [spectacleId],
          () => modifierRepresentations(client, spectacleId, (liste) => [...liste, nouvelle]),
          {
            title: `Date ajoutée : « ${s?.titre ?? 'Spectacle'} », ${quand(nouvelle.dateHeure!)}`,
            description: s?.nonPublie ? 'Enregistrée dans le brouillon de la fiche.' : 'Publiée. Le site suit dans le quart d’heure.',
          },
        )
        .then(apres)
    },
    [client, historique, apres, spectacles],
  )

  return {
    chargement,
    erreur,
    spectacles,
    lieux,
    saisons,
    reps,
    conflits: listeConflits,
    enConflit,
    changerStatut,
    modifier,
    supprimer,
    ajouter,
    annuler: historique.annuler,
    dernierGeste: historique.dernier,
    enCours: historique.enCours,
  }
}

export type ChampsDate = {
  date: string
  heure: string
  /** Salle de cette date ; vide = la salle du spectacle. */
  lieuId?: string | null
  mention?: string
  statut?: Statut
  scolaire?: boolean
  heureAConfirmer?: boolean
}

/** Applique des champs saisis à une représentation stockée. */
export function appliquer(r: RepresentationBrute, champs: Partial<ChampsDate>, spectacle?: SpectacleAgenda): RepresentationBrute {
  const suivant: RepresentationBrute = {...r}
  if (champs.date || champs.heure) {
    const actuel = r.dateHeure ? local(r.dateHeure) : {date: '', heure: '20:00'}
    suivant.dateHeure = versIso(champs.date || actuel.date, champs.heure || actuel.heure)
  }
  if (champs.lieuId !== undefined) {
    const lieuSpectacle = spectacle?.lieu?._ref
    if (!champs.lieuId || champs.lieuId === lieuSpectacle) delete suivant.lieu
    else suivant.lieu = {_type: 'reference', _ref: champs.lieuId}
  }
  if (champs.mention !== undefined) {
    if (champs.mention.trim()) suivant.mention = champs.mention.trim()
    else delete suivant.mention
  }
  if (champs.statut) suivant.statut = champs.statut
  for (const cle of ['scolaire', 'heureAConfirmer'] as const) {
    if (champs[cle] === undefined) continue
    if (champs[cle]) suivant[cle] = true
    else delete suivant[cle]
  }
  return suivant
}
