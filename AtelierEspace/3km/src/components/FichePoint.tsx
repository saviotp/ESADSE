// ─────────────────────────────────────────────────────────────
//  À TOI DE JOUER ✏️  — les deux photos d'un point
// ─────────────────────────────────────────────────────────────
// Ce composant reçoit une étape de type « paire » :
//   etape.chemin2 → la photo du 2e chemin (à gauche sur la carte → en haut, bordure bleue)
//   etape.chemin1 → la photo du 1er chemin (à droite sur la carte → en bas, bordure rouge)
// Chaque photo a : n (numéro), titre (le mot : « Brutalisme »…), et
// urlPhoto(photo) donne l'adresse de l'image.
//
// Ce qui marche déjà : les deux images, l'une sur l'autre, avec leur bordure ;
// un clic sur une image l'ouvre en grand (← → pour passer à l'autre).
//
// Exercices (dans l'ordre) :
//   1. Afficher le titre-mot de chaque photo par-dessus l'image
//      (indice : un <figcaption className="mot">…</figcaption> dans chaque <figure>).
//   2. Afficher le km du point : « 1,2 km »
//      (indice : etape.km.toFixed(1).replace('.', ','))
//   3. Dans src/index.css, styler .mot à ton goût (position, police, couleur).
//
// Rappel : on n'écrit jamais « Chemin A / Chemin B » sur le site.

import { urlPhoto, type Etape, type Photo } from '../lib/donnees'
import { ImageCliquable } from './Visionneuse'

export function FichePoint({ etape }: { etape: Etape }) {
  // ce qu'on voit en grand, dans l'ordre de l'écran (haut, puis bas)
  const enGrand = [etape.chemin2, etape.chemin1]
    .filter((p): p is Photo => !!p)
    .map((p) => ({ src: urlPhoto(p), titre: p.titre }))

  return (
    <div className="fiche-point">
      {etape.chemin2 && (
        <figure className="photo chemin-2">
          <ImageCliquable src={urlPhoto(etape.chemin2)} alt={etape.chemin2.titre} liste={enGrand} index={0} />
          {/* 1. le titre-mot ici */}
        </figure>
      )}

      {etape.chemin1 && (
        <figure className="photo chemin-1">
          <ImageCliquable
            src={urlPhoto(etape.chemin1)}
            alt={etape.chemin1.titre}
            liste={enGrand}
            index={enGrand.length - 1}
          />
          {/* 1. le titre-mot ici */}
        </figure>
      )}

      {/* 2. le km ici */}
    </div>
  )
}
