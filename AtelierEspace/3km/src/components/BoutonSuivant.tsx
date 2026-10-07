// Le bouton « suivant », toujours dans le coin inférieur droit de l'écran
export function BoutonSuivant({ onClick, texte = 'Suivant' }: { onClick: () => void; texte?: string }) {
  return (
    <button className="bouton-suivant" onClick={onClick}>
      {texte} <span aria-hidden="true">→</span>
    </button>
  )
}
