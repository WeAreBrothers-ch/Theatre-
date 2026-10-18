'use client'

import {useCallback, useEffect, useLayoutEffect, useMemo, useState} from 'react'
import type {Carte} from '@/lib/spectacles'
import {moisCourt, nomMois} from '@/lib/dates'
import {Affiche} from '../Affiche'
import {Croix, Loupe, VueAffiches, VueListe} from '../Icones'
import {Ligne} from '../Ligne'

type Genre = {valeur: string; titre: string}
type Vue = 'liste' | 'affiches'

const normaliser = (t: string) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
const pluriel = (n: number) => `${n} spectacle${n > 1 ? 's' : ''}`

function lireVue(): Vue | null {
  try {
    const v = localStorage.getItem('tbb:vue')
    return v === 'affiches' || v === 'liste' ? v : null
  } catch {
    return null
  }
}

/*
 * Le programme de la saison. Liens directs : /programme#danse, #jeune-public,
 * #midi-theatre, #places (places disponibles). L'adresse suit les filtres.
 */
export function Programme({cartes, genres}: {cartes: Carte[]; genres: Genre[]}) {
  const [genre, setGenre] = useState('tout')
  const [midi, setMidi] = useState(false)
  const [dispo, setDispo] = useState(false)
  const [mois, setMois] = useState('tous')
  const [q, setQ] = useState('')
  const [vue, setVue] = useState<Vue>('liste')
  const [passes, setPasses] = useState(false)

  /** Applique le filtre d'une ancre (#danse, #midi-theatre…). Renvoie vrai si elle en était un. */
  const appliquer = useCallback(
    (ancre: string) => {
      const h = decodeURIComponent(ancre.replace(/^#/, ''))
      if (!h) return false
      if (genres.some((g) => g.valeur === h)) {
        setGenre(h)
        setMidi(false)
      } else if (h === 'midi-theatre') {
        setMidi(true)
        setGenre('tout')
      } else if (h === 'places') setDispo(true)
      else return false
      setMois('tous')
      setQ('')
      return true
    },
    [genres],
  )
  const lireAdresse = useCallback(() => appliquer(window.location.hash), [appliquer])

  // Avant le premier affichage : filtre de l'adresse et vue mémorisée, sans clignement.
  useLayoutEffect(() => {
    lireAdresse()
    const v = lireVue()
    if (v) setVue(v)
  }, [lireAdresse])

  // Liens vers le programme depuis le programme (menu, pied de page) et boutons précédent/suivant.
  useEffect(() => {
    // Un lien vers une ancre du programme depuis cette même page (pied de page, menu) :
    // on applique le filtre et on remonte à la liste.
    // Écouté en phase de capture : le lien de Next voit l'événement déjà traité et ne navigue pas.
    const surClic = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const a = (e.target as Element | null)?.closest?.('a[href*="#"]') as HTMLAnchorElement | null
      if (!a) return
      const url = new URL(a.href, window.location.href)
      if (url.pathname !== window.location.pathname || !appliquer(url.hash)) return
      e.preventDefault()
      window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`)
      window.requestAnimationFrame(() => document.getElementById('liste-programme')?.scrollIntoView({block: 'start'}))
    }
    const surRetour = () => lireAdresse()
    window.addEventListener('hashchange', surRetour)
    window.addEventListener('popstate', surRetour)
    document.addEventListener('click', surClic, true)
    return () => {
      window.removeEventListener('hashchange', surRetour)
      window.removeEventListener('popstate', surRetour)
      document.removeEventListener('click', surClic, true)
    }
  }, [appliquer, lireAdresse])

  const ecrireAdresse = (h: string) => {
    const url = `${window.location.pathname}${window.location.search}${h ? `#${h}` : ''}`
    window.history.replaceState(window.history.state, '', url)
  }

  const choisirGenre = (g: string) => {
    setGenre(g)
    setMidi(false)
    ecrireAdresse(g === 'tout' ? '' : g)
  }
  const basculerMidi = () => {
    const v = !midi
    setMidi(v)
    if (v) setGenre('tout')
    ecrireAdresse(v ? 'midi-theatre' : '')
  }
  const basculerDispo = () => setDispo((v) => !v)
  const changerVue = (v: Vue) => {
    setVue(v)
    try {
      localStorage.setItem('tbb:vue', v)
    } catch {
      /* stockage indisponible : la vue n'est pas mémorisée */
    }
  }
  const effacer = () => {
    setGenre('tout')
    setMidi(false)
    setDispo(false)
    setMois('tous')
    setQ('')
    ecrireAdresse('')
  }

  const base = useMemo(() => (passes ? cartes : cartes.filter((c) => c.etat !== 'passe')), [cartes, passes])
  const nombrePasses = cartes.length - cartes.filter((c) => c.etat !== 'passe').length
  const recherche = normaliser(q)

  const liste = useMemo(
    () =>
      base.filter((c) => {
        if (genre !== 'tout' && c.genre !== genre) return false
        if (midi && !c.midi) return false
        if (dispo && c.etat !== 'en-vente') return false
        if (mois !== 'tous' && c.cleMois !== mois) return false
        if (recherche && !c.recherche.includes(recherche)) return false
        return true
      }),
    [base, genre, midi, dispo, mois, recherche],
  )

  const lesMois = useMemo(() => [...new Set(base.map((c) => c.cleMois).filter(Boolean))].sort(), [base])
  const groupes = useMemo(() => {
    const g = new Map<string, Carte[]>()
    for (const c of liste) g.set(c.cleMois, [...(g.get(c.cleMois) ?? []), c])
    return [...g.entries()].sort(([a], [b]) => a.localeCompare(b))
  }, [liste])
  const compte = (g: string) => base.filter((c) => g === 'tout' || c.genre === g).length

  return (
    <>
      <div className="bande" id="liste-programme">
        <div className="cadre outils__ligne" style={{paddingBlock: '18px 14px'}}>
          <label className="recherche">
            <span className="visuellement-cache">Rechercher un spectacle</span>
            <Loupe />
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Titre, compagnie, artiste…" enterKeyHint="search" autoComplete="off" />
            {q && (
              <button type="button" className="recherche__effacer" onClick={() => setQ('')} aria-label="Effacer la recherche">
                <Croix />
              </button>
            )}
          </label>
          <div className="vue" role="group" aria-label="Affichage du programme">
            <button type="button" aria-pressed={vue === 'liste'} onClick={() => changerVue('liste')}>
              <VueListe />
              <span className="vue__libelle">Liste</span>
              <span className="visuellement-cache">en liste</span>
            </button>
            <button type="button" aria-pressed={vue === 'affiches'} onClick={() => changerVue('affiches')}>
              <VueAffiches />
              <span className="vue__libelle">Affiches</span>
              <span className="visuellement-cache">en affiches</span>
            </button>
          </div>
        </div>
      </div>

      <div className="outils bande">
        <div className="cadre">
          <div className="filtres" role="group" aria-label="Filtrer le programme">
            <button type="button" className="filtre" aria-pressed={genre === 'tout' && !midi} onClick={() => choisirGenre('tout')}>
              Tout <span className="filtre__nombre">{compte('tout')}</span>
            </button>
            {genres
              .filter((g) => compte(g.valeur) > 0)
              .map((g) => (
                <button key={g.valeur} type="button" className="filtre" aria-pressed={genre === g.valeur} onClick={() => choisirGenre(g.valeur)}>
                  {g.titre} <span className="filtre__nombre">{compte(g.valeur)}</span>
                </button>
              ))}
            <button type="button" className="filtre" aria-pressed={midi} onClick={basculerMidi}>
              Midi théâtre
            </button>
            <button type="button" className="filtre" aria-pressed={dispo} onClick={basculerDispo}>
              Places disponibles
            </button>
          </div>
          {lesMois.length > 1 && (
            <div className="mois-nav" role="group" aria-label="Choisir un mois">
              <button type="button" aria-pressed={mois === 'tous'} onClick={() => setMois('tous')}>
                Toute la saison
              </button>
              {lesMois.map((m) => (
                <button key={m} type="button" aria-pressed={mois === m} onClick={() => setMois(m)} aria-label={`${nomMois(m)} ${m.slice(0, 4)}`}>
                  {moisCourt(m)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bande">
        <div className="cadre" style={{paddingBottom: 'var(--section)'}}>
          <p className="resultats" aria-live="polite" style={{paddingTop: 18}}>
            {pluriel(liste.length)}
            {mois !== 'tous' ? ` en ${nomMois(mois)}` : ''}
          </p>

          {liste.length === 0 ? (
            <div className="vide">
              <p className="t-affiche t-m">Aucun spectacle ne correspond.</p>
              <p>Essayez un autre genre, un autre mois ou un autre mot.</p>
              <button type="button" className="btn btn--trait" onClick={effacer}>
                Effacer les filtres
              </button>
            </div>
          ) : (
            groupes.map(([cle, cartesDuMois]) => (
              <section key={cle} aria-labelledby={`mois-${cle}`}>
                <div className="mois">
                  <h2 className="t-affiche" id={`mois-${cle}`}>
                    {nomMois(cle)}
                    <span className="mois__annee">{cle.slice(0, 4)}</span>
                  </h2>
                  <span className="mois__nombre">{pluriel(cartesDuMois.length)}</span>
                </div>
                {vue === 'liste' ? (
                  <div className="agenda">
                    {cartesDuMois.map((c) => (
                      <Ligne key={c.slug} carte={c} />
                    ))}
                  </div>
                ) : (
                  <div className="mur">
                    {cartesDuMois.map((c) => (
                      <Affiche key={c.slug} carte={c} />
                    ))}
                  </div>
                )}
              </section>
            ))
          )}

          {nombrePasses > 0 && (
            <div className="programme__passes">
              <button type="button" className="btn btn--trait" onClick={() => setPasses((v) => !v)} aria-pressed={passes}>
                {passes ? 'Masquer les spectacles passés' : `Voir aussi les ${pluriel(nombrePasses)} passés de la saison`}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
