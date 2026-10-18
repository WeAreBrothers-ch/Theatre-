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

/** Un document à télécharger : le fichier téléversé, sinon l'adresse saisie. */
const FICHIER = /* groq */ `
  _key, titre, description,
  "url": coalesce(fichier.asset->url, url),
  "taille": fichier.asset->size,
  "extension": fichier.asset->extension
`

const CARTE = /* groq */ `
  _id, titre, sousTitre, compagnie, genre, precision, etiquettes, impression, accroche, age, duree, lienBilletterie, libelleBillet, lienListeAttente,
  "slug": slug.current,
  "encre": encre.hex,
  "visuel": visuel{${IMAGE}},
  "lieu": lieu->{nom, nomComplet, adresse, accessibilite, lienPlan},
  "saison": saison->{titre, courante, boutique},
  "representations": representations[defined(dateHeure)]{_key, dateHeure, statut, mention, lien, heureAConfirmer, scolaire, "lieu": lieu->nom} | order(dateHeure asc)
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
    _type == "sectionEquipe" => {"personnes": *[_type == "personne" && (count(coalesce(^.groupes, [])) == 0 && groupe != "comite-amis" || groupe in ^.groupes)] | order(ordre asc, nom asc){_id, nom, fonction, groupe, email, telephone, bio, "photo": photo{${IMAGE}}}},
    _type == "sectionDocuments" => {"documents": documents[]{${FICHIER}}},
    _type == "sectionPartenaires" => {"partenaires": *[_type == "partenaire" && (count(coalesce(^.types, [])) == 0 || type in ^.types)] | order(ordre asc, nom asc){_id, nom, type, url, "logo": logo{${IMAGE}}}},
    _type == "sectionPresse" => {"articles": *[_type == "articlePresse"] | order(date desc){_id, titre, media, auteur, date, type, extrait, "url": coalesce(lien, fichier.asset->url), "spectacle": spectacle->{titre, "slug": slug.current}}},
    _type == "sectionRendezVous" => {"rendezVous": *[_type == "rendezVous" && (count(coalesce(^.categories, [])) == 0 || categorie in ^.categories)] | order(debut asc){
      _id, titre, categorie, debut, fin, periode, organisateur, lieu, prix, inscription, texte, horaires,
      "slug": slug.current, "image": image{${IMAGE}}, "liens": liens[]{_key, ${LIEN}}
    }},
    _type == "sectionLieux" => {"lieux": *[_type == "lieu" && (^.quels == "tous" || coalesce(type, "theatre") == "theatre")] | order(ordre asc){
      _id, nom, nomComplet, capacite, description, adresse, visiteVirtuelle, caracteristiques,
      "photos": photos[]{_key, ${IMAGE}}, "documents": documents[]{${FICHIER}}
    }},
    _type == "sectionArchives" => {"saisons": *[_type == "saison" && courante != true] | order(debut desc){
      _id, titre, debut, "affiche": affiche{${IMAGE}},
      "spectacles": *[_type == "spectacle" && saison._ref == ^._id && masque != true && defined(slug.current)] | order(representations[0].dateHeure asc){
        _id, titre, compagnie, "slug": slug.current, "premiere": representations[0].dateHeure
      }
    }},
    _type == "sectionListe" => {"elements": elements[]{..., "image": image{${IMAGE}}, "lien": lien{${LIEN}}}},
    _type == "sectionFormules" => {"formules": formules[]{..., bouton}}
  }
`

/** Les spectacles de la saison en cours (toutes les saisons si aucune n'est cochée « en cours »). */
export const REQ_SPECTACLES = defineQuery(`
  *[_type == "spectacle" && defined(slug.current) && masque != true && (saison->courante == true || count(*[_type == "saison" && courante == true]) == 0)]{${CARTE}}
`)

/** Menu : une entrée et ses sous-rubriques. */
const MENU = /* groq */ `_key, ${LIEN}, "sousLiens": sousLiens[]{_key, ${LIEN}}`

export const REQ_SITE = defineQuery(`{
  "reglages": *[_id == "reglages"][0]{
    ...,
    "menu": menu[]{${MENU}},
    "colonnesPied": colonnesPied[]{_key, titre, "liens": liens[]{_key, ${LIEN}}},
    "seo": seo{titre, description, "image": image{${IMAGE}}}
  },
  "partenaires": *[_type == "partenaire" && piedDePage == true] | order(ordre asc){_id, nom, url, type},
  "saison": *[_type == "saison" && courante == true][0]{titre, boutique, "programmePdf": programmePdf.asset->url, "afficheHD": afficheHD.asset->url}
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
    texte, video, deroule, avertissement, autour, distinction, accessibilite, distribution, production, creation, creditsPhotos, noteTarifs,
    citations, photosHD, scolaire,
    "dossierPresse": dossierPresse.asset->url,
    "dossierPedagogique": dossierPedagogique.asset->url,
    "documents": documents[]{${FICHIER}},
    "photos": photos[]{_key, ${IMAGE}},
    "tarifs": tarifs->{nom, tarifs, note},
    "articles": *[_type == "articlePresse" && spectacle._ref == ^._id] | order(date desc){_id, titre, media, auteur, date, extrait, "url": coalesce(lien, fichier.asset->url)},
    "rendezVous": *[_type == "rendezVous" && ^._id in spectacles[]._ref] | order(debut asc){_id, titre, debut, fin, periode, lieu, "slug": slug.current, "aTexte": count(texte) > 0},
    "seo": seo{titre, description, "image": image{${IMAGE}}}
  }
`)

export const REQ_RENDEZ_VOUS = defineQuery(`
  *[_type == "rendezVous" && slug.current == $slug][0]{
    _id, titre, categorie, debut, fin, periode, organisateur, lieu, prix, inscription, texte, horaires,
    "slug": slug.current,
    "image": image{${IMAGE}},
    "liens": liens[]{_key, ${LIEN}},
    "spectacles": spectacles[]->{${CARTE}}
  }
`)

export const REQ_SLUGS_PAGES = defineQuery(`*[_type == "page" && defined(slug.current)].slug.current`)
export const REQ_SLUGS_SPECTACLES = defineQuery(`*[_type == "spectacle" && defined(slug.current)].slug.current`)
export const REQ_SLUGS_RENDEZ_VOUS = defineQuery(`*[_type == "rendezVous" && defined(slug.current) && count(texte) > 0].slug.current`)

/** Le site lit-il Sanity ? Oui dès que le Content Lake contient un spectacle. */
export const REQ_SANITY_REMPLI = defineQuery(`count(*[_type == "spectacle"][0...1])`)
