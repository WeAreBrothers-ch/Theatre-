import {local, MOIS, plusJours, versIso, dateLongue} from '../temps.ts'
import {
  GRIS,
  NOIR,
  ROUGE,
  VERT,
  STATUTS,
  capitales,
  dureeCourte,
  echapper,
  encreDe,
  libelleCourt,
  prixEnLigne,
  repsEntre,
  texteSur,
  typo,
  urlImage,
  urlSpectacle,
  type Contexte,
  type ReglagesCom,
  type RepCom,
  type SpectacleCom,
} from './commun.ts'

/*
 * La lettre d'information du TBB, prête à coller dans la messagerie ou l'outil d'envoi.
 *
 * Écrite pour les messageries, pas pour les navigateurs : des tableaux, des styles posés
 * sur chaque case, des couleurs écrites en toutes lettres, des capitales tapées dans le texte
 * (l'Outlook récent ignore text-transform) et une largeur fixe pour l'Outlook classique.
 * Les images viennent du CDN de Sanity, en JPEG (certaines messageries ignorent le WebP).
 */

export type OptionsLettre = {
  /** Premier jour, « AAAA-MM-JJ ». */
  debut: string
  /** Nombre de semaines couvertes. */
  semaines: number
  titre?: string
  intro?: string
  /** Le spectacle mis en avant en grand, en tête de lettre. */
  aLaUne?: string | null
  inclureComplets?: boolean
}

export type Entree = {spectacle: SpectacleCom; reps: RepCom[]}

const POLICE = 'Arial,Helvetica,sans-serif'
const POLICE_TITRE = "'Arial Black','Arial Bold',Arial,Helvetica,sans-serif"

/** La période couverte : [début inclus, fin exclue[, en instants ISO. */
export function periode(o: OptionsLettre): {debut: string; fin: string; dernierJour: string} {
  const dernierJour = plusJours(o.debut, o.semaines * 7 - 1)
  return {debut: versIso(o.debut, '00:00'), fin: versIso(plusJours(dernierJour, 1), '00:00'), dernierJour}
}

/** Les spectacles de la période, dans l'ordre de leur première date. */
export function entrees(spectacles: SpectacleCom[], o: OptionsLettre): Entree[] {
  const {debut, fin} = periode(o)
  return spectacles
    .map((spectacle) => ({spectacle, reps: repsEntre(spectacle, debut, fin).filter((r) => r.statut !== 'annule')}))
    .filter((e) => e.reps.length && (o.inclureComplets !== false || e.reps.some((r) => r.statut !== 'complet')))
    .sort((a, b) => a.reps[0].dateHeure.localeCompare(b.reps[0].dateHeure))
}

/** « Du lundi 19 octobre au dimanche 15 novembre 2026 » */
export function libellePeriode(o: OptionsLettre): string {
  const {dernierJour} = periode(o)
  const memeAnnee = o.debut.slice(0, 4) === dernierJour.slice(0, 4)
  return `Du ${dateLongue(o.debut, !memeAnnee)} au ${dateLongue(dernierJour, true)}`
}

/** L'objet du message : les premiers titres, pour donner envie d'ouvrir. */
export function objet(spectacles: SpectacleCom[], o: OptionsLettre): string {
  const liste = entrees(spectacles, o)
  const titres = liste.slice(0, 3).map((e) => e.spectacle.titre)
  const mois = MOIS[Number(o.debut.slice(5, 7)) - 1]
  const reste = liste.length > 3 ? '…' : ''
  return titres.length ? `Au TBB en ${mois} : ${titres.join(', ')}${reste}` : `La lettre du TBB, ${mois}`
}

/* ---------------------------------------------------------------------------
 * Morceaux de gabarit
 * ------------------------------------------------------------------------- */

const td = (style: string, contenu: string, attrs = '') => `<td ${attrs} style="${style}">${contenu}</td>`
const tableau = (contenu: string, style = '', attrs = '') =>
  `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" ${attrs} style="border-collapse:collapse;${style}">${contenu}</table>`

function bouton(texte: string, href: string, fond: string): string {
  const couleur = texteSur(fond)
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;"><tr>${td(
    `background:${fond};mso-padding-alt:10px 18px;`,
    `<a href="${echapper(href)}" style="display:inline-block;padding:10px 18px;font-family:${POLICE};font-size:14px;font-weight:bold;line-height:18px;color:${couleur};text-decoration:none;">${echapper(capitales(texte))}&nbsp;&rarr;</a>`,
  )}</tr></table>`
}

/** Une date en pastille : chaque pastille est son propre tableau, pour l'Outlook classique. */
function pastille(r: RepCom): string {
  const etat = STATUTS[r.statut ?? ''] ?? ''
  const complet = r.statut === 'complet'
  const fond = complet ? '#ffffff' : GRIS
  const couleur = complet ? ROUGE : NOIR
  const texte = `${capitales(libelleCourt(r))}${etat ? ` · ${capitales(etat)}` : ''}${r.mention ? ` · ${capitales(r.mention)}` : ''}`
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="left" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;"><tr>${td(
    'padding:0 6px 6px 0;',
    `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;"><tr>${td(
      `background:${fond};border:1px solid ${complet ? ROUGE : fond};padding:4px 8px;font-family:${POLICE};font-size:12px;line-height:16px;font-weight:bold;color:${couleur};white-space:nowrap;mso-line-height-rule:exactly;`,
      echapper(texte).replace(/ /g, '&nbsp;'),
    )}</tr></table>`,
  )}</tr></table>`
}

function libelleAction(reps: RepCom[]): {texte: string; actif: boolean} {
  if (reps.every((r) => r.statut === 'complet')) return {texte: 'Complet', actif: false}
  if (reps.every((r) => r.statut === 'complet' || r.statut === 'liste-attente')) return {texte: 'Liste d’attente', actif: true}
  return {texte: 'Réserver', actif: true}
}

function ligneInfos(s: SpectacleCom): string {
  return [s.precision || s.genreLibelle, s.lieu, s.age, dureeCourte(s.duree), prixEnLigne(s)].filter(Boolean).join(' · ')
}

function blocUne(ctx: Contexte, e: Entree): string {
  const s = e.spectacle
  const encre = encreDe(s)
  const image = urlImage(ctx, s.visuel, {largeur: 1200, hauteur: 750})
  const action = libelleAction(e.reps)
  const lien = urlSpectacle(ctx, s)
  return `<tr>${td(
    'padding:0 0 32px 0;',
    tableau(
      `${image ? `<tr>${td('padding:0;', `<a href="${echapper(lien)}"><img src="${image}" width="600" alt="${echapper(s.visuel?.alt || s.titre)}" style="display:block;width:100%;max-width:600px;height:auto;border:0;"></a>`)}</tr>` : ''}
      <tr>${td(
        `background:${encre};padding:20px 24px 24px 24px;`,
        `<p style="margin:0 0 6px 0;font-family:${POLICE};font-size:12px;line-height:16px;font-weight:bold;letter-spacing:1px;color:${texteSur(encre)};">${echapper(capitales('À la une'))}</p>
        <p style="margin:0;font-family:${POLICE_TITRE};font-size:30px;line-height:32px;font-weight:900;color:${texteSur(encre)};"><a href="${echapper(lien)}" style="color:${texteSur(encre)};text-decoration:none;">${echapper(capitales(s.titre))}</a></p>
        ${s.compagnie ? `<p style="margin:8px 0 0 0;font-family:${POLICE};font-size:15px;line-height:20px;color:${texteSur(encre)};">${echapper(typo(s.compagnie))}</p>` : ''}`,
      )}</tr>
      <tr>${td(
        'padding:18px 0 0 0;',
        `${s.accroche ? `<p style="margin:0 0 14px 0;font-family:Georgia,'Times New Roman',serif;font-size:18px;line-height:26px;color:${NOIR};">${echapper(typo(s.accroche))}</p>` : ''}
        <div>${e.reps.map(pastille).join('')}<div style="clear:both;font-size:0;line-height:0;">&nbsp;</div></div>
        <p style="margin:6px 0 14px 0;font-family:${POLICE};font-size:13px;line-height:18px;color:#555555;">${echapper(typo(ligneInfos(s)))}</p>
        ${action.actif ? bouton(action.texte, lien, encre) : `<p style="margin:0;font-family:${POLICE};font-size:14px;font-weight:bold;color:${ROUGE};">${echapper(capitales('Complet'))}</p>`}`,
      )}</tr>`,
    ),
  )}</tr>`
}

function ligneSpectacle(ctx: Contexte, e: Entree): string {
  const s = e.spectacle
  const encre = encreDe(s)
  const image = urlImage(ctx, s.visuel, {largeur: 280, hauteur: 400})
  const action = libelleAction(e.reps)
  const lien = urlSpectacle(ctx, s)
  const visuel = image
    ? `<a href="${echapper(lien)}"><img src="${image}" width="140" height="200" alt="${echapper(s.visuel?.alt || s.titre)}" style="display:block;width:140px;height:200px;border:0;border-top:6px solid ${encre};"></a>`
    : `<div style="width:140px;height:200px;background:${encre};"></div>`
  return `<tr>${td(
    `padding:0 0 22px 0;border-bottom:2px solid ${NOIR};`,
    tableau(
      `<tr>${td('width:140px;padding:22px 18px 0 0;vertical-align:top;', visuel, 'width="140" valign="top"')}${td(
        'padding:22px 0 0 0;vertical-align:top;',
        `<p style="margin:0 0 4px 0;font-family:${POLICE};font-size:11px;line-height:14px;font-weight:bold;letter-spacing:1px;color:${VERT};">${echapper(capitales(s.precision || s.genreLibelle || ''))}</p>
        <p style="margin:0;font-family:${POLICE_TITRE};font-size:21px;line-height:24px;font-weight:900;color:${NOIR};"><a href="${echapper(lien)}" style="color:${NOIR};text-decoration:none;">${echapper(capitales(s.titre))}</a></p>
        ${s.compagnie ? `<p style="margin:4px 0 0 0;font-family:${POLICE};font-size:13px;line-height:18px;color:#555555;">${echapper(typo(s.compagnie))}</p>` : ''}
        ${s.accroche ? `<p style="margin:10px 0 12px 0;font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:21px;color:${NOIR};">${echapper(typo(s.accroche))}</p>` : ''}
        <div>${e.reps.map(pastille).join('')}<div style="clear:both;font-size:0;line-height:0;">&nbsp;</div></div>
        <p style="margin:4px 0 12px 0;font-family:${POLICE};font-size:12px;line-height:17px;color:#555555;">${echapper(typo([s.lieu, s.age, dureeCourte(s.duree), prixEnLigne(s)].filter(Boolean).join(' · ')))}</p>
        ${action.actif ? bouton(action.texte, lien, encre) : `<p style="margin:0;font-family:${POLICE};font-size:13px;font-weight:bold;color:${ROUGE};">${echapper(capitales('Complet'))}</p>`}`,
        'valign="top"',
      )}</tr>`,
    ),
  )}</tr>`
}

function titreMois(cleMois: string): string {
  const [a, m] = cleMois.split('-').map(Number)
  return `<tr>${td(
    'padding:28px 0 0 0;',
    tableau(`<tr>${td(`background:${VERT};padding:8px 12px;font-family:${POLICE_TITRE};font-size:16px;line-height:20px;font-weight:900;letter-spacing:1px;color:#ffffff;`, echapper(capitales(`${MOIS[m - 1]} ${a}`)))}</tr>`),
  )}</tr>`
}

/** Le corps de la lettre (à coller) : un tableau de 600 px, styles en ligne. */
export function lettreHtml(ctx: Contexte, reglages: ReglagesCom, spectacles: SpectacleCom[], o: OptionsLettre): string {
  const liste = entrees(spectacles, o)
  const une = o.aLaUne ? liste.find((e) => e.spectacle._id === o.aLaUne) : undefined
  const reste = une ? liste.filter((e) => e !== une) : liste
  const site = ctx.site.replace(/\/$/, '')
  const nom = reglages.nom || 'Théâtre Benno Besson'

  let mois = ''
  const lignes: string[] = []
  for (const e of reste) {
    const cle = local(e.reps[0].dateHeure).date.slice(0, 7)
    if (cle !== mois) {
      lignes.push(titreMois(cle))
      mois = cle
    }
    lignes.push(ligneSpectacle(ctx, e))
  }

  const billetterie = [
    reglages.telBilletterie ? `<a href="tel:${echapper(reglages.telBilletterie.replace(/[^\d+]/g, '').replace(/^0/, '+41'))}" style="color:${NOIR};text-decoration:none;">${echapper(typo(reglages.telBilletterie))}</a>` : '',
    reglages.emailBilletterie ? `<a href="mailto:${echapper(reglages.emailBilletterie)}" style="color:${NOIR};text-decoration:underline;">${echapper(reglages.emailBilletterie)}</a>` : '',
  ].filter(Boolean)
  const horaires = (reglages.horaires ?? []).map((h) => `${h.jours} ${h.heures}`).join(', ')
  const reseaux = [
    reglages.instagram ? `<a href="${echapper(reglages.instagram)}" style="color:${NOIR};text-decoration:underline;">Instagram</a>` : '',
    reglages.facebook ? `<a href="${echapper(reglages.facebook)}" style="color:${NOIR};text-decoration:underline;">Facebook</a>` : '',
  ].filter(Boolean)

  const corps = `
<!--[if mso]><table role="presentation" width="600" align="center" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;width:100%;max-width:600px;margin:0 auto;background:#ffffff;">
  <tr>${td(
    `padding:24px 0 18px 0;border-bottom:6px solid ${VERT};`,
    tableau(
      `<tr>${td('width:56px;padding:0 14px 0 0;vertical-align:middle;', `<a href="${echapper(site)}"><img src="${echapper(site)}/logo-tbb.png" width="56" alt="${echapper(nom)}" style="display:block;width:56px;height:auto;border:0;"></a>`, 'width="56"')}${td(
        'vertical-align:middle;',
        `<p style="margin:0;font-family:${POLICE_TITRE};font-size:18px;line-height:22px;font-weight:900;color:${NOIR};">${echapper(capitales(nom))}</p>
        <p style="margin:2px 0 0 0;font-family:${POLICE};font-size:13px;line-height:18px;color:#555555;">${echapper(libellePeriode(o))}</p>`,
      )}</tr>`,
    ),
  )}</tr>
  ${
    o.titre || o.intro
      ? `<tr>${td(
          'padding:24px 0 28px 0;',
          `${o.titre ? `<p style="margin:0 0 10px 0;font-family:${POLICE_TITRE};font-size:26px;line-height:30px;font-weight:900;color:${NOIR};">${echapper(capitales(o.titre))}</p>` : ''}${
            o.intro
              ? o.intro
                  .split(/\n{2,}/)
                  .map((p) => `<p style="margin:0 0 12px 0;font-family:Georgia,'Times New Roman',serif;font-size:17px;line-height:25px;color:${NOIR};">${echapper(typo(p)).replace(/\n/g, '<br>')}</p>`)
                  .join('')
              : ''
          }`,
        )}</tr>`
      : '<tr><td style="padding:12px 0 0 0;font-size:0;line-height:0;">&nbsp;</td></tr>'
  }
  ${une ? blocUne(ctx, une) : ''}
  ${lignes.join('\n')}
  ${
    liste.length
      ? ''
      : `<tr>${td(`padding:24px 0;font-family:${POLICE};font-size:15px;color:${NOIR};`, 'Aucune représentation pendant cette période.')}</tr>`
  }
  <tr>${td('padding:28px 0 0 0;', bouton('Tout le programme', `${site}/programme`, NOIR))}</tr>
  <tr>${td(
    `padding:28px 0 28px 0;font-family:${POLICE};font-size:13px;line-height:20px;color:${NOIR};`,
    `<p style="margin:0 0 6px 0;font-weight:bold;">${echapper(capitales('Billetterie'))}</p>
    <p style="margin:0;">${billetterie.join(' · ')}${horaires ? `<br>${echapper(typo(horaires))}${reglages.noteHoraires ? ` ${echapper(typo(reglages.noteHoraires))}` : ''}` : ''}</p>
    <p style="margin:12px 0 0 0;">${echapper(nom)}, ${echapper([reglages.rue, reglages.localite].filter(Boolean).join(', '))}${reseaux.length ? `<br>${reseaux.join(' · ')}` : ''}</p>`,
  )}</tr>
</table>
<!--[if mso]></td></tr></table><![endif]-->`
  return corps.trim()
}

/** La lettre dans une page complète (aperçu, fichier à télécharger, code pour l'outil d'envoi). */
export function pageLettre(corps: string, titre: string): string {
  return `<!doctype html>
<html lang="fr-CH">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<title>${echapper(titre)}</title>
<style>body{margin:0;padding:0;background:#ffffff;} img{-ms-interpolation-mode:bicubic;} a{color:${NOIR};}</style>
</head>
<body style="margin:0;padding:0 16px;background:#ffffff;">
${corps}
</body>
</html>`
}

/** Version texte (messageries qui refusent le HTML, et deuxième format du presse-papiers). */
export function lettreTexte(ctx: Contexte, reglages: ReglagesCom, spectacles: SpectacleCom[], o: OptionsLettre): string {
  const liste = entrees(spectacles, o)
  const lignes = [capitales(reglages.nom || 'Théâtre Benno Besson'), libellePeriode(o), '']
  if (o.titre) lignes.push(capitales(o.titre), '')
  if (o.intro) lignes.push(o.intro, '')
  for (const e of liste) {
    const s = e.spectacle
    lignes.push(capitales(s.titre))
    if (s.compagnie) lignes.push(s.compagnie)
    lignes.push(e.reps.map((r) => libelleCourt(r) + (r.statut && STATUTS[r.statut] ? ` (${STATUTS[r.statut]})` : '')).join(', '))
    if (s.accroche) lignes.push(s.accroche)
    lignes.push(urlSpectacle(ctx, s), '')
  }
  lignes.push(`Billetterie : ${[reglages.telBilletterie, reglages.emailBilletterie].filter(Boolean).join(' · ')}`)
  return lignes.join('\n')
}
