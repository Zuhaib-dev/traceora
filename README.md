<div align="center">
  <img src="./logo.svg" alt="Traceora Logo" width="120" height="120" style="border-radius: 20px; box-shadow: 0 8px 24px rgba(9, 146, 104, 0.3);" />
  
  <h1>Traceora</h1>
  <p><strong>Runtime Intelligence & Telemetry for Modern Applications</strong></p>
  <p>🌍 <strong><a href="https://traceora-web.vercel.app/">Visit the Official Website</a></strong></p>

  [![npm version](https://img.shields.io/npm/v/@traceora/core.svg?style=flat-square)](https://www.npmjs.com/package/@traceora/core)
  [![license](https://img.shields.io/github/license/zuhaib-dev/traceora?style=flat-square)](https://github.com/zuhaib-dev/traceora/blob/main/LICENSE)
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
| [`@traceora/express`](./packages/express/README.md) | The backend adapter. Uses Node `AsyncLocalStorage` and HTTP Headers to seamlessly inject database and backend errors straight into your frontend timeline. |

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

## Quick Setup (Express Backend)

If you have a backend API, Traceora seamlessly connects your backend logs to your frontend timeline.

### 1. Install

```bash
npm install @traceora/express
```

### 2. Add Middleware

Add the traceora middleware *before* your routes. Make sure your `cors` is configured to expose the custom headers!

```ts
import express from "express";
import cors from "cors";
import { traceora, emitTraceEvent } from "@traceora/express";

const app = express();

app.use(cors({ exposedHeaders: ["X-Traceora-Events"] }));
app.use(traceora());

app.get("/api/data", (req, res) => {
  // Traceora will instantly inject this backend event into your React DevTools!
  emitTraceEvent({
    type: "STATE_CHANGE",
    source: "MySQL",
    metadata: { query: "SELECT * FROM users" }
  });
  
  res.json({ ok: true });
});
```

## Tech Stack

Traceora is built for performance and developer experience using modern web technologies:

- **TypeScript**: 100% strictly typed codebase for maximum safety.
- **React 18**: Deep lifecycle bindings and sleek DevTools UI.
- **Vite & tsup**: Blazing fast ESM/CJS dual-format package bundling.
- **Babel**: Advanced AST (Abstract Syntax Tree) parsing for zero-config auto-tracking.
- **pnpm Workspaces**: Lightning-fast monorepo package management.

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
  <img src="https://zuhaib-portfolio-tau.vercel.app/_next/image?url=%2FprofilePic.webp&w=256&q=75" alt="Zuhaib Rashid" width="100" height="100" style="border-radius: 50%; border: 2px solid #099268; margin-bottom: 10px;" />
  <br />
  <h3>Built by Zuhaib Rashid</h3>
  <p><strong>Full-Stack Engineer | MERN & Next.js | Scalable Web Applications | Generative AI & AI Integration</strong></p>
  <a href="https://zuhaibrashid.com">🌍 Portfolio</a> &nbsp; | &nbsp; 
  <a href="https://github.com/zuhaib-dev">🐙 GitHub</a> &nbsp; | &nbsp; 
  <a href="https://x.com/xuhaib_x9">🐦 Twitter / X</a> &nbsp; | &nbsp; 
  <a href="https://www.linkedin.com/in/zuhaib-rashid-661345318/">💼 LinkedIn</a>
</div>