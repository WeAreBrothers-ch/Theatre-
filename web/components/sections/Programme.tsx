import Link from 'next/link'
import {stegaClean} from 'next-sanity'
import {GENRES} from '@/lib/constantes'
import {estAVenir, versCarte, type Spectacle} from '@/lib/spectacles'
import {Affiche} from '../Affiche'
import {Fleche} from '../Icones'
import {Ligne} from '../Ligne'
import {Rubrique} from '../Rubrique'
import {FiltreMur} from '../accueil/FiltreMur'
import type {ProprietesSection, SectionAffiches as TAffiches, SectionAgenda as TAgenda} from './types'

const pluriel = (n: number, mot: string) => `${n} ${mot}${n > 1 ? 's' : ''}`

export const nombreAgenda = (section: TAgenda) => Math.max(2, Math.min(20, Number(stegaClean(section.nombre)) || 6))

export function SectionAgenda({section, id, titreId, contexte}: ProprietesSection<TAgenda>) {
  const aVenir = contexte.spectacles.filter(estAVenir)
  const liste = aVenir.slice(0, nombreAgenda(section))
  if (!liste.length) return null
  const lien = (
    <Link className="lien-fleche" href="/programme">
      Toute la saison, {pluriel(aVenir.length, 'spectacle')} <Fleche />
    </Link>
  )
  return (
    <section className="section bande" id={id} aria-labelledby={titreId}>
      <div className="cadre">
        <Rubrique surtitre={section.surtitre} titre={section.titre || 'Prochainement'} id={titreId} action={lien} />
        <div className="agenda agenda--court">
          {liste.map((s) => (
            <Ligne key={s.id} carte={versCarte(s)} />
          ))}
        </div>
      </div>
    </section>
  )
}

/**
 * Le mur d'affiches. Avec les filtres, chaque affiche porte la liste des filtres
 * dans lesquels elle figure parmi les N premières : le tri se fait sans recharger.
 */
export function SectionAffiches({section, id, titreId, contexte}: ProprietesSection<TAffiches>) {
  const genre = stegaClean(section.genre)
  const etiquette = stegaClean(section.etiquette)
  const nombre = Math.max(2, Math.min(40, Number(stegaClean(section.nombre)) || 8))
  const quand = stegaClean(section.quand) || (section.inclurePasses ? 'tous' : 'avenir')
  const garder = (s: Spectacle) => (quand === 'tous' ? true : quand === 'passes' ? !estAVenir(s) : estAVenir(s))

  let base: Spectacle[] = contexte.spectacles.filter((s) => garder(s) && (!genre || s.genre === genre) && (!etiquette || s.etiquettes.includes(etiquette)))
  // Les spectacles passés : du plus récent au plus ancien.
  if (quand === 'passes') base = [...base].reverse()
  // Sans filtre de genre, on saute les spectacles déjà listés dans l'agenda au-dessus.
  if (!genre && !etiquette && quand === 'avenir') {
    const sansDoublon = base.filter((s) => !contexte.dejaMontres.has(s.slug))
    if (sansDoublon.length >= Math.min(4, nombre)) base = sansDoublon
  }
  if (!base.length) return null

  const filtres = section.filtres && !genre
  const lien =
    quand === 'passes' ? null : (
      <Link className="lien-fleche" href={genre ? `/programme#${genre}` : '/programme'}>
        Tout le programme <Fleche />
      </Link>
    )

  if (!filtres) {
    const liste = base.slice(0, nombre)
    return (
      <section className="section bande" id={id} aria-labelledby={titreId}>
        <div className="cadre">
          <Rubrique surtitre={section.surtitre} titre={section.titre} texte={section.texte} id={titreId} action={lien} />
          <div className={`mur mur--court${liste.length === 5 ? ' mur--5' : ''}`}>
            {liste.map((s) => (
              <Affiche key={s.id} carte={versCarte(s)} />
            ))}
          </div>
        </div>
      </section>
    )
  }

  const cles = ['tout', ...GENRES.map((g) => g.value)]
  const dans = new Map<string, string[]>()
  const compte: Record<string, number> = {}
  for (const cle of cles) {
    const choisis = base.filter((s) => cle === 'tout' || s.genre === cle)
    compte[cle] = choisis.length
    for (const s of choisis.slice(0, nombre)) dans.set(s.slug, [...(dans.get(s.slug) ?? []), cle])
  }
  const visibles = base.filter((s) => dans.has(s.slug))
  const boutons = [{valeur: 'tout', titre: 'Tout', nombre: compte.tout}, ...GENRES.filter((g) => compte[g.value]).map((g) => ({valeur: g.value, titre: g.title, nombre: compte[g.value]}))]

  return (
    <section className="section bande" id={id} aria-labelledby={titreId}>
      <div className="cadre">
        <Rubrique surtitre={section.surtitre} titre={section.titre} texte={section.texte} id={titreId} action={lien} />
        <FiltreMur filtres={boutons} classeMur="mur mur--court">
          {visibles.map((s) => (
            <div key={s.id} data-dans={dans.get(s.slug)!.join(' ')}>
              <Affiche carte={versCarte(s)} />
            </div>
          ))}
        </FiltreMur>
      </div>
    </section>
  )
}
