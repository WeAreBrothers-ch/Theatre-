import {defineEnableDraftMode} from 'next-sanity/draft-mode'
import {client} from '@/sanity/client'
import {tokenLecture} from '@/sanity/env'

/* Ouvert par l'outil « Aperçu du site » du Studio : affiche les brouillons, modifiables d'un clic. */
export const {GET} = defineEnableDraftMode({
  client: client.withConfig({token: tokenLecture}),
})
