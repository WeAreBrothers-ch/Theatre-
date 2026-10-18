import {useMemo, type ReactNode} from 'react'
import {useCurrentUser, useWorkspace, type Tool} from 'sanity'
import {useIntentLink, useRouter} from 'sanity/router'
import {Badge, Box, Button, Card, Container, Flex, Grid, Heading, Spinner, Stack, Text} from '@sanity/ui'
import {Menu, MenuButton, MenuItem} from '@sanity/ui/menu'
import {DashboardIcon} from '@sanity/icons/Dashboard'
import {AddIcon} from '@sanity/icons/Add'
import {LaunchIcon} from '@sanity/icons/Launch'
import {CalendarIcon} from '@sanity/icons/Calendar'
import {ChevronDownIcon} from '@sanity/icons/ChevronDown'
import {CheckmarkCircleIcon} from '@sanity/icons/CheckmarkCircle'
import {URL_SITE} from '../lib/constantes'
import {aujourdhui, dateLongue, heureLisible, local, plusJours} from '../lib/temps'
import {useRequete} from './commun/donnees'
import {BoutonsStatut, Pastille} from './commun/statuts'
import {pointsDeLaFiche} from '../composants/EtatFiche'
import {useAgenda, type RepAgenda} from './agenda/modele'
import {MegaphoneIcon} from './communication/icones'

/*
 * Le tableau de bord : la première chose que l'équipe voit en ouvrant le Studio.
 *
 * - La semaine qui vient, avec l'état de chaque date en un clic (publié aussitôt).
 * - « À faire » : tout ce que le Studio repère seul (fiches incomplètes, heures à confirmer,
 *   salles prises deux fois, brouillons oubliés, messages, bandeau expiré, fin de saison…).
 * - Les raccourcis et un mode d'emploi court.
 */

type Donnees = {
  spectacles: {
    _id: string
    titre?: string
    compagnie?: string
    genre?: string
    visuel?: {asset?: unknown; alt?: string}
    accroche?: string
    saison?: unknown
    lieu?: unknown
    representations?: {dateHeure?: string; heureAConfirmer?: boolean; statut?: string}[]
    slug?: {current?: string}
    nbTexte: number
    duree?: string
    age?: string
    tarifs?: unknown
    noteTarifs?: string
    nbDistribution: number
    nbPhotos: number
    lienBilletterie?: string
    masque?: boolean
  }[]
  brouillons: {_id: string; _type: string; titre?: string; _updatedAt: string}[]
  messages: {_id: string; sujet?: string; nom?: string; recuLe?: string}[]
  nbMessages: number
  reglages: {annonce?: {active?: boolean; texte?: string; jusquau?: string}; avis?: {texte?: string; titre?: string; du?: string; au?: string}[]; lienBilletterie?: string; adresseSite?: string} | null
  saison: {_id: string; titre?: string; fin?: string; boutique?: string} | null
  saisonSuivante: {_id: string; titre?: string} | null
  imagesSansDescription: number
}

const REQUETE = /* groq */ `{
  "spectacles": *[_type == "spectacle" && !(_id in path("drafts.**"))]{
    _id, titre, compagnie, genre, visuel{asset, alt}, accroche, saison, lieu, representations, slug,
    "nbTexte": count(texte), duree, age, tarifs, noteTarifs, "nbDistribution": count(distribution), "nbPhotos": count(photos),
    lienBilletterie, masque
  },
  "brouillons": *[_id in path("drafts.**") && _type in ["spectacle", "page", "accueil", "reglages", "rendezVous", "saison", "lieu", "personne", "partenaire", "articlePresse", "grilleTarifaire"]] | order(_updatedAt desc)[0...8]{
    _id, _type, "titre": coalesce(titre, nom), _updatedAt
  },
  "messages": *[_type == "message" && statut == "nouveau" && !(_id in path("drafts.**"))] | order(recuLe desc)[0...4]{_id, sujet, nom, recuLe},
  "nbMessages": count(*[_type == "message" && statut == "nouveau" && !(_id in path("drafts.**"))]),
  "reglages": *[_id == "reglages"][0]{annonce, avis, lienBilletterie, adresseSite},
  "saison": *[_type == "saison" && courante == true && !(_id in path("drafts.**"))][0]{_id, titre, fin, boutique},
  "saisonSuivante": *[_type == "saison" && courante != true && !(_id in path("drafts.**")) && debut > now()] | order(debut asc)[0]{_id, titre},
  "imagesSansDescription": count(*[_type == "spectacle" && !(_id in path("drafts.**")) && defined(visuel.asset) && !defined(visuel.alt) && count(representations[dateHeure >= now()]) > 0])
}`

const NOMS_TYPES: Record<string, string> = {
  spectacle: 'Spectacle',
  page: 'Page',
  accueil: 'Accueil',
  reglages: 'Réglages',
  rendezVous: 'Rendez-vous',
  saison: 'Saison',
  lieu: 'Lieu',
  personne: 'Équipe',
  partenaire: 'Partenaire',
  articlePresse: 'Presse',
  grilleTarifaire: 'Tarifs',
}

const majuscule = (t: string) => t.charAt(0).toUpperCase() + t.slice(1)

const fmtCourt = new Intl.DateTimeFormat('fr-CH', {timeZone: 'Europe/Zurich', weekday: 'short', day: '2-digit', month: '2-digit'})

function Lien({id, type, children, tone}: {id: string; type: string; children: ReactNode; tone?: 'default' | 'caution' | 'critical' | 'primary'}) {
  const {href, onClick} = useIntentLink({intent: 'edit', params: {id: id.replace(/^drafts\./, ''), type}})
  return (
    <Card as="a" href={href} onClick={onClick} padding={3} radius={2} tone={tone ?? 'default'} border style={{textDecoration: 'none', display: 'block'}}>
      {children}
    </Card>
  )
}

function BoutonIntention({intent, params, ...props}: {intent: 'edit' | 'create'; params: Record<string, string>; text: string; tone?: 'primary'; mode?: 'ghost'; icon?: typeof AddIcon}) {
  const {href, onClick} = useIntentLink({intent, params})
  return <Button as="a" href={href} onClick={onClick} style={{textDecoration: 'none'}} {...props} />
}

function MenuNouveau() {
  const router = useRouter()
  const creer = (template: string) => router.navigateIntent('create', {type: 'spectacle', template})
  return (
    <MenuButton
      id="menu-nouveau"
      button={<Button icon={AddIcon} iconRight={ChevronDownIcon} text="Nouveau spectacle" tone="primary" />}
      popover={{portal: true, placement: 'bottom-start'}}
      menu={
        <Menu>
          <MenuItem text="Spectacle" onClick={() => creer('spectacle')} />
          <MenuItem text="Midi théâtre (Salle 1, 12h15, prix unique)" onClick={() => creer('spectacle-midi-theatre')} />
          <MenuItem text="Spectacle jeune public" onClick={() => creer('spectacle-jeune-public')} />
          <MenuItem text="Concert de la saison musicale" onClick={() => creer('spectacle-saison-musicale')} />
        </Menu>
      }
    />
  )
}

function Bloc({titre, compteur, action, children, ton}: {titre: string; compteur?: number; action?: ReactNode; children: ReactNode; ton?: 'caution' | 'default'}) {
  return (
    <Card padding={4} radius={3} border tone={ton ?? 'default'}>
      <Stack gap={4}>
        <Flex align="center" gap={2} justify="space-between">
          <Flex align="center" gap={2}>
            <Heading as="h2" size={1}>
              {titre}
            </Heading>
            {typeof compteur === 'number' && compteur > 0 ? <Badge tone="primary">{compteur}</Badge> : null}
          </Flex>
          {action}
        </Flex>
        {children}
      </Stack>
    </Card>
  )
}

type Tache = {cle: string; ton: 'critical' | 'caution' | 'primary'; titre: string; detail?: string; lien?: {id: string; type: string}; outil?: string}

const GUIDE: {titre: string; etapes: string[]}[] = [
  {
    titre: 'Une date est complète',
    etapes: [
      'Ici même, dans « La semaine », ou dans l’onglet Agenda : cliquez sur « Complet » à côté de la date.',
      'C’est publié aussitôt : le bandeau rouge « Complet » se colle sur l’affiche, le bouton Réserver devient « Liste d’attente ».',
      'Une erreur ? Le bouton « Annuler » de l’agenda remet la date comme avant.',
    ],
  },
  {
    titre: 'Ajouter un spectacle et ses dates',
    etapes: [
      '« Nouveau spectacle » (ou « Midi théâtre », « Jeune public » : saison, salle et prix sont déjà remplis).',
      'Onglet Essentiel : titre, artistes, genre, visuel, accroche. L’adresse de la page se fait seule.',
      'Onglet Dates et billets : « Ajouter des dates » crée toute une série (du mardi au samedi à 20h, le dimanche à 17h…) ou lit une liste collée depuis un e-mail.',
      'Collez le lien Infomaniak du spectacle, puis « Publier ». Le bandeau en haut de la fiche dit ce qui manque encore.',
    ],
  },
  {
    titre: 'Envoyer la lettre d’information',
    etapes: [
      'Onglet Communication, « Lettre d’information » : choisissez la période et, si vous voulez, un spectacle à la une.',
      '« Copier la lettre », puis collez dans un nouveau message ou dans votre outil d’envoi : images, couleurs et boutons suivent.',
    ],
  },
  {
    titre: 'Imprimer la feuille de salle ou l’agenda du mois',
    etapes: [
      'Depuis la fiche du spectacle : menu en bas à droite, « Feuille de salle ».',
      'Ou l’onglet Communication : « Feuille de salle », « Agenda à afficher ». « Imprimer » puis « Enregistrer au format PDF » si besoin.',
    ],
  },
  {
    titre: 'Prévenir d’une fermeture ou d’un changement',
    etapes: [
      'Réglages du site, onglet Annonce.',
      'Un bandeau en haut de tout le site (avec une date de fin : il se retire seul), ou un avis daté sur la page Billetterie (fermetures, permanences).',
    ],
  },
  {
    titre: 'Changer de saison',
    etapes: [
      'Créez la nouvelle saison dans Programme → Saisons, avec sa boutique Infomaniak et son programme PDF.',
      'Le jour venu, ouvrez-la et choisissez « Faire de cette saison la saison en cours » : le site bascule, l’ancienne saison rejoint les archives toute seule.',
    ],
  },
]

function TableauDeBord() {
  const utilisateur = useCurrentUser()
  const {basePath} = useWorkspace()
  const router = useRouter()
  const a = useAgenda()
  const {donnees, erreur} = useRequete<Donnees>(REQUETE, {}, ['spectacle', 'message', 'reglages', 'saison', 'page', 'rendezVous'])
  const auj = aujourdhui()
  const finSemaine = plusJours(auj, 7)
  const allerA = (outil: string) => router.navigateUrl({path: `${basePath.replace(/\/$/, '')}/${outil}`})

  // Les sept prochains jours ; quand ils sont calmes, les six prochaines dates.
  const semaine: RepAgenda[] = useMemo(() => {
    const aVenir = a.reps.filter((r) => r.date >= auj)
    const sept = aVenir.filter((r) => r.date < finSemaine)
    return sept.length >= 6 ? sept : aVenir.slice(0, Math.max(6, sept.length))
  }, [a.reps, auj, finSemaine])
  const titreSemaine = semaine.some((r) => r.date >= finSemaine) ? 'Les prochaines dates' : 'La semaine'

  const taches: Tache[] = useMemo(() => {
    if (!donnees) return []
    const t: Tache[] = []
    const maintenant = new Date().toISOString()
    if (donnees.nbMessages) t.push({cle: 'messages', ton: 'primary', titre: `${donnees.nbMessages} message${donnees.nbMessages > 1 ? 's' : ''} à traiter`, detail: 'Contenu → Messages reçus'})
    const conflits = a.conflits.filter((c) => c.a.date >= auj)
    for (const c of conflits.slice(0, 3))
      t.push({
        cle: `conflit-${c.a.cle}-${c.b.cle}`,
        ton: 'critical',
        titre: `Salle prise deux fois le ${dateLongue(c.a.date)}`,
        detail: `« ${c.a.titre} » à ${heureLisible(c.a.heure)} et « ${c.b.titre} » à ${heureLisible(c.b.heure)}`,
        outil: 'agenda',
      })
    const prochaine = (s: Donnees['spectacles'][number]) => (s.representations ?? []).map((r) => r.dateHeure ?? '').filter((d) => d >= maintenant).sort()[0] ?? ''
    const aVenir = donnees.spectacles.filter((s) => !s.masque && prochaine(s)).sort((x, y) => prochaine(x).localeCompare(prochaine(y)))
    for (const s of aVenir) {
      const aConfirmer = (s.representations ?? []).filter((r) => r.dateHeure && r.dateHeure >= maintenant && r.heureAConfirmer).length
      if (aConfirmer) t.push({cle: `heure-${s._id}`, ton: 'caution', titre: `« ${s.titre} » : ${aConfirmer} heure${aConfirmer > 1 ? 's' : ''} à confirmer`, lien: {id: s._id, type: 'spectacle'}})
    }
    const fiches = aVenir.map((s) => ({
      s,
      manque: pointsDeLaFiche({
        ...s,
        texte: s.nbTexte ? [1] : [],
        distribution: s.nbDistribution ? [1] : [],
        photos: s.nbPhotos ? [1] : [],
      } as Parameters<typeof pointsDeLaFiche>[0]).filter((p) => !p.ok),
    }))
    // Ce qui empêche une fiche d'être correcte sur le site : à faire tout de suite.
    const bloquees = fiches.filter((x) => x.manque.some((m) => m.essentiel))
    for (const {s, manque} of bloquees.slice(0, 5))
      t.push({
        cle: `fiche-${s._id}`,
        ton: 'critical',
        titre: `« ${s.titre} » : il manque l’essentiel`,
        detail: manque
          .filter((m) => m.essentiel)
          .map((m) => m.titre.toLowerCase())
          .join(', '),
        lien: {id: s._id, type: 'spectacle'},
      })
    // Le reste (photos, distribution, durée…) : un rappel groupé, par ordre de date.
    const aEnrichir = fiches.filter((x) => x.manque.length && !x.manque.some((m) => m.essentiel))
    for (const {s, manque} of aEnrichir.slice(0, 3))
      t.push({cle: `enrichir-${s._id}`, ton: 'caution', titre: `« ${s.titre} » à compléter`, detail: `Pour une page complète : ${manque.map((m) => m.titre.toLowerCase()).join(', ')}`, lien: {id: s._id, type: 'spectacle'}})
    if (aEnrichir.length > 3) t.push({cle: 'fiches-plus', ton: 'caution', titre: `Et ${aEnrichir.length - 3} autres fiches à compléter`, detail: 'Contenu → Programme → À compléter'})
    const sansLien = aVenir.filter((s) => !s.lienBilletterie && (s.representations ?? []).some((r) => r.statut !== 'complet'))
    if (sansLien.length && !donnees.reglages?.lienBilletterie && !donnees.saison?.boutique)
      t.push({cle: 'billetterie', ton: 'caution', titre: `${sansLien.length} spectacle${sansLien.length > 1 ? 's' : ''} sans lien de réservation`, detail: 'Ajoutez la boutique Infomaniak à la saison en cours, ou le lien de chaque spectacle.'})
    const annonce = donnees.reglages?.annonce
    if (annonce?.active && annonce.jusquau && annonce.jusquau < maintenant)
      t.push({cle: 'annonce-expiree', ton: 'primary', titre: 'Le bandeau d’annonce a expiré', detail: `« ${annonce.texte} » ne s’affiche plus. Décochez-le ou changez sa date.`, lien: {id: 'reglages', type: 'reglages'}})
    if (!donnees.saison) t.push({cle: 'saison', ton: 'critical', titre: 'Aucune saison en cours', detail: 'Le programme affiche toutes les saisons. Ouvrez une saison et faites-en la saison en cours.'})
    else if (donnees.saison.fin && donnees.saison.fin < plusJours(auj, 60) && !donnees.saisonSuivante)
      t.push({cle: 'saison-suivante', ton: 'primary', titre: `La ${donnees.saison.titre} se termine le ${dateLongue(donnees.saison.fin, true)}`, detail: 'Créez la saison suivante dans Programme → Saisons.'})
    if (donnees.imagesSansDescription)
      t.push({cle: 'alt', ton: 'primary', titre: `${donnees.imagesSansDescription} visuel${donnees.imagesSansDescription > 1 ? 's' : ''} sans description`, detail: 'Une phrase pour les personnes malvoyantes et pour Google.'})
    return t
  }, [donnees, a.conflits, auj])

  const enCours = useMemo(() => {
    const r = donnees?.reglages
    const maintenant = new Date().toISOString()
    const annonce = r?.annonce?.active && r.annonce.texte && (!r.annonce.jusquau || r.annonce.jusquau > maintenant) ? r.annonce : null
    const avis = (r?.avis ?? []).filter((x) => (!x.du || x.du <= auj) && (!x.au || x.au >= auj))
    return {annonce, avis}
  }, [donnees, auj])

  const stats = useMemo(() => {
    const reps = a.reps.filter((r) => r.date >= auj && !r.scolaire)
    return {
      spectacles: new Set(reps.map((r) => r.spectacleId)).size,
      dates: reps.length,
      complets: reps.filter((r) => r.statut === 'complet').length,
    }
  }, [a.reps, auj])

  const prenom = utilisateur?.name?.split(' ')[0]
  const site = (donnees?.reglages?.adresseSite || URL_SITE).replace(/\/$/, '')

  return (
    <Box padding={[3, 4, 5]} style={{overflow: 'auto', height: '100%'}}>
      <Container width={4}>
        <Stack gap={5}>
          <Stack gap={3}>
            <Text muted size={1}>
              {majuscule(dateLongue(auj, true))}
            </Text>
            <Heading as="h1" size={4}>
              {prenom ? `Bonjour ${prenom}` : 'Bonjour'}
            </Heading>
            <Text muted>
              {donnees?.saison?.titre ? `${donnees.saison.titre} · ` : ''}
              {stats.spectacles} spectacle{stats.spectacles > 1 ? 's' : ''} à venir · {stats.dates} date{stats.dates > 1 ? 's' : ''}
              {stats.complets ? ` · ${stats.complets} complète${stats.complets > 1 ? 's' : ''}` : ''}
            </Text>
          </Stack>

          <Flex gap={2} wrap="wrap">
            <MenuNouveau />
            <Button icon={CalendarIcon} text="Agenda" mode="ghost" onClick={() => allerA('agenda')} />
            <Button icon={MegaphoneIcon} text="Lettre d’information" mode="ghost" onClick={() => allerA('communication/lettre')} />
            <BoutonIntention intent="edit" params={{id: 'accueil', type: 'accueil'}} text="Modifier l’accueil" mode="ghost" />
            <BoutonIntention intent="edit" params={{id: 'reglages', type: 'reglages'}} text="Annonce, horaires et réglages" mode="ghost" />
            <Button as="a" href={site} target="_blank" rel="noreferrer" icon={LaunchIcon} text="Voir le site" mode="ghost" />
          </Flex>

          {(enCours.annonce || enCours.avis.length > 0) && (
            <Card padding={3} radius={2} tone="primary" border>
              <Stack gap={2}>
                {enCours.annonce && (
                  <Text size={1}>
                    <strong>Bandeau en ligne :</strong> {enCours.annonce.texte}
                    {enCours.annonce.jusquau ? ` (jusqu’au ${fmtCourt.format(new Date(enCours.annonce.jusquau))})` : ''}
                  </Text>
                )}
                {enCours.avis.map((x, i) => (
                  <Text key={i} size={1}>
                    <strong>Avis en ligne :</strong> {x.titre ? `${x.titre}. ` : ''}
                    {x.texte}
                    {x.au ? ` (jusqu’au ${x.au.split('-').reverse().join('.')})` : ''}
                  </Text>
                ))}
              </Stack>
            </Card>
          )}

          {erreur ? (
            <Card padding={4} radius={3} tone="critical">
              <Text>Impossible de charger le tableau de bord : {erreur}</Text>
            </Card>
          ) : !donnees || a.chargement ? (
            <Flex padding={5} justify="center">
              <Spinner muted />
            </Flex>
          ) : (
            <Grid gridTemplateColumns={[1, 1, 1, 2]} gap={4}>
              <Bloc titre={titreSemaine} compteur={semaine.length} action={<Button mode="bleed" fontSize={1} text="Tout l’agenda →" onClick={() => allerA('agenda')} />}>
                {semaine.length ? (
                  <Stack gap={2}>
                    {semaine.map((r, i) => {
                      const nouveauJour = i === 0 || semaine[i - 1].date !== r.date
                      return (
                        <Stack key={`${r.spectacleId}/${r.cle}`} gap={2}>
                          {nouveauJour && (
                            <Box paddingTop={i ? 2 : 0}>
                              <Text size={1} weight="semibold" muted style={{textTransform: 'uppercase', letterSpacing: '.05em'}}>
                                {r.date === auj ? 'Aujourd’hui' : r.date === plusJours(auj, 1) ? 'Demain' : dateLongue(r.date)}
                              </Text>
                            </Box>
                          )}
                          <Card padding={3} radius={2} border style={{borderLeft: `5px solid ${r.encre || '#019e35'}`}}>
                            <Flex align="center" gap={3} wrap="wrap">
                              <Text size={1} weight="bold" style={{width: 44, fontVariantNumeric: 'tabular-nums'}}>
                                {r.heureAConfirmer ? '—' : heureLisible(local(r.iso).heure)}
                              </Text>
                              <Stack gap={2} flex={1} style={{minWidth: 140}}>
                                <Flex gap={2} align="center">
                                  <Pastille couleur={r.encre} taille={10} />
                                  <Text size={1} weight="semibold" textOverflow="ellipsis">
                                    {r.titre}
                                  </Text>
                                </Flex>
                                <Text size={0} muted>
                                  {[r.lieuNom, r.mention, r.scolaire ? 'Scolaire' : ''].filter(Boolean).join(' · ')}
                                </Text>
                              </Stack>
                              <BoutonsStatut compact valeur={r.statut} desactive={a.enCours} onChange={(s) => a.changerStatut(r, s)} />
                            </Flex>
                          </Card>
                        </Stack>
                      )
                    })}
                  </Stack>
                ) : (
                  <Text muted size={1}>
                    Aucune représentation à venir.
                  </Text>
                )}
              </Bloc>

              <Stack gap={4}>
                <Bloc titre="À faire" compteur={taches.length}>
                  {taches.length ? (
                    <Stack gap={2}>
                      {taches.map((t) =>
                        t.lien ? (
                          <Lien key={t.cle} id={t.lien.id} type={t.lien.type} tone={t.ton}>
                            <Stack gap={2}>
                              <Text size={1} weight="semibold">
                                {t.titre}
                              </Text>
                              {t.detail && (
                                <Text size={1} muted>
                                  {t.detail}
                                </Text>
                              )}
                            </Stack>
                          </Lien>
                        ) : (
                          <Card
                            key={t.cle}
                            padding={3}
                            radius={2}
                            border
                            tone={t.ton}
                            as={t.outil ? 'button' : 'div'}
                            onClick={t.outil ? () => allerA(t.outil!) : undefined}
                            style={{textAlign: 'left', cursor: t.outil ? 'pointer' : 'default'}}
                          >
                            <Stack gap={2}>
                              <Text size={1} weight="semibold">
                                {t.titre}
                              </Text>
                              {t.detail && (
                                <Text size={1} muted>
                                  {t.detail}
                                </Text>
                              )}
                            </Stack>
                          </Card>
                        ),
                      )}
                    </Stack>
                  ) : (
                    <Flex gap={2} align="center">
                      <Text>
                        <CheckmarkCircleIcon />
                      </Text>
                      <Text muted size={1}>
                        Rien à signaler : les fiches à venir sont complètes et les salles libres.
                      </Text>
                    </Flex>
                  )}
                </Bloc>

                <Bloc titre="Messages reçus" compteur={donnees.nbMessages}>
                  {donnees.messages.length ? (
                    <Stack gap={2}>
                      {donnees.messages.map((m) => (
                        <Lien key={m._id} id={m._id} type="message">
                          <Stack gap={2}>
                            <Text size={1} weight="semibold">
                              {m.sujet || 'Message'}
                            </Text>
                            <Text size={1} muted>
                              {[m.nom, m.recuLe ? fmtCourt.format(new Date(m.recuLe)) : ''].filter(Boolean).join(' · ')}
                            </Text>
                          </Stack>
                        </Lien>
                      ))}
                    </Stack>
                  ) : (
                    <Text muted size={1}>
                      Aucun nouveau message.
                    </Text>
                  )}
                </Bloc>

                <Bloc titre="Modifications non publiées" compteur={donnees.brouillons.length}>
                  {donnees.brouillons.length ? (
                    <Stack gap={2}>
                      {donnees.brouillons.map((b) => (
                        <Lien key={b._id} id={b._id} type={b._type}>
                          <Flex align="center" justify="space-between" gap={3}>
                            <Text size={1} weight="semibold" textOverflow="ellipsis">
                              {b.titre || NOMS_TYPES[b._type] || 'Document'}
                            </Text>
                            <Badge tone="caution">{NOMS_TYPES[b._type] || b._type}</Badge>
                          </Flex>
                        </Lien>
                      ))}
                      <Text size={1} muted>
                        Ces changements ne sont pas encore sur le site : ouvrez-les et cliquez sur « Publier ».
                      </Text>
                    </Stack>
                  ) : (
                    <Text muted size={1}>
                      Tout est publié.
                    </Text>
                  )}
                </Bloc>
              </Stack>
            </Grid>
          )}

          <Bloc titre="Mode d’emploi">
            <Grid gridTemplateColumns={[1, 1, 2]} gap={3}>
              {GUIDE.map((g) => (
                <Card key={g.titre} padding={3} radius={2} tone="transparent" border>
                  <details>
                    <summary style={{cursor: 'pointer', fontWeight: 600, fontSize: 14}}>{g.titre}</summary>
                    <Box paddingTop={3}>
                      <ol style={{margin: 0, paddingLeft: 20, lineHeight: 1.55, fontSize: 13}}>
                        {g.etapes.map((e) => (
                          <li key={e}>{e}</li>
                        ))}
                      </ol>
                    </Box>
                  </details>
                </Card>
              ))}
            </Grid>
          </Bloc>
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
