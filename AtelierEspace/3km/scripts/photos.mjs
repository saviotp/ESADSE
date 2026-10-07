// Photos → src/data/photos.json (+ copies réduites dans public/media pour le développement)
//
// - n et titre viennent du nom du fichier : « 12Mort.jpg » → { n: 12, titre: "Mort" }
// - l'heure vient de l'EXIF ; si une trace couvre cette heure, on calcule la position
//   (GPX Visorando pour 22 → 54, Linha do Tempo Google pour 1 → 21)
// - sinon, la position vient de src/data/placements.json (placée à la main dans /selection)
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import exifr from 'exifr'
import { SOURCE_DIR, DATA_DIR, MEDIA_DIR, PHOTO_DIRS, DECALAGE_EXIF } from './config.mjs'

const traces = ['chemin1-22sept', 'chemin1', 'chemin2'].map((id) => JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'traces', `${id}.json`), 'utf8')))
const fichierPlacements = path.join(DATA_DIR, 'placements.json')
const placements = fs.existsSync(fichierPlacements) ? JSON.parse(fs.readFileSync(fichierPlacements, 'utf8')) : {}

fs.mkdirSync(path.join(MEDIA_DIR, 'thumbs'), { recursive: true })

const photos = []
for (const { chemin, dossier } of PHOTO_DIRS) {
  const dir = path.join(SOURCE_DIR, dossier)
  for (const brut of fs.readdirSync(dir)) {
    const fichier = brut.normalize('NFC') // macOS écrit les accents en NFD
    const m = fichier.match(/^(\d+)(.+)\.jpe?g$/i)
    if (!m) continue // fichiers sans nom : ignorés
    const n = Number(m[1])
    const titre = m[2]
    const source = path.join(dir, brut)

    const exif = await exifr.parse(source, { pick: ['DateTimeOriginal', 'OffsetTimeOriginal'], reviveValues: false })
    const heure = exif?.DateTimeOriginal ? parseExif(exif.DateTimeOriginal, exif.OffsetTimeOriginal) : null

    let position = heure ? positionParHeure(heure) : null
    let source_position = position ? 'gpx' : null
    if (placements[n]) {
      position = placements[n]
      source_position = 'manuel'
    }

    copierReduite(source, path.join(MEDIA_DIR, `${n}.jpg`), 1600)
    copierReduite(source, path.join(MEDIA_DIR, 'thumbs', `${n}.jpg`), 400)

    photos.push({
      n,
      titre,
      fichier,
      chemin,
      heure: heure ? new Date(heure).toISOString() : null,
      lat: position?.lat ?? null,
      lng: position?.lng ?? null,
      position: source_position,
      cloudinaryId: `atelier-espaces/3km/${n}`,
    })
  }
}

photos.sort((a, b) => a.n - b.n)
fs.writeFileSync(path.join(DATA_DIR, 'photos.json'), JSON.stringify(photos, null, 2) + '\n')

const sansPosition = photos.filter((p) => p.lat === null).map((p) => p.n)
console.log(`${photos.length} photos → src/data/photos.json`)
console.log(`  position GPX : ${photos.filter((p) => p.position === 'gpx').length}`)
console.log(`  position manuelle : ${photos.filter((p) => p.position === 'manuel').length}`)
console.log(`  sans position (${sansPosition.length}) : ${sansPosition.join(', ') || '—'}`)

// « 2026:09:23 08:09:50 » → millisecondes UTC
function parseExif(texte, offset) {
  const [d, t] = texte.split(' ')
  return Date.parse(`${d.replaceAll(':', '-')}T${t}${offset || DECALAGE_EXIF}`)
}

// Interpolation linéaire entre les deux points GPX qui encadrent l'heure de la photo
function positionParHeure(t) {
  for (const trace of traces) {
    const { coords, times } = trace
    if (t < times[0] || t > times[times.length - 1]) continue
    for (let i = 1; i < times.length; i++) {
      if (times[i] >= t) {
        const f = times[i] === times[i - 1] ? 0 : (t - times[i - 1]) / (times[i] - times[i - 1])
        const [lng0, lat0] = coords[i - 1]
        const [lng1, lat1] = coords[i]
        return { lat: round(lat0 + (lat1 - lat0) * f), lng: round(lng0 + (lng1 - lng0) * f) }
      }
    }
  }
  return null
}

function copierReduite(source, dest, taille) {
  if (fs.existsSync(dest)) return
  execFileSync('sips', ['-Z', String(taille), '-s', 'format', 'jpeg', '-s', 'formatOptions', '80', source, '--out', dest], { stdio: 'ignore' })
}

function round(n) {
  return Math.round(n * 1e6) / 1e6
}
