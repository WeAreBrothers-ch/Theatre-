import {useMemo, useState} from 'react'
import {Card, Flex, Label, Select, Stack, Text} from '@sanity/ui'
import {exportRepresentations, exportSpectacles} from '../../lib/communication/export'
import {BoutonCopier, telecharger} from './outils'
import type {ProprietesOnglet} from './Communication'

/* La saison en tableau (CSV pour Excel) : pour la brochure, la presse, les partenaires. */
export function OngletExport({ctx, donnees}: ProprietesOnglet) {
  const saisons = useMemo(() => [...new Set(donnees.spectacles.map((s) => s.saison).filter(Boolean))] as string[], [donnees.spectacles])
  const [saison, setSaison] = useState(donnees.saison?.titre ?? saisons[0] ?? '')
  const choisis = donnees.spectacles.filter((s) => !saison || s.saison === saison)
  const nom = (saison || 'saison').toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const nbReps = choisis.reduce((n, s) => n + (s.representations?.length ?? 0), 0)

  return (
    <Stack gap={4}>
      <Flex gap={3} align="flex-end" wrap="wrap">
        <Stack gap={2} style={{minWidth: 220}}>
          <Label size={1}>Saison</Label>
          <Select value={saison} onChange={(e) => setSaison(e.currentTarget.value)}>
            {saisons.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
            <option value="">Toutes les saisons</option>
          </Select>
        </Stack>
        <Text size={1} muted>
          {choisis.length} spectacles, {nbReps} représentations.
        </Text>
      </Flex>
      <Card padding={4} radius={2} border>
        <Stack gap={3}>
          <Text weight="semibold">Les spectacles, avec leurs textes</Text>
          <Text size={1} muted>
            Une ligne par spectacle : titre, artistes, genre, dates, lieu, durée, public, prix, accroche, présentation, distribution et production. La matière de la brochure, à transmettre à la
            graphiste.
          </Text>
          <Flex>
            <BoutonCopier texte="Télécharger (Excel, CSV)" tone="primary" mode="default" action={async () => telecharger(`tbb-spectacles-${nom}.csv`, exportSpectacles(ctx, choisis), 'text/csv;charset=utf-8')} />
          </Flex>
        </Stack>
      </Card>
      <Card padding={4} radius={2} border>
        <Stack gap={3}>
          <Text weight="semibold">Toutes les représentations</Text>
          <Text size={1} muted>
            Une ligne par date : jour, heure, spectacle, lieu, état (complet, annulé…), mention. Pour un planning, l’accueil, la régie ou la comptabilité.
          </Text>
          <Flex>
            <BoutonCopier texte="Télécharger (Excel, CSV)" tone="primary" mode="default" action={async () => telecharger(`tbb-representations-${nom}.csv`, exportRepresentations(ctx, choisis), 'text/csv;charset=utf-8')} />
          </Flex>
        </Stack>
      </Card>
    </Stack>
  )
}
