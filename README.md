<div align="center">
  <img src="./logo.svg" alt="Traceora Logo" width="120" height="120" />
  
  <h1>Traceora</h1>
  <p><strong>Next-Generation Runtime Intelligence & Telemetry for Modern Applications</strong></p>

  <p>
    <a href="https://traceora-web.vercel.app/"><b>Website</b></a> •
    <a href="./docs/README.md"><b>Architecture Docs</b></a> •
    <a href="https://www.npmjs.com/package/@traceora/core"><b>NPM</b></a>
  </p>

  <p>
    <a href="https://www.npmjs.com/package/@traceora/core"><img src="https://img.shields.io/npm/v/@traceora/core.svg?style=flat-square&color=099268" alt="npm version" /></a>
    <a href="https://github.com/zuhaib-dev/traceora/blob/main/LICENSE"><img src="https://img.shields.io/github/license/zuhaib-dev/traceora?style=flat-square&color=099268" alt="license" /></a>
    <a href="https://www.npmjs.com/package/@traceora/core"><img src="https://img.shields.io/npm/dt/@traceora/core.svg?style=flat-square&color=099268" alt="npm downloads" /></a>
  </p>
</div>

<br/>

<div align="center">
  <a href="./traceora-showcase.mp4">
    <img src="./traceora-showcase.jpg" alt="Traceora Showcase" style="border-radius: 12px; max-width: 100%; box-shadow: 0 8px 30px rgba(0,0,0,0.12);" />
  </a>
</div>

<br/>

> **Traceora** is a full-stack runtime intelligence toolkit designed to help developers understand exactly what their applications are doing in production. It reconstructs the exact sequence of events (mounts, renders, clicks, API calls, state changes, and errors) into a beautifully unified timeline.

---

## ✨ God-Tier Features

Traceora is fully reimagined with features that give developers superpowers:

- 🪄 **One-Click IDE Jump**: Instantly open the exact file and line of code where an error occurred in your IDE (VSCode/Cursor) by simply clicking "Open in Editor" directly from the DevTools overlay.
- 🛑 **Live Network Mocking**: Click "Mock Request" on any API call to intercept and stub network traffic instantly. Force 500 errors or fake JSON responses on the fly without writing a single line of code.
- 🔗 **God View Waterfall**: Trace a single click from the frontend through Next.js Server Actions, Express APIs, and down to Prisma database queries in one unified, deeply nested timeline.
- ⚡ **Zero-Config Auto-Tracking**: With our Vite plugin, every component in your app is automatically traced. No manual hooks required.
- 🌐 **Universal Tracing**: Automatically intercepts `window.fetch`, `XMLHttpRequest`, console errors, and React renders into one sleek glassmorphism UI.

---

## 📦 The Ecosystem

Traceora is built as a highly composable monorepo. Dive into the individual packages:

| Package | Version | Description |
|---|---|---|
| 🧩 [`@traceora/core`](./packages/core) | [![npm](https://img.shields.io/npm/v/@traceora/core?style=flat-square)](https://www.npmjs.com/package/@traceora/core) | The framework-agnostic event engine. Handles network interception, error catching, and the memory store. |
| ⚛️ [`@traceora/react`](./packages/react) | [![npm](https://img.shields.io/npm/v/@traceora/react?style=flat-square)](https://www.npmjs.com/package/@traceora/react) | React-specific bindings. Includes context providers, error boundaries, and the floating DevTools timeline. |
| ▲ [`@traceora/next`](./packages/next) | [![npm](https://img.shields.io/npm/v/@traceora/next?style=flat-square)](https://www.npmjs.com/package/@traceora/next) | Next.js App Router integration. Tracks Server Components, Route Handlers, Server Actions, and DB queries. |
| ⚡ [`@traceora/vite-plugin`](./packages/vite-plugin) | [![npm](https://img.shields.io/npm/v/@traceora/vite-plugin?style=flat-square)](https://www.npmjs.com/package/@traceora/vite-plugin) | A custom Babel compiler that automatically injects tracking code into your React components during build. |
| 🚂 [`@traceora/express`](./packages/express) | [![npm](https://img.shields.io/npm/v/@traceora/express?style=flat-square)](https://www.npmjs.com/package/@traceora/express) | Express backend adapter. Injects backend errors straight into your frontend timeline. |
| 🟢 [`@traceora/node`](./packages/node) | [![npm](https://img.shields.io/npm/v/@traceora/node?style=flat-square)](https://www.npmjs.com/package/@traceora/node) | The shared backend core. Contains agnostic telemetry logic for all server environments. |

---

## 🚀 Quick Setup

Get full runtime intelligence in your application in under 2 minutes.

<details>
<summary><b>React + Vite</b></summary>

### 1. Install Dependencies

```bash
npm install @traceora/core @traceora/react @traceora/vite-plugin
```

### 2. Configure Vite Plugin

Update your `vite.config.ts`:

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { traceoraPlugin } from '@traceora/vite-plugin';

export default defineConfig({
  plugins: [traceoraPlugin(), react()],
});
```

### 3. Wrap your App

Update your `main.tsx`:

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

import { TraceoraProvider, TraceoraErrorBoundary, TraceoraDevtools } from '@traceora/react';

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
);
```
</details>

<details>
<summary><b>Next.js (App Router)</b></summary>

Traceora handles Server Components, Route Handlers, and Server Actions seamlessly.

### 1. Install Dependencies

```bash
npm install @traceora/next
```

### 2. Wrap your Layout

Open `app/layout.tsx` and add the provider:

```tsx
import { TraceoraNextProvider } from "@traceora/next/client";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <TraceoraNextProvider>
          {children}
        </TraceoraNextProvider>
      </body>
    </html>
  );
}
```

Check out the [Next.js documentation](./packages/next/README.md) for advanced tracking!
</details>

<details>
<summary><b>Express Backend</b></summary>

Seamlessly connect your backend logs to your frontend timeline.

### 1. Install Dependencies

```bash
npm install @traceora/express
```

### 2. Add Middleware

Add the middleware *before* your routes and expose custom headers:

```ts
import express from "express";
import cors from "cors";
import { traceora } from "@traceora/express";
import { emitTraceEvent } from "@traceora/node";

const app = express();

app.use(cors({ exposedHeaders: ["X-Traceora-Events"] }));
app.use(traceora());

app.get("/api/data", (req, res) => {
  // Instantly inject this backend event into your React DevTools!
  emitTraceEvent({
    type: "STATE_CHANGE",
    source: "MySQL",
    metadata: { query: "SELECT * FROM users" }
  });
  
  res.json({ ok: true });
});
```
</details>

---

## 🛠️ Tech Stack

Traceora is built for performance and developer experience using modern web technologies:

- **TypeScript**: 100% strictly typed codebase for maximum safety.
- **React 18**: Deep lifecycle bindings and sleek DevTools UI.
- **Vite & tsup**: Blazing fast ESM/CJS dual-format package bundling.
- **Babel**: Advanced AST (Abstract Syntax Tree) parsing for zero-config auto-tracking.
- **pnpm Workspaces**: Lightning-fast monorepo package management.

---

## 🤝 Contributing

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