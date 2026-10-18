import {useState} from 'react'
import type {ObjectInputProps} from 'sanity'
import {Box, Button, Card, Flex, Stack, Text} from '@sanity/ui'
import {CheckmarkCircleIcon} from '@sanity/icons/CheckmarkCircle'
import {ChevronDownIcon} from '@sanity/icons/ChevronDown'
import {ChevronUpIcon} from '@sanity/icons/ChevronUp'

/*
 * En tête de la fiche spectacle : ce qui est prêt et ce qui manque, en une ligne.
 * Un clic sur un manque ouvre le bon onglet et place le curseur dans le bon champ.
 */

type Spectacle = {
  titre?: string
  compagnie?: string
  genre?: string
  visuel?: {asset?: unknown; alt?: string}
  accroche?: string
  saison?: unknown
  lieu?: unknown
  representations?: {dateHeure?: string; heureAConfirmer?: boolean}[]
  slug?: {current?: string}
  texte?: unknown[]
  duree?: string
  age?: string
  tarifs?: unknown
  noteTarifs?: string
  distribution?: unknown[]
  photos?: unknown[]
}

type Point = {cle: string; titre: string; champ: string; groupe: string; ok: boolean; essentiel: boolean}

export function pointsDeLaFiche(s: Spectacle): Point[] {
  const maintenant = new Date().toISOString()
  const aVenir = (s.representations ?? []).filter((r) => r.dateHeure && r.dateHeure >= maintenant)
  return [
    {cle: 'titre', titre: 'Titre', champ: 'titre', groupe: 'essentiel', ok: !!s.titre?.trim(), essentiel: true},
    {cle: 'compagnie', titre: 'Artistes', champ: 'compagnie', groupe: 'essentiel', ok: !!s.compagnie?.trim(), essentiel: true},
    {cle: 'genre', titre: 'Genre', champ: 'genre', groupe: 'essentiel', ok: !!s.genre, essentiel: true},
    {cle: 'visuel', titre: 'Visuel', champ: 'visuel', groupe: 'essentiel', ok: !!s.visuel?.asset, essentiel: true},
    {cle: 'alt', titre: 'Description du visuel', champ: 'visuel', groupe: 'essentiel', ok: !!s.visuel?.alt?.trim(), essentiel: false},
    {cle: 'accroche', titre: 'Accroche', champ: 'accroche', groupe: 'essentiel', ok: !!s.accroche?.trim(), essentiel: true},
    {cle: 'saison', titre: 'Saison', champ: 'saison', groupe: 'essentiel', ok: !!s.saison, essentiel: true},
    {cle: 'dates', titre: 'Dates', champ: 'representations', groupe: 'dates', ok: !!s.representations?.length, essentiel: true},
    {cle: 'lieu', titre: 'Salle', champ: 'lieu', groupe: 'dates', ok: !!s.lieu, essentiel: true},
    {cle: 'heures', titre: 'Heures confirmées', champ: 'representations', groupe: 'dates', ok: !aVenir.some((r) => r.heureAConfirmer), essentiel: false},
    {cle: 'prix', titre: 'Prix', champ: 'tarifs', groupe: 'dates', ok: !!s.tarifs || !!s.noteTarifs?.trim(), essentiel: false},
    {cle: 'texte', titre: 'Présentation', champ: 'texte', groupe: 'contenu', ok: !!s.texte?.length, essentiel: false},
    {cle: 'photos', titre: 'Photos', champ: 'photos', groupe: 'contenu', ok: !!s.photos?.length, essentiel: false},
    {cle: 'age', titre: 'Public', champ: 'age', groupe: 'pratique', ok: !!s.age?.trim(), essentiel: false},
    {cle: 'duree', titre: 'Durée', champ: 'duree', groupe: 'pratique', ok: !!s.duree?.trim(), essentiel: false},
    {cle: 'distribution', titre: 'Distribution', champ: 'distribution', groupe: 'distribution', ok: !!s.distribution?.length, essentiel: false},
  ]
}

export function EtatFiche(props: ObjectInputProps) {
  const [ouvert, setOuvert] = useState(false)
  const points = pointsDeLaFiche((props.value ?? {}) as Spectacle)
  const faits = points.filter((p) => p.ok).length
  const pourcent = Math.round((faits / points.length) * 100)
  const manquent = points.filter((p) => !p.ok)
  const bloquants = manquent.filter((p) => p.essentiel)
  const aller = (p: Point) => {
    props.onFieldGroupSelect(p.groupe)
    // Le champ n'existe dans la page qu'après le changement d'onglet.
    setTimeout(() => props.onPathFocus([p.champ]), 50)
  }

  return (
    <Stack gap={5}>
      <Card padding={3} radius={3} border tone={bloquants.length ? 'caution' : manquent.length ? 'primary' : 'positive'}>
        <Stack gap={3}>
          <Flex align="center" gap={3}>
            {!manquent.length && (
              <Text size={2}>
                <CheckmarkCircleIcon />
              </Text>
            )}
            <Box flex={1}>
              <Text size={1} weight="semibold">
                {!manquent.length
                  ? 'Fiche complète'
                  : bloquants.length
                    ? `Fiche prête à ${pourcent} % · à remplir avant de publier : ${bloquants.map((p) => p.titre.toLowerCase()).join(', ')}`
                    : `Fiche prête à ${pourcent} % · pour la compléter : ${manquent.map((p) => p.titre.toLowerCase()).join(', ')}`}
              </Text>
            </Box>
            {manquent.length > 0 && <Button mode="bleed" fontSize={1} padding={2} icon={ouvert ? ChevronUpIcon : ChevronDownIcon} text={ouvert ? 'Masquer' : 'Voir'} onClick={() => setOuvert(!ouvert)} />}
          </Flex>
          <Box style={{height: 4, borderRadius: 2, background: 'var(--card-border-color)', overflow: 'hidden'}}>
            <Box style={{height: '100%', width: `${pourcent}%`, background: bloquants.length ? '#e0a800' : '#019e35', transition: 'width .3s'}} />
          </Box>
          {ouvert && manquent.length > 0 && (
            <Flex gap={2} wrap="wrap">
              {manquent.map((p) => (
                <Button key={p.cle} mode="ghost" tone={p.essentiel ? 'caution' : 'default'} fontSize={1} padding={2} text={`${p.titre} →`} onClick={() => aller(p)} />
              ))}
            </Flex>
          )}
        </Stack>
      </Card>
      {props.renderDefault(props)}
    </Stack>
  )
}
