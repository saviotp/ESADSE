// Configuration commune aux scripts (lue depuis .env)
import 'dotenv/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
export const DATA_DIR = path.join(ROOT, 'src/data')
export const MEDIA_DIR = path.join(ROOT, 'public/media')

if (!process.env.SOURCE_DIR) {
  console.error('SOURCE_DIR manque dans .env (voir .env.example)')
  process.exit(1)
}
export const SOURCE_DIR = process.env.SOURCE_DIR

// Les deux dossiers de photos : chemin 1 (à l'est, en bas de l'écran) et chemin 2 (à l'ouest, en haut)
export const PHOTO_DIRS = [
  { chemin: 1, dossier: 'Photos/PremiereChamin' },
  { chemin: 2, dossier: 'Photos/DeuxièmeChamin' },
]

// Les traces GPX de Visorando
export const TRACES = [
  { id: 'droite', fichier: 'visorando-atelier-espace.gpx' }, // la ligne droite D → A (3 km)
  { id: 'chemin1', fichier: 'visorando-108394172.gpx' }, // 23/09, photos 22 → 30
  { id: 'chemin2', fichier: 'visorando-108504671.gpx' }, // 24/09, photos 31 → 54
]

// Les photos sont prises en France : l'heure EXIF est en heure de Paris (UTC+2 en septembre)
export const DECALAGE_EXIF = '+02:00'
