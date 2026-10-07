// Un marqueur rond avec un texte (numéro, « D », « A »), stylé en CSS (.marqueur)
import { useMemo } from 'react'
import L from 'leaflet'
import { Marker } from 'react-leaflet'
import type { LatLng } from '../lib/donnees'

type Props = {
  position: LatLng
  texte?: string | number
  classe?: string // ex. "marqueur-debut", "actif", "chemin-1"
  taille?: number
  onClick?: () => void
  titre?: string
  onDeplacer?: (position: LatLng) => void // rend le marqueur déplaçable à la souris
}

export function Marqueur({ position, texte = '', classe = '', taille = 28, onClick, titre, onDeplacer }: Props) {
  const icon = useMemo(
    () =>
      L.divIcon({
        className: `marqueur ${classe}`,
        html: `<span>${texte}</span>`,
        iconSize: [taille, taille],
      }),
    [texte, classe, taille],
  )
  return (
    <Marker
      position={position}
      icon={icon}
      title={titre}
      draggable={!!onDeplacer}
      eventHandlers={{
        ...(onClick && { click: onClick }),
        ...(onDeplacer && {
          dragend: (e) => {
            const { lat, lng } = e.target.getLatLng()
            onDeplacer([lat, lng])
          },
        }),
      }}
      keyboard={!!onClick}
    />
  )
}
