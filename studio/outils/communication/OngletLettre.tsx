import {useMemo, useState} from 'react'
import {Box, Button, Card, Checkbox, Flex, Grid, Label, Select, Stack, Text, TextArea, TextInput} from '@sanity/ui'
import {aujourdhui, lundi, plusJours} from '../../lib/temps'
import {entrees, lettreHtml, lettreTexte, libellePeriode, objet, pageLettre, type OptionsLettre} from '../../lib/communication/lettre'
import type {ReglagesCom} from '../../lib/communication/commun'
import {usePreference} from '../commun/donnees'
import {BoutonCopier, copierHtml, copierTexte, telecharger} from './outils'
import type {ProprietesOnglet} from './Communication'

/*
 * La lettre d'information : on choisit la période, on écrit deux phrases d'introduction,
 * et la lettre se compose seule. « Copier la lettre » puis coller dans la messagerie ou
 * l'outil d'envoi : images, couleurs et boutons suivent.
 */
export function OngletLettre({ctx, donnees}: ProprietesOnglet) {
  const auj = aujourdhui()
  const [debut, setDebut] = useState(() => lundi(auj))
  const [semaines, setSemaines] = usePreference('lettre.semaines', 4)
  const [titre, setTitre] = usePreference('lettre.titre', 'Les prochaines semaines au TBB')
  const [intro, setIntro] = useState('')
  const [aLaUne, setALaUne] = useState('')
  const [complets, setComplets] = usePreference('lettre.complets', true)
  const [largeur, setLargeur] = useState<'ordinateur' | 'telephone'>('ordinateur')

  const options: OptionsLettre = {debut, semaines, titre, intro, aLaUne: aLaUne || null, inclureComplets: complets}
  const reglages: ReglagesCom = donnees.reglages ?? {}
  const liste = useMemo(() => entrees(donnees.spectacles, options), [donnees.spectacles, debut, semaines, complets]) // eslint-disable-line react-hooks/exhaustive-deps
  const corps = useMemo(() => lettreHtml(ctx, reglages, donnees.spectacles, options), [ctx.site, donnees, debut, semaines, titre, intro, aLaUne, complets]) // eslint-disable-line react-hooks/exhaustive-deps
  const sujet = objet(donnees.spectacles, options)
  const page = pageLettre(corps, sujet)

  return (
    <Grid gridTemplateColumns={[1, 1, 1, 3]} gap={5}>
      <Stack gap={4} style={{gridColumn: 'span 1'}}>
        <Grid gridTemplateColumns={2} gap={3}>
          <Stack gap={2}>
            <Label size={1}>À partir du</Label>
            <TextInput type="date" value={debut} onChange={(e) => setDebut(e.currentTarget.value)} />
          </Stack>
          <Stack gap={2}>
            <Label size={1}>Pendant</Label>
            <Select value={semaines} onChange={(e) => setSemaines(Number(e.currentTarget.value))}>
              {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((n) => (
                <option key={n} value={n}>
                  {n} semaine{n > 1 ? 's' : ''}
                </option>
              ))}
            </Select>
          </Stack>
        </Grid>
        <Text size={1} muted>
          {libellePeriode(options)} · {liste.length} spectacle{liste.length > 1 ? 's' : ''}
        </Text>
        <Flex gap={2} wrap="wrap">
          {[
            ['Cette semaine', lundi(auj), 1],
            ['Semaine prochaine', plusJours(lundi(auj), 7), 1],
            ['Le mois à venir', lundi(auj), 4],
          ].map(([t, d, n]) => (
            <Button
              key={t as string}
              mode="ghost"
              fontSize={1}
              padding={2}
              text={t as string}
              selected={debut === d && semaines === n}
              onClick={() => {
                setDebut(d as string)
                setSemaines(n as number)
              }}
            />
          ))}
        </Flex>
        <Stack gap={2}>
          <Label size={1}>Titre</Label>
          <TextInput value={titre} onChange={(e) => setTitre(e.currentTarget.value)} />
        </Stack>
        <Stack gap={2}>
          <Label size={1}>Introduction (facultatif)</Label>
          <TextArea rows={5} value={intro} placeholder="Deux ou trois phrases. Une ligne vide sépare les paragraphes." onChange={(e) => setIntro(e.currentTarget.value)} />
        </Stack>
        <Stack gap={2}>
          <Label size={1}>À la une, en grand</Label>
          <Select value={aLaUne} onChange={(e) => setALaUne(e.currentTarget.value)}>
            <option value="">Aucun</option>
            {liste.map((e) => (
              <option key={e.spectacle._id} value={e.spectacle._id}>
                {e.spectacle.titre}
              </option>
            ))}
          </Select>
        </Stack>
        <Flex as="label" gap={2} align="center">
          <Checkbox checked={complets} onChange={(e) => setComplets(e.currentTarget.checked)} />
          <Text size={1}>Garder les spectacles complets (marqués « Complet »)</Text>
        </Flex>

        <Card padding={3} radius={2} border tone="primary">
          <Stack gap={3}>
            <Text size={1} weight="semibold">
              Objet : {sujet}
            </Text>
            <Flex gap={2} wrap="wrap">
              <BoutonCopier texte="Copier la lettre" tone="primary" mode="default" action={() => copierHtml(corps, lettreTexte(ctx, reglages, donnees.spectacles, options))} />
              <BoutonCopier texte="Copier l’objet" action={() => copierTexte(sujet)} />
            </Flex>
            <Text size={1} muted>
              Collez la lettre dans un nouveau message (Outlook, Gmail…) ou dans le bloc « texte » de votre outil d’envoi.
            </Text>
            <Flex gap={2} wrap="wrap">
              <BoutonCopier texte="Copier le code HTML" action={() => copierTexte(page)} />
              <BoutonCopier texte="Télécharger (.html)" action={async () => telecharger(`lettre-tbb-${debut}.html`, page, 'text/html')} />
            </Flex>
          </Stack>
        </Card>
      </Stack>

      <Stack gap={3} style={{gridColumn: 'span 2'}}>
        <Flex gap={2}>
          {(['ordinateur', 'telephone'] as const).map((l) => (
            <Button key={l} mode="ghost" fontSize={1} padding={2} selected={largeur === l} text={l === 'ordinateur' ? 'Aperçu sur ordinateur' : 'Aperçu sur téléphone'} onClick={() => setLargeur(l)} />
          ))}
        </Flex>
        <Card radius={2} border style={{background: '#f3f4f2'}}>
          <Box padding={3} style={{display: 'flex', justifyContent: 'center'}}>
            <iframe title="Aperçu de la lettre" srcDoc={page} style={{width: largeur === 'ordinateur' ? 680 : 390, maxWidth: '100%', height: '72vh', border: 0, background: '#fff'}} />
          </Box>
        </Card>
      </Stack>
    </Grid>
  )
}
