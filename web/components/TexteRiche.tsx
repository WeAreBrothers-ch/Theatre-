import Link from 'next/link'
import {PortableText, stegaClean, type PortableTextComponents} from 'next-sanity'
import type {Bloc} from '@/sanity/types'
import {NOUVEL_ONGLET, sortDuSite} from '@/lib/liens'
import {typo} from '@/lib/typo'

const composants: PortableTextComponents = {
  block: {
    normal: ({children}) => <p>{children}</p>,
    h3: ({children}) => <h3>{children}</h3>,
    blockquote: ({children}) => <blockquote>{children}</blockquote>,
  },
  list: {
    bullet: ({children}) => <ul>{children}</ul>,
    number: ({children}) => <ol>{children}</ol>,
  },
  marks: {
    link: ({value, children}) => {
      const href = stegaClean((value as {href?: string} | undefined)?.href) ?? ''
      if (!href) return <>{children}</>
      if (sortDuSite(href))
        return (
          <a href={href} {...NOUVEL_ONGLET}>
            {children}
            <span className="visuellement-cache"> (nouvel onglet)</span>
          </a>
        )
      if (href.startsWith('/')) return <Link href={href}>{children}</Link>
      return <a href={href}>{children}</a>
    },
  },
}

/** Espaces fines de la typographie française, appliquées au texte de chaque bloc. */
function avecTypo(blocs: Bloc[]): Bloc[] {
  return blocs.map((bloc) =>
    Array.isArray(bloc.children)
      ? {...bloc, children: (bloc.children as {text?: unknown}[]).map((c) => (typeof c.text === 'string' ? {...c, text: typo(c.text)} : c))}
      : bloc,
  )
}

/** Texte mis en forme dans le Studio (paragraphes, intertitres, listes, liens). */
export function TexteRiche({valeur, className}: {valeur?: Bloc[] | null; className?: string}) {
  if (!valeur?.length) return null
  return (
    <div className={['texte-riche', className ?? ''].filter(Boolean).join(' ')}>
      <PortableText value={avecTypo(valeur)} components={composants} />
    </div>
  )
}
