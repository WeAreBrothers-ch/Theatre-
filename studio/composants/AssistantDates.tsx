import {useMemo, useState} from 'react'
import {Badge, Box, Button, Card, Checkbox, Dialog, Flex, Grid, Label, Select, Stack, Tab, TabList, TabPanel, Text, TextArea, TextInput} from '@sanity/ui'
import {aplatir, conflits, genererSerie, lireListe, nouvelleCle, type Rep, type RepresentationBrute, type SpectaclePourAgenda} from '../lib/representations'
import {aujourdhui, dateLongue, heureLisible, JOURS, local, plusJours, versIso} from '../lib/temps'
import {MENTIONS} from '../outils/agenda/DialogueDate'

/*
 * L'assistant « Ajouter des dates » de la fiche spectacle. Trois façons de faire :
 * une série (« du 3 au 14 novembre, du mardi au samedi à 20h, le dimanche à 17h »),
 * une date seule, ou une liste collée depuis un e-mail ou un tableur.
 * Avant d'ajouter, chaque date est vérifiée : déjà dans la fiche, ou salle déjà prise.
 */

type Lieu = {_id: string; nom: string}

type Props = {
  titre: string
  duree?: string
  lieuSpectacle?: string
  lieux: Lieu[]
  existantes: RepresentationBrute[]
  /** Les représentations des autres spectacles, pour repérer les salles déjà prises. */
  autres: Rep[]
  /** Date de référence pour deviner l'année d'une liste collée (début de saison). */
  reference?: string
  onFermer: () => void
  onAjouter: (nouvelles: RepresentationBrute[]) => void
}

type Candidate = {iso: string; etat: 'nouvelle' | 'doublon' | 'conflit'; avec?: string}

// Lundi d'abord, comme un agenda ; 0 = dimanche.
const ORDRE_JOURS = [1, 2, 3, 4, 5, 6, 0]

export function AssistantDates({titre, duree, lieuSpectacle, lieux, existantes, autres, reference, onFermer, onAjouter}: Props) {
  const [onglet, setOnglet] = useState<'serie' | 'une' | 'liste'>('serie')
  const auj = aujourdhui()
  const debutProbable = reference && reference > auj ? reference : auj

  // Série
  const [du, setDu] = useState(debutProbable)
  const [au, setAu] = useState(plusJours(debutProbable, 6))
  const [heures, setHeures] = useState<Partial<Record<number, string>>>({})
  const [sauf, setSauf] = useState<string[]>([])
  const [jourSauf, setJourSauf] = useState('')
  // Une date
  const [date, setDate] = useState(debutProbable)
  const [heure, setHeure] = useState('20:00')
  // Liste
  const [texte, setTexte] = useState('')
  const [heureDefaut, setHeureDefaut] = useState('20:00')
  // Commun
  const [lieu, setLieu] = useState(lieuSpectacle ?? '')
  const [mention, setMention] = useState('')
  const [scolaire, setScolaire] = useState(false)
  const [ignorees, setIgnorees] = useState<Set<string>>(new Set())

  const lecture = useMemo(() => lireListe(texte, reference || auj, heureDefaut), [texte, reference, auj, heureDefaut])

  const isos = useMemo(() => {
    if (onglet === 'serie') return genererSerie({du, au, heures, sauf})
    if (onglet === 'une') return /^\d{4}-\d{2}-\d{2}$/.test(date) && /^\d{2}:\d{2}$/.test(heure) ? [versIso(date, heure)] : []
    return lecture.isos
  }, [onglet, du, au, heures, sauf, date, heure, lecture])

  const candidates: Candidate[] = useMemo(() => {
    const deja = new Set(existantes.map((r) => r.dateHeure && new Date(r.dateHeure).getTime()))
    const lieuChoisi = lieu || lieuSpectacle
    const essai: SpectaclePourAgenda = {
      _id: '__ici__',
      titre,
      duree,
      lieu: lieuChoisi ? {_ref: lieuChoisi} : null,
      representations: isos.map((iso, i) => ({_key: `c${i}`, dateHeure: iso})),
    }
    const miennes = aplatir([essai])
    const trouves = conflits([...autres, ...miennes])
    return isos.map((iso, i) => {
      if (deja.has(new Date(iso).getTime())) return {iso, etat: 'doublon'}
      const c = trouves.find((x) => (x.a.spectacleId === '__ici__' && x.a.cle === `c${i}`) || (x.b.spectacleId === '__ici__' && x.b.cle === `c${i}`))
      if (c) {
        const autre = c.a.spectacleId === '__ici__' ? c.b : c.a
        if (autre.spectacleId !== '__ici__') return {iso, etat: 'conflit', avec: `${autre.titre} à ${heureLisible(autre.heure)}`}
      }
      return {iso, etat: 'nouvelle'}
    })
  }, [isos, existantes, autres, lieu, lieuSpectacle, titre, duree])

  const aAjouter = candidates.filter((c) => c.etat !== 'doublon' && !ignorees.has(c.iso))

  const ajouter = () => {
    const lieuRef = lieu && lieu !== lieuSpectacle ? {_type: 'reference', _ref: lieu} : undefined
    onAjouter(
      aAjouter.map((c) => ({
        _key: nouvelleCle(),
        _type: 'representation',
        dateHeure: c.iso,
        statut: 'en-vente',
        ...(lieuRef ? {lieu: lieuRef} : {}),
        ...(mention.trim() ? {mention: mention.trim()} : {}),
        ...(scolaire ? {scolaire: true} : {}),
      })),
    )
  }

  const basculerJour = (j: number) =>
    setHeures((h) => {
      const suivant = {...h}
      if (suivant[j]) delete suivant[j]
      else suivant[j] = j === 0 ? '17:00' : '20:00'
      return suivant
    })

  return (
    <Dialog
      id="assistant-dates"
      header={`Ajouter des dates : ${titre || 'nouveau spectacle'}`}
      width={2}
      onClose={onFermer}
      footer={
        <Flex padding={3} gap={2} justify="space-between" align="center" wrap="wrap">
          <Text size={1} muted>
            Les dates s’ajoutent à la fiche ; elles paraissent sur le site quand vous publiez.
          </Text>
          <Flex gap={2}>
            <Button mode="ghost" text="Fermer" onClick={onFermer} />
            <Button tone="primary" text={aAjouter.length > 1 ? `Ajouter ${aAjouter.length} dates` : aAjouter.length ? 'Ajouter la date' : 'Ajouter'} disabled={!aAjouter.length} onClick={ajouter} />
          </Flex>
        </Flex>
      }
    >
      <Box padding={4}>
        <Stack gap={4}>
          <TabList gap={1}>
            <Tab id="onglet-serie" aria-controls="panneau-serie" label="Une série" selected={onglet === 'serie'} onClick={() => setOnglet('serie')} />
            <Tab id="onglet-une" aria-controls="panneau-une" label="Une date" selected={onglet === 'une'} onClick={() => setOnglet('une')} />
            <Tab id="onglet-liste" aria-controls="panneau-liste" label="Coller une liste" selected={onglet === 'liste'} onClick={() => setOnglet('liste')} />
          </TabList>

          {onglet === 'serie' && (
            <TabPanel id="panneau-serie" aria-labelledby="onglet-serie">
              <Stack gap={4}>
                <Grid gridTemplateColumns={2} gap={3}>
                  <Stack gap={2}>
                    <Label size={1}>Du</Label>
                    <TextInput type="date" value={du} onChange={(e) => setDu(e.currentTarget.value)} />
                  </Stack>
                  <Stack gap={2}>
                    <Label size={1}>Au (inclus)</Label>
                    <TextInput type="date" value={au} min={du} onChange={(e) => setAu(e.currentTarget.value)} />
                  </Stack>
                </Grid>
                <Stack gap={2}>
                  <Label size={1}>Les jours joués, et leur heure</Label>
                  <Grid gridTemplateColumns={[2, 4, 7]} gap={2}>
                    {ORDRE_JOURS.map((j) => {
                      const actif = !!heures[j]
                      return (
                        <Card key={j} padding={2} radius={2} border tone={actif ? 'primary' : 'default'}>
                          <Stack gap={2}>
                            <Flex as="label" gap={2} align="center">
                              <Checkbox checked={actif} onChange={() => basculerJour(j)} />
                              <Text size={1} weight={actif ? 'semibold' : 'regular'} style={{textTransform: 'capitalize'}}>
                                {JOURS[j].slice(0, 3)}.
                              </Text>
                            </Flex>
                            <TextInput
                              type="time"
                              fontSize={1}
                              padding={2}
                              disabled={!actif}
                              value={heures[j] ?? ''}
                              onChange={(e) => {
                                const v = e.currentTarget.value
                                setHeures((h) => ({...h, [j]: v}))
                              }}
                            />
                          </Stack>
                        </Card>
                      )
                    })}
                  </Grid>
                  <Flex gap={2} wrap="wrap" align="center">
                    <Text size={1} muted>
                      Raccourcis :
                    </Text>
                    {(
                      [
                        ['Mardi → samedi 20h, dimanche 17h', {2: '20:00', 3: '20:00', 4: '20:00', 5: '20:00', 6: '20:00', 0: '17:00'}],
                        ['Tous les soirs 20h', {1: '20:00', 2: '20:00', 3: '20:00', 4: '20:00', 5: '20:00', 6: '20:00', 0: '20:00'}],
                        ['Midi 12h15', {2: '12:15', 3: '12:15', 4: '12:15', 5: '12:15'}],
                        ['Tout décocher', {}],
                      ] as [string, Partial<Record<number, string>>][]
                    ).map(([t, h]) => (
                      <Button key={t} mode="ghost" fontSize={1} padding={2} text={t} onClick={() => setHeures(h)} />
                    ))}
                  </Flex>
                </Stack>
                <Stack gap={2}>
                  <Label size={1}>Relâche (jours sautés)</Label>
                  <Flex gap={2} wrap="wrap" align="center">
                    <TextInput type="date" value={jourSauf} min={du} max={au} onChange={(e) => setJourSauf(e.currentTarget.value)} />
                    <Button
                      mode="ghost"
                      text="Sauter ce jour"
                      disabled={!jourSauf || sauf.includes(jourSauf)}
                      onClick={() => {
                        setSauf((s) => [...s, jourSauf].sort())
                        setJourSauf('')
                      }}
                    />
                    {sauf.map((s) => (
                      <Button key={s} mode="bleed" tone="critical" fontSize={1} padding={2} text={`${dateLongue(s)} ✕`} onClick={() => setSauf((x) => x.filter((y) => y !== s))} />
                    ))}
                  </Flex>
                </Stack>
              </Stack>
            </TabPanel>
          )}

          {onglet === 'une' && (
            <TabPanel id="panneau-une" aria-labelledby="onglet-une">
              <Grid gridTemplateColumns={2} gap={3}>
                <Stack gap={2}>
                  <Label size={1}>Jour</Label>
                  <TextInput type="date" value={date} onChange={(e) => setDate(e.currentTarget.value)} />
                </Stack>
                <Stack gap={2}>
                  <Label size={1}>Heure</Label>
                  <TextInput type="time" value={heure} onChange={(e) => setHeure(e.currentTarget.value)} />
                </Stack>
              </Grid>
            </TabPanel>
          )}

          {onglet === 'liste' && (
            <TabPanel id="panneau-liste" aria-labelledby="onglet-liste">
              <Stack gap={3}>
                <TextArea
                  rows={5}
                  value={texte}
                  placeholder={'Collez les dates, une par ligne ou séparées par des virgules :\n29.10 20h\nve 30 octobre 19h30\n1.11.2026 17:00'}
                  onChange={(e) => setTexte(e.currentTarget.value)}
                />
                <Flex gap={2} align="center">
                  <Text size={1}>Heure quand la ligne n’en dit rien :</Text>
                  <Box style={{width: 120}}>
                    <TextInput type="time" fontSize={1} padding={2} value={heureDefaut} onChange={(e) => setHeureDefaut(e.currentTarget.value)} />
                  </Box>
                </Flex>
                {lecture.incomprises.length > 0 && (
                  <Card padding={3} radius={2} tone="caution" border>
                    <Text size={1}>Pas compris : {lecture.incomprises.map((x) => `« ${x} »`).join(', ')}</Text>
                  </Card>
                )}
              </Stack>
            </TabPanel>
          )}

          <Grid gridTemplateColumns={[1, 2]} gap={3}>
            <Stack gap={2}>
              <Label size={1}>Salle</Label>
              <Select value={lieu} onChange={(e) => setLieu(e.currentTarget.value)}>
                {!lieuSpectacle && <option value="">Salle du spectacle (à choisir dans la fiche)</option>}
                {lieux.map((l) => (
                  <option key={l._id} value={l._id}>
                    {l.nom}
                    {l._id === lieuSpectacle ? ' (salle du spectacle)' : ''}
                  </option>
                ))}
              </Select>
            </Stack>
            <Stack gap={2}>
              <Label size={1}>Mention (facultatif)</Label>
              <TextInput value={mention} list="mentions-assistant" placeholder="Afterwork, Bord de scène…" onChange={(e) => setMention(e.currentTarget.value)} />
              <datalist id="mentions-assistant">
                {MENTIONS.map((m) => (
                  <option key={m} value={m} />
                ))}
              </datalist>
            </Stack>
          </Grid>
          <Flex as="label" align="center" gap={2}>
            <Checkbox checked={scolaire} onChange={(e) => setScolaire(e.currentTarget.checked)} />
            <Text size={1}>Représentations scolaires (réservées aux classes)</Text>
          </Flex>

          <Stack gap={2}>
            <Label size={1}>
              {candidates.length ? `${candidates.length} date${candidates.length > 1 ? 's' : ''}` : 'Aucune date pour l’instant'}
            </Label>
            <Card radius={2} border style={{maxHeight: 260, overflow: 'auto'}}>
              <Stack>
                {candidates.map((c) => {
                  const l = local(c.iso)
                  const ignoree = ignorees.has(c.iso)
                  return (
                    <Flex key={c.iso} padding={2} gap={2} align="center" style={{borderBottom: '1px solid var(--card-border-color)'}}>
                      <Checkbox
                        checked={c.etat !== 'doublon' && !ignoree}
                        disabled={c.etat === 'doublon'}
                        onChange={() =>
                          setIgnorees((s) => {
                            const n = new Set(s)
                            if (n.has(c.iso)) n.delete(c.iso)
                            else n.add(c.iso)
                            return n
                          })
                        }
                      />
                      <Box flex={1}>
                        <Text size={1} style={{opacity: ignoree || c.etat === 'doublon' ? 0.5 : 1}}>
                          {dateLongue(l.date, l.date.slice(0, 4) !== auj.slice(0, 4))} à {heureLisible(l.heure)}
                        </Text>
                      </Box>
                      {c.etat === 'doublon' && <Badge>Déjà dans la fiche</Badge>}
                      {c.etat === 'conflit' && <Badge tone="caution">Salle prise : {c.avec}</Badge>}
                    </Flex>
                  )
                })}
              </Stack>
            </Card>
          </Stack>
        </Stack>
      </Box>
    </Dialog>
  )
}
