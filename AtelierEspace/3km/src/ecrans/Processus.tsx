// Dernier écran — le processus de création : esquisses, technologies, toutes les photos
// ✏️ Les textes et les légendes sont un brouillon : réécris-les avec tes mots.
// Toutes les images s'ouvrent en grand au clic.
import { ImageCliquable } from '../components/Visionneuse'
import { photos, urlPhoto } from '../lib/donnees'

const TECHNOLOGIES = [
  ['Visorando', 'tracé de la ligne droite et enregistrement GPS des deux marches'],
  ['Supernote', 'esquisses et storyboard du site'],
  ['React + TypeScript', "l'interface, écran par écran"],
  ['Vite', 'outil de développement'],
  ['Leaflet + Plan IGN', 'la carte'],
  ['GitHub + Vercel', 'code source et mise en ligne'],
  [
    'Intelligence artificielle : Claude Opus 5.5 (Anthropic)',
    'assistant de programmation (Claude Code) : écriture du code avec moi, scripts de données, mise en ligne',
  ],
]

// Les pages de la note Supernote (public/media/esquisses/<page>.png, voir npm run esquisses).
// Les pages 1 et 9 sont les en-têtes des séances : elles deviennent les titres.
const SEANCES = [
  {
    titre: 'Séance 4 — 01.10.2026',
    pages: [
      [2, 'La première idée, une manière plus immersive de raconter'],
      [3, 'Le plan initial : après une conversation avec le professeur'],
      [4, 'Physique : « Sainté, sentiment et conflit », un livre sur le contraste de la ville'],
      [5, 'Physique : « Livre-Jeu de rôle de Sainté », reconter la histoire de la marche de manière immersive aussi'],
      [6, 'La vidéo et la carte, idée changer de plan, solement une image'],
      [7, 'Deux images, l’une sur l’autre, comparation entre les differentes marches, sur le architecture et ambiance'],
      [8, 'La fin, idée changer de plan aussi'],
    ],
  },
  {
    titre: 'Storyboard — 02.10.2026',
    pages: [
      [10, 'première wireframe du site'],
      [11, ' « C’est le chemin… », une idée de narration immersive'],
      [12, ' « Il y a deux chemins »'],
      [13, 'Le départ'],
      [14, 'Chez moi, la rue, marcher, image suivante, storyboard du video que foi descarté'],
      [15, 'Les deux images et la carte'],
      [16, 'Le fin de la journée'],
    ],
  },
] as const

const esquisse = (page: number) => `/media/esquisses/${page}.png`

export function Processus({ onRecommencer }: { onRecommencer: () => void }) {
  return (
    <section className="ecran processus">
      <header>
        <h1>Processus</h1>
        <p>
          Une ligne droite de 3 km tracée sur la carte, depuis chez moi. Je l'ai suivie à pied deux fois, par les
          rues : le 22–23 septembre puis le 24 septembre 2026. À chaque arrêt, une photo, et un mot pour la nommer.
        </p>
      </header>

      <h2>Esquisses</h2>
      {SEANCES.map((seance) => {
        const enGrand = seance.pages.map(([page, legende]) => ({ src: esquisse(page), titre: legende }))
        return (
          <div key={seance.titre} className="seance">
            <h3>{seance.titre}</h3>
            <ul className="esquisses">
              {seance.pages.map(([page, legende], i) => (
                <li key={page}>
                  <ImageCliquable src={esquisse(page)} alt={legende} liste={enGrand} index={i} loading="lazy" />
                  <span>{legende}</span>
                </li>
              ))}
            </ul>
          </div>
        )
      })}

      <h2>Technologies</h2>
      <dl className="technologies">
        {TECHNOLOGIES.map(([nom, role]) => (
          <div key={nom}>
            <dt>{nom}</dt>
            <dd>{role}</dd>
          </div>
        ))}
      </dl>

      <h2>Les photos</h2>
      <div className="dossiers">
        {[1, 2].map((chemin) => {
          const liste = photos.filter((p) => p.chemin === chemin)
          const enGrand = liste.map((p) => ({ src: urlPhoto(p), titre: `${p.n}. ${p.titre}` }))
          return (
            <div key={chemin} className={`dossier chemin-${chemin}`}>
              <h3>{chemin === 1 ? '22–23.09.2026' : '24.09.2026'}</h3>
              <ul>
                {liste.map((p, i) => (
                  <li key={p.n}>
                    <ImageCliquable src={urlPhoto(p, 'vignette')} alt={p.titre} liste={enGrand} index={i} loading="lazy" />
                    <span>
                      {p.n}. {p.titre}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>

      <button className="recommencer" onClick={onRecommencer}>
        ↺ Recommencer
      </button>
    </section>
  )
}
