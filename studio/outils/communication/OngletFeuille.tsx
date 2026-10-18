import {useMemo, useState} from 'react'
import {Card, Checkbox, Flex, Grid, Label, Select, Stack, Text} from '@sanity/ui'
import {aujourdhui, local} from '../../lib/temps'
import {repsPubliques, type SpectacleCom} from '../../lib/communication/commun'
import {feuilleDeSalle} from '../../lib/communication/impression'
import {usePreference} from '../commun/donnees'
import {ApercuImprimable} from './outils'
import type {ProprietesOnglet} from './Communication'

/*
 * La feuille de salle, distribuée le soir du spectacle : titre, artistes, dates, texte,
 * distribution et production, et en pied les prochains spectacles. Tirée de la fiche.
 */

/** La prochaine date d'un spectacle (ou la dernière s'il est passé). */
function reference(s: SpectacleCom): string {
  const reps = repsPubliques(s)
  const auj = aujourdhui()
  return (reps.find((r) => local(r.dateHeure).date >= auj) ?? reps[reps.length - 1])?.dateHeure ?? ''
}

export function OngletFeuille({ctx, donnees, spectacle, choisir}: ProprietesOnglet) {
  const auj = aujourdhui()
  const tries = useMemo(() => {
    const avecDate = donnees.spectacles.filter((s) => reference(s))
    const aVenir = avecDate.filter((s) => local(reference(s)).date >= auj).sort((a, b) => reference(a).localeCompare(reference(b)))
    const passes = avecDate.filter((s) => local(reference(s)).date < auj).sort((a, b) => reference(b).localeCompare(reference(a)))
    return {aVenir, passes}
  }, [donnees.spectacles, auj])
  const [idLocal, setIdLocal] = useState(() => tries.aVenir[0]?._id ?? tries.passes[0]?._id ?? '')
  const id = spectacle && donnees.spectacles.some((x) => x._id === spectacle) ? spectacle : idLocal
  const setId = (x: string) => (choisir ? choisir(x) : setIdLocal(x))
  const [format, setFormat] = usePreference<'A4' | 'A5'>('feuille.format', 'A4')
  const [visuel, setVisuel] = usePreference('feuille.visuel', true)
  const [pages, setPages] = useState(1)

  const s = donnees.spectacles.find((x) => x._id === id)
  const html = useMemo(() => {
    if (!s) return ''
    const apres = reference(s)
    const prochains = tries.aVenir.filter((x) => x._id !== s._id && reference(x) > apres).slice(0, 4)
    return feuilleDeSalle(ctx, donnees.reglages ?? {}, s, {format, prochains, saison: donnees.saison?.titre, avecVisuel: visuel})
  }, [s, tries, ctx, donnees, format, visuel])

  return (
    <Stack gap={4}>
      <Grid gridTemplateColumns={[1, 3]} gap={3}>
        <Stack gap={2}>
          <Label size={1}>Spectacle</Label>
          <Select value={id} onChange={(e) => setId(e.currentTarget.value)}>
            <optgroup label="À venir">
              {tries.aVenir.map((x) => (
                <option key={x._id} value={x._id}>
                  {x.titre}
                </option>
              ))}
            </optgroup>
            <optgroup label="Passés">
              {tries.passes.map((x) => (
                <option key={x._id} value={x._id}>
                  {x.titre}
                </option>
              ))}
            </optgroup>
          </Select>
        </Stack>
        <Stack gap={2}>
          <Label size={1}>Format</Label>
          <Select value={format} onChange={(e) => setFormat(e.currentTarget.value as 'A4' | 'A5')}>
            <option value="A4">A4</option>
            <option value="A5">A5 (moitié d’A4)</option>
          </Select>
        </Stack>
        <Flex as="label" gap={2} align="flex-end" paddingBottom={2}>
          <Checkbox checked={visuel} onChange={(e) => setVisuel(e.currentTarget.checked)} />
          <Text size={1}>Avec le visuel</Text>
        </Flex>
      </Grid>
      {pages > 1 && (
        <Card padding={3} radius={2} tone="caution" border>
          <Text size={1}>
            La feuille fait {pages} pages en {format} : imprimez en recto verso{visuel ? ', ou retirez le visuel pour gagner de la place' : ''}.
          </Text>
        </Card>
      )}
      {s ? (
        <ApercuImprimable html={html} format={format} titre={`Feuille de salle - ${s.titre}`} onPages={setPages} />
      ) : (
        <Text muted>Aucun spectacle avec des dates.</Text>
      )}
    </Stack>
  )
}
