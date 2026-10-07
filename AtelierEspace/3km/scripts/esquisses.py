# Les esquisses Supernote → public/media/esquisses/1.png, 2.png… (une image par page)
#
# Une seule fois :  python3 -m venv .venv && .venv/bin/pip install supernotelib
# Ensuite :         npm run esquisses     (chaque fois que la note change)
#
# Le chemin de la note est NOTE_SUPERNOTE dans .env.
# Les pages à montrer sur le site sont choisies dans src/ecrans/Processus.tsx.
import os
import re
import sys

import supernotelib as sn
from supernotelib import decoder, exceptions
from supernotelib.converter import ImageConverter

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SORTIE = os.path.join(RACINE, 'public/media/esquisses')
LARGEUR = 1600  # px, assez pour la visionneuse plein écran


def lire_env(cle):
    with open(os.path.join(RACINE, '.env'), encoding='utf-8') as f:
        for ligne in f:
            m = re.match(rf'\s*{cle}\s*=\s*"?([^"\n]*)"?', ligne)
            if m:
                return m.group(1)
    return None


# Certaines couches sont en paysage alors que la bibliothèque attend du portrait :
# si la taille ne correspond pas, on réessaie avec largeur et hauteur inversées.
_decode = decoder.PngDecoder.decode


def _decode_tourne(self, data, w, h, *args, **kwargs):
    try:
        return _decode(self, data, w, h, *args, **kwargs)
    except exceptions.DecoderException:
        return _decode(self, data, h, w, *args, **kwargs)


decoder.PngDecoder.decode = _decode_tourne

note = lire_env('NOTE_SUPERNOTE')
if not note or not os.path.exists(note):
    sys.exit('NOTE_SUPERNOTE manque dans .env (ou le fichier est introuvable)')

os.makedirs(SORTIE, exist_ok=True)
carnet = sn.load_notebook(note, policy='loose')
for i in range(carnet.get_total_pages()):
    image = ImageConverter(carnet).convert(i).convert('L')  # niveaux de gris
    image.thumbnail((LARGEUR, LARGEUR))
    # 16 niveaux de gris suffisent pour un dessin au trait : fichiers bien plus légers
    image.quantize(16).save(os.path.join(SORTIE, f'{i + 1}.png'), optimize=True)
    print(f'✔ page {i + 1}')
