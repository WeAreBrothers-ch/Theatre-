import {useCallback, useRef, useState} from 'react'
import {useClient} from 'sanity'
import {useToast} from '@sanity/ui/toast'
import {API_VERSION} from '../../lib/constantes'
import {photographier, restaurer, type Photo} from '../../lib/ecriture'

/*
 * Le bouton « Annuler » des outils : avant chaque geste, une photo des documents touchés ;
 * annuler les remet exactement comme avant (publié et brouillon). Vingt gestes gardés,
 * le temps de la visite de l'outil.
 */
export function useHistorique() {
  const client = useClient({apiVersion: API_VERSION})
  const toast = useToast()
  const pile = useRef<Photo[]>([])
  const [dernier, setDernier] = useState<string | null>(null)
  const [enCours, setEnCours] = useState(false)

  /** Exécute un geste après avoir photographié les documents qu'il touche. */
  const geste = useCallback(
    async (libelle: string, ids: string[], action: () => Promise<unknown>, succes?: {title: string; description?: string}) => {
      setEnCours(true)
      try {
        const photo = await photographier(client, libelle, ids)
        await action()
        pile.current = [...pile.current.slice(-19), photo]
        setDernier(libelle)
        if (succes) toast.push({status: 'success', ...succes})
        return true
      } catch (e) {
        toast.push({status: 'error', title: 'La modification n’a pas pu être enregistrée', description: (e as Error).message})
        return false
      } finally {
        setEnCours(false)
      }
    },
    [client, toast],
  )

  const annuler = useCallback(async () => {
    const photo = pile.current[pile.current.length - 1]
    if (!photo) return
    setEnCours(true)
    try {
      await restaurer(client, photo)
      pile.current = pile.current.slice(0, -1)
      setDernier(pile.current[pile.current.length - 1]?.geste ?? null)
      toast.push({status: 'info', title: `Annulé : ${photo.geste}`})
    } catch (e) {
      toast.push({status: 'error', title: 'Impossible d’annuler', description: (e as Error).message})
    } finally {
      setEnCours(false)
    }
  }, [client, toast])

  return {geste, annuler, dernier, enCours}
}
