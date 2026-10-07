import fs from 'node:fs'
import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

// En développement seulement : l'outil /selection envoie ses JSON ici
// (POST /__sauver/points.json) et on les écrit dans src/data.
const FICHIERS_AUTORISES = ['points.json', 'placements.json']

function sauverDonnees(): Plugin {
  return {
    name: 'sauver-donnees',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__sauver', (req, res) => {
        const nom = (req.url ?? '').replace(/^\//, '')
        if (req.method !== 'POST' || !FICHIERS_AUTORISES.includes(nom)) {
          res.statusCode = 400
          return res.end('fichier non autorisé')
        }
        let corps = ''
        req.on('data', (c) => (corps += c))
        req.on('end', () => {
          const json = JSON.parse(corps)
          const fichier = path.resolve('src/data', nom)
          fs.writeFileSync(fichier, JSON.stringify(json, null, 2) + '\n')
          // Pas de rechargement de la page (le fichier est ignoré par le watcher),
          // mais le prochain chargement lira bien la nouvelle version.
          server.moduleGraph.getModulesByFile(fichier)?.forEach((m) => server.moduleGraph.invalidateModule(m))
          res.end('ok')
        })
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), sauverDonnees()],
  server: {
    watch: { ignored: FICHIERS_AUTORISES.map((f) => `**/src/data/${f}`) },
  },
})
