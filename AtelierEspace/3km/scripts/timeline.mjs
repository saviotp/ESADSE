// Linha do Tempo Google (« Vos trajets.json ») → src/data/traces/chemin1-22sept.json
//
// Le fichier exporté contient TOUT l'historique de localisation : on n'en garde
// que la fenêtre de la marche du 22/09 (photos 1 → 21). Le fichier d'origine
// reste dans OneDrive et n'est jamais copié dans le projet.
import fs from 'node:fs'
import path from 'node:path'
import { SOURCE_DIR, DATA_DIR } from './config.mjs'

const FICHIER = path.join(SOURCE_DIR, '..', 'Vos trajets.json')
// Segment « WALKING » de la Linha do Tempo : départ de chez moi → montée dans le tram
const DEBUT = Date.parse('2026-09-22T16:40:00+02:00')
const FIN = Date.parse('2026-09-22T17:27:40+02:00')
const PRECISION_MAX = 50 // mètres : on ignore les points trop imprécis

const d = JSON.parse(fs.readFileSync(FICHIER, 'utf8'))
const points = []

for (const r of d.rawSignals ?? []) {
  const p = r.position
  if (!p) continue
  const t = Date.parse(p.timestamp)
  if (t < DEBUT || t > FIN || (p.accuracyMeters ?? 999) > PRECISION_MAX) continue
  points.push([t, ...lireLatLng(p.LatLng)])
}
// (on n'utilise pas « timelinePath » : points lissés, sans précision, parfois à 200 m)

// tri par heure, sans doublons
points.sort((a, b) => a[0] - b[0])
const uniques = points.filter((p, i) => i === 0 || p[0] !== points[i - 1][0])

const trace = {
  id: 'chemin1-22sept',
  nom: 'Linha do Tempo Google — 22/09/2026',
  coords: uniques.map(([, lat, lng]) => [lng, lat]),
  times: uniques.map(([t]) => t),
}
fs.writeFileSync(path.join(DATA_DIR, 'traces', 'chemin1-22sept.json'), JSON.stringify(trace))
console.log(`chemin1-22sept: ${uniques.length} points (${new Date(DEBUT).toISOString()} → ${new Date(FIN).toISOString()})`)

// « 45.4378366°, 4.3888146° » → [45.4378366, 4.3888146]
function lireLatLng(texte) {
  const [lat, lng] = texte.replaceAll('°', '').split(',').map(Number)
  return [Math.round(lat * 1e6) / 1e6, Math.round(lng * 1e6) / 1e6]
}
