import {draftMode} from 'next/headers'
import {VisualEditing} from 'next-sanity/visual-editing'
import {contenusSanity} from './charger'
import {SanityLive} from './live'

/*
 * Mise à jour en direct (contenus publiés) et aperçu des brouillons pour le Studio.
 * La version statique du site (GitHub Pages) remplace ce fichier par statique/apercu.tsx.
 */
export async function Apercu() {
  const [sanity, brouillons] = await Promise.all([contenusSanity(), draftMode()])
  return (
    <>
      {sanity && <SanityLive />}
      {brouillons.isEnabled && <VisualEditing />}
    </>
  )
}
