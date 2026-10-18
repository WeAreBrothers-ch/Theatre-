import {useCallback, useEffect, useRef, useState} from 'react'
import {Box, Button, Card, Flex, Stack, Text} from '@sanity/ui'
import {PrintIcon} from './icones'

/* Petits outils communs aux générateurs : presse-papiers, téléchargement, aperçu imprimable. */

/** Copie un contenu riche (HTML + texte) : collé dans une messagerie, il garde sa mise en page. */
export async function copierHtml(html: string, texte: string): Promise<void> {
  if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([html], {type: 'text/html'}),
          'text/plain': new Blob([texte], {type: 'text/plain'}),
        }),
      ])
      return
    } catch {
      /* certains navigateurs refusent : on passe par la sélection */
    }
  }
  const boite = document.createElement('div')
  boite.innerHTML = html
  boite.setAttribute('style', 'position:fixed;left:-99999px;top:0;')
  document.body.appendChild(boite)
  const plage = document.createRange()
  plage.selectNodeContents(boite)
  const selection = window.getSelection()
  selection?.removeAllRanges()
  selection?.addRange(plage)
  document.execCommand('copy')
  selection?.removeAllRanges()
  boite.remove()
}

export async function copierTexte(texte: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(texte)
  } catch {
    const zone = document.createElement('textarea')
    zone.value = texte
    zone.setAttribute('style', 'position:fixed;left:-99999px;top:0;')
    document.body.appendChild(zone)
    zone.select()
    document.execCommand('copy')
    zone.remove()
  }
}

export function telecharger(nom: string, contenu: string, type: string): void {
  const url = URL.createObjectURL(new Blob([contenu], {type}))
  const a = document.createElement('a')
  a.href = url
  a.download = nom
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 60000)
}

/** Un bouton qui dit « Copié » une seconde et demie après le clic. */
export function BoutonCopier({texte, action, tone = 'default', mode = 'ghost'}: {texte: string; action: () => Promise<void>; tone?: 'default' | 'primary'; mode?: 'ghost' | 'default'}) {
  const [etat, setEtat] = useState<'repos' | 'ok' | 'erreur'>('repos')
  useEffect(() => {
    if (etat === 'repos') return
    const t = setTimeout(() => setEtat('repos'), 1800)
    return () => clearTimeout(t)
  }, [etat])
  return (
    <Button
      mode={mode}
      tone={etat === 'ok' ? 'positive' : etat === 'erreur' ? 'critical' : tone}
      text={etat === 'ok' ? 'Copié ✓' : etat === 'erreur' ? 'Impossible de copier' : texte}
      onClick={() =>
        action()
          .then(() => setEtat('ok'))
          .catch(() => setEtat('erreur'))
      }
    />
  )
}

/** Hauteur d'une page imprimée, en pixels CSS (96 par pouce). */
export const HAUTEUR_PAGE: Record<string, number> = {A5: (210 / 25.4) * 96, A4: (297 / 25.4) * 96, A3: (420 / 25.4) * 96}

/**
 * L'aperçu d'une feuille imprimable, réduit à la largeur du panneau, avec le bouton Imprimer.
 * `onPages` reçoit le nombre de pages qu'occupera l'impression.
 */
export function ApercuImprimable({html, format, titre, onPages}: {html: string; format: 'A4' | 'A5' | 'A3'; titre: string; onPages?: (n: number) => void}) {
  const cadre = useRef<HTMLIFrameElement>(null)
  const [pret, setPret] = useState(false)
  const [hauteur, setHauteur] = useState(1200)
  const mesurer = useCallback(() => {
    const doc = cadre.current?.contentDocument
    if (!doc) return
    const feuille = doc.querySelector('.feuille') as HTMLElement | null
    const h = feuille?.scrollHeight ?? doc.body.scrollHeight
    setHauteur(doc.body.scrollHeight + 20)
    onPages?.(Math.max(1, Math.ceil((h - 2) / HAUTEUR_PAGE[format])))
    setPret(true)
  }, [format, onPages])

  useEffect(() => setPret(false), [html])

  const imprimer = () => {
    const fenetre = cadre.current?.contentWindow
    if (!fenetre) return
    fenetre.document.title = titre
    fenetre.focus()
    fenetre.print()
  }

  return (
    <Stack gap={3}>
      <Flex gap={2} align="center">
        <Button icon={PrintIcon} tone="primary" text="Imprimer ou enregistrer en PDF" disabled={!pret} onClick={imprimer} />
        <Text size={1} muted>
          Dans la fenêtre d’impression, choisissez « Enregistrer au format PDF » pour un fichier.
        </Text>
      </Flex>
      <Card radius={2} border style={{background: '#8a8d89', overflow: 'hidden'}}>
        <Box style={{height: Math.min(hauteur, 1400) * 0.62, overflow: 'auto'}}>
          <iframe
            ref={cadre}
            title={titre}
            srcDoc={html}
            onLoad={() => setTimeout(mesurer, 600)}
            style={{width: '161.3%', height: hauteur, border: 0, transform: 'scale(.62)', transformOrigin: '0 0', display: 'block'}}
          />
        </Box>
      </Card>
    </Stack>
  )
}
