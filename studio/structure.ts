import type {StructureResolver} from 'sanity/structure'
import {CalendarIcon} from '@sanity/icons/Calendar'
import {HomeIcon} from '@sanity/icons/Home'
import {CogIcon} from '@sanity/icons/Cog'
import {EnvelopeIcon} from '@sanity/icons/Envelope'
import {ClockIcon} from '@sanity/icons/Clock'
import {StarIcon} from '@sanity/icons/Star'
import {ArchiveIcon} from '@sanity/icons/Archive'
import {WarningOutlineIcon} from '@sanity/icons/WarningOutline'
import {InboxIcon} from '@sanity/icons/Inbox'
import {CheckmarkCircleIcon} from '@sanity/icons/CheckmarkCircle'
import {API_VERSION} from './lib/constantes'

const AVENIR = 'count(representations[dateHeure >= now()]) > 0'

/*
 * Le menu du Studio, pensé pour l'équipe du théâtre : d'abord le programme,
 * ensuite les pages du site, puis les listes de référence et les réglages.
 */
export const structure: StructureResolver = (S) => {
  const listeSpectacles = (titre: string, filtre: string, ordre: 'asc' | 'desc' = 'asc') =>
    S.documentList()
      .title(titre)
      .apiVersion(API_VERSION)
      .schemaType('spectacle')
      .filter(`_type == "spectacle" && ${filtre}`)
      .defaultOrdering([{field: 'representations[0].dateHeure', direction: ordre}])

  return S.list()
    .title('Contenu')
    .items([
      S.listItem()
        .title('Programme')
        .icon(CalendarIcon)
        .child(
          S.list()
            .title('Programme')
            .items([
              S.listItem().title('À venir').icon(ClockIcon).child(listeSpectacles('À venir', AVENIR)),
              S.listItem().title('Complets').icon(WarningOutlineIcon).child(listeSpectacles('Complets', `${AVENIR} && count(representations[dateHeure >= now() && statut != "complet"]) == 0`)),
              S.listItem().title('Jeune public').icon(StarIcon).child(listeSpectacles('Jeune public', `genre == "jeune-public"`)),
              S.listItem().title('Midi théâtre').icon(StarIcon).child(listeSpectacles('Midi théâtre', `"midi-theatre" in etiquettes`)),
              S.listItem().title('Passés').icon(ArchiveIcon).child(listeSpectacles('Passés', `!(${AVENIR})`, 'desc')),
              S.divider(),
              S.listItem().title('Tous les spectacles').icon(CalendarIcon).child(listeSpectacles('Tous les spectacles', 'true')),
              S.documentTypeListItem('saison').title('Saisons'),
            ]),
        ),
      S.divider(),
      S.listItem().title('Accueil').icon(HomeIcon).child(S.document().schemaType('accueil').documentId('accueil').title('Accueil')),
      S.documentTypeListItem('page').title('Pages'),
      S.divider(),
      S.documentTypeListItem('lieu').title('Lieux et salles'),
      S.documentTypeListItem('grilleTarifaire').title('Tarifs'),
      S.documentTypeListItem('personne').title('Équipe'),
      S.documentTypeListItem('partenaire').title('Partenaires'),
      S.divider(),
      S.listItem()
        .title('Messages reçus')
        .icon(EnvelopeIcon)
        .child(
          S.list()
            .title('Messages reçus')
            .items([
              S.listItem()
                .title('Nouveaux')
                .icon(InboxIcon)
                .child(S.documentList().title('Nouveaux messages').apiVersion(API_VERSION).schemaType('message').filter('_type == "message" && statut == "nouveau"').defaultOrdering([{field: 'recuLe', direction: 'desc'}])),
              S.listItem()
                .title('Traités')
                .icon(CheckmarkCircleIcon)
                .child(S.documentList().title('Messages traités').apiVersion(API_VERSION).schemaType('message').filter('_type == "message" && statut == "traite"').defaultOrdering([{field: 'recuLe', direction: 'desc'}])),
            ]),
        ),
      S.divider(),
      S.listItem().title('Réglages du site').icon(CogIcon).child(S.document().schemaType('reglages').documentId('reglages').title('Réglages du site')),
    ])
}
