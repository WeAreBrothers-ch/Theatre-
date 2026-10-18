/*
 * Texte riche Wix (HTML) → paragraphes structurés, puis → Portable Text.
 *
 * Un paragraphe = {style, vide, spans: [{texte, gras, italique, lien}]}.
 * Les <br> deviennent des retours à la ligne dans le texte des spans.
 */

const ENTITES = {nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', apos: '’', rsquo: '’', lsquo: '‘', ldquo: '“', rdquo: '”', laquo: '«', raquo: '»', hellip: '…', ndash: '–', mdash: '—', eacute: 'é', egrave: 'è', agrave: 'à', ccedil: 'ç', ocirc: 'ô', ecirc: 'ê', icirc: 'î', ucirc: 'û', acirc: 'â', oelig: 'œ', euro: '€', shy: ''}

export function decoder(texte) {
  return texte
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (m, nom) => ENTITES[nom.toLowerCase()] ?? m)
}

/** Espaces normalisés : insécables et doubles espaces ramenés à une espace simple. */
export function espaces(texte) {
  return texte
    .normalize('NFC')
    .replace(/[   \t]/g, ' ')
    .replace(/[​‎‏﻿]/g, '')
    .replace(/ *\n */g, '\n')
    .replace(/ {2,}/g, ' ')
}

const BLOCS = /<(p|h[1-6]|li|blockquote)\b[^>]*>([\s\S]*?)<\/\1>/gi

/** HTML Wix → liste de paragraphes. */
export function paragraphes(html) {
  if (!html || typeof html !== 'string') return []
  const sortie = []
  let trouve = false
  for (const m of html.matchAll(BLOCS)) {
    trouve = true
    const balise = m[1].toLowerCase()
    // Un <li> contient souvent un <p> : on prend le contenu tel quel.
    const style = balise === 'li' ? 'li' : /^h[1-6]$/.test(balise) ? 'h3' : balise === 'blockquote' ? 'blockquote' : 'normal'
    sortie.push(paragraphe(m[2].replace(/<\/?p\b[^>]*>/gi, ''), style))
  }
  if (!trouve) sortie.push(paragraphe(html, 'normal'))
  // Les <li> imbriqués produisent aussi le <p> intérieur : on retire le doublon.
  return sortie.filter((p, i) => !(p.style === 'normal' && i > 0 && sortie[i - 1].style === 'li' && texteDe(sortie[i - 1]) === texteDe(p)))
}

function paragraphe(html, style) {
  const spans = []
  let gras = 0
  let italique = 0
  const liens = []
  const re = /<(\/?)([a-z0-9]+)\b([^>]*)>|([^<]+)/gi
  for (const m of html.matchAll(re)) {
    if (m[4] !== undefined) {
      const texte = decoder(m[4]).replace(/\n/g, ' ')
      if (texte) spans.push({texte, gras: gras > 0, italique: italique > 0, lien: liens.at(-1) ?? null})
      continue
    }
    const ferme = m[1] === '/'
    const nom = m[2].toLowerCase()
    if (nom === 'br') spans.push({texte: '\n', gras: gras > 0, italique: italique > 0, lien: liens.at(-1) ?? null})
    else if (nom === 'strong' || nom === 'b') gras += ferme ? -1 : 1
    else if (nom === 'em' || nom === 'i') italique += ferme ? -1 : 1
    else if (nom === 'a') {
      if (ferme) liens.pop()
      else liens.push(decoder(m[3].match(/href="([^"]*)"/i)?.[1] ?? '') || null)
    } else if (nom === 'span' && !ferme && /font-weight:\s*(bold|[6-9]00)/i.test(m[3])) {
      // Rare : gras posé par un style. Ignoré à la fermeture (approximation suffisante).
    }
  }
  const fusion = []
  for (const s of spans) {
    const precedent = fusion.at(-1)
    if (precedent && precedent.gras === s.gras && precedent.italique === s.italique && precedent.lien === s.lien) precedent.texte += s.texte
    else fusion.push({...s})
  }
  for (const s of fusion) s.texte = espaces(s.texte)
  const p = {style, spans: fusion.filter((s) => s.texte !== '')}
  p.vide = texteDe(p).trim() === ''
  return p
}

export const texteDe = (p) => espaces(p.spans.map((s) => s.texte).join('')).trim()

/** Le texte brut d'un HTML, paragraphes séparés par une ligne vide. */
export function texteBrut(html) {
  return paragraphes(html)
    .filter((p) => !p.vide)
    .map(texteDe)
    .join('\n\n')
}

/** Paragraphe → morceaux de lignes (séparées par <br>), chacun avec ses spans. */
export function lignes(p) {
  const sortie = [[]]
  for (const s of p.spans) {
    const morceaux = s.texte.split('\n')
    morceaux.forEach((m, i) => {
      if (i > 0) sortie.push([])
      if (m) sortie.at(-1).push({...s, texte: m})
    })
  }
  return sortie.filter((l) => l.some((s) => s.texte.trim()))
}

/**
 * Paragraphes → blocs Portable Text. `cle(i, j)` fabrique des clés stables.
 * Les liens deviennent des annotations « link » ; gras et italique des décorateurs.
 */
export function versPortableText(paras, cle) {
  const blocs = []
  paras.forEach((p, i) => {
    if (p.vide) return
    const markDefs = []
    const cles = new Map()
    const children = []
    p.spans.forEach((s, j) => {
      let texte = s.texte
      if (j === 0) texte = texte.replace(/^[\s\n]+/, '')
      if (j === p.spans.length - 1) texte = texte.replace(/[\s\n]+$/, '')
      if (!texte) return
      const marks = []
      if (s.gras && p.style !== 'h3') marks.push('strong')
      if (s.italique) marks.push('em')
      if (s.lien && /^(https?:|mailto:|tel:|\/)/.test(s.lien)) {
        if (!cles.has(s.lien)) {
          const k = cle(i, 'l', cles.size)
          cles.set(s.lien, k)
          markDefs.push({_type: 'link', _key: k, href: s.lien})
        }
        marks.push(cles.get(s.lien))
      }
      children.push({_type: 'span', _key: cle(i, 's', j), text: texte, marks})
    })
    if (!children.length) return
    const bloc = {_type: 'block', _key: cle(i, 'b'), style: p.style === 'li' ? 'normal' : p.style, markDefs, children}
    if (p.style === 'li') Object.assign(bloc, {listItem: 'bullet', level: 1})
    blocs.push(bloc)
  })
  return blocs
}
