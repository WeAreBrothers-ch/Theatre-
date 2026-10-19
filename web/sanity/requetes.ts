import {defineQuery} from 'next-sanity'

/*
 * Requêtes GROQ du site. Les mêmes requêtes servent pour Sanity et pour le jeu
 * d'amorçage local (évalué avec groq-js tant que Sanity est vide).
 *
 * Rien ne dépend de l'heure dans ces requêtes : le tri « à venir / passé »
 * se fait au rendu, pour que le cache reste valable d'un jour à l'autre.
 */

const IMAGE = /* groq */ `
  "ref": asset._ref,
  "url": asset->url,
  "gris": asset->urlGris,
  "l": asset->metadata.dimensions.width,
  "h": asset->metadata.dimensions.height,
  "lqip": asset->metadata.lqip,
  "dominante": asset->metadata.palette.dominant.background,
  "vibrante": asset->metadata.palette.vibrant.background,
  hotspot, crop, alt, legende, credit
`

const LIEN = /* groq */ `
  titre, url,
  "page": page->{_type, "slug": slug.current}
`

const CARTE = /* groq */ `
  _id, titre, sousTitre, compagnie, genre, precision, etiquettes, impression, accroche, age, duree, lienBilletterie, libelleBillet, lienListeAttente,
  "slug": slug.current,
  "encre": encre.hex,
  "visuel": visuel{${IMAGE}},
  "lieu": lieu->{nom, nomComplet, adresse, accessibilite},
  "representations": representations[defined(dateHeure)]{_key, dateHeure, statut, mention, lien, "lieu": lieu->nom} | order(dateHeure asc)
`

const SECTIONS = /* groq */ `
  sections[]{
    ...,
    _type == "sectionTexte" => {"image": image{${IMAGE}}},
    _type == "sectionInfos" => {"blocs": blocs[]{..., "lien": lien{${LIEN}}}},
    _type == "sectionTarifs" => {"grille": grille->{nom, tarifs, note}, "notes": notes[]{..., "lien": lien{${LIEN}}}},
    _type == "sectionCitation" => {"portrait": portrait{${IMAGE}}, "lien": lien{${LIEN}}},
    _type == "sectionFrise" => {"etapes": etapes[]{..., "image": image{${IMAGE}}}},
    _type == "sectionGalerie" => {"images": images[]{_key, ${IMAGE}}},
    _type == "sectionEquipe" => {"personnes": *[_type == "personne"] | order(ordre asc, nom asc){_id, nom, fonction, email, telephone, "photo": photo{${IMAGE}}}}
  }
`

/** Les spectacles de la saison en cours (toutes les saisons si aucune n'est cochée « en cours »). */
export const REQ_SPECTACLES = defineQuery(`
  *[_type == "spectacle" && defined(slug.current) && (saison->courante == true || count(*[_type == "saison" && courante == true]) == 0)]{${CARTE}}
`)

export const REQ_SITE = defineQuery(`{
  "reglages": *[_id == "reglages"][0]{
    ...,
    "menu": menu[]{_key, ${LIEN}},
    "colonnesPied": colonnesPied[]{_key, titre, "liens": liens[]{_key, ${LIEN}}},
    "seo": seo{titre, description, "image": image{${IMAGE}}}
  },
  "partenaires": *[_type == "partenaire" && piedDePage == true] | order(ordre asc){_id, nom, url, type},
  "saison": *[_type == "saison" && courante == true][0]{titre, boutique, "programmePdf": programmePdf.asset->url}
}`)

export const REQ_ACCUEIL = defineQuery(`
  *[_id == "accueil"][0]{
    "aLaffiche": aLaffiche[]._ref,
    ${SECTIONS},
    "seo": seo{titre, description, "image": image{${IMAGE}}}
  }
`)

export const REQ_PAGE = defineQuery(`
  *[_type == "page" && slug.current == $slug][0]{
    _id, titre, intro,
    "slug": slug.current,
    "image": image{${IMAGE}},
    ${SECTIONS},
    "seo": seo{titre, description, "image": image{${IMAGE}}}
  }
`)

export const REQ_SPECTACLE = defineQuery(`
  *[_type == "spectacle" && slug.current == $slug][0]{
    ${CARTE},
    texte, video, deroule, avertissement, autour, distinction, accessibilite, distribution, production, noteTarifs,
    "photos": photos[]{_key, ${IMAGE}},
    "tarifs": tarifs->{nom, tarifs, note},
    "seo": seo{titre, description, "image": image{${IMAGE}}}
  }
`)

export const REQ_SLUGS_PAGES = defineQuery(`*[_type == "page" && defined(slug.current)].slug.current`)
export const REQ_SLUGS_SPECTACLES = defineQuery(`*[_type == "spectacle" && defined(slug.current)].slug.current`)

/** Le site lit-il Sanity ? Oui dès que le Content Lake contient un spectacle. */
export const REQ_SANITY_REMPLI = defineQuery(`count(*[_type == "spectacle"][0...1])`)
