#!/usr/bin/env python3
"""Assemble les pages statiques de la maquette.

Chaque page de src/pages/ commence par un bloc de métadonnées :
    <!--
    titre: Programme 26–27
    page: programme
    description: ...
    corps: page-programme
    -->
Les gabarits de src/partials/ sont insérés à la place de {{tete}}, {{entete}} et {{pied}}.
La typographie française (espace fine insécable avant : ; ! ? » et après «) est appliquée
au texte, jamais au code (balises, <script>, <style>).

Usage : python3 tools/build.py [dossier_de_sortie]
"""
import pathlib
import re
import sys

RACINE = pathlib.Path(__file__).resolve().parent.parent
SRC = RACINE / "src"
SORTIE = pathlib.Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else RACINE
NNBSP = " "


def lire(nom):
    return (SRC / "partials" / nom).read_text(encoding="utf-8")


def meta(source):
    m = re.match(r"\s*<!--(.*?)-->", source, re.S)
    if not m:
        raise SystemExit("Métadonnées manquantes")
    donnees = {}
    for ligne in m.group(1).strip().splitlines():
        cle, _, val = ligne.partition(":")
        donnees[cle.strip()] = val.strip()
    return donnees, source[m.end():]


def typographie(html):
    morceaux = re.split(r"(<script\b.*?</script>|<style\b.*?</style>|<[^>]+>)", html, flags=re.S | re.I)
    for i, m in enumerate(morceaux):
        if not m or m.startswith("<"):
            continue
        m = re.sub(r"[  ]([:;!?»])", NNBSP + r"\1", m)
        m = re.sub(r"«[  ]", "«" + NNBSP, m)
        morceaux[i] = m
    return "".join(morceaux)


def assembler(chemin):
    source = chemin.read_text(encoding="utf-8")
    donnees, corps = meta(source)
    page = donnees.get("page", "")
    entete = lire("entete.html")
    for nom in ("programme", "infos", "theatre"):
        entete = entete.replace("{{cur:%s}}" % nom, 'aria-current="page"' if nom == page else "")
    tete = (lire("tete.html")
            .replace("{{titre}}", donnees["titre"])
            .replace("{{description}}", donnees.get("description", "")))
    html = (corps.replace("{{tete}}", tete)
            .replace("{{entete}}", entete)
            .replace("{{pied}}", lire("pied.html"))
            .replace("{{corps}}", donnees.get("corps", "")))
    return typographie(html.strip() + "\n")


def main():
    SORTIE.mkdir(parents=True, exist_ok=True)
    for chemin in sorted((SRC / "pages").glob("*.html")):
        (SORTIE / chemin.name).write_text(assembler(chemin), encoding="utf-8")
        print("→", (SORTIE / chemin.name).relative_to(SORTIE.parent) if SORTIE != RACINE else chemin.name)


if __name__ == "__main__":
    main()
