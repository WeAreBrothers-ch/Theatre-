import {useEffect, useState} from 'react'
import {useClient, type DocumentActionComponent, type DocumentBadgeComponent} from 'sanity'
import {useRouter} from 'sanity/router'
import {useToast} from '@sanity/ui/toast'
import {LaunchIcon} from '@sanity/icons/Launch'
import {CopyIcon} from '@sanity/icons/Copy'
import {StarIcon} from '@sanity/icons/Star'
import {EnvelopeIcon} from '@sanity/icons/Envelope'
import {CheckmarkCircleIcon} from '@sanity/icons/CheckmarkCircle'
import {ShareIcon} from '@sanity/icons/Share'
import {API_VERSION, URL_SITE, slugifier} from '../lib/constantes'
import {idBrouillon, idPublie} from '../lib/ecriture'
import {nouvelleCle} from '../lib/representations'
import {PrintIcon} from './communication/icones'

/*
 * Les actions ajoutées en bas des fiches (menu à côté de « Publier ») :
 * voir la page sur le site, dupliquer un spectacle pour une reprise, imprimer sa feuille
 * de salle, faire d'une saison la saison en cours, répondre à un message.
 */

/** L'adresse publique du site : celle des Réglages, sinon celle du Studio. */
function useAdresseSite(): string {
  const client = useClient({apiVersion: API_VERSION})
  const [site, setSite] = useState(URL_SITE)
  useEffect(() => {
    let actif = true
    client
      .fetch<string | null>(`*[_id == "reglages"][0].adresseSite`)
      .then((a) => actif && a && setSite(a))
      .catch(() => undefined)
    return () => {
      actif = false
    }
  }, [client])
  return site.replace(/\/$/, '')
}

type AvecSlug = {slug?: {current?: string}}

export const voirSurLeSite: DocumentActionComponent = (props) => {
  const site = useAdresseSite()
  const slug = (props.published as AvecSlug | null)?.slug?.current
  const chemins: Record<string, string> = {spectacle: '/spectacles/', page: '/', rendezVous: '/rendez-vous/'}
  const prefixe = chemins[props.type]
  return {
    label: 'Voir sur le site',
    icon: LaunchIcon,
    disabled: !slug || !prefixe,
    title: slug ? undefined : 'Publiez d’abord la page.',
    onHandle: () => {
      window.open(`${site}${prefixe}${slug}`, '_blank', 'noopener')
      props.onComplete()
    },
  }
}

export const voirAccueil: DocumentActionComponent = (props) => {
  const site = useAdresseSite()
  return {
    label: 'Voir sur le site',
    icon: LaunchIcon,
    onHandle: () => {
      window.open(`${site}/`, '_blank', 'noopener')
      props.onComplete()
    },
  }
}

/** Une copie du spectacle pour une reprise : mêmes textes et distribution, sans les dates. */
export const dupliquerPourReprise: DocumentActionComponent = (props) => {
  const client = useClient({apiVersion: API_VERSION})
  const router = useRouter()
  const toast = useToast()
  const [enCours, setEnCours] = useState(false)
  const source = (props.draft ?? props.published) as (Record<string, unknown> & {titre?: string}) | null
  return {
    label: 'Dupliquer pour une reprise',
    icon: CopyIcon,
    disabled: !source || enCours,
    onHandle: async () => {
      if (!source) return
      setEnCours(true)
      try {
        const saison = await client.fetch<string | null>(`*[_type == "saison" && courante == true && !(_id in path("drafts.**"))][0]._id`)
        const {_id, _rev, _createdAt, _updatedAt, representations, slug, ...reste} = source
        void _id
        void _rev
        void _createdAt
        void _updatedAt
        void representations
        void slug
        const id = `drafts.${crypto.randomUUID()}`
        const titre = String(source.titre ?? 'Spectacle')
        await client.create({
          ...reste,
          _id: id,
          _type: 'spectacle',
          titre,
          representations: [],
          ...(saison ? {saison: {_type: 'reference', _ref: saison}} : {}),
          slug: {_type: 'slug', current: `${slugifier(titre)}-${nouvelleCle().slice(0, 4)}`},
        })
        toast.push({status: 'success', title: 'Copie créée', description: 'Ajoutez les dates de la reprise, vérifiez l’adresse de la page, puis publiez.'})
        router.navigateIntent('edit', {id: idPublie(id), type: 'spectacle'})
      } catch (e) {
        toast.push({status: 'error', title: 'La copie n’a pas pu être créée', description: (e as Error).message})
      } finally {
        setEnCours(false)
        props.onComplete()
      }
    },
  }
}

/** Ouvre la feuille de salle du spectacle dans l'outil Communication. */
export const imprimerFeuille: DocumentActionComponent = (props) => {
  const router = useRouter()
  return {
    label: 'Feuille de salle',
    icon: PrintIcon,
    disabled: !props.published,
    title: props.published ? undefined : 'Publiez d’abord le spectacle.',
    onHandle: () => {
      router.navigateIntent('feuille-de-salle', {id: idPublie(props.id)})
      props.onComplete()
    },
  }
}

/** Ouvre les textes pour les réseaux sociaux du spectacle. */
export const textesReseaux: DocumentActionComponent = (props) => {
  const router = useRouter()
  return {
    label: 'Textes pour les réseaux',
    icon: ShareIcon,
    disabled: !props.published,
    title: props.published ? undefined : 'Publiez d’abord le spectacle.',
    onHandle: () => {
      router.navigateIntent('reseaux', {id: idPublie(props.id)})
      props.onComplete()
    },
  }
}

/** Faire d'une saison la saison en cours : une seule à la fois, sans risque d'oubli. */
export const rendreCourante: DocumentActionComponent = (props) => {
  const client = useClient({apiVersion: API_VERSION})
  const toast = useToast()
  const [enCours, setEnCours] = useState(false)
  const publie = props.published as {courante?: boolean; titre?: string} | null
  return {
    label: publie?.courante ? 'Saison en cours' : 'Faire de cette saison la saison en cours',
    icon: StarIcon,
    disabled: !publie || !!publie.courante || enCours,
    title: !publie ? 'Publiez d’abord la saison.' : undefined,
    onHandle: async () => {
      setEnCours(true)
      try {
        const brut = client.withConfig({perspective: 'raw'})
        const autres = await brut.fetch<string[]>(`*[_type == "saison" && courante == true]._id`)
        const tx = client.transaction()
        for (const id of autres) if (idPublie(id) !== idPublie(props.id)) tx.patch(id, (p) => p.set({courante: false}))
        tx.patch(idPublie(props.id), (p) => p.set({courante: true}))
        if (props.draft) tx.patch(idBrouillon(props.id), (p) => p.set({courante: true}))
        await tx.commit()
        toast.push({status: 'success', title: `« ${publie?.titre} » est la saison en cours`, description: 'Le programme du site affiche désormais ses spectacles ; les autres passent dans les archives.'})
      } catch (e) {
        toast.push({status: 'error', title: 'Impossible de changer de saison', description: (e as Error).message})
      } finally {
        setEnCours(false)
        props.onComplete()
      }
    },
  }
}

type Message = {email?: string; sujet?: string; nom?: string; contenu?: string; statut?: string}

export const repondre: DocumentActionComponent = (props) => {
  const m = (props.published ?? props.draft) as Message | null
  return {
    label: 'Répondre par e-mail',
    icon: EnvelopeIcon,
    disabled: !m?.email,
    onHandle: () => {
      const corps = `\n\n\n— Message reçu —\n${m?.contenu ?? ''}`
      window.location.href = `mailto:${m?.email}?subject=${encodeURIComponent(`Re: ${m?.sujet ?? 'Votre message au TBB'}`)}&body=${encodeURIComponent(corps)}`
      props.onComplete()
    },
  }
}

export const marquerTraite: DocumentActionComponent = (props) => {
  const client = useClient({apiVersion: API_VERSION})
  const m = (props.draft ?? props.published) as Message | null
  const traite = m?.statut === 'traite'
  return {
    label: traite ? 'Remettre en « Nouveau »' : 'Marquer comme traité',
    icon: CheckmarkCircleIcon,
    tone: traite ? undefined : 'positive',
    onHandle: async () => {
      const tx = client.transaction()
      if (props.published) tx.patch(idPublie(props.id), (p) => p.set({statut: traite ? 'nouveau' : 'traite'}))
      if (props.draft) tx.patch(idBrouillon(props.id), (p) => p.set({statut: traite ? 'nouveau' : 'traite'}))
      await tx.commit()
      props.onComplete()
    },
  }
}

export const BadgeMessage: DocumentBadgeComponent = (props) => {
  const m = (props.draft ?? props.published) as Message | null
  return m?.statut === 'nouveau' ? {label: 'Nouveau', color: 'primary'} : null
}

export const BadgeRendezVous: DocumentBadgeComponent = (props) => {
  const r = (props.draft ?? props.published) as {debut?: string; fin?: string} | null
  const dernier = r?.fin || r?.debut
  if (!dernier) return null
  return dernier < new Date().toISOString().slice(0, 10) ? {label: 'Passé', color: 'warning'} : {label: 'À venir', color: 'success'}
}
