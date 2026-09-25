<div align="center">
  <img src="https://via.placeholder.com/150x150/1971c2/ffffff?text=Traceora" alt="Traceora Logo" width="120" height="120" style="border-radius: 20px;" />
  
  <h1>Traceora</h1>
  <p><strong>Runtime Intelligence & Telemetry for Modern Applications</strong></p>

  [![npm version](https://img.shields.io/npm/v/@traceora/core.svg?style=flat-square)](https://www.npmjs.com/package/@traceora/core)
  [![license](https://img.shields.io/npm/l/@traceora/core.svg?style=flat-square)](https://github.com/zuhaib-dev/traceora/blob/main/LICENSE)
</div>

<hr />

## What is Traceora?

Traceora is not just an error logger. It is a **full-stack runtime intelligence toolkit** designed to help developers understand exactly what their applications are doing in production. 

Instead of hunting through `console.log` statements or trying to decipher isolated crash reports, Traceora reconstructs the exact sequence of events (mounts, renders, clicks, API calls, state changes, and errors) into a beautifully unified timeline.

### Why use it?
1. **Zero-Config Tracing**: With our Vite plugin, every component in your app is automatically traced. No manual hooks required.
2. **Causality Tracking**: Group related events (e.g., a button click ➡️ 4 state changes ➡️ 2 API calls) under a single `TraceID`.
3. **Performance Intelligence**: Detect excessive component re-renders or duplicate API requests automatically.
4. **Missing Context**: When an error happens, Traceora shows you the exact user interactions and network requests that led up to it.

## The Ecosystem

Traceora is built as a highly composable monorepo:

| Package | Description |
|---|---|
| [`@traceora/core`](./packages/core/README.md) | The framework-agnostic event engine. Handles network interception, error catching, and the memory store. |
| [`@traceora/react`](./packages/react/README.md) | React-specific bindings. Includes context providers, error boundaries, and the floating DevTools timeline. |
| [`@traceora/vite-plugin`](./packages/vite-plugin/README.md) | The magic. A custom Babel compiler that automatically injects tracking code into your React components during build. |

## Quick Setup (React + Vite)

It only takes 2 minutes to get full runtime intelligence in your React application.

### 1. Install

```bash
npm install @traceora/core @traceora/react @traceora/vite-plugin
```

### 2. Configure Vite Plugin

Open your `vite.config.ts` and add the Traceora plugin to automatically track all your components.

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { traceoraPlugin } from '@traceora/vite-plugin'

export default defineConfig({
  plugins: [traceoraPlugin(), react()],
})
```

### 3. Wrap your App

Open `main.tsx` and wrap your application in the Traceora Provider and Error Boundary.

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'

import { TraceoraProvider, TraceoraErrorBoundary, TraceoraDevtools } from '@traceora/react'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TraceoraProvider>
      <TraceoraErrorBoundary>
        <App />
        
        {/* Floating timeline overlay for development */}
        <TraceoraDevtools />
      </TraceoraErrorBoundary>
    </TraceoraProvider>
  </StrictMode>,
)
```

## Contributing

We welcome contributions! To run Traceora locally:

```bash
# Clone the repository
git clone https://github.com/zuhaib-dev/traceora.git
cd traceora

# Install dependencies
pnpm install

# Run the package builders in watch mode
pnpm dev

# Run the playground test app (in a separate terminal)
cd examples/react-vite
pnpm dev
```

---

<div align="center">
  <h3>Author</h3>
  <p>Built with ❤️ by <strong>Zuhaib Rashid</strong></p>
  <a href="https://zuhaibrashid.com">🌍 Portfolio</a> &nbsp; | &nbsp; 
  <a href="https://github.com/zuhaib-dev">🐙 GitHub</a> &nbsp; | &nbsp; 
  <a href="https://twitter.com/zuhaib_rashid">🐦 Twitter / X</a> &nbsp; | &nbsp; 
  <a href="https://www.linkedin.com/in/zuhaibrashid/">💼 LinkedIn</a>
</div>
