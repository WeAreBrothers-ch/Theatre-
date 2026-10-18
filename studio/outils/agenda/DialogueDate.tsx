import {useMemo, useState} from 'react'
import {Box, Button, Card, Checkbox, Dialog, Flex, Grid, Label, Select, Stack, Text, TextInput} from '@sanity/ui'
import {conflits, aplatir, statutValide, type Statut} from '../../lib/representations'
import {aujourdhui, heureLisible, local, dateLongue} from '../../lib/temps'
import {BoutonsStatut} from '../commun/statuts'
import type {ChampsDate, Lieu, RepAgenda, SpectacleAgenda} from './modele'
import {appliquer} from './modele'

/*
 * Ajouter une date, ou modifier celle qu'on a ouverte : spectacle, jour, heure, salle,
 * mention. Les chevauchements dans la même salle sont annoncés avant d'enregistrer.
 */

export const MENTIONS = ['Afterwork', 'Bord de scène', 'Représentation scolaire', 'Audiodescription', 'Surtitré', 'Première', 'Dernière']

type Props = {
  mode: 'ajouter' | 'modifier'
  spectacles: SpectacleAgenda[]
  lieux: Lieu[]
  reps: RepAgenda[]
  /** Pour « modifier » : la date ouverte. */
  rep?: RepAgenda
  /** Pour « ajouter » : jour proposé et spectacle proposé. */
  date?: string
  spectacleId?: string
  saisonCourante?: string
  onFermer: () => void
  onValider: (spectacleId: string, champs: ChampsDate) => Promise<boolean>
}

export function DialogueDate({mode, spectacles, lieux, reps, rep, date, spectacleId, saisonCourante, onFermer, onValider}: Props) {
  const depart = rep ? local(rep.iso) : null
  const [spectacle, setSpectacle] = useState(rep?.spectacleId ?? spectacleId ?? '')
  const [jour, setJour] = useState(depart?.date ?? date ?? aujourdhui())
  const [heure, setHeure] = useState(depart?.heure ?? '20:00')
  const [lieuId, setLieuId] = useState<string>(rep ? (rep.lieuId ?? '') : '')
  const [mention, setMention] = useState(rep?.mention ?? '')
  const [statut, setStatut] = useState<Statut>(rep?.statut ?? 'en-vente')
  const [scolaire, setScolaire] = useState(!!rep?.scolaire)
  const [aConfirmer, setAConfirmer] = useState(!!rep?.heureAConfirmer)
  const [envoi, setEnvoi] = useState(false)

  const choisi = spectacles.find((s) => s._id === spectacle)
  const lieuDuSpectacle = choisi?.lieu?._ref
  // En modification, la salle affichée est celle de la date ; « vide » veut dire la salle du spectacle.
  const lieuEffectif = lieuId || lieuDuSpectacle || ''

  const ordonnes = useMemo(() => {
    const courants = spectacles.filter((s) => s.saison === saisonCourante)
    const autres = spectacles.filter((s) => s.saison !== saisonCourante)
    return {courants, autres}
  }, [spectacles, saisonCourante])

  const champs: ChampsDate = {date: jour, heure, lieuId: lieuEffectif || null, mention, statut, scolaire, heureAConfirmer: aConfirmer}

  // Les chevauchements que la date provoquerait, avec les autres dates déjà connues.
  const chevauchements = useMemo(() => {
    if (!choisi || !jour || !heure) return []
    const essai = appliquer({_key: rep?.cle ?? '__nouvelle__', _type: 'representation', statut: statutValide(statut)}, champs, choisi)
    const autres = reps.filter((r) => !(rep && r.spectacleId === rep.spectacleId && r.cle === rep.cle))
    const [nouvelle] = aplatir([{...choisi, representations: [essai]}])
    if (!nouvelle) return []
    return conflits([...autres, nouvelle]).filter((c) => c.a === nouvelle || c.b === nouvelle).map((c) => (c.a === nouvelle ? c.b : c.a))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [choisi, jour, heure, lieuEffectif, statut, reps, rep])

  const valide = !!spectacle && /^\d{4}-\d{2}-\d{2}$/.test(jour) && /^\d{2}:\d{2}$/.test(heure)

  const valider = async () => {
    setEnvoi(true)
    const ok = await onValider(spectacle, champs)
    setEnvoi(false)
    if (ok) onFermer()
  }

  return (
    <Dialog
      id="dialogue-date"
      header={mode === 'ajouter' ? 'Ajouter une date' : `Modifier la date : ${rep?.titre ?? ''}`}
      width={1}
      onClose={onFermer}
      footer={
        <Flex padding={3} gap={2} justify="flex-end">
          <Button mode="ghost" text="Annuler" onClick={onFermer} />
          <Button
            tone={chevauchements.length ? 'caution' : 'primary'}
            text={mode === 'ajouter' ? (chevauchements.length ? 'Ajouter quand même' : 'Ajouter la date') : chevauchements.length ? 'Enregistrer quand même' : 'Enregistrer'}
            disabled={!valide || envoi}
            loading={envoi}
            onClick={valider}
          />
        </Flex>
      }
    >
      <Box padding={4}>
        <Stack gap={4}>
          {mode === 'ajouter' && (
            <Stack gap={2}>
              <Label size={1}>Spectacle</Label>
              <Select value={spectacle} onChange={(e) => setSpectacle(e.currentTarget.value)}>
                <option value="">Choisir un spectacle…</option>
                {ordonnes.courants.length > 0 && (
                  <optgroup label="Saison en cours">
                    {ordonnes.courants.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.titre}
                        {s.nonPublie ? ' (brouillon)' : ''}
                      </option>
                    ))}
                  </optgroup>
                )}
                <optgroup label={ordonnes.courants.length ? 'Autres saisons' : 'Spectacles'}>
                  {ordonnes.autres.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.titre}
                      {s.nonPublie ? ' (brouillon)' : ''}
                    </option>
                  ))}
                </optgroup>
              </Select>
            </Stack>
          )}

          <Grid gridTemplateColumns={[1, 2]} gap={3}>
            <Stack gap={2}>
              <Label size={1}>Jour</Label>
              <TextInput type="date" value={jour} onChange={(e) => setJour(e.currentTarget.value)} />
              {jour && /^\d{4}-\d{2}-\d{2}$/.test(jour) && (
                <Text size={1} muted>
                  {dateLongue(jour, true)}
                </Text>
              )}
            </Stack>
            <Stack gap={2}>
              <Label size={1}>Heure</Label>
              <TextInput type="time" step={300} value={heure} onChange={(e) => setHeure(e.currentTarget.value)} />
              <Text size={1} muted>
                {heure ? heureLisible(heure) : ''}
                {choisi?.duree ? ` · durée ${choisi.duree}` : ''}
              </Text>
            </Stack>
          </Grid>

          <Stack gap={2}>
            <Label size={1}>Salle</Label>
            <Select value={lieuEffectif} onChange={(e) => setLieuId(e.currentTarget.value)}>
              {!lieuDuSpectacle && <option value="">Choisir une salle…</option>}
              {lieux.map((l) => (
                <option key={l._id} value={l._id}>
                  {l.nom}
                  {l._id === lieuDuSpectacle ? ' (salle du spectacle)' : ''}
                </option>
              ))}
            </Select>
          </Stack>

          <Stack gap={2}>
            <Label size={1}>Mention (facultatif)</Label>
            <TextInput value={mention} list="mentions-dates" placeholder="Afterwork, Bord de scène…" onChange={(e) => setMention(e.currentTarget.value)} />
            <datalist id="mentions-dates">
              {MENTIONS.map((m) => (
                <option key={m} value={m} />
              ))}
            </datalist>
          </Stack>

          <Stack gap={2}>
            <Label size={1}>Billets</Label>
            <BoutonsStatut valeur={statut} onChange={setStatut} />
          </Stack>

          <Stack gap={3}>
            <Flex as="label" align="center" gap={2}>
              <Checkbox checked={scolaire} onChange={(e) => setScolaire(e.currentTarget.checked)} />
              <Text size={1}>Représentation scolaire (réservée aux classes : pas de bouton Réserver sur le site)</Text>
            </Flex>
            <Flex as="label" align="center" gap={2}>
              <Checkbox checked={aConfirmer} onChange={(e) => setAConfirmer(e.currentTarget.checked)} />
              <Text size={1}>Heure à confirmer (le site écrit « heure à confirmer »)</Text>
            </Flex>
          </Stack>

          {chevauchements.length > 0 && (
            <Card padding={3} radius={2} tone="caution" border>
              <Stack gap={2}>
                <Text size={1} weight="semibold">
                  La salle est déjà prise à ce moment-là :
                </Text>
                {chevauchements.map((c) => (
                  <Text key={`${c.spectacleId}/${c.cle}`} size={1}>
                    « {c.titre} », {dateLongue(c.date)} à {heureLisible(c.heure)}
                    {c.dureeConnue ? '' : ' (durée inconnue : deux heures comptées)'}
                  </Text>
                ))}
              </Stack>
            </Card>
          )}
          {choisi?.nonPublie && (
            <Card padding={3} radius={2} tone="primary" border>
              <Text size={1}>Ce spectacle n’est pas encore publié : la date est ajoutée à son brouillon et paraîtra sur le site avec lui.</Text>
            </Card>
          )}
        </Stack>
      </Box>
    </Dialog>
  )
}

/** Confirmation avant de supprimer une date. */
export function DialogueSupprimer({rep, onFermer, onValider}: {rep: RepAgenda; onFermer: () => void; onValider: () => Promise<boolean>}) {
  const [envoi, setEnvoi] = useState(false)
  return (
    <Dialog
      id="dialogue-supprimer"
      header="Supprimer cette date ?"
      width={0}
      onClose={onFermer}
      footer={
        <Flex padding={3} gap={2} justify="flex-end">
          <Button mode="ghost" text="Garder" onClick={onFermer} />
          <Button
            tone="critical"
            text="Supprimer la date"
            loading={envoi}
            onClick={async () => {
              setEnvoi(true)
              const ok = await onValider()
              setEnvoi(false)
              if (ok) onFermer()
            }}
          />
        </Flex>
      }
    >
      <Box padding={4}>
        <Stack gap={3}>
          <Text>
            « {rep.titre} », {dateLongue(rep.date, true)} à {heureLisible(rep.heure)}.
          </Text>
          <Text size={1} muted>
            Pour une date qui n’aura pas lieu mais que le public connaît déjà, préférez « Annulé » : elle reste visible, barrée. Une suppression peut être annulée avec le bouton « Annuler » de
            l’agenda.
          </Text>
        </Stack>
      </Box>
    </Dialog>
  )
}
