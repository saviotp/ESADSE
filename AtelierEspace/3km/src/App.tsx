// L'enchaînement des écrans.
// L'écran courant est dans l'adresse (#droite, #parcours/3…) : on peut recharger
// la page ou partager un lien sans revenir au début.
import { useEffect, useState } from 'react'
import { EcranCarte } from './ecrans/EcranCarte'
import { Intro } from './ecrans/Intro'
import { Merci } from './ecrans/Merci'
import { Parcours } from './ecrans/Parcours'
import { Processus } from './ecrans/Processus'
import { etapes as calculerEtapes } from './lib/donnees'

const etapes = calculerEtapes()
const DERNIERE = etapes.length

const ECRANS = ['intro', 'droite', 'deux', 'parcours', 'merci', 'processus'] as const
type Ecran = (typeof ECRANS)[number]
type Position = { ecran: Ecran; etape: number }

function lireAdresse(): Position {
  const [nom, n] = location.hash.slice(1).split('/')
  const ecran = (ECRANS as readonly string[]).includes(nom) ? (nom as Ecran) : 'intro'
  const etape = Math.min(DERNIERE, Math.max(1, Number(n) || 1))
  return { ecran, etape }
}

export default function App() {
  const [pos, setPos] = useState<Position>(lireAdresse)

  // l'adresse suit l'écran, et les boutons Précédent/Suivant du navigateur marchent
  useEffect(() => {
    const hash = pos.ecran === 'parcours' ? `#parcours/${pos.etape}` : `#${pos.ecran}`
    if (location.hash === hash) return
    if (location.hash === '') history.replaceState(null, '', hash)
    else history.pushState(null, '', hash)
  }, [pos])
  useEffect(() => {
    const retour = () => setPos(lireAdresse())
    window.addEventListener('popstate', retour)
    return () => window.removeEventListener('popstate', retour)
  }, [])

  const aller = (ecran: Ecran, etape = 1) => setPos({ ecran, etape })
  const ecranSuivant = () => aller(ECRANS[ECRANS.indexOf(pos.ecran) + 1] ?? 'intro')
  const etapeSuivante = () =>
    pos.etape < DERNIERE ? aller('parcours', pos.etape + 1) : aller('merci')

  switch (pos.ecran) {
    case 'intro':
      return <Intro onSuivant={ecranSuivant} />
    case 'droite':
      return (
        <EcranCarte traces={['droite']} onSuivant={ecranSuivant}>
          <p>C'est le chemin.</p>
          <p>Mais j'en ai fait un peu plus…</p>
        </EcranCarte>
      )
    case 'deux':
      return (
        <EcranCarte traces={['chemin1', 'chemin2']} onSuivant={ecranSuivant}>
          <p>
            Il y a <strong>DEUX</strong> chemins.
          </p>
        </EcranCarte>
      )
    case 'parcours':
      return (
        <Parcours
          etapes={etapes}
          active={pos.etape}
          onChoisir={(id) => aller('parcours', id)}
          onSuivant={etapeSuivante}
        />
      )
    case 'merci':
      return <Merci onSuivant={ecranSuivant} />
    case 'processus':
      return <Processus onRecommencer={() => aller('intro')} />
  }
}
