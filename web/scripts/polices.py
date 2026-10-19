"""
Fabrique les polices allégées du site (web/app/polices/) à partir des fichiers
variables de Google Fonts (licence SIL Open Font, sans nom réservé) :
  https://github.com/google/fonts/tree/main/ofl/archivo
  https://github.com/google/fonts/tree/main/ofl/newsreader

  python3 scripts/polices.py <dossier des .ttf téléchargés>

- Archivo : largeur normale figée, graisses 400 à 700 gardées en variable.
- Newsreader : 400 romain et italique, taille optique 16 (celle de Google Fonts).
- Caractères : latin, latin étendu A (noms d'artistes), ponctuation française.
"""
import sys
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

SOURCES = Path(sys.argv[1])
CIBLE = Path(__file__).resolve().parent.parent / 'app' / 'polices'
CARACTERES = (
    'U+0020-007E,U+00A0-017F,U+02C6,U+02DA,U+02DC,U+2009-200B,U+2010-2014,U+2018-201E,'
    'U+2020-2022,U+2026,U+202F,U+2030,U+2039-203A,U+2044,U+20AC,U+2122,U+2190-2193,U+2212'
)

POLICES = [
    ('Archivo[wdth,wght].ttf', 'Archivo.woff2', {'wdth': 100, 'wght': (400, 700)}),
    ('Newsreader[opsz,wght].ttf', 'Newsreader.woff2', {'opsz': 16, 'wght': 400}),
    ('Newsreader-Italic[opsz,wght].ttf', 'Newsreader-Italic.woff2', {'opsz': 16, 'wght': 400}),
]

for source, nom, axes in POLICES:
    police = TTFont(SOURCES / source)
    options = subset.Options()
    options.flavor = 'woff2'
    options.layout_features = ['kern', 'liga', 'calt', 'ccmp', 'locl', 'mark', 'mkmk', 'tnum']
    options.notdef_outline = True
    options.hinting = False
    sub = subset.Subsetter(options)
    sub.populate(unicodes=subset.parse_unicodes(CARACTERES))
    sub.subset(police)
    police = instantiateVariableFont(police, axes)
    police.flavor = 'woff2'
    police.save(CIBLE / nom)
    print(f'{nom}: {(CIBLE / nom).stat().st_size / 1024:.1f} Ko, {len(police.getGlyphOrder())} glyphes')
