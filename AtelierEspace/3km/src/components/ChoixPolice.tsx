// Provisoire : comparer les polices de titre (Oswald ou Arvo), aussi sur téléphone.
// Ouvrir le site avec ?police=arvo (ou ?police=oswald) : la police change, et un petit
// sélecteur apparaît en haut à gauche. Le choix est gardé dans ce navigateur.
// Une fois la police choisie : la mettre dans --police-titre (index.css) et supprimer ce fichier.
import { useState } from 'react'

const POLICES = ['oswald', 'arvo'] as const
type Police = (typeof POLICES)[number]
const CLE = 'police-titre'

function lire(): Police | null {
  const demandee = new URLSearchParams(location.search).get('police')
  if (POLICES.includes(demandee as Police)) return demandee as Police
  try {
    const gardee = localStorage.getItem(CLE)
    if (POLICES.includes(gardee as Police)) return gardee as Police
  } catch {
    // stockage indisponible (navigation privée…) : tant pis
  }
  return null
}

function appliquer(police: Police) {
  document.documentElement.dataset.police = police
  try {
    localStorage.setItem(CLE, police)
  } catch {
    // idem
  }
}

const initiale = lire()
if (initiale) appliquer(initiale)

export function ChoixPolice() {
  const [police, setPolice] = useState(initiale)
  if (!police) return null // sans ?police=…, rien ne s'affiche
  return (
    <div className="choix-police" role="group" aria-label="Police des titres">
      {POLICES.map((p) => (
        <button
          key={p}
          aria-pressed={p === police}
          onClick={() => {
            appliquer(p)
            setPolice(p)
          }}
        >
          {p === 'oswald' ? 'Oswald' : 'Arvo'}
        </button>
      ))}
    </div>
  )
}
