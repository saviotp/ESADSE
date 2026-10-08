// La carte : fond IGN + les traces choisies + des marqueurs.
//
// - `horizontale` : la carte est tournée de -90° (le nord à gauche), comme sur
//   les fiches Visorando : D se retrouve à gauche, A à droite.
// - `cadenas` : la carte est fixe ; un bouton cadenas permet de la déverrouiller.
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { MapContainer, Polyline, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import type { LatLngBoundsExpression } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { A, D, traces, type LatLng } from '../lib/donnees'

// Plan IGN (Géoplateforme) : gratuit, sans clé, même style que les fiches Visorando
const IGN =
  'https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0' +
  '&LAYER=GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2&STYLE=normal&TILEMATRIXSET=PM&FORMAT=image/png' +
  '&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}'

export type Trace = 'droite' | 'chemin1' | 'chemin2'

type Props = {
  traces: Trace[]
  children?: ReactNode // les marqueurs
  horizontale?: boolean
  cadenas?: boolean // fixe par défaut, avec un bouton pour déverrouiller
  interactive?: boolean // sans cadenas : libre (true) ou fixe (false)
  onClic?: (position: LatLng) => void
  className?: string
}

export function Carte({ traces: visibles, children, horizontale, cadenas, interactive = true, onClic, className }: Props) {
  const [verrouillee, setVerrouillee] = useState(true)
  const libre = cadenas ? !verrouillee : interactive && !horizontale
  const cle = visibles.join()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const cadre = useMemo(() => cadrage(visibles), [cle])

  return (
    <div className={`carte ${horizontale ? 'carte-horizontale' : ''} ${className ?? ''}`}>
      <div className="carte-interieur">
        <MapContainer
          bounds={cadre}
          boundsOptions={{ padding: [40, 40] }}
          zoomSnap={0.1} // zoom fractionnaire : le parcours remplit bien le cadre
          zoomDelta={0.5}
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer url={IGN} maxZoom={19} />
          {/* className en prop directe : Leaflet ne lit la classe qu'à la création du tracé
              (avec pathOptions, elle n'arrivait qu'en dev, grâce au double montage du StrictMode) */}
          {visibles.includes('chemin1') && <Polyline positions={traces.chemin1} className="trace trace-1" />}
          {visibles.includes('chemin2') && <Polyline positions={traces.chemin2} className="trace trace-2" />}
          {visibles.includes('droite') && <Polyline positions={[D, A]} className="trace trace-droite" />}
          <Interactions libre={libre} cadre={cadre} />
          {onClic && <Clics onClic={onClic} />}
          {children}
        </MapContainer>
      </div>

      {cadenas && (
        <button
          className="cadenas"
          onClick={() => setVerrouillee(!verrouillee)}
          aria-label={verrouillee ? 'Déverrouiller la carte' : 'Verrouiller la carte'}
          aria-pressed={!verrouillee}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <rect x="5" y="11" width="14" height="10" rx="2" fill="currentColor" />
            <path
              d={verrouillee ? 'M8 11V8a4 4 0 0 1 8 0v3' : 'M8 11V8a4 4 0 0 1 7.5-2'}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        </button>
      )}
      <span className="attribution">© IGN</span>
    </div>
  )
}

/** Le cadre de départ : englobe les traces visibles */
function cadrage(visibles: Trace[]): LatLngBoundsExpression {
  const pts: LatLng[] = [D, A]
  if (visibles.includes('chemin1')) pts.push(...traces.chemin1)
  if (visibles.includes('chemin2')) pts.push(...traces.chemin2)
  return pts
}

/** Active ou coupe le déplacement / zoom. En reverrouillant, on revient au cadre. */
function Interactions({ libre, cadre }: { libre: boolean; cadre: LatLngBoundsExpression }) {
  const map = useMap()
  // Si la taille du conteneur change (mise en page, fenêtre) :
  // - la première fois, ou si la carte est fixe → on recadre sur les traces
  // - si l'utilisateur a pu bouger la carte → on garde sa vue telle quelle
  const libreRef = useRef(libre)
  useEffect(() => {
    libreRef.current = libre
  }, [libre])
  useEffect(() => {
    let premiere = true
    const obs = new ResizeObserver(() => {
      map.invalidateSize({ pan: false })
      if (premiere || !libreRef.current) map.fitBounds(cadre, { padding: [40, 40] })
      premiere = false
    })
    obs.observe(map.getContainer())
    return () => obs.disconnect()
  }, [map, cadre])
  useEffect(() => {
    const outils = [map.dragging, map.scrollWheelZoom, map.doubleClickZoom, map.touchZoom, map.boxZoom, map.keyboard]
    outils.forEach((o) => (libre ? o.enable() : o.disable()))
    if (!libre) map.flyToBounds(cadre, { padding: [40, 40], duration: 0.6 })
  }, [libre, map, cadre])
  return null
}

function Clics({ onClic }: { onClic: (p: LatLng) => void }) {
  useMapEvents({ click: (e) => onClic([e.latlng.lat, e.latlng.lng]) })
  return null
}
