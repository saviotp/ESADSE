// Outil /selection (développement seulement)
// 1. Placer à la main les photos sans position (1 → 21)
// 2. Composer les 6 paires : une photo du 2e chemin (en haut à l'écran) + une du 1er (en bas)
import { useEffect, useRef, useState } from 'react'
import { Carte } from '../components/Carte'
import { Marqueur } from '../components/Marqueur'
import {
  etapes,
  photos as photosInitiales,
  placements as placementsInitiaux,
  points as pointsInitiaux,
  traces,
  urlPhoto,
  type LatLng,
  type Paire,
  type Photo,
} from '../lib/donnees'
import './selection.css'

const NB_PAIRES = 6

export function Selection() {
  const [placements, setPlacements] = useState(placementsInitiaux)
  const [paires, setPaires] = useState<Paire[]>(pointsInitiaux.paires)
  const [active, setActive] = useState<number | null>(null) // photo sélectionnée
  const [choix1, setChoix1] = useState<number | null>(null) // photo du 1er chemin
  const [choix2, setChoix2] = useState<number | null>(null) // photo du 2e chemin
  const [aimanter, setAimanter] = useState(true)
  const [message, setMessage] = useState('')
  const [paireActive, setPaireActive] = useState<number | null>(null) // épingle cliquée sur la carte

  const photos: Photo[] = photosInitiales.map((p) =>
    placements[p.n] ? { ...p, ...placements[p.n], position: 'manuel' } : p,
  )
  const dansUnePaire = new Set(paires.flatMap((p) => [p.chemin1, p.chemin2]))

  function choisir(p: Photo) {
    setActive(p.n)
    setPaireActive(null)
    if (p.chemin === 1) setChoix1(p.n)
    else setChoix2(p.n)
  }

  function placer(pos: LatLng, n = active) {
    if (n == null) return
    const [lat, lng] = aimanter ? plusProche(pos, traces.chemin1.concat(traces.chemin2)) : pos
    setPlacements((avant) => ({ ...avant, [n]: { lat: arrondi(lat), lng: arrondi(lng) } }))
  }

  // Suppr / Retour arrière : supprime la paire active (épingle cliquée),
  // sinon enlève la position placée à la main de la photo active
  // (une photo placée par le GPX revient à sa position GPX)
  useEffect(() => {
    const touche = (e: KeyboardEvent) => {
      if (e.key !== 'Delete' && e.key !== 'Backspace') return
      if ((e.target as HTMLElement).closest('input, textarea')) return
      if (paireActive != null) {
        e.preventDefault()
        setPaires((avant) => avant.filter((_, j) => j !== paireActive))
        setPaireActive(null)
        return
      }
      if (active == null) return
      e.preventDefault()
      setPlacements((avant) => {
        const { [active]: _enleve, ...reste } = avant
        return reste
      })
    }
    window.addEventListener('keydown', touche)
    return () => window.removeEventListener('keydown', touche)
  }, [active, paireActive])

  function ajouterPaire() {
    if (choix1 == null || choix2 == null) return
    setPaires([...paires, { chemin1: choix1, chemin2: choix2 }])
    setChoix1(null)
    setChoix2(null)
  }

  // Sauvegarde automatique : chaque changement est écrit dans src/data (0,4 s après)
  const premierRendu = useRef(true)
  useEffect(() => {
    if (premierRendu.current) {
      premierRendu.current = false
      return
    }
    setMessage('…')
    const minuteur = setTimeout(async () => {
      const ok = await Promise.all([
        fetch('/__sauver/placements.json', { method: 'POST', body: JSON.stringify(placements) }),
        fetch('/__sauver/points.json', { method: 'POST', body: JSON.stringify({ ...pointsInitiaux, paires }) }),
      ]).catch(() => [])
      setMessage(ok.length && ok.every((r) => r.ok) ? 'Sauvé ✔' : '⚠ Erreur de sauvegarde (npm run dev tourne ?)')
    }, 400)
    return () => clearTimeout(minuteur)
  }, [placements, paires])

  const photoActive = photos.find((p) => p.n === active)
  const etapesActuelles = etapes(paires, photos)

  function supprimerPaire(i: number) {
    setPaires(paires.filter((_, j) => j !== i))
    setPaireActive(null)
  }

  // Clic sur une épingle de la carte → on retrouve sa paire dans la liste
  function choisirEtape(id: number) {
    const e = etapesActuelles.find((x) => x.id === id)
    const i = paires.findIndex((p) => p.chemin1 === e?.chemin1?.n && p.chemin2 === e?.chemin2?.n)
    setPaireActive(i >= 0 ? i : null)
    document.querySelector('.paires li:nth-child(' + (i + 1) + ')')?.scrollIntoView({ block: 'nearest' })
  }

  return (
    <div className="selection">
      <aside>
        <header>
          <h1>Sélection</h1>
          <p className={paires.length === NB_PAIRES ? 'ok' : ''}>
            {paires.length} / {NB_PAIRES} paires · {paires.length * 2} images
          </p>
          <span className="message">{message}</span>
        </header>

        {[2, 1].map((chemin) => (
          <section key={chemin}>
            <h2>{chemin === 2 ? '2e chemin (haut)' : '1er chemin (bas)'}</h2>
            <div className="grille">
              {photos
                .filter((p) => p.chemin === chemin)
                .map((p) => (
                  <button
                    key={p.n}
                    className={[
                      'vignette',
                      p.n === active && 'active',
                      (p.n === choix1 || p.n === choix2) && 'choisie',
                      dansUnePaire.has(p.n) && 'utilisee',
                      p.lat == null && 'sans-position',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => choisir(p)}
                    title={`${p.n} ${p.titre}`}
                  >
                    <img src={urlPhoto(p, 'vignette')} alt="" loading="lazy" />
                    <span>
                      {p.n} {p.titre}
                    </span>
                  </button>
                ))}
            </div>
          </section>
        ))}
      </aside>

      <main>
        <Carte traces={['droite', 'chemin1', 'chemin2']} className="carte-selection" onClic={placer}>
          {photos
            .filter((p) => p.lat != null)
            .map((p) => (
              <Marqueur
                key={p.n}
                position={[p.lat!, p.lng!]}
                texte={p.n}
                taille={22}
                classe={`photo chemin-${p.chemin} ${p.n === active ? 'actif' : ''}`}
                onClick={() => choisir(p)}
                onDeplacer={(pos) => {
                  choisir(p)
                  placer(pos, p.n)
                }}
                titre={p.titre}
              />
            ))}
          {etapesActuelles.map((e) => (
            <Marqueur
              key={`e${e.id}`}
              position={e.position}
              texte={e.id}
              classe={`etape ${e.type === 'paire' && paires[paireActive ?? -1]?.chemin1 === e.chemin1?.n ? 'actif' : ''}`}
              onClick={e.type === 'paire' ? () => choisirEtape(e.id) : undefined}
              titre={e.type === 'paire' ? `${e.chemin2?.titre} / ${e.chemin1?.titre}` : undefined}
            />
          ))}
        </Carte>

        <div className="outils">
          {photoActive && (
            <p>
              <strong>
                {photoActive.n} {photoActive.titre}
              </strong>{' '}
              —{' '}
              {photoActive.lat == null
                ? 'sans position : clique sur la carte pour la placer'
                : photoActive.position === 'manuel'
                  ? 'placée à la main : glisse le point ou clique sur la carte pour la déplacer, Suppr pour l’enlever'
                  : 'position GPX : glisse le point pour la corriger'}
              <label>
                <input type="checkbox" checked={aimanter} onChange={(e) => setAimanter(e.target.checked)} />{' '}
                aimanter sur les traces
              </label>
            </p>
          )}

          <div className="apercu">
            <Moitie n={choix2} photos={photos} vide="choisis une photo du 2e chemin" />
            <Moitie n={choix1} photos={photos} vide="choisis une photo du 1er chemin" />
            <button disabled={choix1 == null || choix2 == null} onClick={ajouterPaire}>
              Ajouter la paire
            </button>
          </div>

          <ol className="paires">
            {paires.map((p, i) => {
              const numero = etapesActuelles.find((e) => e.chemin1?.n === p.chemin1 && e.chemin2?.n === p.chemin2)?.id
              return (
                <li key={`${p.chemin1}-${p.chemin2}`} className={paireActive === i ? 'active' : ''}>
                  <span className="numero">{numero}</span>
                  <MiniPhoto n={p.chemin2} photos={photos} />
                  <MiniPhoto n={p.chemin1} photos={photos} />
                  <button className="supprimer" onClick={() => supprimerPaire(i)}>
                    Supprimer
                  </button>
                </li>
              )
            })}
          </ol>
        </div>
      </main>
    </div>
  )
}

function Moitie({ n, photos, vide }: { n: number | null; photos: Photo[]; vide: string }) {
  const p = photos.find((ph) => ph.n === n)
  if (!p) return <div className="moitie vide">{vide}</div>
  return (
    <div className="moitie">
      <img src={urlPhoto(p, 'vignette')} alt="" />
      <span>
        {p.n} {p.titre}
      </span>
    </div>
  )
}

function MiniPhoto({ n, photos }: { n: number; photos: Photo[] }) {
  const p = photos.find((ph) => ph.n === n)
  if (!p) return null
  return (
    <figure className={`mini chemin-${p.chemin}`}>
      <img src={urlPhoto(p, 'vignette')} alt="" />
      <figcaption>
        {p.n} {p.titre}
      </figcaption>
    </figure>
  )
}

/** Le point le plus proche sur une liste de segments (approximation plane, suffisante à 3 km) */
function plusProche([lat, lng]: LatLng, ligne: LatLng[]): LatLng {
  let meilleur: LatLng = [lat, lng]
  let dMin = Infinity
  for (let i = 1; i < ligne.length; i++) {
    const [aLat, aLng] = ligne[i - 1]
    const [bLat, bLng] = ligne[i]
    const dx = bLng - aLng, dy = bLat - aLat
    const l2 = dx * dx + dy * dy
    const t = l2 ? Math.max(0, Math.min(1, ((lng - aLng) * dx + (lat - aLat) * dy) / l2)) : 0
    const p: LatLng = [aLat + dy * t, aLng + dx * t]
    const d = (p[0] - lat) ** 2 + (p[1] - lng) ** 2
    if (d < dMin) {
      dMin = d
      meilleur = p
    }
  }
  return meilleur
}

const arrondi = (n: number) => Math.round(n * 1e6) / 1e6
