import {useMemo, useState} from 'react'
import type {Tool} from 'sanity'
import {Box, Button, Card, Container, Flex, Heading, Select, Spinner, Stack, Tab, TabList, Text, TextInput} from '@sanity/ui'
import {Tooltip} from '@sanity/ui/tooltip'
import {CalendarIcon} from '@sanity/icons/Calendar'
import {AddIcon} from '@sanity/icons/Add'
import {UndoIcon} from '@sanity/icons/Undo'
import {ChevronLeftIcon} from '@sanity/icons/ChevronLeft'
import {ChevronRightIcon} from '@sanity/icons/ChevronRight'
import {SearchIcon} from '@sanity/icons/Search'
import {aujourdhui, dateLongue, heureLisible, nomMois, plusMois} from '../../lib/temps'
import {useOuvrir, usePreference} from '../commun/donnees'
import {DialogueDate, DialogueSupprimer} from './DialogueDate'
import {useAgenda, type RepAgenda} from './modele'
import {VueListe} from './VueListe'
import {VueMois} from './VueMois'

/*
 * L'agenda : toutes les représentations de toutes les salles, au même endroit.
 *
 * - Liste : jour par jour, l'état de chaque date en un clic (le guichet).
 * - Mois : le calendrier de la saison ; on y déplace une date d'un geste.
 *
 * Tout ce qui se fait ici est publié aussitôt et peut être annulé.
 */

type Dialogue = {type: 'ajouter'; date?: string; spectacleId?: string} | {type: 'modifier'; rep: RepAgenda} | {type: 'supprimer'; rep: RepAgenda} | null

function AgendaOutil() {
  const a = useAgenda()
  const ouvrir = useOuvrir()
  const [vue, setVue] = usePreference<'liste' | 'mois'>('agenda.vue', 'liste')
  const [lieu, setLieu] = usePreference<string>('agenda.lieu', '')
  const [periode, setPeriode] = useState<'avenir' | 'passees' | 'tout'>('avenir')
  const [recherche, setRecherche] = useState('')
  const [mois, setMois] = useState(() => aujourdhui().slice(0, 7))
  const [dialogue, setDialogue] = useState<Dialogue>(null)

  const saisonCourante = a.saisons.find((s) => s.courante)?._id
  const auj = aujourdhui()

  const filtrees = useMemo(() => {
    const q = recherche
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
    return a.reps.filter((r) => {
      if (lieu && r.lieuId !== lieu) return false
      if (q && !r.titre.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').includes(q)) return false
      return true
    })
  }, [a.reps, lieu, recherche])

  const liste = useMemo(() => {
    if (periode === 'avenir') return filtrees.filter((r) => r.date >= auj)
    if (periode === 'passees') return [...filtrees.filter((r) => r.date < auj)].reverse()
    return filtrees
  }, [filtrees, periode, auj])

  const duMois = useMemo(() => filtrees.filter((r) => r.date >= `${plusMois(mois, -1)}-20` && r.date <= `${plusMois(mois, 1)}-12`), [filtrees, mois])

  const conflitsAVenir = a.conflits.filter((c) => c.a.date >= auj)
  const lieuxParId = new Map(a.lieux.map((l) => [l._id, l.nom]))

  return (
    <Box padding={[3, 4, 5]} style={{overflow: 'auto', height: '100%'}}>
      <Container width={vue === 'mois' ? 5 : 3}>
        <Stack gap={4}>
          <Flex align="flex-end" justify="space-between" gap={3} wrap="wrap">
            <Stack gap={3}>
              <Heading as="h1" size={3}>
                Agenda
              </Heading>
              <Text muted size={1}>
                Toutes les dates, toutes les salles. Chaque changement est publié aussitôt.
              </Text>
            </Stack>
            <Flex gap={2} wrap="wrap">
              <Tooltip content={<Text size={1}>{a.dernierGeste ? `Annuler : ${a.dernierGeste}` : 'Rien à annuler'}</Text>} padding={2} portal>
                <Button icon={UndoIcon} text="Annuler" mode="ghost" disabled={!a.dernierGeste || a.enCours} onClick={a.annuler} />
              </Tooltip>
              <Button icon={AddIcon} text="Ajouter une date" tone="primary" onClick={() => setDialogue({type: 'ajouter'})} />
            </Flex>
          </Flex>

          <Flex gap={3} wrap="wrap" align="center" justify="space-between">
            <TabList gap={1}>
              <Tab id="vue-liste" aria-controls="panneau-agenda" label="Liste" selected={vue === 'liste'} onClick={() => setVue('liste')} />
              <Tab id="vue-mois" aria-controls="panneau-agenda" label="Mois" selected={vue === 'mois'} onClick={() => setVue('mois')} />
            </TabList>
            <Flex gap={2} wrap="wrap" align="center">
              <Box style={{width: 210}}>
                <TextInput icon={SearchIcon} placeholder="Chercher un spectacle" value={recherche} onChange={(e) => setRecherche(e.currentTarget.value)} clearButton={!!recherche} onClear={() => setRecherche('')} />
              </Box>
              <Box style={{width: 190}}>
                <Select value={lieu} onChange={(e) => setLieu(e.currentTarget.value)}>
                  <option value="">Toutes les salles</option>
                  {a.lieux.map((l) => (
                    <option key={l._id} value={l._id}>
                      {l.nom}
                    </option>
                  ))}
                </Select>
              </Box>
              {vue === 'liste' ? (
                <Box style={{width: 170}}>
                  <Select value={periode} onChange={(e) => setPeriode(e.currentTarget.value as typeof periode)}>
                    <option value="avenir">À venir</option>
                    <option value="passees">Passées</option>
                    <option value="tout">Toutes les dates</option>
                  </Select>
                </Box>
              ) : (
                <Flex align="center" gap={1}>
                  <Button icon={ChevronLeftIcon} mode="ghost" aria-label="Mois précédent" onClick={() => setMois(plusMois(mois, -1))} />
                  <Box style={{minWidth: 150, textAlign: 'center'}}>
                    <Text weight="semibold" style={{textTransform: 'capitalize'}}>
                      {nomMois(mois)}
                    </Text>
                  </Box>
                  <Button icon={ChevronRightIcon} mode="ghost" aria-label="Mois suivant" onClick={() => setMois(plusMois(mois, 1))} />
                  <Button text="Aujourd’hui" mode="bleed" onClick={() => setMois(auj.slice(0, 7))} />
                </Flex>
              )}
            </Flex>
          </Flex>

          {conflitsAVenir.length > 0 && (
            <Card padding={3} radius={2} tone="caution" border>
              <Stack gap={2}>
                <Text size={1} weight="semibold">
                  {conflitsAVenir.length === 1 ? 'Une salle est réservée deux fois' : `${conflitsAVenir.length} chevauchements de salle`}
                </Text>
                {conflitsAVenir.slice(0, 5).map((c) => (
                  <Text key={`${c.a.spectacleId}${c.a.cle}${c.b.cle}`} size={1}>
                    {lieuxParId.get(c.a.lieuId ?? '') ?? 'Salle'}, {dateLongue(c.a.date)} : « {c.a.titre} » à {heureLisible(c.a.heure)} et « {c.b.titre} » à {heureLisible(c.b.heure)}
                  </Text>
                ))}
                <Text size={1} muted>
                  La durée de chaque spectacle (onglet Infos pratiques de la fiche) sert à ce calcul ; sans durée, deux heures sont comptées.
                </Text>
              </Stack>
            </Card>
          )}

          <Box id="panneau-agenda">
            {a.erreur ? (
              <Card padding={4} tone="critical" radius={2}>
                <Text>Impossible de charger l’agenda : {a.erreur}</Text>
              </Card>
            ) : a.chargement ? (
              <Flex padding={6} justify="center">
                <Spinner muted />
              </Flex>
            ) : vue === 'liste' ? (
              <VueListe
                reps={liste}
                enConflit={a.enConflit}
                desactive={a.enCours}
                onStatut={a.changerStatut}
                onModifier={(rep) => setDialogue({type: 'modifier', rep})}
                onSupprimer={(rep) => setDialogue({type: 'supprimer', rep})}
                onOuvrir={(r) => ouvrir(r.spectacleId, 'spectacle')}
              />
            ) : (
              <VueMois
                mois={mois}
                reps={duMois}
                enConflit={a.enConflit}
                desactive={a.enCours}
                onStatut={a.changerStatut}
                onDeplacer={(r, date) => a.modifier(r, {date}, `déplacer au ${dateLongue(date)}`)}
                onAjouter={(date) => setDialogue({type: 'ajouter', date})}
                onModifier={(rep) => setDialogue({type: 'modifier', rep})}
                onSupprimer={(rep) => setDialogue({type: 'supprimer', rep})}
                onOuvrir={(r) => ouvrir(r.spectacleId, 'spectacle')}
              />
            )}
          </Box>
        </Stack>
      </Container>

      {dialogue?.type === 'ajouter' && (
        <DialogueDate
          mode="ajouter"
          spectacles={a.spectacles}
          lieux={a.lieux}
          reps={a.reps}
          date={dialogue.date}
          spectacleId={dialogue.spectacleId}
          saisonCourante={saisonCourante}
          onFermer={() => setDialogue(null)}
          onValider={(id, champs) => a.ajouter(id, champs)}
        />
      )}
      {dialogue?.type === 'modifier' && (
        <DialogueDate
          mode="modifier"
          spectacles={a.spectacles}
          lieux={a.lieux}
          reps={a.reps}
          rep={dialogue.rep}
          saisonCourante={saisonCourante}
          onFermer={() => setDialogue(null)}
          onValider={(_id, champs) => a.modifier(dialogue.rep, champs, 'modifier la date')}
        />
      )}
      {dialogue?.type === 'supprimer' && <DialogueSupprimer rep={dialogue.rep} onFermer={() => setDialogue(null)} onValider={() => a.supprimer(dialogue.rep)} />}
    </Box>
  )
}

export const agenda: Tool = {
  name: 'agenda',
  title: 'Agenda',
  icon: CalendarIcon,
  component: AgendaOutil,
}
