/** Où le banc d'essai lit les contenus publiés du théâtre (lecture publique, sans jeton). */
export const SOURCE = 'https://pgmabzq0.apicdn.sanity.io/v2025-02-19/data/query/production'
export const TOUT =
  '*[!(_id in path("_.**")) && (_type in ["spectacle", "lieu", "saison", "grilleTarifaire", "reglages", "accueil", "page", "personne", "partenaire", "rendezVous", "articlePresse"] || _type == "sanity.imageAsset")]'
