import {stegaClean} from 'next-sanity'
import type {Lien, Site} from '@/sanity/types'
import {hrefLien} from '@/lib/liens'
import {lienTel, typo} from '@/lib/typo'
import {LienSite} from './LienSite'

/** Le pied de page : la façade du théâtre et ses trois arches. */
export function PiedDePage({site}: {site: Site}) {
  const r = site.reglages ?? {}
  const reseaux = [
    {titre: 'Instagram', href: stegaClean(r.instagram)},
    {titre: 'Facebook', href: stegaClean(r.facebook)},
    {titre: 'LinkedIn', href: stegaClean(r.linkedin)},
  ].filter((x): x is {titre: string; href: string} => !!x.href)

  // « PDF du programme » : le fichier de la saison rangé dans Sanity, pas l'ancienne adresse Wix
  // (elle disparaîtra avec l'ancien site).
  const pdfSaison = stegaClean(site.saison?.programmePdf)
  const adresse = (l: Lien) => {
    const href = hrefLien(l)
    return pdfSaison && href && /pdf/i.test(stegaClean(l.titre) ?? '') ? pdfSaison : href
  }

  // Sur téléphone, les colonnes deviennent une seule ligne de liens, sans doublon :
  // les deux premiers de chaque colonne, pour que le pied de page reste court.
  const liensMobiles: {titre: string; href: string}[] = []
  for (const col of r.colonnesPied ?? []) {
    for (const l of (col.liens ?? []).slice(0, 2)) {
      const href = adresse(l)
      if (href && l.titre && !liensMobiles.some((x) => x.href === href)) liensMobiles.push({titre: l.titre, href})
    }
  }

  return (
    <footer className="facade" id="pied-de-page">
      <svg className="facade__arches" viewBox="0 0 1300 276" preserveAspectRatio="xMidYMax meet" aria-hidden="true" focusable="false">
        <path d="M0 276A215 215 0 0 1 410.01 185.47A248 248 0 0 1 889.99 185.47A215 215 0 0 1 1300 276Z" />
        {/* Le contour des arches, tracé seulement quand la page finit déjà en vert (globals.css). */}
        <path className="facade__contour" d="M0 276A215 215 0 0 1 410.01 185.47A248 248 0 0 1 889.99 185.47A215 215 0 0 1 1300 276" />
      </svg>
      <div className="facade__corps bande">
        <div className="cadre">
          <div className="facade__grille">
            <div className="facade__adresse">
              {r.rue && <p className="t-affiche">{r.rue}</p>}
              {r.localite && <p className="facade__ville">{r.localite}</p>}
              {(r.accesTrain || r.accesBus) && (
                <p className="facade__transports">
                  {typo(r.accesTrain)}
                  {r.accesTrain && r.accesBus && <br />}
                  {typo(r.accesBus)}
                </p>
              )}
              <p className="facade__contacts">
                {r.telBilletterie && (
                  <span>
                    Billetterie <a className="chiffres" href={lienTel(stegaClean(r.telBilletterie))}>{r.telBilletterie}</a>
                  </span>
                )}
                {r.telAdmin && (
                  <span>
                    Administration <a className="chiffres" href={lienTel(stegaClean(r.telAdmin))}>{r.telAdmin}</a>
                  </span>
                )}
                {r.emailGeneral && <a href={`mailto:${stegaClean(r.emailGeneral)}`}>{r.emailGeneral}</a>}
              </p>
            </div>
            {(r.colonnesPied ?? []).map((col) => (
              <div key={col._key} className="facade__colonne">
                {col.titre && <h2>{col.titre}</h2>}
                <ul>
                  {(col.liens ?? []).map((l) => {
                    const href = adresse(l)
                    return href ? (
                      <li key={l._key}>
                        <LienSite href={href}>{l.titre}</LienSite>
                      </li>
                    ) : null
                  })}
                </ul>
              </div>
            ))}
          </div>
          {liensMobiles.length > 0 && (
            <nav className="facade__liens" aria-label="Liens utiles">
              {liensMobiles.map((l) => (
                <LienSite key={l.href} href={l.href}>
                  {l.titre}
                </LienSite>
              ))}
            </nav>
          )}
          <div className="facade__bas">
            {site.partenaires.length > 0 && (
              <div className="facade__soutiens">
                {site.partenaires.map((p) =>
                  p.url ? (
                    <a key={p._id} href={stegaClean(p.url)} target="_blank" rel="noopener noreferrer">
                      {p.nom}
                    </a>
                  ) : (
                    <span key={p._id}>{p.nom}</span>
                  ),
                )}
              </div>
            )}
            {reseaux.length > 0 && (
              <div className="facade__reseaux">
                {reseaux.map((x) => (
                  <a key={x.href} href={x.href} target="_blank" rel="noopener noreferrer">
                    {x.titre}
                  </a>
                ))}
              </div>
            )}
            <p>
              © {r.nom || 'Théâtre Benno Besson'} {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
