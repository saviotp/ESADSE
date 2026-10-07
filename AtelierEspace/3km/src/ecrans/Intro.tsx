// Écran 1 — l'introduction (storyboard : « Sainté », image de fond à 30 %)
// Les textes, la police et l'organisation sont à toi : change-les librement.
import { BoutonSuivant } from '../components/BoutonSuivant'
import { photoParNumero, urlPhoto } from '../lib/donnees'

const FOND = photoParNumero.get(1) // « Début »

export function Intro({ onSuivant }: { onSuivant: () => void }) {
  return (
    <section className="ecran intro">
      {FOND && <img className="fond" src={urlPhoto(FOND)} alt="" />}
      <div className="texte">
        <p className="sur-titre">Atelier Espaces — Saint-Étienne</p>
        <h1>3 km</h1>
        <p>Une ligne droite de trois kilomètres, depuis chez moi.</p>
      </div>
      <BoutonSuivant onClick={onSuivant} texte="Entrer" />
    </section>
  )
}
