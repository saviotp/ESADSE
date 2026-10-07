// Envoie sur Cloudinary toutes les photos nommées (le dernier écran les montre toutes)
// Usage : npm run upload
import fs from 'node:fs'
import path from 'node:path'
import { v2 as cloudinary } from 'cloudinary'
import { SOURCE_DIR, DATA_DIR, PHOTO_DIRS } from './config.mjs'

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env
if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  console.error('Remplis CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET dans .env')
  process.exit(1)
}
cloudinary.config({ cloud_name: CLOUDINARY_CLOUD_NAME, api_key: CLOUDINARY_API_KEY, api_secret: CLOUDINARY_API_SECRET })

const photos = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'photos.json'), 'utf8'))
for (const p of photos) {
  const dossier = PHOTO_DIRS.find((d) => d.chemin === p.chemin).dossier
  const source = trouver(path.join(SOURCE_DIR, dossier), p.fichier)
  await cloudinary.uploader.upload(source, { public_id: p.cloudinaryId, overwrite: true, resource_type: 'image' })
  console.log(`✔ ${p.n} ${p.titre}`)
}

// Les noms de fichiers peuvent être en NFD sur macOS
function trouver(dir, nom) {
  const f = fs.readdirSync(dir).find((x) => x.normalize('NFC') === nom)
  return path.join(dir, f)
}
