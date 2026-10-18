/* Requêtes GROQ partagées par les outils du Studio (agenda, tableau de bord, communication). */

/** Les spectacles, avec leurs représentations, pour l'agenda (versions publiées). */
export const REQ_AGENDA = /* groq */ `{
  "spectacles": *[_type == "spectacle" && !(_id in path("drafts.**"))]{
    _id, titre, duree, genre, etiquettes, "encre": coalesce(encre.hex, visuel.asset->metadata.palette.vibrant.background, visuel.asset->metadata.palette.dominant.background),
    "saison": saison._ref,
    lieu, representations,
    "brouillon": defined(*[_id == "drafts." + ^._id][0]._id)
  },
  "lieux": *[_type == "lieu" && !(_id in path("drafts.**"))] | order(ordre asc, nom asc){_id, nom, capacite},
  "saisons": *[_type == "saison" && !(_id in path("drafts.**"))] | order(debut desc){_id, titre, debut, fin, courante}
}`

/** Ce qu'il faut aux générateurs de la communication (SpectacleCom dans lib/communication). */
export const PROJECTION_COM = /* groq */ `{
  _id, titre, sousTitre, compagnie, genre, precision, etiquettes, accroche, age, duree,
  "slug": slug.current,
  "encre": encre.hex,
  "visuel": visuel{"ref": asset._ref, alt, hotspot, "dominante": coalesce(asset->metadata.palette.vibrant.background, asset->metadata.palette.dominant.background)},
  "lieu": lieu->nom, "lieuComplet": lieu->nomComplet, "adresse": lieu->adresse,
  "representations": representations[defined(dateHeure)]{_key, dateHeure, statut, mention, "lieu": lieu->nom, heureAConfirmer, scolaire},
  "prix": tarifs->tarifs[]{categorie, prix, precision}, noteTarifs, lienBilletterie,
  texte, "distribution": distribution[]{titre, "lignes": lignes[]{role, noms}}, production, avertissement,
  "deroule": deroule[]{titre, duree}, autour,
  "presse": presse[]{citation, source},
  "saison": saison->titre
}`

export const REQ_COMMUNICATION = /* groq */ `{
  "spectacles": *[_type == "spectacle" && !(_id in path("drafts.**")) && defined(slug.current)] ${PROJECTION_COM},
  "reglages": *[_id == "reglages"][0]{nom, rue, localite, telBilletterie, emailBilletterie, emailGeneral, lienBilletterie, instagram, facebook, horaires, noteHoraires, adresseSite},
  "saison": *[_type == "saison" && courante == true && !(_id in path("drafts.**"))][0]{titre, debut, fin}
}`
