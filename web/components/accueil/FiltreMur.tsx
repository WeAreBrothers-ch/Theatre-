'use client'

import {useState, type ReactNode} from 'react'

/*
 * Filtres du mur d'affiches. Les affiches sont rendues par le serveur ; chacune
 * sait à quels filtres elle appartient (attribut data-dans). Ici, on ne change
 * qu'un attribut : la feuille de style montre les bonnes affiches, sans rechargement.
 */
export function FiltreMur({filtres, children, classeMur = 'mur'}: {filtres: {valeur: string; titre: string; nombre: number}[]; children: ReactNode; classeMur?: string}) {
  const [filtre, setFiltre] = useState('tout')
  return (
    <>
      <div className="filtres" role="group" aria-label="Filtrer par genre" style={{marginBottom: 'clamp(20px, 3vw, 36px)'}}>
        {filtres.map((f) => (
          <button key={f.valeur} type="button" className="filtre" aria-pressed={filtre === f.valeur} onClick={() => setFiltre(f.valeur)}>
            {f.titre} <span className="filtre__nombre">{f.nombre}</span>
          </button>
        ))}
      </div>
      <div className={classeMur} data-filtre={filtre} aria-live="polite">
        {children}
      </div>
    </>
  )
}
