import type {Site} from '@/sanity/types'
import {hrefPropre} from './liens'
import type {Spectacle} from './spectacles'

/*
 * La billetterie en ligne est celle d'Infomaniak, comme sur le site actuel : chaque spectacle
 * a son adresse dans la boutique de la saison ; à défaut, la boutique de la saison en cours,
 * puis le lien général des Réglages. Ces liens s'ouvrent dans un nouvel onglet : le site du TBB
 * reste ouvert derrière.
 */
export const boutique = (site: Site): string | null => hrefPropre(site.saison?.boutique) || hrefPropre(site.reglages?.lienBilletterie)

export const lienReservation = (s: Spectacle, site: Site): string | null => s.lienBilletterie || boutique(site)

/** Formulaire de liste d'attente (Brevo) du spectacle, sinon celui des Réglages. */
export const lienListeAttente = (s: Spectacle, site: Site): string | null => s.lienListeAttente || hrefPropre(site.reglages?.lienListeAttente)

export const NOUVEL_ONGLET = {target: '_blank', rel: 'noopener noreferrer'} as const
