import {Fragment} from 'react'
import {Badge, Box, Button, Card, Flex, Stack, Text} from '@sanity/ui'
import {Menu, MenuButton, MenuDivider, MenuItem} from '@sanity/ui/menu'
import {EllipsisVerticalIcon} from '@sanity/icons/EllipsisVertical'
import {EditIcon} from '@sanity/icons/Edit'
import {TrashIcon} from '@sanity/icons/Trash'
import {DocumentIcon} from '@sanity/icons/Document'
import {aujourdhui, dateLongue, heureLisible, plusJours} from '../../lib/temps'
import {BoutonsStatut} from '../commun/statuts'
import type {RepAgenda} from './modele'
import type {Statut} from '../../lib/representations'

/*
 * La vue « liste » : toutes les dates, jour par jour, avec les quatre boutons d'état.
 * C'est la vue du guichet : « ce soir c'est complet » se fait en un clic.
 */

type Props = {
  reps: RepAgenda[]
  enConflit: Set<string>
  desactive: boolean
  onStatut: (r: RepAgenda, s: Statut) => void
  onModifier: (r: RepAgenda) => void
  onSupprimer: (r: RepAgenda) => void
  onOuvrir: (r: RepAgenda) => void
}

function titreJour(date: string): string {
  const auj = aujourdhui()
  const prefixe = date === auj ? 'Aujourd’hui · ' : date === plusJours(auj, 1) ? 'Demain · ' : ''
  return `${prefixe}${dateLongue(date, date.slice(0, 4) !== auj.slice(0, 4))}`
}

export function VueListe({reps, enConflit, desactive, onStatut, onModifier, onSupprimer, onOuvrir}: Props) {
  if (!reps.length)
    return (
      <Card padding={5} radius={3} border tone="transparent">
        <Text muted align="center">
          Aucune date pour ces critères.
        </Text>
      </Card>
    )
  let jour = ''
  return (
    <Stack gap={2}>
      {reps.map((r) => {
        const nouveauJour = r.date !== jour
        jour = r.date
        const conflit = enConflit.has(`${r.spectacleId}/${r.cle}`)
        return (
          <Fragment key={`${r.spectacleId}/${r.cle}`}>
            {nouveauJour && (
              <Box paddingTop={4} paddingBottom={1}>
                <Text size={1} weight="semibold" style={{textTransform: 'uppercase', letterSpacing: '.06em'}}>
                  {titreJour(r.date)}
                </Text>
              </Box>
            )}
            <Card
              padding={3}
              radius={2}
              border
              tone={r.statut === 'annule' ? 'transparent' : 'default'}
              style={{borderLeft: `6px solid ${r.encre || '#019e35'}`, boxShadow: conflit ? 'inset 0 0 0 2px #e3241b' : undefined}}
            >
              <Flex align="center" gap={3} wrap="wrap">
                <Box style={{width: 54}}>
                  <Text size={2} weight="bold" style={{fontVariantNumeric: 'tabular-nums'}}>
                    {r.heureAConfirmer ? '—' : heureLisible(r.heure)}
                  </Text>
                </Box>
                <Stack gap={2} flex={1} style={{minWidth: 200}}>
                  <Flex align="center" gap={2}>
                    <Text size={2} weight="semibold" textOverflow="ellipsis" style={r.statut === 'annule' ? {textDecoration: 'line-through'} : undefined}>
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          onOuvrir(r)
                        }}
                        style={{color: 'inherit', textDecoration: 'none'}}
                        title="Ouvrir la fiche du spectacle"
                      >
                        {r.titre}
                      </a>
                    </Text>
                  </Flex>
                  <Flex gap={2} wrap="wrap" align="center">
                    <Text size={1} muted>
                      {r.lieuNom ?? 'Salle non choisie'}
                    </Text>
                    {r.mention && <Badge tone="primary">{r.mention}</Badge>}
                    {r.scolaire && <Badge>Scolaire</Badge>}
                    {r.heureAConfirmer && <Badge tone="caution">Heure à confirmer</Badge>}
                    {r.nonPublie && <Badge tone="caution">Spectacle en brouillon</Badge>}
                    {conflit && <Badge tone="critical">Salle déjà prise</Badge>}
                  </Flex>
                </Stack>
                <BoutonsStatut valeur={r.statut} desactive={desactive} onChange={(s) => onStatut(r, s)} compact />
                <MenuButton
                  id={`menu-${r.spectacleId}-${r.cle}`}
                  button={<Button icon={EllipsisVerticalIcon} mode="bleed" aria-label="Plus d’actions" disabled={desactive} />}
                  popover={{portal: true, placement: 'bottom-end'}}
                  menu={
                    <Menu>
                      <MenuItem icon={EditIcon} text="Changer le jour, l’heure ou la salle…" onClick={() => onModifier(r)} />
                      <MenuItem icon={DocumentIcon} text="Ouvrir la fiche du spectacle" onClick={() => onOuvrir(r)} />
                      <MenuDivider />
                      <MenuItem icon={TrashIcon} tone="critical" text="Supprimer cette date…" onClick={() => onSupprimer(r)} />
                    </Menu>
                  }
                />
              </Flex>
            </Card>
          </Fragment>
        )
      })}
    </Stack>
  )
}
