// Voir une image en grand : un <dialog> natif par-dessus tout le site.
// Fermer : Échap, ✕, ou clic à côté de l'image. Parcourir : ← → (clavier ou boutons).
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { VisionneuseContexte, useVisionneuse, type ImageVue } from '../lib/visionneuse'

type Etat = { liste: ImageVue[]; index: number } | null

export function Visionneuse({ children }: { children: ReactNode }) {
  const [etat, setEtat] = useState<Etat>(null)
  const dialogue = useRef<HTMLDialogElement>(null)

  const ouvrir = useCallback((liste: ImageVue[], index: number) => setEtat({ liste, index }), [])
  const fermer = () => dialogue.current?.close() // déclenche onClose
  const decaler = (d: number) =>
    setEtat((e) => e && { ...e, index: (e.index + d + e.liste.length) % e.liste.length })

  useEffect(() => {
    const dlg = dialogue.current
    if (etat && dlg && !dlg.open) dlg.showModal()
  }, [etat])

  const image = etat?.liste[etat.index]
  const plusieurs = (etat?.liste.length ?? 0) > 1

  return (
    <VisionneuseContexte.Provider value={ouvrir}>
      {children}
      <dialog
        ref={dialogue}
        className="visionneuse"
        onClose={() => setEtat(null)}
        onClick={(e) => e.target === e.currentTarget && fermer()} // clic sur le fond
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') decaler(1)
          if (e.key === 'ArrowLeft') decaler(-1)
        }}
      >
        {image && (
          <>
            <img src={image.src} alt={image.titre ?? ''} onClick={fermer} />
            {image.titre && <p className="legende">{image.titre}</p>}
            <button className="fermer" onClick={fermer} aria-label="Fermer" autoFocus>
              ✕
            </button>
            {plusieurs && (
              <>
                <button className="precedente" onClick={() => decaler(-1)} aria-label="Image précédente">
                  ←
                </button>
                <button className="suivante" onClick={() => decaler(1)} aria-label="Image suivante">
                  →
                </button>
              </>
            )}
          </>
        )}
      </dialog>
    </VisionneuseContexte.Provider>
  )
}

/** Une image qu'on peut cliquer pour la voir en grand */
export function ImageCliquable({
  src,
  liste,
  index = 0,
  alt = '',
  loading,
}: {
  src: string // l'image affichée dans la page (vignette ou grande)
  liste: ImageVue[] // ce qu'on verra en grand (au moins cette image)
  index?: number
  alt?: string
  loading?: 'lazy'
}) {
  const ouvrir = useVisionneuse()
  return (
    <button className="image-cliquable" onClick={() => ouvrir(liste, index)} aria-label={`Agrandir ${alt}`.trim()}>
      <img src={src} alt={alt} loading={loading} />
    </button>
  )
}
