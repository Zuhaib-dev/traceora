import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { TraceoraProvider, TraceoraErrorBoundary } from '@traceora/react'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TraceoraProvider>
      <TraceoraErrorBoundary>
        <App />
      </TraceoraErrorBoundary>
    </TraceoraProvider>
  </StrictMode>,
)
