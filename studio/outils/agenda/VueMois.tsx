import {useState, type DragEvent} from 'react'
import {Box, Button, Card, Flex, Grid, Stack, Text} from '@sanity/ui'
import {Menu, MenuButton, MenuDivider, MenuItem} from '@sanity/ui/menu'
import {AddIcon} from '@sanity/icons/Add'
import {CheckmarkIcon} from '@sanity/icons/Checkmark'
import {EditIcon} from '@sanity/icons/Edit'
import {TrashIcon} from '@sanity/icons/Trash'
import {DocumentIcon} from '@sanity/icons/Document'
import {aujourdhui, grilleMois, heureLisible} from '../../lib/temps'
import type {Statut} from '../../lib/representations'
import {ETATS} from '../commun/statuts'
import type {RepAgenda} from './modele'

/*
 * La vue « mois » : le calendrier mural de la saison. Une étiquette par date, dans l'encre
 * du spectacle. On attrape une date et on la pose sur un autre jour (même heure) ; un clic
 * ouvre le menu de la date ; le « + » d'un jour y ajoute une représentation.
 */

const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

type Props = {
  mois: string
  reps: RepAgenda[]
  enConflit: Set<string>
  desactive: boolean
  onStatut: (r: RepAgenda, s: Statut) => void
  onDeplacer: (r: RepAgenda, date: string) => void
  onAjouter: (date: string) => void
  onModifier: (r: RepAgenda) => void
  onSupprimer: (r: RepAgenda) => void
  onOuvrir: (r: RepAgenda) => void
}

function texteSur(hex?: string): string {
  const h = (hex || '#019e35').replace('#', '')
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.179 ? '#0d0d0c' : '#ffffff'
}

export function VueMois({mois, reps, enConflit, desactive, onStatut, onDeplacer, onAjouter, onModifier, onSupprimer, onOuvrir}: Props) {
  const jours = grilleMois(mois)
  const auj = aujourdhui()
  const [survol, setSurvol] = useState<string | null>(null)
  const parJour = new Map<string, RepAgenda[]>()
  for (const r of reps) parJour.set(r.date, [...(parJour.get(r.date) ?? []), r])

  const deposer = (e: DragEvent, date: string) => {
    e.preventDefault()
    setSurvol(null)
    const cle = e.dataTransfer.getData('text/plain')
    const r = reps.find((x) => `${x.spectacleId}/${x.cle}` === cle)
    if (r && r.date !== date) onDeplacer(r, date)
  }

  return (
    <Box style={{overflowX: 'auto'}}>
      <Grid gridTemplateColumns={7} gap={1} style={{minWidth: 880}}>
        {JOURS.map((j) => (
          <Box key={j} paddingY={2} paddingX={1}>
            <Text size={1} weight="semibold" muted>
              {j}
            </Text>
          </Box>
        ))}
        {jours.map((date) => {
          const horsMois = date.slice(0, 7) !== mois
          const liste = parJour.get(date) ?? []
          return (
            <Card
              key={date}
              padding={1}
              radius={2}
              border
              tone={date === auj ? 'primary' : horsMois ? 'transparent' : 'default'}
              style={{minHeight: 118, outline: survol === date ? '2px solid var(--card-focus-ring-color)' : undefined, opacity: horsMois ? 0.6 : 1}}
              onDragOver={(e: DragEvent) => {
                if (desactive) return
                e.preventDefault()
                e.dataTransfer.dropEffect = 'move'
                if (survol !== date) setSurvol(date)
              }}
              onDragLeave={() => setSurvol((s) => (s === date ? null : s))}
              onDrop={(e: DragEvent) => deposer(e, date)}
            >
              <Stack gap={1}>
                <Flex align="center" justify="space-between" paddingX={1}>
                  <Text size={1} weight={date === auj ? 'bold' : 'regular'}>
                    {Number(date.slice(8, 10))}
                  </Text>
                  <Button icon={AddIcon} mode="bleed" padding={1} fontSize={1} aria-label={`Ajouter une date le ${date}`} disabled={desactive} onClick={() => onAjouter(date)} />
                </Flex>
                {liste.map((r) => {
                  const cle = `${r.spectacleId}/${r.cle}`
                  const conflit = enConflit.has(cle)
                  const fond = r.statut === 'annule' ? '#d8dad6' : r.encre || '#019e35'
                  const couleur = r.statut === 'annule' ? '#555' : texteSur(fond)
                  return (
                    <MenuButton
                      key={cle}
                      id={`mois-${cle}`}
                      popover={{portal: true, placement: 'bottom-start'}}
                      button={
                        <button
                          type="button"
                          draggable={!desactive}
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', cle)
                            e.dataTransfer.effectAllowed = 'move'
                          }}
                          title={`${r.titre} · ${r.lieuNom ?? ''}${r.mention ? ` · ${r.mention}` : ''}`}
                          style={{
                            // Pas de « all: unset » : il retirerait aussi la possibilité de glisser l'élément.
                            appearance: 'none',
                            border: 0,
                            margin: 0,
                            font: 'inherit',
                            textAlign: 'left',
                            boxSizing: 'border-box',
                            display: 'block',
                            width: '100%',
                            cursor: desactive ? 'default' : 'grab',
                            background: fond,
                            color: couleur,
                            borderRadius: 3,
                            padding: '3px 5px',
                            fontSize: 12,
                            lineHeight: '15px',
                            fontWeight: 600,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            boxShadow: conflit ? '0 0 0 2px #e3241b' : r.nonPublie ? 'inset 0 0 0 1px rgba(0,0,0,.4)' : undefined,
                            textDecoration: r.statut === 'annule' ? 'line-through' : undefined,
                            opacity: r.nonPublie ? 0.75 : 1,
                          }}
                        >
                          {r.heureAConfirmer ? '?' : heureLisible(r.heure)} {r.titre}
                          {r.statut === 'complet' ? ' · COMPLET' : r.statut === 'liste-attente' ? ' · ATTENTE' : ''}
                        </button>
                      }
                      menu={
                        <Menu>
                          <Stack gap={2} paddingX={3} paddingY={2}>
                            <Text size={1} weight="semibold">
                              {r.titre}
                            </Text>
                            <Text size={1} muted>
                              {heureLisible(r.heure)} · {r.lieuNom ?? 'salle non choisie'}
                              {conflit ? ' · salle déjà prise' : ''}
                            </Text>
                          </Stack>
                          <MenuDivider />
                          {ETATS.map((e) => (
                            <MenuItem
                              key={e.valeur}
                              text={e.titre}
                              tone={e.valeur === 'complet' ? 'critical' : undefined}
                              icon={r.statut === e.valeur ? CheckmarkIcon : undefined}
                              disabled={desactive}
                              onClick={() => r.statut !== e.valeur && onStatut(r, e.valeur)}
                            />
                          ))}
                          <MenuDivider />
                          <MenuItem icon={EditIcon} text="Changer le jour, l’heure ou la salle…" onClick={() => onModifier(r)} />
                          <MenuItem icon={DocumentIcon} text="Ouvrir la fiche du spectacle" onClick={() => onOuvrir(r)} />
                          <MenuItem icon={TrashIcon} tone="critical" text="Supprimer cette date…" onClick={() => onSupprimer(r)} />
                        </Menu>
                      }
                    />
                  )
                })}
              </Stack>
            </Card>
          )
        })}
      </Grid>
    </Box>
  )
}
