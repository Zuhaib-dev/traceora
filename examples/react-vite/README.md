<div align="center">
  <br/>
  <img src="../../logo.svg" alt="Traceora" width="64" height="64" />
  <h1>Traceora Playground — React + Vite</h1>
  <p><strong>A fully instrumented example app for testing & developing Traceora.</strong></p>
  <br/>
</div>

> This is the development playground used to test every Traceora feature: component auto-tracking, network interception, error boundaries, the DevTools timeline, and live network mocking.

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18
- [pnpm](https://pnpm.io/) installed globally

### Run the playground

From the **monorepo root**:

```bash
# 1. Install all dependencies
pnpm install

# 2. Build all packages in watch mode
pnpm dev

# 3. In a new terminal — start the playground
cd examples/react-vite
pnpm dev
```

The app will be available at `http://localhost:5173`.

---

## 🧪 What to Test

Once the playground is running, you can verify:

| Feature | How to test |
|---|---|
| **Auto-Tracking** | Open the Traceora DevTools overlay — every component mount/render is logged automatically. |
| **Network Tracing** | Trigger any `fetch` call — the request/response pair appears in the timeline. |
| **Error Boundary** | Throw an error in a component — the error is caught, logged, and a fallback is shown. |
| **IDE Jump** | Click "Editor" on an error event with a local source frame. The Vite dev server opens it in VS Code or Cursor when the editor CLI is available. |
| **Network Mocking** | Click "Mock Request" on any API call in the timeline to intercept it on the fly. |

---

## 🛠️ Tech Stack

- **Vite** — Dev server with HMR
- **React 18** — UI framework
- **TypeScript** — Strict mode enabled
- **@traceora/vite-plugin** — Instruments supported named function components

---

<div align="center">
  <sub>Part of the <a href="https://github.com/zuhaib-dev/traceora">Traceora</a> ecosystem · Built by <a href="https://zuhaibrashid.com">Zuhaib Rashid</a></sub>
</div>
