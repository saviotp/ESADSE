// Écrans 2 et 3 — carte horizontale (80 %) + texte (20 %)
//   2 : la ligne droite seule — « C'est le chemin. Mais j'en ai fait un peu plus… »
//   3 : les deux chemins seuls — « Il y a DEUX chemins. »
import type { ReactNode } from 'react'
import { Marker } from 'react-leaflet'
import { BoutonSuivant } from '../components/BoutonSuivant'
import { Carte, type Trace } from '../components/Carte'
import { A, D } from '../lib/donnees'
import { pinVisorando } from '../lib/icones'

const PIN_D = pinVisorando('D', true)
const PIN_A = pinVisorando('A', true)

type Props = {
  traces: Trace[]
  children: ReactNode // le texte
  onSuivant: () => void
}

export function EcranCarte({ traces, children, onSuivant }: Props) {
  return (
    <section className="ecran ecran-carte">
      <Carte traces={traces} horizontale>
        <Marker position={D} icon={PIN_D} interactive={false} />
        <Marker position={A} icon={PIN_A} interactive={false} />
      </Carte>
      <div className="texte-lateral">{children}</div>
      <BoutonSuivant onClick={onSuivant} />
    </section>
  )
}
