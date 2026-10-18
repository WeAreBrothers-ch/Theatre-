#!/usr/bin/env node
/*
 * Empreinte des contenus publiés dans Sanity : nombre de documents, dernière
 * modification et date du jour à Zurich (l'agenda avance chaque jour).
 * Le workflow GitHub compare cette empreinte à celle du site en ligne
 * (version.txt) et ne reconstruit le site que si elle a changé.
 */
const projet = process.env.SANITY_PROJET || 'pgmabzq0'
const dataset = process.env.SANITY_DATASET || 'production'
const requete = '{"n": count(*[!(_id in path("drafts.**")) && !(_type match "system.*")]), "d": *[!(_id in path("drafts.**")) && !(_type match "system.*")] | order(_updatedAt desc)[0]._updatedAt}'
const jour = new Intl.DateTimeFormat('en-CA', {timeZone: 'Europe/Zurich'}).format(new Date())

try {
  const reponse = await fetch(`https://${projet}.api.sanity.io/v2025-02-19/data/query/${dataset}?query=${encodeURIComponent(requete)}`)
  if (!reponse.ok) throw new Error(`HTTP ${reponse.status}`)
  const {result} = await reponse.json()
  console.log(`${jour} ${result?.n ?? 0} ${result?.d ?? 'vide'}`)
} catch (e) {
  // En cas de doute, une empreinte unique force la reconstruction.
  console.log(`${jour} inconnu ${Date.now()}`)
  console.error('Empreinte des contenus indisponible :', e.message)
}
