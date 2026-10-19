import {stegaClean} from 'next-sanity'
import type {ComponentType} from 'react'
import {slugifier} from '@/lib/constantes'
import type {Section} from '@/sanity/types'
import {SectionAcces, SectionContact, SectionLettre, SectionTarifs} from './Pratiques'
import {SectionAffiches, SectionAgenda, nombreAgenda} from './Programme'
import {estAVenir} from '@/lib/spectacles'
import {SectionAppel, SectionCitation, SectionEquipe, SectionFaq, SectionFormules, SectionFrise, SectionGalerie, SectionInfos, SectionTexte} from './Simples'
import type {Contexte, ProprietesSection} from './types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const COMPOSANTS: Record<string, ComponentType<ProprietesSection<any>>> = {
  sectionTexte: SectionTexte,
  sectionInfos: SectionInfos,
  sectionTarifs: SectionTarifs,
  sectionCitation: SectionCitation,
  sectionFrise: SectionFrise,
  sectionGalerie: SectionGalerie,
  sectionEquipe: SectionEquipe,
  sectionFormules: SectionFormules,
  sectionAcces: SectionAcces,
  sectionAppel: SectionAppel,
  sectionAffiches: SectionAffiches,
  sectionAgenda: SectionAgenda,
  sectionFaq: SectionFaq,
  sectionContact: SectionContact,
  sectionLettre: SectionLettre,
}

/** Les sections d'une page, dans l'ordre choisi dans le Studio. */
export function Sections({sections, contexte}: {sections?: Section[] | null; contexte: Omit<Contexte, 'dejaMontres'>}) {
  if (!sections?.length) return null
  const utilises = new Set<string>()
  // Les spectacles listés par un agenda ne se répètent pas dans le mur d'affiches qui suit.
  const montres = new Set<string>()
  const aVenir = contexte.spectacles.filter(estAVenir)
  return (
    <>
      {sections.map((section) => {
        const Composant = COMPOSANTS[section._type]
        if (!Composant) return null
        // L'ancre : celle choisie dans le Studio, sinon le titre de la section.
        let id = slugifier(stegaClean(section.ancre) || stegaClean(section.titre) || section._type.replace('section', ''))
        if (utilises.has(id)) id = `${id}-${section._key.slice(0, 4)}`
        utilises.add(id)
        const ctx: Contexte = {...contexte, dejaMontres: new Set(montres)}
        if (section._type === 'sectionAgenda') aVenir.slice(0, nombreAgenda(section)).forEach((s) => montres.add(s.slug))
        return <Composant key={section._key} section={section} id={id} titreId={`titre-${section._key}`} contexte={ctx} />
      })}
    </>
  )
}
