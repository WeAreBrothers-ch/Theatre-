import {local, heureLisible, dateLongue, ecartJours, aujourdhui} from '../temps.ts'
import {dureeCourte, prixEnLigne, repsPubliques, typo, urlSpectacle, type Contexte, type ReglagesCom, type RepCom, type SpectacleCom} from './commun.ts'

/*
 * Textes prêts à copier pour Instagram, Facebook ou LinkedIn, écrits à partir de la fiche.
 * Chaque variante répond à un moment de la vie d'un spectacle : l'annonce, la semaine
 * qui précède, les dernières places, le soir même, le complet.
 */

export type Variante = 'annonce' | 'semaine' | 'dernieres' | 'ce-soir' | 'complet' | 'story'

export const VARIANTES: {valeur: Variante; titre: string; aide: string}[] = [
  {valeur: 'annonce', titre: 'Annonce', aide: 'Pour présenter le spectacle, quelques semaines avant.'},
  {valeur: 'semaine', titre: 'C’est bientôt', aide: 'La semaine qui précède la première date.'},
  {valeur: 'dernieres', titre: 'Dernières places', aide: 'Quand la salle se remplit.'},
  {valeur: 'ce-soir', titre: 'Ce soir', aide: 'Le jour même, en story ou en publication.'},
  {valeur: 'complet', titre: 'Complet', aide: 'Pour dire que c’est plein et proposer la liste d’attente.'},
  {valeur: 'story', titre: 'Story courte', aide: 'Trois lignes à poser sur le visuel.'},
]

const MOTS_CLES: Record<string, string[]> = {
  theatre: ['théâtre'],
  danse: ['danse', 'dansecontemporaine'],
  humour: ['humour', 'standup'],
  musique: ['musique', 'concert'],
  'jeune-public': ['jeunepublic', 'enfamille'],
  cirque: ['cirque'],
}

/** Mots-dièse : le théâtre, la ville, le genre. */
export function motsDiese(s: SpectacleCom): string {
  const base = ['TBB', 'TheatreBennoBesson', 'Yverdon', 'YverdonLesBains']
  const genre = MOTS_CLES[s.genre ?? ''] ?? []
  const etiquettes = (s.etiquettes ?? []).includes('midi-theatre') ? ['miditheatre'] : []
  return [...base, ...genre, ...etiquettes].map((m) => `#${m.normalize('NFD').replace(/[̀-ͯ]/g, '')}`).join(' ')
}

function prochaines(s: SpectacleCom, depuis: string): RepCom[] {
  return repsPubliques(s).filter((r) => r.statut !== 'annule' && local(r.dateHeure).date >= depuis)
}

function datesEnClair(reps: RepCom[]): string {
  if (!reps.length) return ''
  const dates = reps.map((r) => {
    const l = local(r.dateHeure)
    return `${dateLongue(l.date)}${r.heureAConfirmer ? '' : ` à ${heureLisible(l.heure)}`}`
  })
  if (dates.length === 1) return dates[0]
  if (dates.length === 2) return `${dates[0]} et ${dates[1]}`
  return `${dates.slice(0, -1).join(', ')} et ${dates[dates.length - 1]}`
}

const maj = (t: string) => (t ? t.charAt(0).toUpperCase() + t.slice(1) : t)

export type OptionsReseaux = {emojis: boolean; aujourdhui?: string}

export function texteReseaux(ctx: Contexte, reglages: ReglagesCom, s: SpectacleCom, variante: Variante, o: OptionsReseaux): string {
  const jour = o.aujourdhui ?? aujourdhui()
  const e = (emoji: string) => (o.emojis ? `${emoji} ` : '')
  const reps = prochaines(s, jour)
  const ouvertes = reps.filter((r) => r.statut !== 'complet')
  const lien = urlSpectacle(ctx, s)
  const tel = reglages.telBilletterie ? typo(reglages.telBilletterie) : ''
  const lieu = s.lieuComplet || s.lieu || reglages.nom || 'Théâtre Benno Besson'
  const titre = s.titre.toLocaleUpperCase('fr-CH')
  const par = s.compagnie ? `${s.compagnie}\n` : ''
  const accroche = s.accroche ? `${typo(s.accroche)}\n\n` : ''
  const infos = [s.age, dureeCourte(s.duree), prixEnLigne(s)].filter(Boolean).join(' · ')
  const ceSoir = reps.find((r) => local(r.dateHeure).date === jour)
  const premier = reps[0]
  const dans = premier ? ecartJours(jour, local(premier.dateHeure).date) : null

  switch (variante) {
    case 'annonce':
      return [
        `${e('🎭')}${titre}`,
        par.trim(),
        '',
        accroche.trim(),
        accroche ? '' : null,
        `${e('📅')}${datesEnClair(reps) || 'dates à venir'}`,
        `${e('📍')}${lieu}`,
        infos ? `${e('ℹ️')}${infos}` : null,
        `${e('🎟️')}Billets : ${lien}`,
        '',
        motsDiese(s),
      ]
        .filter((l) => l !== null)
        .join('\n')
        .replace(/\n{3,}/g, '\n\n')
    case 'semaine':
      return [
        `${e('⏳')}${dans === 0 ? 'C’est aujourd’hui' : dans === 1 ? 'C’est demain' : dans !== null && dans <= 7 ? `Plus que ${dans} jours` : 'Bientôt'} : ${titre} !`,
        '',
        accroche.trim() || par.trim(),
        '',
        `${e('📅')}${datesEnClair(ouvertes.length ? ouvertes : reps)}`,
        `${e('🎟️')}${lien}${tel ? ` ou ${tel}` : ''}`,
        '',
        motsDiese(s),
      ].join('\n')
    case 'dernieres':
      return [
        `${e('🔥')}Dernières places pour ${titre} !`,
        '',
        `${maj(datesEnClair(ouvertes.length ? ouvertes : reps))}, ${lieu}.`,
        '',
        `${e('🎟️')}Réservez vite : ${lien}${tel ? ` · ${tel}` : ''}`,
        '',
        motsDiese(s),
      ].join('\n')
    case 'ce-soir': {
      const r = ceSoir ?? premier
      const quand = r ? `${ceSoir ? 'Ce soir' : maj(dateLongue(local(r.dateHeure).date))}${r.heureAConfirmer ? '' : ` à ${heureLisible(local(r.dateHeure).heure)}`}` : 'Ce soir'
      return [
        `${e('✨')}${quand} : ${titre}`,
        par.trim(),
        '',
        r?.statut === 'complet' ? 'Complet ce soir : appelez la billetterie, des places se libèrent parfois.' : `Il reste des places : ${lien}${tel ? ` · ${tel}` : ''}`,
        `${e('📍')}${lieu}`,
        '',
        motsDiese(s),
      ].join('\n')
    }
    case 'complet': {
      const complets = reps.filter((r) => r.statut === 'complet')
      const tout = complets.length === reps.length
      return [
        `${e('❤️')}${titre} affiche complet${!complets.length || tout ? '' : ` le ${datesEnClair(complets)}`} !`,
        '',
        `Merci ! Des places se libèrent parfois : inscrivez-vous sur la liste d’attente${tel ? ` au ${tel}` : ''}${reglages.emailBilletterie ? ` ou à ${reglages.emailBilletterie}` : ''}.`,
        complets.length && ouvertes.length ? `\nEncore des places le ${datesEnClair(ouvertes)} : ${lien}` : '',
        '',
        motsDiese(s),
      ]
        .join('\n')
        .replace(/\n{3,}/g, '\n\n')
    }
    case 'story':
      return [titre, premier ? `${datesEnClair([premier])}${reps.length > 1 ? ` (+${reps.length - 1})` : ''}` : '', 'Billets en lien'].filter(Boolean).join('\n')
  }
}
