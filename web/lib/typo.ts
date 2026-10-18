/* Typographie française : espace fine insécable avant : ; ! ? » et après «. */

const FINE = '\u202f'
const INSECABLE = '\u00a0'

export function typo(texte: string | null | undefined): string {
  if (!texte) return ''
  return (
    texte
      // Numéros de téléphone suisses (024 423 65 84) : jamais coupés en fin de ligne.
      .replace(/\b(0\d{2}) (\d{3}) (\d{2}) (\d{2})\b/g, `$1${INSECABLE}$2${INSECABLE}$3${INSECABLE}$4`)
      .replace(/[ \u00a0]([:;!?»])/g, `${FINE}$1`)
      .replace(/«[ \u00a0]/g, `«${FINE}`)
      // Milliers : 1 200 places
      .replace(/(\d) (\d{3})\b/g, `$1${FINE}$2`)
  )
}

/** Catégorie de longueur d'un titre, pour adapter le corps des titres d'affiche. */
export function longueur(titre: string): 'tres-court' | 'court' | 'long' | 'tres-long' {
  const n = titre.length
  return n > 34 ? 'tres-long' : n > 16 ? 'long' : n > 9 ? 'court' : 'tres-court'
}

/** Numéro de téléphone suisse vers lien tel: (024 423 65 84 → +41244236584). */
export function lienTel(numero: string): string {
  const chiffres = numero.replace(/[^\d+]/g, '')
  return `tel:${chiffres.startsWith('0') ? `+41${chiffres.slice(1)}` : chiffres}`
}
