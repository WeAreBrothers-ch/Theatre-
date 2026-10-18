import {local, heureLisible, JOURS_COURTS, MOIS, MOIS_COURTS, nomMois, versIso, plusMois} from '../temps.ts'
import {
  NOIR,
  ROUGE,
  VERT,
  GRIS,
  STATUTS,
  echapper,
  encreDe,
  libelleRep,
  paragraphes,
  repsPubliques,
  texteSur,
  typo,
  urlImage,
  type Contexte,
  type ReglagesCom,
  type SpectacleCom,
} from './commun.ts'

/*
 * Les feuilles à imprimer, chacune une page HTML autonome affichée en aperçu dans le
 * Studio puis imprimée par le navigateur (« Enregistrer en PDF » pour un fichier).
 *
 * - La feuille de salle : distribuée le soir du spectacle, tirée de la fiche.
 * - L'agenda du mois : pour la vitrine, le guichet ou l'affichage en ville.
 */

export type Format = 'A4' | 'A5' | 'A3'

const POLICES =
  "@import url('https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..100,400..800&family=Newsreader:ital,opsz@0,6..72;1,6..72&display=swap');"

function styles(format: Format, orientation: 'portrait' | 'landscape' = 'portrait'): string {
  return `${POLICES}
  @page { size: ${format} ${orientation}; margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body { background: #8a8d89; font-family: Archivo, 'Arial Narrow', Arial, sans-serif; color: ${NOIR}; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .feuille { background: #fff; margin: 12mm auto; overflow: hidden; position: relative; box-shadow: 0 2px 12px rgba(0,0,0,.25); }
  .A4.portrait { width: 210mm; min-height: 297mm; }
  .A5.portrait { width: 148mm; min-height: 210mm; }
  .A3.portrait { width: 297mm; min-height: 420mm; }
  .feuille { display: flex; flex-direction: column; }
  @media print {
    body { background: #fff; }
    .feuille { margin: 0; box-shadow: none; }
  }
  .affiche { font-weight: 800; font-stretch: 62%; text-transform: uppercase; line-height: .88; letter-spacing: -.01em; }
  .voix { font-family: Newsreader, Georgia, serif; }
  .chiffres { font-variant-numeric: tabular-nums; }
  `
}

function page(titre: string, css: string, corps: string): string {
  return `<!doctype html><html lang="fr-CH"><head><meta charset="utf-8"><title>${echapper(titre)}</title><style>${css}</style></head><body>${corps}</body></html>`
}

const arches = (couleur: string) =>
  `<svg viewBox="0 0 1300 1122" width="100%" height="100%" aria-hidden="true"><path d="M0 1122V276A215 215 0 0 1 410.01 185.47A248 248 0 0 1 889.99 185.47A215 215 0 0 1 1300 276V1122Z" fill="${couleur}"/></svg>`

/* ---------------------------------------------------------------------------
 * Feuille de salle
 * ------------------------------------------------------------------------- */

export type OptionsFeuille = {
  format: Format
  /** Les spectacles suivants à annoncer en pied de feuille. */
  prochains: SpectacleCom[]
  saison?: string | null
  /** Montrer le visuel du spectacle en tête. */
  avecVisuel?: boolean
}

export function feuilleDeSalle(ctx: Contexte, reglages: ReglagesCom, s: SpectacleCom, o: OptionsFeuille): string {
  const encre = encreDe(s)
  const surEncre = texteSur(encre)
  const petit = o.format === 'A5'
  const echelle = o.format === 'A3' ? 1.41 : petit ? 0.72 : 1
  const mm = (n: number) => `${(n * echelle).toFixed(2)}mm`
  const pt = (n: number) => `${(n * echelle).toFixed(2)}pt`
  const reps = repsPubliques(s).filter((r) => r.statut !== 'annule')
  const texte = paragraphes(s.texte)
  const visuel = o.avecVisuel !== false ? urlImage(ctx, s.visuel, {largeur: 1400, hauteur: 700}) : null
  const site = ctx.site.replace(/^https?:\/\//, '').replace(/\/$/, '')

  const css = `${styles(o.format)}
  .tete { background: ${encre}; color: ${surEncre}; padding: ${mm(12)} ${mm(14)} ${mm(10)}; }
  .tete .theatre { font-size: ${pt(9)}; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; display: flex; justify-content: space-between; gap: 4mm; }
  .tete h1 { font-size: ${pt(s.titre.length > 28 ? 38 : s.titre.length > 14 ? 52 : 68)}; margin: ${mm(6)} 0 ${mm(3)}; }
  .tete .par { font-size: ${pt(13)}; font-weight: 600; margin: 0; }
  .tete .sous { font-size: ${pt(11)}; margin: ${mm(1.5)} 0 0; }
  .visuel { display: block; width: 100%; height: ${mm(56)}; object-fit: cover; filter: grayscale(1) contrast(1.1); mix-blend-mode: multiply; }
  .visuel-fond { background: ${encre}; line-height: 0; }
  .infos { display: flex; flex-wrap: wrap; gap: ${mm(2)} ${mm(8)}; padding: ${mm(5)} ${mm(14)}; border-bottom: 0.6mm solid ${NOIR}; font-size: ${pt(10)}; }
  .infos b { display: block; font-size: ${pt(7.5)}; letter-spacing: .1em; text-transform: uppercase; color: #555; }
  .corps { display: grid; grid-template-columns: ${petit ? '1fr' : '1.35fr 1fr'}; gap: ${mm(9)}; padding: ${mm(7)} ${mm(14)}; }
  .texte p { font-family: Newsreader, Georgia, serif; font-size: ${pt(10.5)}; line-height: 1.42; margin: 0 0 ${mm(2.6)}; }
  .texte p.h3 { font-family: Archivo, Arial, sans-serif; font-weight: 700; font-size: ${pt(10)}; text-transform: uppercase; letter-spacing: .04em; }
  .texte p.blockquote { font-style: italic; padding-left: ${mm(3)}; border-left: 0.8mm solid ${encre}; }
  .texte .accroche { font-size: ${pt(13)}; line-height: 1.3; }
  h2 { font-size: ${pt(8)}; letter-spacing: .12em; text-transform: uppercase; margin: 0 0 ${mm(2.5)}; padding-bottom: ${mm(1.2)}; border-bottom: 0.4mm solid ${NOIR}; }
  .distribution { margin-bottom: ${mm(5)}; }
  .distribution h3 { font-size: ${pt(10)}; margin: ${mm(3)} 0 ${mm(1.5)}; text-transform: uppercase; }
  .distribution p { margin: 0 0 ${mm(1)}; font-size: ${pt(8.6)}; line-height: 1.3; font-weight: 600; }
  .distribution p span { font-weight: 400; color: #555; }
  .production { font-size: ${pt(8)}; line-height: 1.4; color: #333; white-space: pre-line; }
  .encart { background: ${GRIS}; padding: ${mm(3.5)} ${mm(4)}; font-size: ${pt(9)}; line-height: 1.4; margin-bottom: ${mm(4)}; }
  .encart ul { margin: 0; padding-left: ${mm(4)}; }
  .pied { margin-top: auto; padding: ${mm(6)} ${mm(14)} ${mm(8)}; border-top: 0.6mm solid ${NOIR}; display: grid; grid-template-columns: ${mm(18)} 1fr; gap: ${mm(6)}; align-items: end; background: #fff; break-inside: avoid; }
  .pied .logo { width: ${mm(18)}; height: ${mm(16)}; }
  .prochains { display: grid; grid-template-columns: repeat(${petit ? 2 : 4}, 1fr); gap: ${mm(4)}; }
  .prochain { border-top: 1.4mm solid var(--e); padding-top: ${mm(1.5)}; font-size: ${pt(8)}; line-height: 1.25; }
  .prochain strong { display: block; font-size: ${pt(10.5)}; font-weight: 800; font-stretch: 62%; text-transform: uppercase; line-height: .95; margin: ${mm(0.6)} 0; }
  .contact { font-size: ${pt(8)}; margin-top: ${mm(3)}; color: #333; }
  `

  const dates = reps.map((r) => libelleRep(r) + (r.mention ? ` · ${r.mention}` : '')).join(' — ')
  const infos: [string, string | null | undefined][] = [
    ['Dates', dates],
    ['Lieu', s.lieuComplet || s.lieu],
    ['Durée', s.duree],
    ['Public', s.age],
  ]

  const prochains = o.prochains.slice(0, petit ? 2 : 4)
  const corps = `<div class="feuille ${o.format} portrait">
    <header class="tete">
      <div class="theatre"><span>${echapper(reglages.nom || 'Théâtre Benno Besson')}</span><span>${echapper(o.saison || '')}</span></div>
      <h1 class="affiche">${echapper(typo(s.titre))}</h1>
      ${s.compagnie ? `<p class="par">${echapper(typo(s.compagnie))}</p>` : ''}
      ${s.sousTitre ? `<p class="sous">${echapper(typo(s.sousTitre))}</p>` : ''}
    </header>
    ${visuel ? `<div class="visuel-fond"><img class="visuel" src="${visuel}" alt=""></div>` : ''}
    <div class="infos">${infos
      .filter(([, v]) => v)
      .map(([k, v]) => `<div><b>${echapper(k)}</b>${echapper(typo(v))}</div>`)
      .join('')}</div>
    <div class="corps">
      <div class="texte">
        ${s.accroche ? `<p class="accroche">${echapper(typo(s.accroche))}</p>` : ''}
        ${texte.map((p) => `<p class="${p.style}">${echapper(typo(p.texte))}</p>`).join('')}
        ${s.avertissement ? `<div class="encart"><strong>À savoir.</strong> ${echapper(typo(s.avertissement))}</div>` : ''}
        ${s.deroule?.length ? `<div class="encart"><strong>Déroulé</strong><ul>${s.deroule.map((d) => `<li>${echapper(typo(d.titre))}${d.duree ? ` : ${echapper(d.duree)}` : ''}</li>`).join('')}</ul></div>` : ''}
        ${s.autour?.length ? `<div class="encart"><strong>Autour du spectacle</strong><ul>${s.autour.map((x) => `<li>${echapper(typo(x))}</li>`).join('')}</ul></div>` : ''}
      </div>
      <div>
        ${
          s.distribution?.length
            ? `<section class="distribution"><h2>Distribution</h2>${s.distribution
                .map(
                  (b) =>
                    `${b.titre ? `<h3>${echapper(typo(b.titre))}</h3>` : ''}${(b.lignes ?? []).map((l) => `<p>${l.role ? `<span>${echapper(typo(l.role))}</span> ` : ''}${echapper(typo(l.noms))}</p>`).join('')}`,
                )
                .join('')}</section>`
            : ''
        }
        ${s.production ? `<section><h2>Production</h2><p class="production">${echapper(typo(s.production))}</p></section>` : ''}
      </div>
    </div>
    <footer class="pied">
      <div class="logo">${arches(VERT)}</div>
      <div>
        ${
          prochains.length
            ? `<h2>Prochainement au TBB</h2><div class="prochains">${prochains
                .map((p) => {
                  const r = repsPubliques(p).find((x) => x.statut !== 'annule')
                  return `<div class="prochain" style="--e:${encreDe(p)}"><span class="chiffres">${r ? echapper(libelleRep(r)) : ''}</span><strong>${echapper(typo(p.titre))}</strong>${echapper(typo(p.compagnie?.split(' / ')[0] ?? ''))}</div>`
                })
                .join('')}</div>`
            : ''
        }
        <p class="contact">Billetterie ${echapper(typo(reglages.telBilletterie || ''))}${reglages.emailBilletterie ? ` · ${echapper(reglages.emailBilletterie)}` : ''} · ${echapper(site)}</p>
      </div>
    </footer>
  </div>`
  return page(`Feuille de salle · ${s.titre}`, css, corps)
}

/* ---------------------------------------------------------------------------
 * Agenda du mois
 * ------------------------------------------------------------------------- */

export type OptionsAgenda = {
  format: Format
  /** « 2026-11 » */
  mois: string
  /** Nombre de mois (1 à 3). */
  nombreMois?: number
  titre?: string
  avecComplets?: boolean
}

type Ligne = {iso: string; s: SpectacleCom; statut?: string; mention?: string; lieu?: string | null; heureAConfirmer?: boolean}

export function lignesAgenda(spectacles: SpectacleCom[], o: OptionsAgenda): Ligne[] {
  const debut = versIso(`${o.mois}-01`, '00:00')
  const fin = versIso(`${plusMois(o.mois, o.nombreMois ?? 1)}-01`, '00:00')
  const lignes: Ligne[] = []
  for (const s of spectacles) {
    for (const r of repsPubliques(s)) {
      if (r.dateHeure < debut || r.dateHeure >= fin || r.statut === 'annule') continue
      if (o.avecComplets === false && r.statut === 'complet') continue
      lignes.push({iso: r.dateHeure, s, statut: r.statut, mention: r.mention, lieu: r.lieu, heureAConfirmer: r.heureAConfirmer})
    }
  }
  return lignes.sort((a, b) => a.iso.localeCompare(b.iso))
}

export function agendaImprime(ctx: Contexte, reglages: ReglagesCom, spectacles: SpectacleCom[], o: OptionsAgenda): string {
  const lignes = lignesAgenda(spectacles, o)
  const n = Math.max(lignes.length, 1)
  const echelle = o.format === 'A3' ? 1.41 : o.format === 'A5' ? 0.72 : 1
  // La liste remplit la page : plus il y a de dates, plus les lignes sont serrées.
  const hauteurDispo = 297 * echelle - 120 * echelle
  const ligne = Math.max(7 * echelle, Math.min(17 * echelle, hauteurDispo / n))
  const corpsTexte = Math.min(ligne * 0.42, 5.2 * echelle)
  // Assez de hauteur : la compagnie passe sous le titre au lieu d'être coupée.
  const deuxLignes = ligne >= 13 * echelle
  const mm = (x: number) => `${(x * echelle).toFixed(2)}mm`
  const site = ctx.site.replace(/^https?:\/\//, '').replace(/\/$/, '')
  const nombre = o.nombreMois ?? 1
  const titre = o.titre || (nombre > 1 ? `${MOIS[Number(o.mois.slice(5)) - 1]} – ${nomMois(plusMois(o.mois, nombre - 1))}` : nomMois(o.mois))

  const css = `${styles(o.format)}
  .feuille { padding: ${mm(14)} ${mm(14)} ${mm(12)}; display: flex; flex-direction: column; }
  .tete { display: flex; align-items: flex-end; justify-content: space-between; gap: ${mm(6)}; border-bottom: ${mm(2.2)} solid ${NOIR}; padding-bottom: ${mm(4)}; }
  .tete h1 { font-size: ${mm(24)}; margin: 0; color: ${VERT}; }
  .tete p { margin: 0 0 ${mm(1)}; font-size: ${mm(4.2)}; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; }
  .logo { width: ${mm(26)}; height: ${mm(22)}; flex: none; }
  table { width: 100%; border-collapse: collapse; table-layout: fixed; margin-top: ${mm(2)}; }
  td { border-bottom: 0.3mm solid ${NOIR}; height: ${ligne.toFixed(2)}mm; vertical-align: middle; font-size: ${corpsTexte.toFixed(2)}mm; padding: 0 ${mm(1.5)}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  td.jour { width: ${mm(31)}; font-weight: 800; font-stretch: 62%; text-transform: uppercase; font-size: ${(corpsTexte * 1.25).toFixed(2)}mm; }
  td.heure { width: ${mm(19)}; font-variant-numeric: tabular-nums; font-weight: 700; }
  td.titre { font-weight: 800; font-stretch: 62%; text-transform: uppercase; font-size: ${(corpsTexte * 1.3).toFixed(2)}mm; line-height: 1.05; }
  td.titre span { display: inline-block; width: ${mm(3)}; height: ${mm(3)}; margin-right: ${mm(2)}; background: var(--e); vertical-align: middle; }
  td.titre small { font-weight: 500; font-stretch: 100%; text-transform: none; font-size: ${(corpsTexte * 0.78).toFixed(2)}mm; color: #444; ${deuxLignes ? `display: block; margin: ${mm(1)} 0 0 ${mm(5)}; overflow: hidden; text-overflow: ellipsis;` : `margin-left: ${mm(2)};`} }
  td.lieu { width: ${mm(34)}; font-size: ${(corpsTexte * 0.85).toFixed(2)}mm; color: #333; }
  td.etat { width: ${mm(27)}; text-align: right; font-weight: 800; color: ${ROUGE}; text-transform: uppercase; font-size: ${(corpsTexte * 0.75).toFixed(2)}mm; }
  tr.nouveau-jour td { border-top: 0.6mm solid ${NOIR}; }
  .vide { margin-top: ${mm(20)}; font-size: ${mm(6)}; }
  .pied { margin-top: auto; padding-top: ${mm(5)}; display: flex; justify-content: space-between; gap: ${mm(6)}; font-size: ${mm(3.4)}; font-weight: 600; white-space: nowrap; }
  .pied strong { color: ${VERT}; }
  `
  let jour = ''
  const rangées = lignes
    .map((l) => {
      const loc = local(l.iso)
      const nouveau = loc.date !== jour
      jour = loc.date
      const etat = STATUTS[l.statut ?? ''] || ''
      return `<tr class="${nouveau ? 'nouveau-jour' : ''}">
        <td class="jour">${nouveau ? `${JOURS_COURTS[loc.semaine]} ${loc.jour === 1 ? '1er' : loc.jour} ${MOIS_COURTS[loc.mois - 1]}` : ''}</td>
        <td class="heure">${l.heureAConfirmer ? '—' : heureLisible(loc.heure)}</td>
        <td class="titre" style="--e:${encreDe(l.s)}"><span></span>${echapper(typo(l.s.titre))}<small>${echapper(typo([l.s.compagnie?.split(' / ')[0], l.mention].filter(Boolean).join(' · ')))}</small></td>
        <td class="lieu">${echapper(l.lieu || l.s.lieu || '')}</td>
        <td class="etat">${echapper(etat)}</td>
      </tr>`
    })
    .join('')

  const corps = `<div class="feuille ${o.format} portrait">
    <header class="tete">
      <div><p>${echapper(reglages.nom || 'Théâtre Benno Besson')}</p><h1 class="affiche">${echapper(titre)}</h1></div>
      <div class="logo">${arches(VERT)}</div>
    </header>
    ${lignes.length ? `<table>${rangées}</table>` : `<p class="vide">Aucune représentation ce mois-ci.</p>`}
    <footer class="pied">
      <span>Billetterie <strong>${echapper(typo(reglages.telBilletterie || ''))}</strong></span>
      <span>${echapper([reglages.rue, reglages.localite].filter(Boolean).join(', '))}</span>
      <span><strong>${echapper(site)}</strong></span>
    </footer>
  </div>`
  return page(`Agenda · ${titre}`, css, corps)
}

/** Tient sur une page ? (au-delà, les lignes deviendraient illisibles). */
export function agendaTientSurUnePage(spectacles: SpectacleCom[], o: OptionsAgenda): boolean {
  const echelle = o.format === 'A3' ? 1.41 : o.format === 'A5' ? 0.72 : 1
  return lignesAgenda(spectacles, o).length * 7 * echelle <= 297 * echelle - 120 * echelle
}

