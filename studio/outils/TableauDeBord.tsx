import {useEffect, useMemo, useState, type ReactNode} from 'react'
import {useClient, useCurrentUser, type Tool} from 'sanity'
import {useIntentLink} from 'sanity/router'
import {Badge, Box, Button, Card, Container, Flex, Grid, Heading, Spinner, Stack, Text} from '@sanity/ui'
import {DashboardIcon} from '@sanity/icons/Dashboard'
import {AddIcon} from '@sanity/icons/Add'
import {LaunchIcon} from '@sanity/icons/Launch'
import {API_VERSION, STATUTS, URL_SITE, libelle} from '../lib/constantes'

/*
 * Tableau de bord : la première chose que l'équipe voit en ouvrant le Studio.
 * Les prochaines dates, ce qui reste à compléter, les messages reçus et un mode d'emploi court.
 */

type Donnees = {
  spectacles: {_id: string; titre: string; lieu?: string; dates: {dateHeure: string; statut?: string; lieu?: string}[]}[]
  aCompleter: {_id: string; titre?: string; manque: string[]}[]
  brouillons: {_id: string; _type: string; titre?: string; _updatedAt: string}[]
  messages: {_id: string; sujet?: string; nom?: string; recuLe?: string}[]
  nbMessages: number
  nbSpectacles: number
}

const REQUETE = `{
  "spectacles": *[_type == "spectacle" && !(_id in path("drafts.**"))]{
    _id, titre, "lieu": lieu->nom,
    "dates": representations[dateHeure >= now()]{dateHeure, statut, "lieu": lieu->nom}
  }[count(dates) > 0],
  "aCompleter": *[_type == "spectacle" && !(_id in path("drafts.**")) && count(representations[dateHeure >= now()]) > 0]{
    _id, titre,
    "manque": [
      select(!defined(visuel.asset) => "visuel"),
      select(!defined(accroche) => "accroche"),
      select(count(texte) == 0 || !defined(texte) => "présentation"),
      select(!defined(age) => "public")
    ]
  }[count(manque[@ != null]) > 0],
  "brouillons": *[_id in path("drafts.**") && _type in ["spectacle", "page", "accueil", "reglages"]] | order(_updatedAt desc)[0...6]{
    _id, _type, "titre": coalesce(titre, nom), _updatedAt
  },
  "messages": *[_type == "message" && statut == "nouveau"] | order(recuLe desc)[0...4]{_id, sujet, nom, recuLe},
  "nbMessages": count(*[_type == "message" && statut == "nouveau"]),
  "nbSpectacles": count(*[_type == "spectacle" && !(_id in path("drafts.**"))])
}`

const fmtJour = new Intl.DateTimeFormat('fr-CH', {timeZone: 'Europe/Zurich', weekday: 'long', day: 'numeric', month: 'long'})
const fmtCourt = new Intl.DateTimeFormat('fr-CH', {timeZone: 'Europe/Zurich', weekday: 'short', day: '2-digit', month: '2-digit'})
const fmtHeure = new Intl.DateTimeFormat('fr-CH', {timeZone: 'Europe/Zurich', hour: '2-digit', minute: '2-digit'})

const TONS: Record<string, 'positive' | 'critical' | 'caution' | 'default'> = {
  'en-vente': 'positive',
  complet: 'critical',
  'liste-attente': 'caution',
  annule: 'default',
}

const NOMS_TYPES: Record<string, string> = {spectacle: 'Spectacle', page: 'Page', accueil: 'Accueil', reglages: 'Réglages'}

function Lien({id, type, children}: {id: string; type: string; children: ReactNode}) {
  const {href, onClick} = useIntentLink({intent: 'edit', params: {id: id.replace(/^drafts\./, ''), type}})
  return (
    <Card as="a" href={href} onClick={onClick} padding={3} radius={2} tone="default" style={{textDecoration: 'none'}}>
      {children}
    </Card>
  )
}

function BoutonIntention({intent, params, ...props}: {intent: 'edit' | 'create'; params: Record<string, string>; text: string; tone?: 'primary'; mode?: 'ghost'; icon?: typeof AddIcon}) {
  const {href, onClick} = useIntentLink({intent, params})
  return <Button as="a" href={href} onClick={onClick} {...props} />
}

function Bloc({titre, compteur, children}: {titre: string; compteur?: number; children: ReactNode}) {
  return (
    <Card padding={4} radius={3} border>
      <Stack gap={4}>
        <Flex align="center" gap={2}>
          <Heading as="h2" size={1}>{titre}</Heading>
          {typeof compteur === 'number' && compteur > 0 ? <Badge tone="primary">{compteur}</Badge> : null}
        </Flex>
        {children}
      </Stack>
    </Card>
  )
}

const GUIDE: {titre: string; etapes: string[]}[] = [
  {
    titre: 'Ajouter un spectacle',
    etapes: [
      'Cliquez sur « Nouveau spectacle » ci-dessus.',
      'Onglet Essentiel : titre, artistes, genre, visuel et une accroche de deux phrases.',
      'Onglet Dates et billets : ajoutez une ligne par représentation et choisissez la salle.',
      'Cliquez sur « Publier » en bas à droite. Le spectacle apparaît sur le site dans le quart d’heure.',
    ],
  },
  {
    titre: 'Indiquer qu’une date est complète',
    etapes: [
      'Ouvrez le spectacle, onglet Dates et billets.',
      'Cliquez sur la date et choisissez « Complet » (ou « Liste d’attente »).',
      'Publiez : le bandeau « Complet » se colle sur l’affiche du site.',
    ],
  },
  {
    titre: 'Changer les spectacles mis en avant sur l’accueil',
    etapes: [
      'Ouvrez « Accueil » dans le menu Contenu.',
      'Dans « À l’affiche », ajoutez ou retirez des spectacles et réordonnez-les avec la poignée.',
      'Laissez la liste vide pour afficher automatiquement les trois prochains spectacles.',
    ],
  },
  {
    titre: 'Modifier une page (Billetterie, Le théâtre, Contact…)',
    etapes: [
      'Ouvrez « Pages », puis la page voulue.',
      'Chaque bloc de la page est une section : modifiez-la, déplacez-la ou ajoutez-en une avec « Ajouter un élément ».',
      'Ouvrez « Aperçu du site » en haut pour voir la page pendant que vous la modifiez, puis publiez.',
    ],
  },
  {
    titre: 'Changer les horaires de la billetterie ou le menu',
    etapes: [
      'Ouvrez « Réglages du site ».',
      'Onglet Billetterie pour les horaires, Menu pour les entrées du menu, Annonce pour un bandeau urgent en haut du site.',
    ],
  },
]

function TableauDeBord() {
  const client = useClient({apiVersion: API_VERSION})
  const utilisateur = useCurrentUser()
  const [donnees, setDonnees] = useState<Donnees | null>(null)
  const [erreur, setErreur] = useState<string | null>(null)

  useEffect(() => {
    let actif = true
    client
      .fetch<Donnees>(REQUETE)
      .then((d) => actif && setDonnees(d))
      .catch((e: Error) => actif && setErreur(e.message))
    return () => {
      actif = false
    }
  }, [client])

  const prochaines = useMemo(() => {
    if (!donnees) return []
    return donnees.spectacles
      .flatMap((s) => s.dates.map((d) => ({...d, _id: s._id, titre: s.titre, lieu: d.lieu || s.lieu})))
      .sort((a, b) => a.dateHeure.localeCompare(b.dateHeure))
      .slice(0, 8)
  }, [donnees])

  const prenom = utilisateur?.name?.split(' ')[0]

  return (
    <Box padding={[3, 4, 5]} style={{overflow: 'auto', height: '100%'}}>
      <Container width={3}>
        <Stack gap={5}>
          <Stack gap={3}>
            <Text muted size={1} style={{textTransform: 'capitalize'}}>{fmtJour.format(new Date())}</Text>
            <Heading as="h1" size={4}>{prenom ? `Bonjour ${prenom}` : 'Bonjour'}</Heading>
            <Text muted>Voici ce qui se passe au théâtre. Cliquez sur une ligne pour la modifier.</Text>
          </Stack>

          <Flex gap={3} wrap="wrap">
            <BoutonIntention intent="create" params={{type: 'spectacle'}} icon={AddIcon} text="Nouveau spectacle" tone="primary" />
            <BoutonIntention intent="edit" params={{id: 'accueil', type: 'accueil'}} text="Modifier l’accueil" mode="ghost" />
            <BoutonIntention intent="edit" params={{id: 'reglages', type: 'reglages'}} text="Horaires et réglages" mode="ghost" />
            <Button as="a" href={URL_SITE} target="_blank" rel="noreferrer" icon={LaunchIcon} text="Voir le site" mode="ghost" />
          </Flex>

          {erreur ? (
            <Card padding={4} radius={3} tone="critical">
              <Text>Impossible de charger le tableau de bord : {erreur}</Text>
            </Card>
          ) : !donnees ? (
            <Flex padding={5} justify="center"><Spinner muted /></Flex>
          ) : (
            <Grid gridTemplateColumns={[1, 1, 2]} gap={4}>
              <Bloc titre="Prochaines représentations">
                {prochaines.length ? (
                  <Stack gap={2}>
                    {prochaines.map((r) => (
                      <Lien key={r._id + r.dateHeure} id={r._id} type="spectacle">
                        <Flex align="center" gap={3}>
                          <Stack gap={2} style={{minWidth: 96}}>
                            <Text size={1} weight="semibold">{fmtCourt.format(new Date(r.dateHeure))}</Text>
                            <Text size={1} muted>{fmtHeure.format(new Date(r.dateHeure)).replace(':', 'h')}</Text>
                          </Stack>
                          <Stack gap={2} flex={1}>
                            <Text size={2} weight="semibold" textOverflow="ellipsis">{r.titre}</Text>
                            <Text size={1} muted>{r.lieu}</Text>
                          </Stack>
                          <Badge tone={TONS[r.statut || 'en-vente']}>{libelle(STATUTS, r.statut || 'en-vente')}</Badge>
                        </Flex>
                      </Lien>
                    ))}
                  </Stack>
                ) : (
                  <Text muted>Aucune date à venir. Ajoutez un spectacle pour commencer.</Text>
                )}
              </Bloc>

              <Stack gap={4}>
                <Bloc titre="Messages reçus" compteur={donnees.nbMessages}>
                  {donnees.messages.length ? (
                    <Stack gap={2}>
                      {donnees.messages.map((m) => (
                        <Lien key={m._id} id={m._id} type="message">
                          <Stack gap={2}>
                            <Text size={2} weight="semibold">{m.sujet || 'Message'}</Text>
                            <Text size={1} muted>{[m.nom, m.recuLe ? fmtCourt.format(new Date(m.recuLe)) : ''].filter(Boolean).join(' · ')}</Text>
                          </Stack>
                        </Lien>
                      ))}
                    </Stack>
                  ) : (
                    <Text muted>Aucun nouveau message.</Text>
                  )}
                </Bloc>

                <Bloc titre="À compléter" compteur={donnees.aCompleter.length}>
                  {donnees.aCompleter.length ? (
                    <Stack gap={2}>
                      {donnees.aCompleter.slice(0, 6).map((s) => (
                        <Lien key={s._id} id={s._id} type="spectacle">
                          <Stack gap={2}>
                            <Text size={2} weight="semibold">{s.titre || 'Sans titre'}</Text>
                            <Text size={1} muted>Il manque : {s.manque.filter(Boolean).join(', ')}</Text>
                          </Stack>
                        </Lien>
                      ))}
                    </Stack>
                  ) : (
                    <Text muted>Tous les spectacles à venir sont complets côté contenu.</Text>
                  )}
                </Bloc>

                <Bloc titre="Modifications non publiées" compteur={donnees.brouillons.length}>
                  {donnees.brouillons.length ? (
                    <Stack gap={2}>
                      {donnees.brouillons.map((b) => (
                        <Lien key={b._id} id={b._id} type={b._type}>
                          <Flex align="center" justify="space-between" gap={3}>
                            <Text size={2} weight="semibold" textOverflow="ellipsis">{b.titre || NOMS_TYPES[b._type] || 'Document'}</Text>
                            <Badge tone="caution">{NOMS_TYPES[b._type] || b._type}</Badge>
                          </Flex>
                        </Lien>
                      ))}
                      <Text size={1} muted>Ces changements ne sont pas encore visibles sur le site : ouvrez-les et cliquez sur « Publier ».</Text>
                    </Stack>
                  ) : (
                    <Text muted>Tout est publié.</Text>
                  )}
                </Bloc>
              </Stack>
            </Grid>
          )}

          <Bloc titre="Mode d’emploi">
            <Stack gap={3}>
              {GUIDE.map((g) => (
                <Card key={g.titre} padding={3} radius={2} tone="transparent" border>
                  <details>
                    <summary style={{cursor: 'pointer', fontWeight: 600, fontSize: 15}}>{g.titre}</summary>
                    <Box paddingTop={3}>
                      <ol style={{margin: 0, paddingLeft: 20, lineHeight: 1.6, fontSize: 14}}>
                        {g.etapes.map((e) => <li key={e}>{e}</li>)}
                      </ol>
                    </Box>
                  </details>
                </Card>
              ))}
            </Stack>
          </Bloc>

          {donnees ? <Text size={1} muted>{donnees.nbSpectacles} spectacles dans le Studio.</Text> : null}
        </Stack>
      </Container>
    </Box>
  )
}

export const tableauDeBord: Tool = {
  name: 'tableau-de-bord',
  title: 'Tableau de bord',
  icon: DashboardIcon,
  component: TableauDeBord,
}
