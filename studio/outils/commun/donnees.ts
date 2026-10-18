import {useCallback, useEffect, useRef, useState} from 'react'
import {useClient} from 'sanity'
import {useRouter} from 'sanity/router'
import {API_VERSION} from '../../lib/constantes'

/*
 * Lecture des données pour les outils du Studio, avec mise à jour en direct :
 * dès qu'un document du type écouté change (ici ou sur l'ordinateur d'une collègue),
 * la requête est relancée, une seconde plus tard pour regrouper les rafales.
 */
export function useRequete<T>(requete: string, params: Record<string, unknown>, ecouter: string[]) {
  const client = useClient({apiVersion: API_VERSION})
  const [donnees, setDonnees] = useState<T | null>(null)
  const [erreur, setErreur] = useState<string | null>(null)
  const [version, setVersion] = useState(0)
  const cleParams = JSON.stringify(params)
  const cleTypes = ecouter.join(',')

  const recharger = useCallback(() => setVersion((v) => v + 1), [])

  useEffect(() => {
    let actif = true
    client
      .withConfig({perspective: 'raw'})
      .fetch<T>(requete, JSON.parse(cleParams))
      .then((d) => {
        if (!actif) return
        setDonnees(d)
        setErreur(null)
      })
      .catch((e: Error) => actif && setErreur(e.message))
    return () => {
      actif = false
    }
  }, [client, requete, cleParams, version])

  useEffect(() => {
    if (!cleTypes) return
    let minuterie: ReturnType<typeof setTimeout> | undefined
    const abonnement = client
      .listen(`*[_type in $types]`, {types: cleTypes.split(',')}, {visibility: 'query', events: ['mutation'], includeResult: false})
      .subscribe({
        next: () => {
          clearTimeout(minuterie)
          minuterie = setTimeout(() => setVersion((v) => v + 1), 900)
        },
        error: () => undefined,
      })
    return () => {
      clearTimeout(minuterie)
      abonnement.unsubscribe()
    }
  }, [client, cleTypes])

  return {donnees, erreur, recharger, chargement: donnees === null && !erreur}
}

/** Ouvre un document dans le Studio. */
export function useOuvrir() {
  const router = useRouter()
  return useCallback((id: string, type: string) => router.navigateIntent('edit', {id: id.replace(/^drafts\./, ''), type}), [router])
}

/** Mémorise une préférence d'affichage dans le navigateur (vue, filtre…). Jamais bloquant. */
export function usePreference<T>(cle: string, initial: T): [T, (v: T) => void] {
  const [valeur, setValeur] = useState<T>(() => {
    try {
      const brut = window.localStorage.getItem(`tbb.${cle}`)
      return brut === null ? initial : (JSON.parse(brut) as T)
    } catch {
      return initial
    }
  })
  const premier = useRef(true)
  useEffect(() => {
    if (premier.current) {
      premier.current = false
      return
    }
    try {
      window.localStorage.setItem(`tbb.${cle}`, JSON.stringify(valeur))
    } catch {
      /* navigation privée : on s'en passe */
    }
  }, [cle, valeur])
  return [valeur, setValeur]
}
