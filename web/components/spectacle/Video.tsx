'use client'

import {useEffect, useRef, useState, type ReactNode} from 'react'
import {preconnect} from 'react-dom'
import {Lecture} from '@/components/Icones'

/*
 * Bande-annonce : une vignette tant qu'on ne la lance pas. Le lecteur Vimeo ou YouTube
 * (près de 800 Ko de scripts) n'est chargé qu'au clic, et la connexion s'ouvre au survol.
 */
export function Video({src, titre, children}: {src: string; titre: string; children?: ReactNode}) {
  const [lancee, setLancee] = useState(false)
  const lecteur = useRef<HTMLIFrameElement>(null)
  const origine = new URL(src).origin

  // Le bouton disparaît : le clavier passe au lecteur.
  useEffect(() => {
    if (lancee) lecteur.current?.focus()
  }, [lancee])

  if (lancee) {
    return (
      <div className="video">
        <iframe ref={lecteur} src={`${src}${src.includes('?') ? '&' : '?'}autoplay=1`} title={titre} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen />
      </div>
    )
  }
  return (
    <div className="video">
      <button type="button" className="video__vignette" onClick={() => setLancee(true)} onPointerEnter={() => preconnect(origine)} onFocus={() => preconnect(origine)}>
        {children}
        <span className="video__lancer">
          <Lecture />
          <span>
            Lire la bande-annonce<span className="visuellement-cache"> : {titre}</span>
          </span>
        </span>
      </button>
    </div>
  )
}
