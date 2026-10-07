// Écran pénultième — le remerciement
import { BoutonSuivant } from '../components/BoutonSuivant'

export function Merci({ onSuivant }: { onSuivant: () => void }) {
  return (
    <section className="ecran merci">
      <p>J'espère que vous avez aimé marcher à mes côtés !</p>
      <BoutonSuivant onClick={onSuivant} texte="Le processus" />
    </section>
  )
}
