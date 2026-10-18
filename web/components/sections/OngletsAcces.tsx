'use client'

import {useId, useState, type ReactNode} from 'react'

export type MoyenAcces = {titre: string; court: string; texte: ReactNode; icone: ReactNode}

/*
 * Venir au théâtre. Sur téléphone, quatre boutons à pictogramme et un seul texte à la fois,
 * plutôt qu'une liste ; sur ordinateur, la liste complète (les boutons sont masqués).
 */
export function OngletsAcces({moyens}: {moyens: MoyenAcces[]}) {
  const [actif, setActif] = useState(0)
  const id = useId()
  return (
    <div className="acces__moyens">
      {moyens.length > 1 && (
        <div className="choix-acces" role="group" aria-label="Choisir un moyen d’accès">
          {moyens.map((m, i) => (
            <button key={m.titre} type="button" aria-pressed={i === actif} aria-controls={`${id}-${i}`} onClick={() => setActif(i)}>
              {m.icone}
              <span>{m.court}</span>
            </button>
          ))}
        </div>
      )}
      <ul className="liste-acces">
        {moyens.map((m, i) => (
          <li key={m.titre} id={`${id}-${i}`} data-actif={i === actif ? '' : undefined}>
            <span className="pictogramme" aria-hidden="true">
              {m.icone}
            </span>
            <div>
              <strong>{m.titre}</strong>
              <p>{m.texte}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
