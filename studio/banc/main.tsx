import {StrictMode, useEffect, useState} from 'react'
import {createRoot} from 'react-dom/client'
import {Box, Card, Flex, LayerProvider, Text, ThemeProvider, studioTheme} from '@sanity/ui'
import {ToastProvider} from '@sanity/ui/toast'
import '@sanity/ui/styles.css'
import {jeu} from './faux-sanity'
import {RouteurContexte} from './faux-routeur'
import {tableauDeBord} from '../outils/TableauDeBord'
import {agenda} from '../outils/agenda/Agenda'
import {communication} from '../outils/communication/Communication'
import {AssistantDates} from '../composants/AssistantDates'
import {aplatir} from '../lib/representations'

/*
 * Le banc d'essai. L'écran se choisit dans l'adresse :
 *   #tableau · #agenda · #agenda-mois · #communication/lettre · #communication/feuille …
 *   #assistant (l'assistant « Ajouter des dates » de la fiche spectacle)
 * Les données sont celles publiées par le théâtre (lecture publique, sans jeton).
 */

import {SOURCE, TOUT} from './source'

async function charger() {
  // Une copie locale (banc/donnees.json, voir telecharger.mjs) si elle existe, sinon l'API publique.
  let r = await fetch('./donnees.json').catch(() => null)
  if (!r?.ok || !(r.headers.get('content-type') ?? '').includes('json')) r = await fetch(`${SOURCE}?query=${encodeURIComponent(TOUT)}`)
  const {result} = await r.json()
  jeu.docs = result
  // Quelques messages et un brouillon, pour voir le tableau de bord vivant.
  jeu.docs.push(
    {_id: 'message-1', _type: 'message', statut: 'nouveau', sujet: 'Billetterie et réservations', nom: 'Claire Rochat', email: 'claire@example.ch', recuLe: '2026-10-17T09:12:00Z', contenu: 'Bonjour…'},
    {_id: 'message-2', _type: 'message', statut: 'nouveau', sujet: 'Proposer un spectacle', nom: 'Cie des Lucioles', email: 'cie@example.ch', recuLe: '2026-10-16T15:40:00Z', contenu: 'Bonjour…'},
  )
  const choices = jeu.docs.find((d) => d._id === 'spectacle-choices')
  if (choices) jeu.docs.push({...structuredClone(choices), _id: 'drafts.spectacle-choices'})
}

function Ecran() {
  const [hash, setHash] = useState(() => window.location.hash.slice(1) || 'tableau')
  useEffect(() => {
    const f = () => setHash(window.location.hash.slice(1) || 'tableau')
    window.addEventListener('hashchange', f)
    return () => window.removeEventListener('hashchange', f)
  }, [])
  const [outil, ...reste] = hash.split('/')
  const [etat, setEtat] = useState<Record<string, string | undefined>>({})
  const etatOutil = outil === 'communication' ? {onglet: reste[0], spectacle: reste[1], ...etat} : etat
  const routeur = {
    state: etatOutil,
    navigate: (s: Record<string, string | undefined>) => {
      setEtat(s)
      if (outil === 'communication' && s.onglet) window.location.hash = ['communication', s.onglet, s.spectacle].filter(Boolean).join('/')
    },
    aller: (chemin: string) => {
      setEtat({})
      window.location.hash = chemin.replace(/^\//, '')
    },
  }

  if (outil === 'agenda-mois') {
    try {
      window.localStorage.setItem('tbb.agenda.vue', JSON.stringify('mois'))
    } catch {
      /* rien */
    }
  } else if (outil === 'agenda') {
    try {
      window.localStorage.setItem('tbb.agenda.vue', JSON.stringify('liste'))
    } catch {
      /* rien */
    }
  }

  let contenu = null
  if (outil === 'tableau') contenu = <tableauDeBord.component tool={tableauDeBord} />
  else if (outil === 'agenda' || outil === 'agenda-mois') contenu = <agenda.component tool={agenda} />
  else if (outil === 'communication') contenu = <communication.component tool={communication} />
  else if (outil === 'assistant') {
    const choices = jeu.docs.find((d) => d._id === 'spectacle-choices') as {titre: string; duree?: string; lieu?: {_ref: string}; representations?: []} | undefined
    contenu = (
      <AssistantDates
        titre={choices?.titre ?? 'Choices'}
        duree={choices?.duree}
        lieuSpectacle={choices?.lieu?._ref}
        lieux={jeu.docs.filter((d) => d._type === 'lieu').map((d) => ({_id: d._id, nom: String(d.nom)}))}
        existantes={choices?.representations ?? []}
        autres={aplatir(jeu.docs.filter((d) => d._type === 'spectacle' && d._id !== 'spectacle-choices') as Parameters<typeof aplatir>[0])}
        reference="2026-09-01"
        onFermer={() => undefined}
        onAjouter={(n) => console.info('[banc] ajout', n)}
      />
    )
  }
  return <RouteurContexte.Provider value={routeur}>{contenu}</RouteurContexte.Provider>
}

function Banc() {
  const [pret, setPret] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)
  useEffect(() => {
    charger()
      .then(() => setPret(true))
      .catch((e: Error) => setErreur(e.message))
  }, [])
  return (
    <ThemeProvider theme={studioTheme}>
      <ToastProvider>
        <LayerProvider>
          <Card height="fill" style={{minHeight: '100%'}}>
            {erreur ? (
              <Box padding={5}>
                <Text>Données indisponibles : {erreur}</Text>
              </Box>
            ) : pret ? (
              <Ecran />
            ) : (
              <Flex padding={6} justify="center">
                <Text muted>Chargement des données du théâtre…</Text>
              </Flex>
            )}
          </Card>
        </LayerProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}

createRoot(document.getElementById('racine')!).render(
  <StrictMode>
    <Banc />
  </StrictMode>,
)
