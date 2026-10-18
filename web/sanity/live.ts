import {defineLive} from 'next-sanity/live'
import {client} from './client'
import {tokenLecture} from './env'

/*
 * Contenus en direct : une modification publiée dans le Studio met à jour le site
 * en quelques secondes, sans redéploiement. En mode aperçu, les brouillons s'affichent aussi.
 */
export const {sanityFetch, SanityLive} = defineLive({
  client,
  serverToken: tokenLecture || false,
  browserToken: tokenLecture || false,
})
