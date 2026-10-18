import {Button, Flex, Inline, Text} from '@sanity/ui'
import {Tooltip} from '@sanity/ui/tooltip'
import type {Statut} from '../../lib/representations'

/* Les quatre états d'une date, avec leur couleur, partout pareils dans le Studio. */

export const ETATS: {valeur: Statut; titre: string; court: string; ton: 'positive' | 'caution' | 'critical' | 'default'; aide: string}[] = [
  {valeur: 'en-vente', titre: 'En vente', court: 'En vente', ton: 'positive', aide: 'Le bouton « Réserver » est affiché.'},
  {valeur: 'liste-attente', titre: 'Liste d’attente', court: 'Attente', ton: 'caution', aide: 'Le site propose la liste d’attente.'},
  {valeur: 'complet', titre: 'Complet', court: 'Complet', ton: 'critical', aide: 'Bandeau rouge « Complet » sur l’affiche, plus de bouton Réserver.'},
  {valeur: 'annule', titre: 'Annulé', court: 'Annulé', ton: 'default', aide: 'La date reste visible, barrée « Annulé ».'},
]

export const etat = (v?: string) => ETATS.find((e) => e.valeur === v) ?? ETATS[0]

/** Quatre boutons côte à côte : un clic change l'état de la date. */
export function BoutonsStatut({valeur, onChange, desactive, compact}: {valeur: Statut; onChange: (s: Statut) => void; desactive?: boolean; compact?: boolean}) {
  return (
    <Inline gap={1} role="radiogroup" aria-label="État de la date">
      {ETATS.map((e) => {
        const actif = e.valeur === valeur
        return (
          <Tooltip key={e.valeur} content={<Text size={1} style={{maxWidth: 260}}>{e.aide}</Text>} padding={2} placement="top" portal>
            <Button
              role="radio"
              aria-checked={actif}
              mode={actif ? 'default' : 'ghost'}
              tone={actif ? e.ton : 'default'}
              text={compact ? e.court : e.titre}
              fontSize={1}
              padding={2}
              disabled={desactive}
              onClick={() => !actif && onChange(e.valeur)}
            />
          </Tooltip>
        )
      })}
    </Inline>
  )
}

/** La pastille de couleur d'un spectacle (son encre). */
export function Pastille({couleur, taille = 12}: {couleur?: string | null; taille?: number}) {
  return <Flex as="span" aria-hidden style={{width: taille, height: taille, borderRadius: 2, flex: 'none', background: couleur || '#019e35', display: 'inline-block'}} />
}
