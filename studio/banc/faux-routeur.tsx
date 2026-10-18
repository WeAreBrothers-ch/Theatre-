import {createContext, useContext} from 'react'

/* Doublure de « sanity/router » pour le banc d'essai. */

export type EtatRouteur = {state: Record<string, string | undefined>; navigate: (s: Record<string, string | undefined>) => void; aller: (chemin: string) => void}

export const RouteurContexte = createContext<EtatRouteur>({state: {}, navigate: () => undefined, aller: () => undefined})

export function useRouter() {
  const r = useContext(RouteurContexte)
  return {
    state: r.state,
    navigate: (s: Record<string, string | undefined>) => r.navigate(s),
    navigateIntent: (intent: string, params: Record<string, string>) => console.info('[banc] intention', intent, params),
    navigateUrl: ({path}: {path: string}) => r.aller(path),
  }
}

export function useIntentLink(o: {intent: string; params: Record<string, string>}) {
  return {href: `#${o.intent}:${o.params.type ?? ''}:${o.params.id ?? ''}`, onClick: (e: {preventDefault: () => void}) => e.preventDefault()}
}

export const route = {create: (..._args: unknown[]) => ({})}
