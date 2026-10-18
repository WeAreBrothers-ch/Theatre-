import Link from 'next/link'
import {Fleche} from '@/components/Icones'

export default function Introuvable() {
  return (
    <section className="introuvable bande">
      <div className="cadre">
        <p className="t-label">Erreur 404</p>
        <h1 className="t-affiche t-xxl">Relâche</h1>
        <p>Cette page n’est pas (ou plus) à l’affiche. Le spectacle a peut-être changé d’adresse.</p>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: 10}}>
          <Link className="btn btn--plein" href="/programme">
            Le programme <Fleche />
          </Link>
          <Link className="btn btn--trait" href="/">
            Accueil
          </Link>
        </div>
      </div>
    </section>
  )
}
