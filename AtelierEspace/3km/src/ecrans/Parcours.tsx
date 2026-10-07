// Écrans 4 → antépénultième — le parcours
//   à gauche : la photo du départ, les deux photos d'un point, ou la photo d'arrivée
//   à droite : la carte verticale (3 traces), fixe avec un cadenas,
//              et les épingles de détective sur la ligne droite
// (sur téléphone : les photos en haut, la carte en bas)
import { Marker } from 'react-leaflet'
import { BoutonSuivant } from '../components/BoutonSuivant'
import { Carte } from '../components/Carte'
import { FichePoint } from '../components/FichePoint'
import { ImageCliquable } from '../components/Visionneuse'
import { urlPhoto, type Etape, type Photo } from '../lib/donnees'
import { epingle } from '../lib/icones'

type Props = {
  etapes: Etape[]
  active: number // id de l'étape : 1 = D … dernière = A
  onChoisir: (id: number) => void
  onSuivant: () => void
}

export function Parcours({ etapes, active, onChoisir, onSuivant }: Props) {
  const etape = etapes.find((e) => e.id === active) ?? etapes[0]

  return (
    <section className="ecran parcours">
      <div className="contenu">
        {etape.type === 'paire' ? <FichePoint etape={etape} /> : etape.photo && <PhotoSeule photo={etape.photo} />}
      </div>

      <Carte traces={['chemin1', 'chemin2', 'droite']} cadenas className="carte-parcours">
        {etapes.map((e) => (
          <Marker
            key={e.id}
            position={e.position}
            icon={epingle(e.id === etape.id, e.id)}
            zIndexOffset={e.id === etape.id ? 1000 : 0}
            eventHandlers={{ click: () => onChoisir(e.id) }}
            title={e.type === 'debut' ? 'Départ' : e.type === 'fin' ? 'Arrivée' : `Point ${e.id}`}
          />
        ))}
      </Carte>

      <BoutonSuivant onClick={onSuivant} />
    </section>
  )
}

/** Départ (photo 1 « Début ») et arrivée (photo 30 « Fini ») : une seule photo, plein cadre */
function PhotoSeule({ photo }: { photo: Photo }) {
  const src = urlPhoto(photo)
  return (
    <figure className="photo-seule">
      <ImageCliquable src={src} alt={photo.titre} liste={[{ src, titre: photo.titre }]} />
    </figure>
  )
}
