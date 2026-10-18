import {useMemo, useState} from 'react'
import {Box, Button, Card, Checkbox, Flex, Grid, Label, Select, Stack, Text, TextArea} from '@sanity/ui'
import {DownloadIcon} from '@sanity/icons/Download'
import {aujourdhui, local} from '../../lib/temps'
import {repsPubliques, urlImage, type SpectacleCom} from '../../lib/communication/commun'
import {texteReseaux, VARIANTES, type Variante} from '../../lib/communication/reseaux'
import {usePreference} from '../commun/donnees'
import {BoutonCopier, copierTexte} from './outils'
import type {ProprietesOnglet} from './Communication'

/*
 * Les réseaux sociaux : pour un spectacle, six textes prêts à publier (annonce, c'est
 * bientôt, dernières places, ce soir, complet, story), modifiables avant de copier,
 * et le visuel aux formats d'Instagram et de Facebook.
 */

const FORMATS = [
  {titre: 'Publication Instagram', l: 1080, h: 1350, nom: 'instagram'},
  {titre: 'Carré', l: 1080, h: 1080, nom: 'carre'},
  {titre: 'Story', l: 1080, h: 1920, nom: 'story'},
  {titre: 'Facebook, LinkedIn', l: 1200, h: 630, nom: 'facebook'},
]

function prochaine(s: SpectacleCom): string {
  const auj = aujourdhui()
  return repsPubliques(s).find((r) => local(r.dateHeure).date >= auj)?.dateHeure ?? ''
}

function Carte({titre, aide, texte}: {titre: string; aide: string; texte: string}) {
  const [valeur, setValeur] = useState(texte)
  // Un autre spectacle ou une autre option : le texte proposé change.
  const [source, setSource] = useState(texte)
  if (source !== texte) {
    setSource(texte)
    setValeur(texte)
  }
  return (
    <Card padding={3} radius={2} border>
      <Stack gap={3}>
        <Flex align="center" justify="space-between" gap={2}>
          <Stack gap={2}>
            <Text size={1} weight="semibold">
              {titre}
            </Text>
            <Text size={1} muted>
              {aide}
            </Text>
          </Stack>
          <BoutonCopier texte="Copier" action={() => copierTexte(valeur)} />
        </Flex>
        <TextArea rows={Math.min(12, valeur.split('\n').length + 1)} value={valeur} onChange={(e) => setValeur(e.currentTarget.value)} style={{fontSize: 13}} />
        <Text size={0} muted>
          {valeur.length} caractères
        </Text>
      </Stack>
    </Card>
  )
}

export function OngletReseaux({ctx, donnees, spectacle, choisir}: ProprietesOnglet) {
  const aVenir = useMemo(
    () => donnees.spectacles.filter((s) => prochaine(s)).sort((a, b) => prochaine(a).localeCompare(prochaine(b))),
    [donnees.spectacles],
  )
  const [idLocal, setIdLocal] = useState(aVenir[0]?._id ?? '')
  const id = spectacle && donnees.spectacles.some((x) => x._id === spectacle) ? spectacle : idLocal
  const setId = (x: string) => (choisir ? choisir(x) : setIdLocal(x))
  const [emojis, setEmojis] = usePreference('reseaux.emojis', true)
  const s = donnees.spectacles.find((x) => x._id === id)
  const reglages = donnees.reglages ?? {}

  if (!s) return <Text muted>Aucun spectacle à venir.</Text>
  return (
    <Stack gap={4}>
      <Grid gridTemplateColumns={[1, 2]} gap={3}>
        <Stack gap={2}>
          <Label size={1}>Spectacle</Label>
          <Select value={id} onChange={(e) => setId(e.currentTarget.value)}>
            {aVenir.map((x) => (
              <option key={x._id} value={x._id}>
                {x.titre}
              </option>
            ))}
          </Select>
        </Stack>
        <Flex as="label" gap={2} align="flex-end" paddingBottom={2}>
          <Checkbox checked={emojis} onChange={(e) => setEmojis(e.currentTarget.checked)} />
          <Text size={1}>Avec des émojis</Text>
        </Flex>
      </Grid>

      <Stack gap={2}>
        <Label size={1}>Le visuel, recadré pour chaque réseau</Label>
        <Flex gap={2} wrap="wrap">
          {FORMATS.map((f) => {
            const url = urlImage(ctx, s.visuel, {largeur: f.l, hauteur: f.h})
            return url ? (
              <Button
                key={f.nom}
                as="a"
                href={`${url}&dl=${encodeURIComponent(`${s.slug ?? 'spectacle'}-${f.nom}.jpg`)}`}
                icon={DownloadIcon}
                mode="ghost"
                text={`${f.titre} (${f.l}×${f.h})`}
              />
            ) : null
          })}
        </Flex>
        <Text size={1} muted>
          Le recadrage suit le point important choisi sur le visuel de la fiche.
        </Text>
      </Stack>

      <Grid gridTemplateColumns={[1, 1, 2]} gap={3}>
        {VARIANTES.map((v) => (
          <Box key={v.valeur}>
            <Carte titre={v.titre} aide={v.aide} texte={texteReseaux(ctx, reglages, s, v.valeur as Variante, {emojis})} />
          </Box>
        ))}
      </Grid>
    </Stack>
  )
}
