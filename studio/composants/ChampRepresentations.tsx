import {useEffect, useMemo, useState} from 'react'
import {set, useClient, useFormValue, type ArrayOfObjectsInputProps, type ObjectItemProps} from 'sanity'
import {Badge, Box, Button, Card, Flex, Stack, Text} from '@sanity/ui'
import {AddIcon} from '@sanity/icons/Add'
import {SortIcon} from '@sanity/icons/Sort'
import {API_VERSION} from '../lib/constantes'
import {aplatir, conflits, statutValide, trier, type Rep, type RepresentationBrute} from '../lib/representations'
import {aujourdhui, dateLongue, heureLisible} from '../lib/temps'
import {BoutonsStatut} from '../outils/commun/statuts'
import {AssistantDates} from './AssistantDates'

/*
 * Le champ « Représentations » de la fiche spectacle :
 * - en tête, le bilan (combien de dates, combien de complètes), l'assistant « Ajouter des
 *   dates » et l'alerte si une salle est déjà prise par un autre spectacle ;
 * - dessous, la liste habituelle, où chaque date porte ses quatre boutons d'état.
 */

type Contexte = {autres: Rep[]; lieux: {_id: string; nom: string}[]; reference?: string}

function useContexte(id: string, saison?: string): Contexte | null {
  const client = useClient({apiVersion: API_VERSION})
  const [ctx, setCtx] = useState<Contexte | null>(null)
  useEffect(() => {
    let actif = true
    client
      .fetch<{spectacles: Parameters<typeof aplatir>[0]; lieux: Contexte['lieux']; debut?: string}>(
        `{
          "spectacles": *[_type == "spectacle" && !(_id in [$id, $brouillon]) && !(_id in path("drafts.**"))]{_id, titre, duree, lieu, representations},
          "lieux": *[_type == "lieu" && !(_id in path("drafts.**"))] | order(ordre asc, nom asc){_id, nom},
          "debut": *[_id == $saison][0].debut
        }`,
        {id, brouillon: `drafts.${id}`, saison: saison ?? ''},
      )
      .then((d) => actif && setCtx({autres: aplatir(d.spectacles), lieux: d.lieux, reference: d.debut}))
      .catch(() => actif && setCtx({autres: [], lieux: []}))
    return () => {
      actif = false
    }
  }, [client, id, saison])
  return ctx
}

export function ChampRepresentations(props: ArrayOfObjectsInputProps) {
  const valeur = (props.value ?? []) as RepresentationBrute[]
  const docId = String(useFormValue(['_id']) ?? '').replace(/^drafts\./, '')
  const titre = (useFormValue(['titre']) as string) ?? ''
  const duree = useFormValue(['duree']) as string | undefined
  const lieu = (useFormValue(['lieu']) as {_ref?: string} | undefined)?._ref
  const saison = (useFormValue(['saison']) as {_ref?: string} | undefined)?._ref
  const ctx = useContexte(docId, saison)
  const [assistant, setAssistant] = useState(false)
  const auj = aujourdhui()

  const reps = useMemo(() => aplatir([{_id: docId || '__ici__', titre, duree, lieu: lieu ? {_ref: lieu} : null, representations: valeur}]), [docId, titre, duree, lieu, valeur])
  const aVenir = reps.filter((r) => r.date >= auj)
  const complets = aVenir.filter((r) => r.statut === 'complet').length
  const nomsLieux = new Map((ctx?.lieux ?? []).map((l) => [l._id, l.nom]))

  const chevauchements = useMemo(() => {
    if (!ctx) return []
    const miennes = reps.filter((r) => r.date >= auj)
    return conflits([...ctx.autres.filter((r) => r.date >= auj), ...miennes])
      .filter((c) => (c.a.spectacleId === reps[0]?.spectacleId) !== (c.b.spectacleId === reps[0]?.spectacleId))
      .map((c) => (c.a.spectacleId === reps[0]?.spectacleId ? {ici: c.a, autre: c.b} : {ici: c.b, autre: c.a}))
  }, [ctx, reps, auj])

  const desordre = valeur.some((r, i) => i > 0 && (valeur[i - 1].dateHeure ?? '') > (r.dateHeure ?? '￿'))
  const doublons = valeur.length - new Set(valeur.map((r) => r.dateHeure && new Date(r.dateHeure).getTime())).size

  return (
    <Stack gap={3}>
      <Card padding={3} radius={2} border tone="transparent">
        <Flex gap={3} align="center" wrap="wrap" justify="space-between">
          <Stack gap={2}>
            <Text size={1} weight="semibold">
              {valeur.length ? `${valeur.length} date${valeur.length > 1 ? 's' : ''}` : 'Aucune date'}
              {valeur.length ? ` · ${aVenir.length} à venir` : ''}
              {complets ? ` · ${complets} complète${complets > 1 ? 's' : ''}` : ''}
            </Text>
            <Text size={1} muted>
              Les boutons d’état de chaque date se publient avec la fiche. Pour un changement immédiat, utilisez l’onglet Agenda.
            </Text>
          </Stack>
          <Flex gap={2} wrap="wrap">
            {desordre && <Button icon={SortIcon} mode="ghost" text="Remettre dans l’ordre" disabled={props.readOnly} onClick={() => props.onChange(set(trier(valeur)))} />}
            <Button icon={AddIcon} tone="primary" text="Ajouter des dates" disabled={props.readOnly} onClick={() => setAssistant(true)} />
          </Flex>
        </Flex>
      </Card>

      {doublons > 0 && (
        <Card padding={3} radius={2} tone="critical" border>
          <Text size={1}>
            {doublons === 1 ? 'Une date figure deux fois' : `${doublons} dates figurent deux fois`} dans la liste : supprimez le doublon.
          </Text>
        </Card>
      )}

      {chevauchements.length > 0 && (
        <Card padding={3} radius={2} tone="caution" border>
          <Stack gap={2}>
            <Text size={1} weight="semibold">
              Salle déjà prise
            </Text>
            {chevauchements.map(({ici, autre}) => (
              <Text key={`${ici.cle}-${autre.spectacleId}-${autre.cle}`} size={1}>
                {dateLongue(ici.date)} à {heureLisible(ici.heure)}, {nomsLieux.get(ici.lieuId ?? '') ?? 'même salle'} : « {autre.titre} » à {heureLisible(autre.heure)}
              </Text>
            ))}
          </Stack>
        </Card>
      )}

      {props.renderDefault(props)}

      {assistant && ctx && (
        <AssistantDates
          titre={titre}
          duree={duree}
          lieuSpectacle={lieu}
          lieux={ctx.lieux}
          existantes={valeur}
          autres={ctx.autres}
          reference={ctx.reference}
          onFermer={() => setAssistant(false)}
          onAjouter={(nouvelles) => {
            props.onChange(set(trier([...valeur, ...nouvelles])))
            setAssistant(false)
          }}
        />
      )}
    </Stack>
  )
}

/** Une date dans la liste : la ligne habituelle, avec ses quatre boutons d'état à côté. */
export function LigneRepresentation(props: ObjectItemProps) {
  const valeur = props.value as RepresentationBrute
  const passee = !!valeur.dateHeure && valeur.dateHeure < new Date().toISOString()
  return (
    <Flex align="center" gap={2} wrap="wrap" style={{opacity: passee ? 0.55 : 1}}>
      <Box flex={1} style={{minWidth: 240}}>
        {props.renderDefault(props)}
      </Box>
      {passee ? (
        <Badge>Passée</Badge>
      ) : (
        <Box paddingRight={1}>
          <BoutonsStatut compact valeur={statutValide(valeur.statut)} desactive={props.readOnly} onChange={(s) => props.inputProps.onChange(set(s, ['statut']))} />
        </Box>
      )}
    </Flex>
  )
}
