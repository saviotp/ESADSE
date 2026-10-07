import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ChoixPolice } from './components/ChoixPolice.tsx'
import { Visionneuse } from './components/Visionneuse.tsx'

// L'outil /selection n'existe qu'en développement (npm run dev)
const Selection = lazy(() => import('./selection/Selection.tsx').then((m) => ({ default: m.Selection })))
const pageSelection = import.meta.env.DEV && location.pathname.startsWith('/selection')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {pageSelection ? (
      <Suspense>
        <Selection />
      </Suspense>
    ) : (
      <Visionneuse>
        <App />
        <ChoixPolice />
      </Visionneuse>
    )}
  </StrictMode>,
)
