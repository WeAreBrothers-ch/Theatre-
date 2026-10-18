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
import {DocumentsIcon} from '@sanity/icons/Documents'
import {DocumentTextIcon} from '@sanity/icons/DocumentText'
import {SparklesIcon} from '@sanity/icons/Sparkles'
import {PinIcon} from '@sanity/icons/Pin'
import {BillIcon} from '@sanity/icons/Bill'
import {UsersIcon} from '@sanity/icons/Users'
import {HeartIcon} from '@sanity/icons/Heart'
import {StackIcon} from '@sanity/icons/Stack'
import {EditIcon} from '@sanity/icons/Edit'
import {ThListIcon} from '@sanity/icons/ThList'
import {EyeClosedIcon} from '@sanity/icons/EyeClosed'
import {API_VERSION, CATEGORIES_RENDEZ_VOUS, GROUPES_EQUIPE, TYPES_PARTENAIRES} from './lib/constantes'

/*
 * Le menu du Studio, dans l'ordre du travail de l'équipe : d'abord le programme, puis les
 * pages du site, la presse, les listes de référence, les messages et les réglages.
 *
 * Les listes « À venir », « Complets »… se mettent à jour seules avec les dates : rien n'est
 * à ranger à la main, ni au changement de saison.
 */

const AVENIR = 'count(representations[dateHeure >= now()]) > 0'
const COURANTE = 'saison->courante == true'

export const structure: StructureResolver = (S) => {
  const listeSpectacles = (titre: string, filtre: string, ordre: 'asc' | 'desc' = 'asc', params: Record<string, unknown> = {}) =>
    S.documentList()
      .title(titre)
      .apiVersion(API_VERSION)
      .schemaType('spectacle')
      .filter(`_type == "spectacle" && ${filtre}`)
      .params(params)
      .defaultOrdering([{field: 'representations[0].dateHeure', direction: ordre}])

  const parListe = (type: string, titre: string, champ: string, liste: {title: string; value: string}[], tri: {field: string; direction: 'asc' | 'desc'}[]) =>
    S.list()
      .title(titre)
      .items([
        S.listItem().title('Tout').icon(ThListIcon).child(S.documentTypeList(type).title(titre).defaultOrdering(tri)),
        S.divider(),
        ...liste.map((x) =>
          S.listItem()
            .id(`${type}-${x.value}`)
            .title(x.title)
            .child(S.documentList().title(x.title).apiVersion(API_VERSION).schemaType(type).filter(`_type == $type && ${champ} == $valeur`).params({type, valeur: x.value}).defaultOrdering(tri)),
        ),
      ])

  return S.list()
    .title('Contenu')
    .items([
      S.listItem()
        .id('programme')
        .title('Programme')
        .icon(CalendarIcon)
        .child(
          S.list()
            .title('Programme')
            .items([
              S.listItem().id('a-venir').title('À venir').icon(ClockIcon).child(listeSpectacles('À venir', AVENIR)),
              S.listItem()
                .id('complets')
                .title('Complets')
                .icon(WarningOutlineIcon)
                .child(listeSpectacles('Complets', `${AVENIR} && count(representations[dateHeure >= now() && statut != "complet" && statut != "annule"]) == 0`)),
              S.listItem()
                .id('a-completer')
                .title('À compléter')
                .icon(EditIcon)
                .child(
                  listeSpectacles(
                    'À compléter',
                    `${AVENIR} && (!defined(visuel.asset) || !defined(visuel.alt) || !defined(accroche) || !defined(texte) || !defined(duree) || !defined(age) || !defined(distribution) || count(representations[heureAConfirmer == true]) > 0)`,
                  ),
                ),
              S.divider(),
              S.listItem().id('jeune-public').title('Jeune public').icon(StarIcon).child(listeSpectacles('Jeune public', `genre == "jeune-public" && ${COURANTE}`)),
              S.listItem().id('midi-theatre').title('Midi théâtre').icon(StarIcon).child(listeSpectacles('Midi théâtre', `"midi-theatre" in etiquettes && ${COURANTE}`)),
              S.listItem().id('saison-musicale').title('Saison musicale classique').icon(StarIcon).child(listeSpectacles('Saison musicale classique', `"saison-musicale" in etiquettes && ${COURANTE}`)),
              S.listItem().id('passes-saison').title('Passés cette saison').icon(ArchiveIcon).child(listeSpectacles('Passés cette saison', `!(${AVENIR}) && ${COURANTE}`, 'desc')),
              S.listItem().id('caches').title('Cachés du site').icon(EyeClosedIcon).child(listeSpectacles('Cachés du site', 'masque == true')),
              S.divider(),
              S.listItem()
                .id('par-saison')
                .title('Par saison (archives)')
                .icon(StackIcon)
                .child(
                  S.documentTypeList('saison')
                    .title('Saisons')
                    .defaultOrdering([{field: 'debut', direction: 'desc'}])
                    .child((saisonId) =>
                      S.documentList()
                        .title('Spectacles de la saison')
                        .apiVersion(API_VERSION)
                        .schemaType('spectacle')
                        .filter('_type == "spectacle" && saison._ref == $saison')
                        .params({saison: saisonId})
                        .defaultOrdering([{field: 'representations[0].dateHeure', direction: 'asc'}]),
                    ),
                ),
              S.listItem().id('tous').title('Tous les spectacles').icon(CalendarIcon).child(listeSpectacles('Tous les spectacles', 'true', 'desc')),
              S.documentTypeListItem('saison').title('Saisons').icon(StackIcon),
            ]),
        ),
      S.listItem()
        .id('rendez-vous')
        .title('Rendez-vous')
        .icon(SparklesIcon)
        .child(parListe('rendezVous', 'Rendez-vous', 'categorie', CATEGORIES_RENDEZ_VOUS, [{field: 'debut', direction: 'desc'}])),
      S.divider(),
      S.listItem().id('accueil').title('Accueil').icon(HomeIcon).child(S.document().schemaType('accueil').documentId('accueil').title('Accueil')),
      S.listItem()
        .id('pages')
        .title('Pages')
        .icon(DocumentsIcon)
        .child(S.documentTypeList('page').title('Pages').defaultOrdering([{field: 'titre', direction: 'asc'}])),
      S.listItem()
        .id('presse')
        .title('La presse en parle')
        .icon(DocumentTextIcon)
        .child(S.documentTypeList('articlePresse').title('La presse en parle').defaultOrdering([{field: 'date', direction: 'desc'}])),
      S.divider(),
      S.documentTypeListItem('lieu').title('Lieux et salles').icon(PinIcon),
      S.documentTypeListItem('grilleTarifaire').title('Tarifs').icon(BillIcon),
      S.listItem().id('equipe').title('Équipe').icon(UsersIcon).child(parListe('personne', 'Équipe', 'groupe', GROUPES_EQUIPE, [{field: 'ordre', direction: 'asc'}])),
      S.listItem().id('partenaires').title('Partenaires').icon(HeartIcon).child(parListe('partenaire', 'Partenaires', 'type', TYPES_PARTENAIRES, [{field: 'ordre', direction: 'asc'}])),
      S.divider(),
      S.listItem()
        .id('messages')
        .title('Messages reçus')
        .icon(EnvelopeIcon)
        .child(
          S.list()
            .title('Messages reçus')
            .items([
              S.listItem()
                .id('messages-nouveaux')
                .title('Nouveaux')
                .icon(InboxIcon)
                .child(S.documentList().title('Nouveaux messages').apiVersion(API_VERSION).schemaType('message').filter('_type == "message" && statut == "nouveau"').defaultOrdering([{field: 'recuLe', direction: 'desc'}])),
              S.listItem()
                .id('messages-lettre')
                .title('Inscriptions à la lettre')
                .icon(EnvelopeIcon)
                .child(
                  S.documentList()
                    .title('Inscriptions à la lettre')
                    .apiVersion(API_VERSION)
                    .schemaType('message')
                    .filter('_type == "message" && sujet match "lettre*"')
                    .defaultOrdering([{field: 'recuLe', direction: 'desc'}]),
                ),
              S.listItem()
                .id('messages-traites')
                .title('Traités')
                .icon(CheckmarkCircleIcon)
                .child(S.documentList().title('Messages traités').apiVersion(API_VERSION).schemaType('message').filter('_type == "message" && statut == "traite"').defaultOrdering([{field: 'recuLe', direction: 'desc'}])),
            ]),
        ),
      S.divider(),
      S.listItem().id('reglages').title('Réglages du site').icon(CogIcon).child(S.document().schemaType('reglages').documentId('reglages').title('Réglages du site')),
    ])
}
