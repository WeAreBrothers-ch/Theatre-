import Link from 'next/link'
import type {ReactNode} from 'react'
import {stegaClean} from 'next-sanity'
import {sourceImage} from '@/lib/image'
import {typo} from '@/lib/typo'
import type {Img} from '@/sanity/types'
import {Mots} from './Mots'
import {ImageImprimee} from './Visuels'

/** En-tête des pages intérieures : fil d'Ariane, très grand titre, introduction, image facultative. */
export function TetePage({titre, surtitre, intro, image, enPlus}: {titre: string; surtitre?: string | null; intro?: string | null; image?: Img | null; enPlus?: ReactNode}) {
  const mobile = sourceImage(image, {ratio: 16 / 10, gris: true, max: 1440})
  const large = sourceImage(image, {ratio: 21 / 8, gris: true, max: 1920})
  // Un mot très long (Professionnel·les) prend une taille plus petite, pour tenir dans l'écran.
  const motLePlusLong = Math.max(...titre.split(/\s+/).map((m) => m.length))
  const taille = motLePlusLong > 15 ? 't-l' : motLePlusLong > 11 ? 't-xl' : 't-xxl'
  return (
    <header className="tete-page bande">
      <div className="cadre">
        <nav aria-label="Fil d’Ariane">
          <ol className="fil-ariane">
            <li>
              <Link href="/">Accueil</Link>
            </li>
            <li aria-current="page">{surtitre || titre}</li>
          </ol>
        </nav>
        <h1 className={`t-affiche ${taille} mots-entree`}>
          <Mots texte={typo(titre)} />
        </h1>
        {(intro || enPlus) && (
          <div className="tete-page__intro">
            {intro && <p>{typo(intro)}</p>}
            {enPlus}
          </div>
        )}
        {mobile && (
          <figure className="tete-page__image">
            <ImageImprimee
              source={mobile}
              variante={{media: '(min-width: 1024px)', source: large, sizes: '100vw'}}
              sizes="72vw"
              priorite
              alt={stegaClean(image?.alt) || ''}
              trame
            />
            {image?.legende && <figcaption>{image.legende}</figcaption>}
          </figure>
        )}
      </div>
    </header>
  )
}
