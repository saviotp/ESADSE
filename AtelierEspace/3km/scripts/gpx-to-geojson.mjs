// GPX (Visorando) → src/data/traces/<id>.json
// Chaque trace : { id, nom, coords: [[lng, lat], …], times: [ms | null, …] }
import fs from 'node:fs'
import path from 'node:path'
import { DOMParser } from '@xmldom/xmldom'
import { gpx } from '@tmcw/togeojson'
import { SOURCE_DIR, DATA_DIR, TRACES } from './config.mjs'

const outDir = path.join(DATA_DIR, 'traces')
fs.mkdirSync(outDir, { recursive: true })

for (const { id, fichier } of TRACES) {
  const xml = fs.readFileSync(path.join(SOURCE_DIR, fichier), 'utf8')
  const geo = gpx(new DOMParser().parseFromString(xml, 'text/xml'))

  // On garde les lignes (trk / rte), pas les points de passage
  const lignes = geo.features.filter((f) => f.geometry?.type === 'LineString' || f.geometry?.type === 'MultiLineString')
  const coords = []
  const times = []
  for (const f of lignes) {
    const parts = f.geometry.type === 'LineString' ? [f.geometry.coordinates] : f.geometry.coordinates
    const t = f.properties?.coordinateProperties?.times
    const tparts = !t ? parts.map(() => []) : f.geometry.type === 'LineString' ? [t] : t
    parts.forEach((part, i) => {
      part.forEach(([lng, lat], j) => {
        coords.push([round(lng), round(lat)])
        const iso = tparts[i]?.[j]
        times.push(iso ? Date.parse(iso) : null)
      })
    })
  }

  const nom = lignes[0]?.properties?.name ?? id
  fs.writeFileSync(path.join(outDir, `${id}.json`), JSON.stringify({ id, nom, coords, times }))
  const avecHeure = times.filter((t) => t !== null).length
  console.log(`${id}: ${coords.length} points (${avecHeure} avec l'heure) — ${nom}`)
}

function round(n) {
  return Math.round(n * 1e6) / 1e6
}
