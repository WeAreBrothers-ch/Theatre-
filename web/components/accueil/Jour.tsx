import Link from 'next/link'
import {dateLongue, heure, moment} from '@/lib/dates'
import type {Spectacle} from '@/lib/spectacles'
import {lienTel, typo} from '@/lib/typo'

/** Le bandeau du jour : ce soir au théâtre, ou le prochain lever de rideau. */
export function Jour({spectacles, instant, tel}: {spectacles: Spectacle[]; instant: Date; tel?: string | null}) {
  const aujourdhui = moment(instant.toISOString()).cleJour
  const ceSoir = spectacles
    .flatMap((s) => s.aVenir.filter((r) => r.statut !== 'annule' && moment(r.iso).cleJour === aujourdhui).map((r) => ({s, r})))
    .sort((a, b) => a.r.iso.localeCompare(b.r.iso))[0]
  const prochain = ceSoir ?? spectacles.flatMap((s) => s.aVenir.filter((r) => r.statut !== 'annule').map((r) => ({s, r}))).sort((a, b) => a.r.iso.localeCompare(b.r.iso))[0]
  if (!prochain) return null
  const jour = dateLongue(instant.toISOString())

  return (
    <div className="jour bande" role="note">
      <div className="cadre">
        <p>
          <span className="jour__point" aria-hidden="true" />
          <span>
            {ceSoir ? (
              <>
                {typo(`Aujourd’hui, ${jour} : `)}
                <Link href={`/spectacles/${prochain.s.slug}`}>
                  {typo(prochain.s.titre)} à {heure(prochain.r.iso)}
                </Link>
                {prochain.s.lieu ? `, ${prochain.s.lieu}` : ''}
              </>
            ) : (
              <>
                {typo(`${jour.charAt(0).toUpperCase()}${jour.slice(1)}, relâche. Prochain lever de rideau : `)}
                <Link href={`/spectacles/${prochain.s.slug}`}>
                  {typo(prochain.s.titre)}, {dateLongue(prochain.r.iso)} à {heure(prochain.r.iso)}
                </Link>
              </>
            )}
          </span>
        </p>
        {tel && (
          <p className="jour__tel">
            Billetterie{' '}
            <a href={lienTel(tel)}>
              <strong className="chiffres">{tel}</strong>
            </a>
          </p>
        )}
      </div>
    </div>
  )
}
