import {useMemo, useState} from 'react'
import {Card, Checkbox, Flex, Grid, Label, Select, Stack, Text, TextInput} from '@sanity/ui'
import {aujourdhui, nomMois, plusMois} from '../../lib/temps'
import {agendaImprime, agendaTientSurUnePage, lignesAgenda, type OptionsAgenda} from '../../lib/communication/impression'
import {usePreference} from '../commun/donnees'
import {ApercuImprimable} from './outils'
import type {ProprietesOnglet} from './Communication'

/* L'agenda du mois en grand, pour la vitrine, le guichet ou les panneaux en ville. */
export function OngletAgenda({ctx, donnees}: ProprietesOnglet) {
  const moisCourant = aujourdhui().slice(0, 7)
  const [mois, setMois] = useState(moisCourant)
  const [nombre, setNombre] = useState(1)
  const [format, setFormat] = usePreference<'A4' | 'A3'>('agenda.format', 'A4')
  const [titre, setTitre] = useState('')
  const [complets, setComplets] = usePreference('agenda.complets', true)
  const options: OptionsAgenda = {format, mois, nombreMois: nombre, titre: titre || undefined, avecComplets: complets}
  const html = useMemo(() => agendaImprime(ctx, donnees.reglages ?? {}, donnees.spectacles, options), [ctx, donnees, format, mois, nombre, titre, complets]) // eslint-disable-line react-hooks/exhaustive-deps
  const n = lignesAgenda(donnees.spectacles, options).length
  const tient = agendaTientSurUnePage(donnees.spectacles, options)

  return (
    <Stack gap={4}>
      <Grid gridTemplateColumns={[1, 2, 4]} gap={3}>
        <Stack gap={2}>
          <Label size={1}>Mois</Label>
          <Select value={mois} onChange={(e) => setMois(e.currentTarget.value)}>
            {Array.from({length: 13}, (_, i) => plusMois(moisCourant, i - 1)).map((m) => (
              <option key={m} value={m}>
                {nomMois(m)}
              </option>
            ))}
          </Select>
        </Stack>
        <Stack gap={2}>
          <Label size={1}>Durée</Label>
          <Select value={nombre} onChange={(e) => setNombre(Number(e.currentTarget.value))}>
            <option value={1}>Un mois</option>
            <option value={2}>Deux mois</option>
            <option value={3}>Trois mois</option>
          </Select>
        </Stack>
        <Stack gap={2}>
          <Label size={1}>Format</Label>
          <Select value={format} onChange={(e) => setFormat(e.currentTarget.value as 'A4' | 'A3')}>
            <option value="A4">A4</option>
            <option value="A3">A3 (affiche)</option>
          </Select>
        </Stack>
        <Stack gap={2}>
          <Label size={1}>Titre (facultatif)</Label>
          <TextInput value={titre} placeholder={nomMois(mois)} onChange={(e) => setTitre(e.currentTarget.value)} />
        </Stack>
      </Grid>
      <Flex as="label" gap={2} align="center">
        <Checkbox checked={complets} onChange={(e) => setComplets(e.currentTarget.checked)} />
        <Text size={1}>Garder les dates complètes (marquées « Complet »)</Text>
      </Flex>
      <Text size={1} muted>
        {n} date{n > 1 ? 's' : ''}.
      </Text>
      {!tient && (
        <Card padding={3} radius={2} tone="caution" border>
          <Text size={1}>Trop de dates pour une seule page lisible : choisissez un seul mois ou le format A3.</Text>
        </Card>
      )}
      <ApercuImprimable html={html} format={format} titre={`Agenda TBB - ${titre || nomMois(mois)}`} />
    </Stack>
  )
}
