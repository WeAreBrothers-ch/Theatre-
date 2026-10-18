import {useMemo} from 'react'
import {useProjectId, useDataset, type Tool} from 'sanity'
import {route, useRouter} from 'sanity/router'
import {Box, Card, Container, Flex, Heading, Spinner, Stack, Tab, TabList, TabPanel, Text} from '@sanity/ui'
import {GENRES, URL_SITE, libelle} from '../../lib/constantes'
import {REQ_COMMUNICATION} from '../../lib/requetes'
import type {Contexte, ReglagesCom, SpectacleCom} from '../../lib/communication/commun'
import {useRequete} from '../commun/donnees'
import {MegaphoneIcon} from './icones'
import {OngletLettre} from './OngletLettre'
import {OngletFeuille} from './OngletFeuille'
import {OngletAgenda} from './OngletAgenda'
import {OngletReseaux} from './OngletReseaux'
import {OngletExport} from './OngletExport'

/*
 * Communication : tout ce qui se fabrique à partir du programme, sans rien ressaisir.
 * La lettre d'information, la feuille de salle, l'agenda à afficher, les textes pour les
 * réseaux sociaux et la saison en tableau pour la brochure.
 */

export type DonneesCom = {
  spectacles: (SpectacleCom & {saison?: string | null})[]
  reglages: (ReglagesCom & {adresseSite?: string | null}) | null
  saison: {titre?: string; debut?: string; fin?: string} | null
}

export type ProprietesOnglet = {ctx: Contexte; donnees: DonneesCom; spectacle?: string; choisir?: (id: string) => void}

const ONGLETS = [
  {id: 'lettre', titre: 'Lettre d’information'},
  {id: 'feuille', titre: 'Feuille de salle'},
  {id: 'agenda', titre: 'Agenda à afficher'},
  {id: 'reseaux', titre: 'Réseaux sociaux'},
  {id: 'export', titre: 'Export de la saison'},
] as const

type Onglet = (typeof ONGLETS)[number]['id']

function CommunicationOutil() {
  const projectId = useProjectId()
  const dataset = useDataset()
  // L'onglet et le spectacle choisis sont dans l'adresse : l'action « Feuille de salle » d'une fiche ouvre directement le bon.
  const router = useRouter()
  const etat = router.state as {onglet?: Onglet; spectacle?: string}
  const onglet: Onglet = ONGLETS.some((o) => o.id === etat.onglet) ? (etat.onglet as Onglet) : 'lettre'
  const setOnglet = (o: Onglet) => router.navigate({onglet: o})
  const choisir = (id: string) => router.navigate({onglet, spectacle: id}, {replace: true})
  const {donnees, erreur} = useRequete<DonneesCom>(REQ_COMMUNICATION, {}, ['spectacle', 'reglages', 'saison'])

  const prepare = useMemo<DonneesCom | null>(() => {
    if (!donnees) return null
    return {
      ...donnees,
      spectacles: donnees.spectacles.map((s) => ({...s, genreLibelle: libelle(GENRES, s.genre ?? undefined)})),
    }
  }, [donnees])

  const ctx: Contexte = {projectId, dataset, site: (donnees?.reglages?.adresseSite || URL_SITE).replace(/\/$/, '')}

  return (
    <Box padding={[3, 4, 5]} style={{overflow: 'auto', height: '100%'}}>
      <Container width={4}>
        <Stack gap={5}>
          <Stack gap={3}>
            <Heading as="h1" size={3}>
              Communication
            </Heading>
            <Text muted size={1}>
              Tout part du programme saisi dans le Studio : rien à recopier, et toujours à jour.
            </Text>
          </Stack>
          <TabList gap={1} style={{flexWrap: 'wrap'}}>
            {ONGLETS.map((o) => (
              <Tab key={o.id} id={`com-${o.id}`} aria-controls={`panneau-${o.id}`} label={o.titre} selected={onglet === o.id} onClick={() => setOnglet(o.id)} />
            ))}
          </TabList>
          {erreur ? (
            <Card padding={4} tone="critical" radius={2}>
              <Text>Impossible de charger le programme : {erreur}</Text>
            </Card>
          ) : !prepare ? (
            <Flex padding={6} justify="center">
              <Spinner muted />
            </Flex>
          ) : (
            <TabPanel id={`panneau-${onglet}`} aria-labelledby={`com-${onglet}`}>
              {onglet === 'lettre' && <OngletLettre ctx={ctx} donnees={prepare} />}
              {onglet === 'feuille' && <OngletFeuille ctx={ctx} donnees={prepare} spectacle={etat.spectacle} choisir={choisir} />}
              {onglet === 'agenda' && <OngletAgenda ctx={ctx} donnees={prepare} />}
              {onglet === 'reseaux' && <OngletReseaux ctx={ctx} donnees={prepare} spectacle={etat.spectacle} choisir={choisir} />}
              {onglet === 'export' && <OngletExport ctx={ctx} donnees={prepare} />}
            </TabPanel>
          )}
        </Stack>
      </Container>
    </Box>
  )
}

export const communication: Tool = {
  name: 'communication',
  title: 'Communication',
  icon: MegaphoneIcon,
  component: CommunicationOutil,
  router: route.create('/', [route.create('/:onglet', [route.create('/:spectacle')])]),
  canHandleIntent: (intent) => intent === 'feuille-de-salle' || intent === 'reseaux',
  getIntentState: (intent, params) => ({onglet: intent === 'reseaux' ? 'reseaux' : 'feuille', spectacle: params.id}),
}
