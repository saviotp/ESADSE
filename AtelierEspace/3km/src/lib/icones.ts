// Les icônes de la carte, dessinées en SVG.
import L from 'leaflet'

// ── Pins D / A, comme sur les fiches Visorando ──
const VISORANDO = {
  D: { fond: '#8db63c', bord: '#6d8f2a' },
  A: { fond: '#d9534a', bord: '#a93a33' },
}

/**
 * `pivot` : sur une carte tournée de -90°, on tourne l'icône de +90°
 * autour de sa pointe, pour qu'elle reste debout à l'écran.
 */
export function pinVisorando(lettre: 'D' | 'A', pivot = false) {
  const { fond, bord } = VISORANDO[lettre]
  return L.divIcon({
    className: `pin-visorando ${pivot ? 'pivot' : ''}`,
    iconSize: [34, 46],
    iconAnchor: [17, 46], // la pointe
    html: `<svg viewBox="0 0 34 46" width="34" height="46" aria-hidden="true">
      <path d="M17 45C17 45 2 27 2 17a15 15 0 0 1 30 0c0 10-15 28-15 28z" fill="${fond}" stroke="${bord}" stroke-width="2"/>
      <circle cx="17" cy="17" r="10" fill="#fff"/>
      <text x="17" y="22" text-anchor="middle" font-family="Montserrat, sans-serif" font-weight="700" font-size="14" fill="${bord}">${lettre}</text>
    </svg>`,
  })
}

// ── Épingle de détective : tête ronde + aiguille ──
// `entouree` : le cercle dessiné à la main autour de l'épingle active
export function epingle(entouree: boolean, numero: number) {
  return L.divIcon({
    className: `epingle ${entouree ? 'entouree' : ''}`,
    iconSize: [24, 38],
    iconAnchor: [12, 38], // la pointe de l'aiguille
    html: `
      ${
        entouree
          ? `<svg class="cercle" viewBox="0 0 80 80" aria-hidden="true">
              <path d="M44 9C24 6 8 20 9 40c1 19 17 32 35 30 18-2 29-17 27-34C69 20 55 10 37 12"
                fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
            </svg>`
          : ''
      }
      <svg class="corps" viewBox="0 0 24 38" width="24" height="38" aria-hidden="true">
        <line x1="12" y1="18" x2="12" y2="37" stroke="#8a8a8a" stroke-width="2" stroke-linecap="round"/>
        <circle cx="12" cy="11" r="9" fill="currentColor"/>
        <circle cx="9" cy="8" r="3" fill="#fff" opacity=".55"/>
      </svg>
      <span class="numero">${numero}</span>`,
  })
}
