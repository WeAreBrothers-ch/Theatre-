import {parse, evaluate} from 'groq-js'

/*
 * Doublure de « sanity » pour le banc d'essai : un client qui lit et écrit dans un jeu de
 * documents en mémoire (évalué en GROQ par groq-js), et les quelques crochets utilisés par
 * les outils.
 */

type Doc = {_id: string; _type: string; _rev?: string; [cle: string]: unknown}

export const jeu: {docs: Doc[]} = {docs: []}
const ecouteurs = new Set<() => void>()
let compteur = 1

function appliquerPatch(doc: Doc, p: {set?: Record<string, unknown>; ifRevisionID?: string}) {
  if (p.ifRevisionID && p.ifRevisionID !== doc._rev) throw Object.assign(new Error('Revision mismatch'), {statusCode: 409})
  Object.assign(doc, p.set ?? {})
  doc._rev = `r${compteur++}`
  doc._updatedAt = new Date().toISOString()
}

class Patch {
  ops: {set?: Record<string, unknown>; ifRevisionID?: string} = {}
  constructor(public id: string) {}
  ifRevisionId(rev: string) {
    this.ops.ifRevisionID = rev
    return this
  }
  set(champs: Record<string, unknown>) {
    this.ops.set = {...this.ops.set, ...champs}
    return this
  }
  async commit() {
    const doc = jeu.docs.find((d) => d._id === this.id)
    if (doc) appliquerPatch(doc, this.ops)
    ecouteurs.forEach((f) => f())
    return doc
  }
}

class Transaction {
  ops: (() => void)[] = []
  patch(id: string, fn: (p: Patch) => Patch) {
    const p = fn(new Patch(id))
    this.ops.push(() => {
      const doc = jeu.docs.find((d) => d._id === id)
      if (!doc) throw new Error(`Document absent : ${id}`)
      appliquerPatch(doc, p.ops)
    })
    return this
  }
  createOrReplace(doc: Doc) {
    this.ops.push(() => {
      jeu.docs = [...jeu.docs.filter((d) => d._id !== doc._id), {...doc, _rev: `r${compteur++}`}]
    })
    return this
  }
  create(doc: Doc) {
    return this.createOrReplace(doc)
  }
  delete(id: string) {
    this.ops.push(() => {
      jeu.docs = jeu.docs.filter((d) => d._id !== id)
    })
    return this
  }
  async commit() {
    const avant = structuredClone(jeu.docs)
    try {
      this.ops.forEach((op) => op())
    } catch (e) {
      jeu.docs = avant
      throw e
    }
    ecouteurs.forEach((f) => f())
    return {}
  }
}

const client = {
  withConfig: () => client,
  async fetch<T>(requete: string, params: Record<string, unknown> = {}): Promise<T> {
    const arbre = parse(requete, {params})
    const resultat = await evaluate(arbre, {dataset: jeu.docs, params})
    // Comme le vrai client : des copies, jamais les documents eux-mêmes.
    return structuredClone(await resultat.get()) as T
  },
  listen: () => ({
    subscribe: ({next}: {next: () => void}) => {
      ecouteurs.add(next)
      return {unsubscribe: () => ecouteurs.delete(next)}
    },
  }),
  transaction: () => new Transaction(),
  patch: (id: string) => new Patch(id),
  async create(doc: Doc) {
    jeu.docs.push({...doc, _rev: `r${compteur++}`})
    ecouteurs.forEach((f) => f())
    return doc
  },
}

export const useClient = () => client
export const useCurrentUser = () => ({name: 'Anicée Willemin', roles: [{name: 'editor'}]})
export const useWorkspace = () => ({basePath: ''})
export const useProjectId = () => 'pgmabzq0'
export const useDataset = () => 'production'
export const useFormValue = () => undefined
export const useEditState = () => ({published: null})
export const set = (valeur: unknown, chemin: unknown[] = []) => ({type: 'set', path: chemin, value: valeur})
