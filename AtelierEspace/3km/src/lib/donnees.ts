// Toutes les données du site, et quelques calculs géographiques simples.
import photosJson from '../data/photos.json'
import pointsJson from '../data/points.json'
import placementsJson from '../data/placements.json'
import droiteJson from '../data/traces/droite.json'
import chemin1Json from '../data/traces/chemin1.json'
import chemin2Json from '../data/traces/chemin2.json'

export type LatLng = [number, number] // [lat, lng], l'ordre de Leaflet

export type Photo = {
  n: number
  titre: string
  fichier: string
  chemin: 1 | 2
  heure: string | null
  lat: number | null
  lng: number | null
  position: 'gpx' | 'manuel' | null
  cloudinaryId: string
}

/** Un point intermédiaire : une photo de chaque chemin (à l'écran : chemin 2 en haut, chemin 1 en bas) */
export type Paire = { chemin1: number; chemin2: number }

export type Points = { paires: Paire[] }

// Les positions placées à la main (outil /selection) remplacent celles du script
export const placements = placementsJson as Record<string, { lat: number; lng: number }>
export const photos: Photo[] = (photosJson as Photo[]).map((p) =>
  placements[p.n] ? { ...p, ...placements[p.n], position: 'manuel' } : p,
)
export const points = pointsJson as Points
export const photoParNumero = new Map(photos.map((p) => [p.n, p]))

// Les traces sont en [lng, lat] (GeoJSON) → on les retourne en [lat, lng]
const versLeaflet = (coords: number[][]): LatLng[] => coords.map(([lng, lat]) => [lat, lng])
export const traces = {
  chemin1: versLeaflet(chemin1Json.coords),
  chemin2: versLeaflet(chemin2Json.coords),
}

export const D: LatLng = versLeaflet(droiteJson.coords)[0]
export const A: LatLng = versLeaflet(droiteJson.coords).at(-1)!

/** Distance en km entre deux points (formule de haversine) */
export function distanceKm([lat1, lng1]: LatLng, [lat2, lng2]: LatLng): number {
  const R = 6371
  const rad = Math.PI / 180
  const dLat = (lat2 - lat1) * rad
  const dLng = (lng2 - lng1) * rad
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

export const LONGUEUR_KM = distanceKm(D, A)

/** Projette un point sur la ligne droite D → A : renvoie la fraction 0…1 (0 = D, 1 = A) */
export function fractionSurDroite([lat, lng]: LatLng): number {
  // À cette échelle (3 km), on peut traiter lat/lng comme un plan,
  // en corrigeant la longitude par cos(latitude).
  const k = Math.cos((D[0] * Math.PI) / 180)
  const ax = (A[1] - D[1]) * k, ay = A[0] - D[0]
  const px = (lng - D[1]) * k, py = lat - D[0]
  const t = (px * ax + py * ay) / (ax * ax + ay * ay)
  return Math.min(1, Math.max(0, t))
}

export function pointSurDroite(t: number): LatLng {
  return [D[0] + (A[0] - D[0]) * t, D[1] + (A[1] - D[1]) * t]
}

// Les photos du départ (D) et de l'arrivée (A)
export const PHOTO_DEBUT = 1 // « Début »
export const PHOTO_FIN = 30 // « Fini »

export type Etape = {
  id: number // 1 … 12
  type: 'debut' | 'paire' | 'fin'
  position: LatLng
  km: number
  photo?: Photo // D et A : une seule photo (1 « Début », 30 « Fini »)
  chemin1?: Photo
  chemin2?: Photo
}

/**
 * Les étapes du parcours : D, puis chaque paire (placée sur la ligne droite
 * à la moyenne de ses deux photos), puis A. Triées de D vers A.
 */
export function etapes(paires: Paire[] = points.paires, liste: Photo[] = photos): Etape[] {
  const parNumero = new Map(liste.map((p) => [p.n, p]))
  const milieu = paires
    .map((p) => {
      const chemin1 = parNumero.get(p.chemin1)
      const chemin2 = parNumero.get(p.chemin2)
      const fractions = [chemin1, chemin2]
        .filter((ph): ph is Photo => ph?.lat != null)
        .map((ph) => fractionSurDroite([ph.lat!, ph.lng!]))
      const t = fractions.length ? fractions.reduce((a, b) => a + b) / fractions.length : 0.5
      return { t, chemin1, chemin2 }
    })
    .sort((a, b) => a.t - b.t)

  return [
    { id: 1, type: 'debut', position: D, km: 0, photo: parNumero.get(PHOTO_DEBUT) },
    ...milieu.map((m, i) => ({
      id: i + 2,
      type: 'paire' as const,
      position: pointSurDroite(m.t),
      km: m.t * LONGUEUR_KM,
      chemin1: m.chemin1,
      chemin2: m.chemin2,
    })),
    { id: milieu.length + 2, type: 'fin', position: A, km: LONGUEUR_KM, photo: parNumero.get(PHOTO_FIN) },
  ]
}

// ---------- Images ----------
const CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined

/** URL d'une photo : Cloudinary si configuré, sinon la copie locale (public/media) */
export function urlPhoto(p: Photo, taille: 'grande' | 'vignette' = 'grande'): string {
  if (CLOUD) {
    const w = taille === 'grande' ? 1600 : 400
    return `https://res.cloudinary.com/${CLOUD}/image/upload/f_auto,q_auto,w_${w}/${p.cloudinaryId}`
  }
  return taille === 'grande' ? `/media/${p.n}.jpg` : `/media/thumbs/${p.n}.jpg`
}
