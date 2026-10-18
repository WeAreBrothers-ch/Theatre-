import {useEffect, useRef} from 'react'
import {set, useEditState, useFormValue, type SlugInputProps} from 'sanity'
import {Stack, Text} from '@sanity/ui'
import {slugifier} from '../lib/constantes'

/*
 * L'adresse de la page se fabrique toute seule depuis le titre, tant que la page n'a
 * jamais été publiée : plus de bouton « Générer » à penser. Une fois publiée, elle ne
 * bouge plus (les liens partagés restent bons) ; on peut toujours la retoucher à la main.
 */
export function ChampAdresse(props: SlugInputProps) {
  const id = String(useFormValue(['_id']) ?? '').replace(/^drafts\./, '')
  const type = String(useFormValue(['_type']) ?? '')
  const titre = (useFormValue(['titre']) as string | undefined) ?? ''
  const {published} = useEditState(id, type)
  const titrePrecedent = useRef(titre)
  const actuel = props.value?.current ?? ''

  const {onChange, readOnly} = props
  useEffect(() => {
    const avant = titrePrecedent.current
    titrePrecedent.current = titre
    if (readOnly || published || !titre.trim()) return
    const voulu = slugifier(titre)
    // On suit le titre tant que l'adresse est vide ou qu'elle venait du titre précédent.
    if (voulu && voulu !== actuel && (!actuel || actuel === slugifier(avant))) {
      onChange(set({_type: 'slug', current: voulu}))
    }
  }, [titre, actuel, published, readOnly, onChange])

  return (
    <Stack gap={2}>
      {props.renderDefault(props)}
      <Text size={1} muted>
        {published ? 'Page publiée : l’adresse ne change plus d’elle-même, pour que les liens déjà partagés restent bons.' : 'Se remplit toute seule à partir du titre.'}
      </Text>
    </Stack>
  )
}
