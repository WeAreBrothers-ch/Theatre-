import 'server-only'
import {readFile} from 'node:fs/promises'
import {join} from 'node:path'
import {cache} from 'react'
import {evaluate, parse} from 'groq-js'
import {client} from './client'
import {source} from './env'
import {sanityFetch} from './live'
import {REQ_SANITY_REMPLI} from './requetes'

/*
 * Un seul point d'entrée pour les contenus.
 *
 * Tant que le Content Lake est vide, le site lit le jeu d'amorçage local
 * (web/sanity/amorce.json, produit par studio/scripts/generer-amorce.mjs)
 * avec les mêmes requêtes GROQ. Dès le premier spectacle publié dans Sanity,
 * il bascule sur Sanity, avec mise à jour en direct.
 */

let verification: {quand: number; resultat: Promise<boolean>} | null = null

async function sanityEstRempli(): Promise<boolean> {
  if (source === 'sanity') return true
  if (source === 'amorce') return false
  const maintenant = Date.now()
  if (!verification || maintenant - verification.quand > 60_000) {
    verification = {
      quand: maintenant,
      resultat: client
        .fetch<number>(REQ_SANITY_REMPLI, {}, {next: {revalidate: 60, tags: ['sanity:rempli']}})
        .then((n) => n > 0)
        .catch(() => false),
    }
  }
  return verification.resultat
}

/** Vrai quand les contenus viennent de Sanity (sert à brancher la mise à jour en direct). */
export const contenusSanity = cache(sanityEstRempli)

let jeuLocal: Promise<unknown[]> | null = null
function lireAmorce(): Promise<unknown[]> {
  jeuLocal ??= readFile(join(process.cwd(), 'sanity/amorce.json'), 'utf8').then((texte) => JSON.parse(texte) as unknown[])
  return jeuLocal
}

async function evaluerLocalement<T>(requete: string, params: Record<string, unknown>): Promise<T> {
  const dataset = await lireAmorce()
  const arbre = parse(requete, {params})
  const resultat = await evaluate(arbre, {dataset, params})
  return (await resultat.get()) as T
}

type Options = {params?: Record<string, unknown>; publie?: boolean}

/**
 * Exécute une requête GROQ.
 * `publie: true` force les contenus publiés sans encodage (generateStaticParams, sitemap).
 */
export async function charger<T>(requete: string, {params = {}, publie = false}: Options = {}): Promise<T> {
  if (await contenusSanity()) {
    const {data} = await sanityFetch({query: requete, params, ...(publie ? {perspective: 'published' as const, stega: false} : {})})
    return data as T
  }
  return evaluerLocalement<T>(requete, params)
}
