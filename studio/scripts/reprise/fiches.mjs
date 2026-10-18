/*
 * Une fiche du CMS Wix → une fiche propre, prête pour le générateur d'amorce.
 * Toute la connaissance des conventions Wix du TBB est ici (voir l'inventaire du site).
 */
import {espaces, lignes, paragraphes, texteBrut, texteDe} from './html.mjs'
import {dateZurich, heures, lireDates} from './dates.mjs'

// ---------------------------------------------------------------------------
// Petits outils
// ---------------------------------------------------------------------------
export function sansAccents(texte) {
  return texte.normalize('NFD').replace(/[̀-ͯ]/g, '')
}

export function adresse(texte, max = 60) {
  let s = sansAccents(String(texte).toLowerCase())
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .replace(/&/g, ' et ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  if (s.length > max) s = s.slice(0, max).replace(/-[^-]*$/, '')
  return s
}

const nettoyer = (t) => espaces(String(t ?? '')).trim()

/** « wix:image://v1/<id>/<nom>#originWidth=800&originHeight=514 » → {id, l, h, nom}. */
export function imageWix(valeur) {
  if (!valeur) return null
  const src = typeof valeur === 'string' ? valeur : valeur.src
  if (typeof src !== 'string') return null
  const m = src.match(/^wix:image:\/\/v1\/([^/#]+)\/([^#]*)#originWidth=(\d+)&originHeight=(\d+)/)
  if (!m) return null
  let nom = m[2]
  try {
    nom = decodeURIComponent(decodeURIComponent(nom))
  } catch {}
  return {id: m[1], l: Number(m[3]), h: Number(m[4]), nom}
}

/** « wix:document://v1/ugd/<fichier>/<nom> » → adresse publique du fichier. */
export function documentWix(valeur) {
  if (typeof valeur !== 'string') return null
  const m = valeur.match(/^wix:document:\/\/v1\/(ugd\/[^/]+)\/(.*)$/)
  if (m) {
    let nom = m[2]
    try {
      nom = decodeURIComponent(nom)
    } catch {}
    return {url: `https://www.theatrebennobesson.ch/_files/${m[1]}`, nom}
  }
  if (/^https?:\/\//.test(valeur)) return {url: valeur, nom: ''}
  return null
}

export function videoWix(valeur) {
  if (typeof valeur !== 'string') return null
  const m = valeur.match(/^wix:video:\/\/v1\/([^/]+)\//)
  return m ? `https://video.wixstatic.com/video/${m[1]}/1080p/mp4/file.mp4` : null
}

const estVideoEnLigne = (u) => typeof u === 'string' && /^https?:\/\/(www\.)?(youtube\.com|youtu\.be|vimeo\.com)\//.test(u.trim())

// ---------------------------------------------------------------------------
// Lieux
// ---------------------------------------------------------------------------
/** Nom de salle Wix → identifiant de lieu et précision éventuelle. */
export function lieuDe(salle) {
  const s = sansAccents(nettoyer(salle).toLowerCase())
  const nonNumerote = /non[- ]numerot/.test(s)
  const avec = (id, mention) => ({id, mention: mention ?? (nonNumerote ? 'Places non numérotées' : undefined)})
  if (!s) return avec('lieu-grande-salle')
  if (/streaming|en direct/.test(s)) return avec('lieu-en-ligne')
  if (/vidy/.test(s)) return avec('lieu-vidy', /salle 17|salle 64/.test(s) ? nettoyer(salle).split('/').pop().trim() : undefined)
  if (/echandole/.test(s)) return avec('lieu-echandole', /caves/.test(s) ? 'Caves du Château' : undefined)
  if (/temple/.test(s)) return avec('lieu-temple')
  if (/eglise|st-pierre/.test(s)) return avec('lieu-eglise-st-pierre')
  if (/aula/.test(s)) return avec('lieu-aula-magna')
  if (/marive/.test(s)) return avec('lieu-la-marive')
  if (/sports 5|chapiteau/.test(s)) return avec('lieu-sports-5', /chapiteau/.test(s) ? 'Sous le chapiteau de la Cie Les arTpenteurs' : undefined)
  if (/nogent/.test(s)) return avec('lieu-quai-de-nogent')
  if (/plage/.test(s)) return avec('lieu-plage')
  if (/jardins|centre du festival/.test(s) && !/rendez-vous|rdv/.test(s)) return avec('lieu-jardins-casino')
  if (/abords|camion|rendez-vous|rdv/.test(s)) return avec('lieu-parvis', /camion/.test(s) ? 'À bord du camion-théâtre' : undefined)
  if (/salle 1/.test(s)) return avec('lieu-salle-1')
  if (/^foyer/.test(s)) return avec('lieu-foyer')
  if (/reflet/.test(s)) return avec('lieu-en-ligne')
  if (/grand/.test(s) || /hall/.test(s)) return avec('lieu-grande-salle', /foyer/.test(s) ? 'Grande Salle et Foyer' : undefined)
  return avec('lieu-grande-salle')
}

// ---------------------------------------------------------------------------
// Prix
// ---------------------------------------------------------------------------
/** « -26 ans et étudiant·es CHF 25.– » → {categorie: 'Moins de 26 ans et étudiant·es', prix: 25}. */
export function lireTarifs(texte) {
  const tarifs = []
  const notes = []
  const lignesTexte = nettoyer(texte)
    .split(/\n|\s\|\s/)
    .map((l) => l.trim())
    .filter(Boolean)
  for (const ligne of lignesTexte) {
    const m = ligne.match(/^(.*?)\s*:?\s*(?:CHF\s*)?(\d+)(?:\s*[.,]\s*[-–]+|\.[–-]|\s*[.,]?–|\.-+|\s*\.?\s*-+)?(?:\s*(\(.*\)))?\s*$/i)
    if (m && /chf|\d+\s*[.,]?\s*[-–]/i.test(ligne) && m[1] && !/majorée|au lieu de/i.test(ligne)) {
      let categorie = m[1].replace(/\s*:\s*$/, '').replace(/\s*CHF\s*$/i, '').trim()
      categorie = categorie
        .replace(/^-\s*(\d+)\s*ans/i, 'Moins de $1 ans')
        .replace(/^(\d+)\s*ans/i, 'Moins de $1 ans')
        .replace(/^Tarif unique$|^Prix unique$|^Pix unique$/i, 'Prix unique')
        .replace(/^Réduit\b/i, 'Tarif réduit')
        .replace(/^Plein tarif$/i, 'Plein tarif')
        .replace(/\bétudiants\b/, 'étudiant·es')
      const precision = m[3]?.replace(/^\(|\)$/g, '')
      tarifs.push({categorie, prix: Number(m[2]), ...(precision ? {precision} : {})})
    } else if (/gratuit/i.test(ligne) && /moins de|-\s*\d+\s*ans/i.test(ligne)) {
      const age = ligne.match(/(\d+)\s*ans/)?.[1]
      tarifs.push({categorie: `Moins de ${age} ans`, prix: 0})
    } else notes.push(ligne)
  }
  return {tarifs, notes}
}

// ---------------------------------------------------------------------------
// Catégorie, genre, étiquettes
// ---------------------------------------------------------------------------
const LABELS = [
  [/^COPRODUCTION$/, ['coproduction']],
  [/^CR[ÉE]ATION(?: ET ACCUEIL)?$/, ['creation']],
  [/^CR[ÉE]ATION ET COPRODUCTION$|^COPRODUCTION ET CR[ÉE]ATION$/, ['creation', 'coproduction']],
  [/^MIDI TH[ÉE][ÂA]TRE$/, ['midi-theatre']],
  [/^HORS SAISON$/, ['hors-saison']],
  [/^NOVA JAZZ$/, ['nova-jazz']],
  [/^BORD DE SC[ÈE]NE/, ['bord-de-scene']],
  [/^EN COLLABORATION AVEC ECOUTE VOIR$/, ['ecoute-voir']],
]

/** « A / B (CH / RU) / C » → [A, B (CH / RU), C] : les barres entre parenthèses ne coupent pas. */
function decouper(texte) {
  const morceaux = ['']
  let profondeur = 0
  for (let i = 0; i < texte.length; i++) {
    const c = texte[i]
    if (c === '(') profondeur++
    if (c === ')') profondeur = Math.max(0, profondeur - 1)
    const coupe = profondeur === 0 && ((c === '/' && texte[i - 1] === ' ' && texte[i + 1] === ' ') || (c === '–' && texte[i - 1] === ' ' && /[A-ZÉ]/.test(texte[i + 2] ?? '')))
    if (coupe) morceaux.push('')
    else morceaux[morceaux.length - 1] += c
  }
  return morceaux.map((m) => m.trim()).filter(Boolean)
}

function phraseDe(segment) {
  // « THÉÂTRE DOCUMENTAIRE MUSICAL (CH) » → « Théâtre documentaire musical (CH) »
  const bas = segment.toLowerCase().replace(/\(([^)]*)\)/g, (m) => m.toUpperCase())
  return bas.charAt(0).toUpperCase() + bas.slice(1)
}

export function lireCategorie(categorie) {
  const etiquettes = new Set()
  const garde = []
  const collaborations = []
  for (const brut of decouper(nettoyer(categorie))) {
    const seg = brut.trim()
    if (!seg) continue
    const haut = seg.toUpperCase()
    const label = LABELS.find(([re]) => re.test(haut))
    if (label) {
      label[1].forEach((e) => etiquettes.add(e))
      if (/^BORD DE SC/.test(haut) && haut.length > 14) collaborations.push(phraseDe(seg))
      continue
    }
    const collab = seg.match(/^(.*?)\s*EN COLLABORATION AVEC\s+(.*)$/i)
    if (collab) {
      if (/ECOUTE VOIR/i.test(collab[2])) etiquettes.add('ecoute-voir')
      collaborations.push(`En collaboration avec ${collab[2].replace(/\b(\w)(\w*)/g, (_, a, b) => a + b.toLowerCase())}`)
      if (collab[1]) garde.push(phraseDe(collab[1]))
      continue
    }
    if (/SAISON MUSICALE/.test(haut)) etiquettes.add('saison-musicale')
    if (/MIDI TH/.test(haut)) etiquettes.add('midi-theatre')
    garde.push(phraseDe(seg.replace(/\s*\/\s*MIDI TH[ÉE][ÂA]TRE/i, '')))
  }
  return {precision: garde.join(' / '), etiquettes: [...etiquettes], collaborations}
}

export function genreDe(categorie, filtres = []) {
  const t = sansAccents([categorie, ...filtres].join(' ').toUpperCase())
  if (/JEUNE PUBLIC|FAMILLE|DES \d ANS/.test(t)) return 'jeune-public'
  if (/HUMOUR|STAND-UP|STAND UP/.test(t)) return 'humour'
  if (/CIRQUE|JONGL|ACROBAT/.test(t)) return 'cirque'
  if (/DANSE|CHOREGRAPH|BALLET/.test(t)) return 'danse'
  if (/THEATRE MUSICAL|COMEDIE MUSICALE|THEATRE/.test(t)) return 'theatre'
  if (/MUSIQUE|CONCERT|SAISON MUSICALE|CHANSON|JAZZ|RECITAL|OPERA|CHOEUR|CHORAL|ROCK|POP|ELECTRO/.test(t)) return 'musique'
  return 'theatre'
}

// ---------------------------------------------------------------------------
// Bandeaux d'information
// ---------------------------------------------------------------------------
export function lireInfos(texte) {
  const r = {statut: null, avertissements: [], distinctions: [], autour: [], programme: [], collaborations: [], etiquettes: new Set(), supplementaires: [], afterwork: false}
  const brut = nettoyer(texte)
  if (!brut) return r
  const morceaux = brut
    .split(/\n/)
    .map((l) => l.replace(/^-\s*/, '').trim())
    .filter(Boolean)
  for (let i = 0; i < morceaux.length; i++) {
    const l = morceaux[i]
    const h = sansAccents(l.toUpperCase())
    if (/^ATTENTION\s*!?$/.test(h) && morceaux[i + 1]) {
      r.avertissements.push(morceaux[++i])
      continue
    }
    if (/^COMPLET/.test(h)) {
      r.statut = /ATTENTE/.test(h) || /ATTENTE/.test(sansAccents((morceaux[i + 1] || '').toUpperCase())) ? 'liste-attente' : 'complet'
      if (/^LISTE D.ATTENTE$/.test(sansAccents((morceaux[i + 1] || '').toUpperCase()))) i++
      continue
    }
    if (/^HORS SAISON$/.test(h)) {
      r.etiquettes.add('hors-saison')
      continue
    }
    if (/AFTERWORK/.test(h)) {
      r.afterwork = true
      r.etiquettes.add('afterwork')
      continue
    }
    if (/^HEURE SUPPLEMENTAIRE/.test(h)) continue
    if (/SUPPLEMENTAIRE/.test(h) && /\d/.test(h)) {
      r.supplementaires.push({texte: l, dernieres: /DERNIERES PLACES/.test(h)})
      if (/DEDICACE/.test(h)) r.autour.push(capitalesAdoucies(l.replace(/^.*?\/\s*/, '')))
      continue
    }
    if (/^DES PLACES SE SONT LIBEREES/.test(h)) continue
    if (/STROBOSCOP|NUDITE|COUPS DE FEU|SENSIBLE|^ATTENTION/.test(h)) {
      r.avertissements.push(l.replace(/^ATTENTION\s*:\s*/i, ''))
      continue
    }
    if (/LAUREAT|PRIME|PRIX /.test(h) && !/LIBRAIRIE/.test(h)) {
      r.distinctions.push(l)
      continue
    }
    if (/^EN COLLABORATION AVEC/.test(h)) {
      r.collaborations.push(l.replace(/^EN COLLABORATION AVEC\s*/i, 'En collaboration avec '))
      continue
    }
    if (/^(OEUVRES|ŒUVRES|MUSIQUE SACREE|TRIOS|PROGRAMME)/.test(h) || /^Œuvres/.test(l)) {
      r.programme.push(l)
      continue
    }
    if (/LA PROGRAMMATION COMPLETE/.test(h)) continue
    if (/LIBRAIRIE/.test(h) && !/ANNULATION/.test(h)) r.etiquettes.add('librairie')
    if (/AVANT-SPECTACLE/.test(h)) r.etiquettes.add('avant-spectacle')
    if (/BORD DE (SCENE|PLATEAU)/.test(h)) r.etiquettes.add('bord-de-scene')
    if (/MEDIATION/.test(h)) r.etiquettes.add('mediation')
    if (/LANGUE DES SIGNES|\bLSF\b/.test(h)) r.etiquettes.add('lsf')
    if (/SURTITR/.test(h)) r.etiquettes.add('surtitrage')
    if (/ECOUTE VOIR/.test(h)) r.etiquettes.add('ecoute-voir')
    if (/MALVOYANT|AVEUGLE/.test(h)) r.etiquettes.add('audiodescription')
    if (/SOURD|MALENTENDANT/.test(h)) r.etiquettes.add('malentendants')
    r.autour.push(capitalesAdoucies(l))
  }
  return r
}

/** « LIBRAIRIE EPHÉMÈRE PAYOT LE SOIR DU SPECTACLE » → « Librairie éphémère Payot le soir du spectacle ». */
export function capitalesAdoucies(texte) {
  const lettres = texte.replace(/[^A-Za-zÀ-ÿ]/g, '')
  if (!lettres || lettres !== lettres.toUpperCase()) return texte
  const propres = ['PAYOT', 'CLY', 'TBB', 'LSF', 'ECOUTE', 'VOIR', 'GEORGES', 'GRBIC', 'BOTHO', 'STRAUSS', 'CERCLE', 'LITTÉRAIRE', 'YVERDON', 'FOYER', 'EUGENE', 'CHAPLIN', 'BRIGITTE', 'ROSSET', 'LUNA', 'DESMEULES', 'LEENAARDS', 'MANUFACTURE', 'CASTRUM', 'DÉRIVÉE', 'ECHANDOLE', 'IMPATIENCE', 'SACD', 'LABEL+', 'ROMAND', 'HALL', 'SALLE']
  const bas = texte.toLowerCase().replace(/\b([a-zà-ÿ+]+)\b/g, (mot) => (propres.includes(mot.toUpperCase()) ? mot.charAt(0).toUpperCase() + mot.slice(1) : mot))
  return bas.replace(/\b(cly|tbb|lsf|sacd)\b/gi, (m) => m.toUpperCase()).replace(/^./, (c) => c.toUpperCase()).replace(/ephémère/g, 'éphémère')
}

// ---------------------------------------------------------------------------
// Durée
// ---------------------------------------------------------------------------
export function lireDuree(texte) {
  const brut = nettoyer(texte)
  if (!brut) return {duree: null, deroule: []}
  const lignesD = brut.split('\n').map((l) => l.trim()).filter(Boolean)
  const estimee = /estim|environ|env\./i.test(brut)
  const deroule = []
  for (const l of lignesD) {
    const m = l.match(/^(?!dur[ée]e)(.+?)\s*:\s*(\d.*)$/i)
    if (m) deroule.push({titre: m[1].trim(), duree: m[2].trim()})
  }
  if (deroule.length >= 2) {
    const total = deroule.reduce((s, d) => s + minutes(d.duree), 0)
    const entracte = deroule.some((d) => /entracte/i.test(d.titre))
    return {duree: total ? `${format(total)}${entracte ? ' avec entracte' : ''}` : null, deroule}
  }
  let duree = brut
    .replace(/^dur[ée]e\s*(estim[ée]e)?\s*:?\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim()
  if (!/\d/.test(duree)) return {duree: null, deroule: []}
  if (estimee && !/^env/.test(duree)) duree = `env. ${duree}`
  return {duree, deroule: []}
}

function minutes(t) {
  const h = t.match(/(\d+)\s*h\s*(\d{1,2})?/)
  if (h) return Number(h[1]) * 60 + Number(h[2] || 0)
  const m = t.match(/(\d+)\s*min/)
  return m ? Number(m[1]) : 0
}
const format = (n) => (n >= 60 ? `${Math.floor(n / 60)}h${n % 60 ? String(n % 60).padStart(2, '0') : ''}` : `${n} min`)

// ---------------------------------------------------------------------------
// Générique
// ---------------------------------------------------------------------------
const PRODUCTION = /^(production|coproduction|co-production|coproductions|soutiens?|avec le soutien|partenaires?|remerciements?|diffusion|administration et production|production et administration|production déléguée|résidences?|accueil en résidence|mécènes?|avec l.aide|ce spectacle|le spectacle|spectacle soutenu|en partenariat|en collaboration|projet soutenu|une production|une coproduction|un spectacle|commande|aide)/i

/** Générique Wix → {blocs: [{titre?, lignes: [{role, noms}]}], production: [..], creation, credits: [..]}. */
export function lireDistribution(html) {
  const blocs = [{titre: null, lignes: []}]
  const production = []
  const credits = []
  let creation = null
  const paras = paragraphes(html).filter((p) => !p.vide)
  for (const p of paras) {
    for (const ligne of lignes(p)) {
      const texte = espaces(ligne.map((s) => s.texte).join('')).trim()
      if (!texte) continue
      const grasDebut = []
      let i = 0
      while (i < ligne.length && ligne[i].gras) grasDebut.push(ligne[i++].texte)
      const role = espaces(grasDebut.join('')).trim().replace(/\s*:$/, '')
      if (/^attention\b/i.test(texte)) continue
      // Une ligne en italique seule (« Choices », « PLEASE, WASH Mii BRAIN ») ouvre la distribution d'une pièce.
      if (ligne.every((x) => x.italique) && texte.length < 60) {
        if (blocs.at(-1).lignes.length || blocs.at(-1).titre) blocs.push({titre: texte, lignes: []})
        else blocs.at(-1).titre = texte
        continue
      }
      const reste = espaces(ligne.slice(i).map((s) => s.texte).join('')).trim().replace(/^:\s*/, '')
      if (/^photos?\s*(©|:|\(c\)|credit)/i.test(texte) || /^©/.test(texte) || /^cr[ée]dits? photos?/i.test(texte)) {
        credits.push(texte.replace(/^photos?\s*©?\s*:?\s*/i, '').replace(/^cr[ée]dits? photos?\s*:?\s*/i, '').replace(/^©\s*/, '').trim())
        continue
      }
      if (/^cr[ée]ation\s+(le|en|au|à|aux|prévue|du|:)/i.test(texte) || /^premi[èe]re\s+(le|en|au)/i.test(texte)) {
        creation = creation ? `${creation} ${texte}` : texte
        continue
      }
      if (PRODUCTION.test(role || texte)) {
        production.push(role ? `${role} : ${reste}` : texte)
        continue
      }
      if (role && !reste) {
        // Un intitulé seul : nouveau bloc (spectacle en deux parties) ou sous-titre « Avec au plateau ».
        if (blocs.at(-1).lignes.length || blocs.at(-1).titre) blocs.push({titre: role, lignes: []})
        else blocs.at(-1).titre = role
        continue
      }
      if (role) blocs.at(-1).lignes.push({role, noms: reste})
      else if (production.length) production.push(texte)
      else blocs.at(-1).lignes.push({role: '', noms: texte})
    }
  }
  return {blocs: blocs.filter((b) => b.lignes.length), production, creation, credits}
}

// ---------------------------------------------------------------------------
// Textes : citations et revue de presse
// ---------------------------------------------------------------------------
const MEDIAS = ['RTS', 'RTS La 1ère', 'RTS Espace 2', 'Espace 2', 'Le Temps', '24 heures', '24heures', '24 Heures', 'La Liberté', 'Le Courrier', 'Tribune de Genève', 'La Tribune de Genève', 'La Région', 'Télérama', 'Le Monde', 'Libération', 'Le Figaro', 'Les Inrockuptibles', 'Le Nouvelliste', 'La Gruyère', 'ArcInfo', 'Le Quotidien Jurassien', 'L’Humanité', "L'Humanité", 'Le Parisien', 'France Inter', 'France Culture', 'La Terrasse', 'Scènes Magazine', 'Le Matin', 'Le Matin Dimanche', 'Sceneweb', 'Mouvement', 'Toute la culture', 'Ouest-France', 'Le Soir', 'La Libre Belgique', 'Les Echos', 'L’Obs', "L'Obs", 'Le Point', 'Marianne', 'Le Canard enchaîné', 'Le JDD', 'Elle', 'Transfuge', 'Les Trois Coups', 'Théâtral magazine', 'Télé Star']
const estMedia = (t) => MEDIAS.some((m) => sansAccents(m.toLowerCase()) === sansAccents(t.toLowerCase().trim()))

function attribution(texte) {
  const t = texte.replace(/^[-–—]\s*/, '').replace(/[.;]\s*$/, '').trim()
  if (!t || t.length > 90 || /«|»/.test(t)) return null
  const parties = t.split(/\s*,\s*/)
  if (parties.length === 1) return estMedia(t) ? {media: t} : {auteur: t}
  const media = parties.pop()
  return {auteur: parties.join(', '), media}
}

/** Sépare le descriptif en texte, citations (« … » Nom, Média) et revue de presse. */
export function lireDescriptif(html) {
  const paras = paragraphes(html)
  const texte = []
  const citations = []
  const revue = []
  let dansRevue = false
  for (let i = 0; i < paras.length; i++) {
    const p = paras[i]
    if (p.vide) {
      texte.push(p)
      continue
    }
    const t = texteDe(p)
    // Un court paragraphe tout en gras est un intertitre (programme en deux parties).
    if (p.style === 'normal' && t.length < 70 && p.spans.every((s) => s.gras || !s.texte.trim()) && !/[.:;!?]$/.test(t) && !/^revue de presse/i.test(t)) {
      texte.push({...p, style: 'h3'})
      continue
    }
    if (/^revue de presse\s*[:;]?\s*$/i.test(t)) {
      dansRevue = true
      continue
    }
    if (dansRevue) {
      const entree = lireEntreeRevue(p)
      if (entree) revue.push(entree)
      continue
    }
    // « … » Nom, Média  (attribution dans le même paragraphe ou dans le suivant)
    const m = t.match(/^[«“"]\s*([\s\S]+?)\s*[»”"]\s*(?:[-–—]\s*)?([\s\S]*)$/)
    if (m && m[1].length > 15 && !/[«»]/.test(m[2])) {
      let attr = m[2] ? attribution(m[2].replace(/\n/g, ' ')) : null
      let saut = 0
      if (!m[2]) {
        let k = i + 1
        while (k < paras.length && paras[k].vide) k++
        const suivant = paras[k] ? texteDe(paras[k]) : ''
        const a = suivant ? attribution(suivant) : null
        if (a && !/^[«“"]/.test(suivant)) {
          attr = a
          saut = k - i
        }
      }
      if (attr || m[2] === '') {
        if (attr) {
          citations.push({citation: m[1].replace(/\s*\n\s*/g, ' ').replace(/^\(…\)\s*/, ''), ...attr})
          i += saut
          continue
        }
      }
    }
    texte.push(p)
  }
  // Une même revue citée deux fois (avec et sans lien) : on garde la plus complète.
  const uniques = []
  for (const a of revue) {
    const cleA = sansAccents(a.titre.toLowerCase()).replace(/[^a-z0-9]/g, '')
    const deja = uniques.find((b) => sansAccents(b.titre.toLowerCase()).replace(/[^a-z0-9]/g, '') === cleA)
    if (!deja) uniques.push(a)
    else if ((!deja.lien && a.lien) || (!deja.auteur && a.auteur)) Object.assign(deja, {...a, lien: a.lien ?? deja.lien, auteur: a.auteur ?? deja.auteur})
  }
  revue.splice(0, revue.length, ...uniques)
  // Pas de lignes vides en tête ou en fin de texte.
  while (texte.length && texte.at(-1).vide) texte.pop()
  return {texte, citations, revue}
}

const MOIS_LONGS = {janvier: '01', fevrier: '02', février: '02', mars: '03', avril: '04', mai: '05', juin: '06', juillet: '07', aout: '08', août: '08', septembre: '09', octobre: '10', novembre: '11', decembre: '12', décembre: '12'}

/** Date d'un article : « 05.01.2024 », « 6.11.23 », « 12 décembre 2024 », « Novembre 2023 ». */
export function dateArticle(texte, anneeParDefaut) {
  let m = texte.match(/\b(\d{1,2})(?:er)?\s+(janvier|f[ée]vrier|mars|avril|mai|juin|juillet|ao[uû]t|septembre|octobre|novembre|d[ée]cembre)\s+(\d{4})\b/i)
  if (m) return {date: `${m[3]}-${MOIS_LONGS[m[2].toLowerCase()]}-${m[1].padStart(2, '0')}`, texte: m[0]}
  m = texte.match(/\b(\d{1,2})\.(\d{1,2})\.(\d{2,4})\b/)
  if (m && Number(m[2]) <= 12 && Number(m[1]) <= 31) return {date: `${m[3].length === 2 ? '20' + m[3] : m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`, texte: m[0]}
  m = texte.match(/\b(janvier|f[ée]vrier|mars|avril|mai|juin|juillet|ao[uû]t|septembre|octobre|novembre|d[ée]cembre)\s+(\d{4})\b/i)
  if (m) return {date: `${m[2]}-${MOIS_LONGS[m[1].toLowerCase()]}-01`, texte: m[0]}
  m = texte.match(/\b(\d{1,2})\.(\d{1,2})\b/)
  if (m && anneeParDefaut) return {date: `${anneeParDefaut}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`, texte: m[0]}
  return null
}

function lireEntreeRevue(p) {
  const t = texteDe(p).replace(/\s+/g, ' ')
  if (t.length < 8) return null
  const lien = p.spans.find((s) => s.lien && /^https?:/.test(s.lien))?.lien ?? null
  const texteLien = lien ? espaces(p.spans.filter((s) => s.lien === lien).map((s) => s.texte).join('')).trim() : ''
  const d = dateArticle(t)
  let reste = d ? t.replace(d.texte, '') : t
  // Le titre : entre guillemets droits (les plus extérieurs), sinon entre chevrons.
  let titre = null
  let extrait = null
  const guill = reste.match(/"(.+)"/)
  if (guill) {
    titre = guill[1].trim()
    reste = reste.replace(guill[0], '')
  } else {
    const chev = reste.match(/«\s*(.+?)\s*»/)
    if (chev) {
      if (chev[1].length > 90) extrait = chev[1].replace(/^\(…\)\s*/, '')
      else titre = chev[1]
      reste = reste.replace(chev[0], '')
    }
  }
  const morceaux = reste
    .split(/\s*,\s*|\s*:\s+/)
    .map((x) => x.replace(/^(entretien avec .+ pour|critique de .+ pour l.émission|sur)\s*/i, '').trim())
    .filter((x) => x && !/^(et|interviews?)\b/i.test(x))
  let media = texteLien && texteLien !== titre && !/^"/.test(texteLien) && texteLien.length < 40 ? texteLien.replace(/[«»"]/g, '').trim() : null
  const autres = morceaux.filter((x) => x !== media && x.replace(/[«»"]/g, '').trim() !== media)
  if (!media) media = autres.find(estMedia) ?? autres.at(-1) ?? null
  const auteur = autres.find((x) => x !== media && /^[A-ZÉ][a-zéèëï-]+(?:\s+[A-ZÉ][\wéèëï-]+){1,2}$/.test(x) && !estMedia(x)) ?? null
  const emission = autres.find((x) => x !== media && x !== auteur && x.length < 30 && /^[A-Z]/.test(x)) ?? null
  if (!titre) titre = emission || extrait?.slice(0, 80) || media
  if (!media || !titre) return null
  if (!d && !lien) return null
  if (/^photos?\s*©/i.test(titre) || /^photos?\s*©/i.test(t)) return null
  let auteurFinal = auteur
  let mediaFinal = emission && emission !== titre ? `${media}, ${emission}` : media
  // « Robin Badoux, Le Nord vaudois » : l'auteur·ice est resté·e collé·e au média.
  const personne = (x) => /^[A-ZÉ][a-zéèëïô-]+(?:\s+(?:de\s+|da\s+|dalla\s+)?[A-ZÉ][\wéèëïô-]+){1,2}$/.test(x) && !estMedia(x)
  if (!auteurFinal && /,/.test(mediaFinal)) {
    const parts = mediaFinal.split(/\s*,\s*/)
    if (personne(parts[0])) [auteurFinal, mediaFinal] = [parts[0], parts.slice(1).join(', ')]
    else if (personne(parts.at(-1))) [auteurFinal, mediaFinal] = [parts.at(-1), parts.slice(0, -1).join(', ')]
  }
  return {date: d?.date ?? null, media: mediaFinal, auteur: auteurFinal, titre, lien, extrait}
}

// ---------------------------------------------------------------------------
// La fiche complète
// ---------------------------------------------------------------------------
export function lireFiche(brut, saison) {
  // Wix mêle des accents composés (é) et décomposés (e + ´) : tout est ramené à la forme composée.
  const d = JSON.parse(JSON.stringify(brut).normalize('NFC'))
  const titre = nettoyer(d.titreVisible || d.titre || d.title)
  if (!titre) return null
  const categorie = nettoyer(d.categorie || d.catgorie)
  const filtres = Array.isArray(d.filtre) ? d.filtre : []
  const cat = lireCategorie(categorie)
  // Le « complément » sert parfois de bandeau (COMPLET, AVANT-SPECTACLE…) : il rejoint alors les infos.
  const complement = nettoyer(d.complementInfo)
  const complementEstInfo = complement && (/COMPLET|LISTE D.ATTENTE|DERNI[ÈE]RES PLACES|SUPPL[ÉE]MENTAIRE|AVANT-SPECTACLE|LIBRAIRIE|BORD DE (SC|PLATEAU)/i.test(complement) || complement === complement.toUpperCase())
  const infos = lireInfos([d.infoImportantes || d.infosImportantes, complementEstInfo ? complement : ''].filter(Boolean).join('\n'))

  // Dates
  const brutDate = typeof d.date === 'string' && /^\d{4}-\d{2}-\d{2}/.test(d.date) ? d.date : d.date?.$date ? d.date : d.date1 ?? null
  const ancre = dateZurich(brutDate)
  const texteDates = nettoyer(d.dateComplete || (typeof d.date === 'string' && !/^\d{4}-/.test(d.date) ? d.date : ''))
  const texteHeure = nettoyer(d.heure)
  const source = /janvier|f[ée]vrier|mars|avril|mai|juin|juillet|ao[uû]t|septembre|octobre|novembre|d[ée]cembre/i.test(texteHeure) ? texteHeure : texteDates
  let dates = lireDates(source, ancre)
  if (ancre) {
    // Une année mal saisie (« Mercredi 6 janvier 2020 » dans la saison 20-21) : on se fie à la date de la fiche.
    const ref = Date.UTC(ancre.a, ancre.m - 1, ancre.j)
    for (const x of dates) {
      const [a, m, j] = x.date.split('-').map(Number)
      if (Math.abs(Date.UTC(a, m - 1, j) - ref) > 250 * 864e5) {
        const annee = m < ancre.m && ancre.m - m > 5 ? ancre.a + 1 : m > ancre.m && m - ancre.m > 6 ? ancre.a - 1 : ancre.a
        x.date = `${annee}-${String(m).padStart(2, '0')}-${String(j).padStart(2, '0')}`
      }
    }
  }
  // Une date reprise sans heure dans une note (« la représentation du 31 décembre est majorée ») n'est pas une séance de plus.
  dates = dates.filter((x, i) => x.heures.length || !dates.some((y, k) => k !== i && y.date === x.date && y.heures.length))
  dates = dates.filter((x, i) => dates.findIndex((y) => y.date === x.date && y.heures.join() === x.heures.join()) === i)
  if (!dates.length && ancre) dates = [{date: `${ancre.a}-${String(ancre.m).padStart(2, '0')}-${String(ancre.j).padStart(2, '0')}`, heures: []}]
  const heuresParDefaut = source === texteHeure ? [] : heures(texteHeure)
  const repli = heuresParDefaut.length ? heuresParDefaut : ancre?.heure ? [ancre.heure] : []
  const representations = []
  dates.forEach((x, i) => {
    let liste = x.heures.length ? x.heures : repli.length === dates.length && dates.length > 1 && !dates.some((y) => y.heures.length) ? [repli[i]] : dates.length > 1 && repli.length > 1 ? [repli[0]] : repli
    if (!liste.length) liste = [null]
    for (const heure of [...new Set(liste)]) representations.push({date: x.date, heure: heure ?? '20:00', ...(heure ? {} : {heureAConfirmer: true})})
  })
  representations.sort((a, b) => (a.date + a.heure < b.date + b.heure ? -1 : 1))
  if (infos.afterwork) for (const r of representations) if (r.heure === '18:00') r.mention = 'Afterwork'
  for (const s of infos.supplementaires) {
    const ds = lireDates(s.texte, ancre)
    for (const r of representations)
      if (ds.some((x) => x.date === r.date)) {
        r.mention = s.dernieres ? 'Supplémentaire, dernières places' : 'Supplémentaire'
        r.libre = true
      }
  }

  // Compagnie : « De Guillaume Poix » en première ligne → sous-titre.
  let compagnie = nettoyer(d.compagnie)
  let sousTitre = complementEstInfo ? '' : complement
  const lignesCie = compagnie.split('\n').map((l) => l.trim()).filter(Boolean)
  if (lignesCie.length > 1 && /^(de|d’après|d'après|texte de|mise en scène)\b/i.test(lignesCie[0])) {
    if (!sousTitre) sousTitre = lignesCie[0].replace(/^De\b/, 'de')
    lignesCie.shift()
  }
  compagnie = lignesCie.join(' / ')
  if (!compagnie && d.de) compagnie = nettoyer(d.de)
  if (!sousTitre && infos.programme.length) sousTitre = infos.programme.shift()

  const lieu = lieuDe(d.salle)
  const {tarifs, notes} = lireTarifs(d.tarifs)
  const duree = lireDuree(d.duree || d.dure)
  const desc = lireDescriptif(d.descriptif)
  const dist = lireDistribution(d.distribution)

  const visuel = imageWix(d.visuel) || imageWix(d.affiche)
  const galerie = (d.galeriePhotos || d.galeriePhotos1 || [])
    .filter((g) => g?.type === 'image' || /^wix:image/.test(g?.src || ''))
    .map((g) => {
      const img = imageWix(g.src)
      if (!img) return null
      const nom = `${g.title || ''} ${g.fileName || ''} ${img.nom}`
      const credit = nom.match(/(?:©|\(c\)|copyright)\s*([A-ZÀ-Ý][\wÀ-ÿ'’.-]+(?:\s+[A-ZÀ-Ý][\wÀ-ÿ'’.-]+){0,3})/i)?.[1]?.replace(/\.(jpe?g|png)$/i, '')
      return {...img, ...(credit ? {credit: credit.trim()} : {}), ...(g.description ? {legende: nettoyer(g.description)} : {})}
    })
    .filter(Boolean)

  const video = [d.teaser, d.video, d.video1].find(estVideoEnLigne)?.trim() ?? null
  const dossier = documentWix(d.dossierDePresse)
  const slugWix = Object.entries(d).find(([k]) => /^link-.*-(title|titre)$/.test(k))?.[1] ?? null
  const acheter = nettoyer(d.acheter)
  const brevo = /sibforms\.com|brevo/.test(acheter)
  const libelle = nettoyer(d.boutonAcheter)

  const autour = [...new Set(infos.autour)]
  const avertissement = [...infos.avertissements].join(' · ') || null
  const production = [...cat.collaborations.filter((c) => /^En collaboration/i.test(c)), ...infos.collaborations, ...dist.production]
  const etiquettes = new Set([...cat.etiquettes, ...infos.etiquettes])
  if (/résidence/i.test(compagnie)) etiquettes.add('residence')
  if (cat.collaborations.some((c) => /^Bord de sc/i.test(c))) autour.unshift(cat.collaborations.find((c) => /^Bord de sc/i.test(c)))
  if (filtres.some((f) => /HORS SAISON/i.test(f))) etiquettes.add('hors-saison')
  if (filtres.some((f) => /NOVA JAZZ/i.test(f))) etiquettes.add('nova-jazz')
  if (/nova jazz/i.test(titre)) etiquettes.add('nova-jazz')
  if (lieu.id === 'lieu-salle-1' && representations.some((r) => r.heure === '12:15')) etiquettes.add('midi-theatre')

  return {
    wix: d._id,
    saison: saison.code,
    ancienneAdresse: slugWix ? decodeURI(slugWix) : null,
    titre,
    sousTitre: sousTitre || null,
    compagnie: compagnie || null,
    categorie,
    precision: cat.precision || null,
    genre: genreDe(categorie, filtres),
    etiquettes: [...etiquettes],
    representations,
    datesTexte: texteDates || null,
    lieu: lieu.id,
    mentionLieu: lieu.mention ?? null,
    salle: nettoyer(d.salle) || null,
    age: nettoyer(d.publicCible).replace(/\s+/g, ' ') || null,
    duree: duree.duree,
    deroule: duree.deroule,
    tarifs,
    notesTarifs: notes,
    lienBilletterie: acheter && !brevo ? acheter : null,
    lienListeAttente: brevo ? acheter : null,
    libelleBillet: libelle && !/^acheter$/i.test(libelle) ? libelle : null,
    statut: infos.statut,
    avertissement,
    distinction: infos.distinctions.join(' · ') || null,
    autour,
    programme: infos.programme,
    accroche: texteBrut(d.chapeauCourt).replace(/\s*\n+\s*/g, ' ') || null,
    chapeau: paragraphes(d.chapeau).filter((p) => !p.vide),
    texte: desc.texte,
    citations: desc.citations,
    revue: desc.revue,
    distribution: dist.blocs,
    production,
    creation: dist.creation,
    creditsPhotos: dist.credits.length ? dist.credits.join(' · ') : null,
    visuel,
    galerie,
    photosHD: /^https?:/.test(nettoyer(d.photosHr)) ? nettoyer(d.photosHr) : null,
    video,
    videoWix: videoWix(d.video) ?? null,
    dossier,
    scolaire: nettoyer(d.classeHarmos) && !/^www\.|^https?:/.test(nettoyer(d.classeHarmos)) ? nettoyer(d.classeHarmos) : null,
    seo: nettoyer(d.seoGoogle) || null,
    aLaUne: Boolean(d.spectacleALaUne || d.spectacleLaUne),
    cache: Boolean(nettoyer(d.spectacleCache)),
    ordre: Object.entries(d).find(([k]) => k.startsWith('_manualSort'))?.[1] ?? null,
  }
}
