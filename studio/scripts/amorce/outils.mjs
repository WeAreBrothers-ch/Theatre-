/*
 * Outils communs du générateur d'amorce : clés stables, références, textes,
 * dates de Zurich, et les deux versions de chaque document (import / jeu local).
 */
import {createHash} from 'node:crypto'
import {readFileSync} from 'node:fs'
import {join} from 'node:path'
import {versPortableText} from '../reprise/html.mjs'

export const cle = (...parties) => createHash('sha1').update(parties.join('|')).digest('hex').slice(0, 12)
export const ref = (id) => ({_type: 'reference', _ref: id})
export const avecCles = (liste, prefixe) => liste.map((x, i) => ({_key: cle(prefixe, i, JSON.stringify(x).slice(0, 80)), ...x}))

/** Paragraphes (chaînes) → blocs Portable Text. Un paragraphe « ## Titre » devient un intertitre. */
export const blocs = (paragraphes, prefixe) =>
  paragraphes.map((texte, i) => {
    const intertitre = texte.startsWith('## ')
    return {
      _type: 'block',
      _key: cle(prefixe, 'b', i),
      style: intertitre ? 'h3' : 'normal',
      markDefs: [],
      children: [{_type: 'span', _key: cle(prefixe, 's', i), text: intertitre ? texte.slice(3) : texte, marks: []}],
    }
  })

/** Paragraphes de la reprise Wix ({style, spans: [{t, g, i, l}]}) → Portable Text. */
export function blocsReprise(paras, prefixe) {
  const developpes = paras.map((p) => ({style: p.style, vide: p.vide, spans: p.spans.map((s) => ({texte: s.t, gras: !!s.g, italique: !!s.i, lien: s.l ?? null}))}))
  return versPortableText(developpes, (...x) => cle(prefixe, ...x))
}

/** Un texte court tiré d'un texte plus long : les premières phrases, 200 caractères au plus. */
export function accrocheDe(texte, max = 200) {
  const t = String(texte ?? '').replace(/\s+/g, ' ').trim()
  if (t.length <= max) return t
  const phrases = t.match(/[^.!?…]+[.!?…]+(\s|$)/g) ?? [t]
  let sortie = ''
  for (const p of phrases) {
    if ((sortie + p).trim().length > max) break
    sortie += p
  }
  sortie = sortie.trim()
  if (sortie) return sortie
  return t.slice(0, max - 1).replace(/\s+\S*$/, '') + '…'
}

/** Décalage horaire de Zurich (minutes) à un instant donné. */
function decalageZurich(ts) {
  const p = new Intl.DateTimeFormat('en-US', {timeZone: 'Europe/Zurich', hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'})
    .formatToParts(new Date(ts))
    .reduce((o, x) => ((o[x.type] = x.value), o), {})
  return (Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute) - ts) / 60000
}
/** « 2026-10-29 » + « 20:00 » heure de Zurich → ISO UTC. */
export function zurichVersIso(date, heure) {
  const [a, m, j] = date.split('-').map(Number)
  const [h, mi] = heure.split(':').map(Number)
  const local = Date.UTC(a, m - 1, j, h, mi)
  let ts = local - 60 * 60000
  for (let i = 0; i < 3; i++) ts = local - decalageZurich(ts) * 60000
  return new Date(ts).toISOString()
}

/** Dimensions d'un JPEG ou d'un PNG, sans dépendance. */
export function dimensions(fichier) {
  const b = readFileSync(fichier)
  if (b[0] === 0x89 && b[1] === 0x50) return {width: b.readUInt32BE(16), height: b.readUInt32BE(20)}
  let i = 2
  while (i < b.length) {
    if (b[i] !== 0xff) {
      i++
      continue
    }
    const marqueur = b[i + 1]
    const taille = b.readUInt16BE(i + 2)
    if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marqueur)) {
      return {height: b.readUInt16BE(i + 5), width: b.readUInt16BE(i + 7)}
    }
    i += 2 + taille
  }
  throw new Error('Dimensions introuvables : ' + fichier)
}

/*
 * Chaque document existe en deux versions :
 * - pour l'import dans Sanity, les images et fichiers sont des `_sanityAsset` (fichier local ou adresse) ;
 * - pour le jeu local du site, ils pointent vers un document d'asset fictif.
 */
export function creerRecueil(IMG) {
  const docsImport = []
  const docsLocaux = []
  const assetsLocaux = new Map()

  /** Image de la maquette (maquette/assets/img/…). */
  function image(chemin, {gris, palette, type = 'image', extra = {}} = {}) {
    const fichier = join(IMG, chemin)
    const {width, height} = dimensions(fichier)
    const id = `image-${createHash('sha1').update(chemin).digest('hex')}-${width}x${height}-jpg`
    if (!assetsLocaux.has(id)) {
      assetsLocaux.set(id, {
        _id: id,
        _type: 'sanity.imageAsset',
        url: `/amorce/${chemin}`,
        urlGris: gris ? `/amorce/${gris}` : null,
        metadata: {dimensions: {width, height, aspectRatio: width / height}, palette: palette ? {dominant: {background: palette}, vibrant: {background: palette}} : null, lqip: null},
      })
    }
    return {pourImport: {_type: type, _sanityAsset: `image@file://${fichier}`, ...extra}, pourLocal: {_type: type, asset: ref(id), ...extra}}
  }

  /** Image du site Wix ({id, l, h}), téléversée depuis static.wixstatic.com. */
  function imageWix(wix, {type = 'image', extra = {}} = {}) {
    const url = `https://static.wixstatic.com/media/${wix.id}`
    const ext = /\.png$/i.test(wix.id) ? 'png' : 'jpg'
    const id = `image-wix${createHash('sha1').update(wix.id).digest('hex')}-${wix.l}x${wix.h}-${ext}`
    if (!assetsLocaux.has(id)) {
      assetsLocaux.set(id, {_id: id, _type: 'sanity.imageAsset', url, metadata: {dimensions: {width: wix.l, height: wix.h, aspectRatio: wix.l / wix.h}, palette: null, lqip: null}})
    }
    return {pourImport: {_type: type, _sanityAsset: `image@${url}`, ...extra}, pourLocal: {_type: type, asset: ref(id), ...extra}}
  }

  /** Fichier (PDF…) à téléverser depuis une adresse. */
  function fichier(url, {type = 'file', extra = {}} = {}) {
    const extension = url.match(/\.([a-z0-9]{2,4})(?:\?|$)/i)?.[1]?.toLowerCase() ?? 'pdf'
    const id = `file-${createHash('sha1').update(url).digest('hex')}-${extension}`
    if (!assetsLocaux.has(id)) assetsLocaux.set(id, {_id: id, _type: 'sanity.fileAsset', url, extension, size: null})
    return {pourImport: {_type: type, _sanityAsset: `file@${url}`, ...extra}, pourLocal: {_type: type, asset: ref(id), ...extra}}
  }

  /** Ajoute un document ; `fabrique(img)` reçoit la fonction qui choisit la bonne variante d'image. */
  function ajouter(fabrique) {
    docsImport.push(fabrique((x) => x.pourImport))
    docsLocaux.push(fabrique((x) => x.pourLocal))
  }

  return {docsImport, docsLocaux, assetsLocaux, image, imageWix, fichier, ajouter}
}
