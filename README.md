# Théâtre Benno Besson — maquette de refonte

Maquette navigable de la refonte de [theatrebennobesson.ch](https://www.theatrebennobesson.ch/), octobre 2026.

> **Le fil rouge : « Le plaisir à l’affiche, pour toutes et tous. »**
> *À l’affiche* : chaque spectacle reçoit sa propre affiche, au format suisse, dans sa propre encre.
> *Le plaisir* : le mot de Benno Besson, « le théâtre n’a pas de sens si ce n’est un plaisir, un plaisir à la vie ».
> *Pour toutes et tous* : la mission d’un théâtre municipal, « ne laisser personne au bord de la route ».

La démarche complète (audit, méthode, choix graphiques, inspirations) est présentée dans `concept.html`.

## Voir la maquette

Pages statiques, sans dépendance ni étape de compilation :

```bash
python3 -m http.server 8000
# puis http://localhost:8000
```

| Page | Fichier | Ce qu’on y montre |
| --- | --- | --- |
| Accueil | `index.html` | Bandeau du jour, la une dans l’encre du prochain spectacle, l’agenda, le mur d’affiches, les tarifs, le jeune public, Benno Besson, l’accès |
| Programme | `programme.html` | Les 35 spectacles en liste ou en affiches, filtres par genre, mois, Midi théâtre, places disponibles, recherche |
| Fiche spectacle | `spectacle.html#choices` | Dates et billets, infos pratiques, photos, distribution, tiroir de réservation. Toute la saison est accessible par `#slug` (`#cosimo`, `#reto`…) |
| Billetterie et accès | `infos.html` | Horaires, tarifs, bon cadeau, échange, schéma d’accès, salles et accessibilité |
| Le théâtre | `theatre.html` | Histoire de 1898 à aujourd’hui, Benno Besson, la salle, l’équipe, les Ami·es du TBB |
| Concept | `concept.html` | La planche de présentation, construite comme la méthode : pourquoi, fil rouge, comment le trouver, pratique, résultat |

## Système graphique

| | |
| --- | --- |
| **Titres** | Archivo extra-condensé 800 (`font-stretch: 62%`), en capitales. L’héritier des caractères en bois des affiches de 1898 et des théâtres zurichois. |
| **Information** | Archivo 400–650, chiffres tabulaires pour les dates, heures et prix. |
| **Voix** | Newsreader (romain et italique) pour le texte des spectacles et les citations. |
| **Couleurs** | Papier `#FFFFFF`, noir d’imprimerie `#0D0D0C`, vert TBB `#019E35` (repris du logo), rouge bandeau `#E3241B` (« Complet » seulement), gris `#EEF0ED`. |
| **Encres** | Une couleur par spectacle, prélevée dans son visuel existant (`encre` dans `assets/js/data.js`). Le texte passe en noir ou en blanc selon la luminance, pour garder un contraste AA. |
| **Images** | Visuels repris en niveaux de gris puis « imprimés » dans l’encre : `multiply` pour une image claire, `screen` pour une image sombre (`TBB.fondsSombres`). Les photos de scène restent en couleur dans les fiches. |
| **Formes** | Affiche au format mondial F4 (895 × 1280), bandeau collé en biais, filets noirs de 2 px, aucun arrondi ni ombre. Les trois arches du logo forment le pied de page. |

Tous les jetons sont en tête de `assets/css/tbb.css`.

## Structure

```
index.html, programme.html, …   pages générées (à ouvrir)
src/pages/                      sources des pages
src/partials/                   en-tête, pied de page « façade », balises <head>
tools/build.py                  assemble les pages et applique la typographie française
assets/css/tbb.css              système graphique et composants
assets/js/data.js               la saison 26–27 (35 spectacles) et la fiche complète de Choices
assets/js/app.js                rendu des listes, filtres, une, fiche, tiroir de réservation
assets/img/                     visuels de la saison, photos du théâtre, captures de l’audit
```

Après une modification dans `src/`, régénérer les pages :

```bash
python3 tools/build.py
```

Le script insère les gabarits et pose les espaces fines insécables avant `: ; ! ? »` et après `«`, sans toucher au code.

## Contenus à valider avec le TBB

Les textes, dates, distributions et visuels viennent du site actuel (relevé du 18 octobre 2026). Restent à confirmer :

- les heures non publiées sur le site actuel, indicatives dans la maquette : 20h en semaine, 17h le dimanche, 12h15 pour le Midi théâtre (`heureIndicative: true` dans les données) ;
- les horaires de la billetterie, les catégories du tarif réduit, les conditions du bon cadeau et de l’échange de billets ;
- les tarifs propres aux concerts, au Midi théâtre et au jeune public.

La maquette fixe la date du jour au 18 octobre 2026 (`TBB.aujourdhui`) pour que l’agenda reste cohérent quel que soit le jour de la présentation.
