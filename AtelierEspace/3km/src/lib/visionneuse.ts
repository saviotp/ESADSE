// La visionneuse plein écran : n'importe quel composant peut l'ouvrir avec
//   const ouvrir = useVisionneuse()
//   ouvrir(liste, index)   // liste = les images qu'on pourra parcourir avec ← →
import { createContext, useContext } from 'react'

export type ImageVue = { src: string; titre?: string }

export const VisionneuseContexte = createContext<(liste: ImageVue[], index: number) => void>(() => {})

export const useVisionneuse = () => useContext(VisionneuseContexte)
