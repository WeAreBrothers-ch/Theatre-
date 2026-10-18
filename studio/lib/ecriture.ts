import type {SanityClient} from 'sanity'
import {trier, type RepresentationBrute} from './representations.ts'

/*
 * Écrire depuis les outils du Studio (agenda, tableau de bord) sans passer par le formulaire.
 *
 * Les représentations vivent dans le document du spectacle. Une modification faite ici
 * (« Complet », une date déplacée) est publiée tout de suite, et reportée aussi dans le
 * brouillon s'il y en a un : sinon, la prochaine publication du brouillon l'effacerait.
 *
 * Chaque écriture vérifie que le document n'a pas changé entre la lecture et l'écriture
 * (ifRevisionId) ; si quelqu'un l'a modifié entre-temps, on relit et on recommence.
 */

type Doc = {_id: string; _rev: string; [cle: string]: unknown}

export const idPublie = (id: string) => id.replace(/^drafts\./, '')
export const idBrouillon = (id: string) => `drafts.${idPublie(id)}`

const brut = (client: SanityClient) => client.withConfig({perspective: 'raw', useCdn: false})

/** Le document publié et son brouillon, s'ils existent. */
export async function versions(client: SanityClient, id: string): Promise<Doc[]> {
  return brut(client).fetch<Doc[]>(`*[_id in [$publie, $brouillon]]`, {publie: idPublie(id), brouillon: idBrouillon(id)})
}

function estConflitDeRevision(e: unknown): boolean {
  const err = e as {statusCode?: number; message?: string}
  return err?.statusCode === 409 || /revision|rev\b/i.test(err?.message ?? '')
}

/**
 * Applique `transformer` à chaque version d'un document (publiée et brouillon),
 * dans une seule transaction. Rejoue jusqu'à trois fois en cas d'écriture concurrente.
 */
export async function modifierVersions(
  client: SanityClient,
  id: string,
  transformer: (doc: Doc) => Record<string, unknown> | null,
): Promise<number> {
  for (let essai = 0; ; essai++) {
    const docs = await versions(client, id)
    const tx = client.transaction()
    let n = 0
    for (const doc of docs) {
      const champs = transformer(doc)
      if (!champs) continue
      tx.patch(doc._id, (p) => p.ifRevisionId(doc._rev).set(champs))
      n++
    }
    if (!n) return 0
    try {
      await tx.commit({visibility: 'async'})
      return n
    } catch (e) {
      if (essai < 2 && estConflitDeRevision(e)) continue
      throw e
    }
  }
}

/** Modifie les représentations d'un spectacle (publié et brouillon), toujours triées par date. */
export function modifierRepresentations(
  client: SanityClient,
  spectacleId: string,
  transformer: (reps: RepresentationBrute[]) => RepresentationBrute[],
): Promise<number> {
  return modifierVersions(client, spectacleId, (doc) => {
    const avant = (doc.representations as RepresentationBrute[] | undefined) ?? []
    const apres = trier(transformer(avant))
    return JSON.stringify(avant) === JSON.stringify(apres) ? null : {representations: apres}
  })
}

/* ---------------------------------------------------------------------------
 * Annuler : une photo des documents touchés, prise avant chaque geste.
 * ------------------------------------------------------------------------- */

export type Photo = {geste: string; documents: Doc[]; ids: string[]}

const SYSTEME = ['_rev', '_createdAt', '_updatedAt']
const sansSysteme = (d: Doc) => Object.fromEntries(Object.entries(d).filter(([k]) => !SYSTEME.includes(k))) as Doc

/** Photographie les versions publiées et brouillons des documents donnés. */
export async function photographier(client: SanityClient, geste: string, ids: string[]): Promise<Photo> {
  const tous = [...new Set(ids.flatMap((id) => [idPublie(id), idBrouillon(id)]))]
  const documents = await brut(client).fetch<Doc[]>(`*[_id in $ids]`, {ids: tous})
  return {geste, documents, ids: tous}
}

/** Remet les documents dans l'état de la photo (et retire les brouillons apparus depuis). */
export async function restaurer(client: SanityClient, photo: Photo): Promise<void> {
  const actuels = await brut(client).fetch<string[]>(`*[_id in $ids]._id`, {ids: photo.ids})
  const presents = new Set(photo.documents.map((d) => d._id))
  const tx = client.transaction()
  for (const id of actuels) if (!presents.has(id)) tx.delete(id)
  for (const d of photo.documents) tx.createOrReplace(sansSysteme(d) as Doc & {_type: string})
  await tx.commit({visibility: 'async'})
}
