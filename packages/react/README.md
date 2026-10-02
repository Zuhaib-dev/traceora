<div align="center">
  <br/>
  <img src="../../logo.svg" alt="Traceora" width="64" height="64" />
  <h1>@traceora/react</h1>
  <p><strong>React bindings, Context Providers & DevTools UI for Traceora.</strong></p>

  <a href="https://www.npmjs.com/package/@traceora/react"><img src="https://img.shields.io/npm/v/@traceora/react.svg?style=flat-square&color=099268" alt="npm" /></a>&ensp;
  <a href="https://www.npmjs.com/package/@traceora/react"><img src="https://img.shields.io/npm/dm/@traceora/react?style=flat-square&color=099268" alt="downloads" /></a>&ensp;
  <a href="https://github.com/zuhaib-dev/traceora/blob/main/LICENSE"><img src="https://img.shields.io/github/license/zuhaib-dev/traceora?style=flat-square&color=099268" alt="license" /></a>
  <br/><br/>
</div>

> Connects React's lifecycle, your network requests, and unhandled errors into a single, comprehensive timeline — with a beautiful floating DevTools overlay.

---

## 📥 Installation

```bash
npm install @traceora/react @traceora/core
```

> **Tip:** Also install [`@traceora/vite-plugin`](../vite-plugin) for zero-config auto-tracking of every component.

---

## ✨ Exports

| Export | Type | Description |
|---|---|---|
| `<TraceoraProvider>` | Component | Initializes the core engine, instruments `fetch`/`XHR`/History API, catches errors, shares the `EventEmitter` via React Context. |
| `<TraceoraErrorBoundary>` | Component | Intercepts React render crashes → logs them to the timeline → shows a fallback UI. |
| `<TraceoraDevtools />` | Component | Floating, real-time visual timeline for development. Drop it in and go. |
| `useTrace()` | Hook | Manually trace specific interactions (e.g., complex button flows). |
| `useComponentTrace()` | Hook | Injected automatically by the Vite plugin. Tracks component mount & render. |

---

## 🔧 Usage

### 1. Wrap your application

```tsx
import {
  TraceoraProvider,
  TraceoraErrorBoundary,
  TraceoraDevtools,
} from '@traceora/react';

function App() {
  return (
    <TraceoraProvider>
      <TraceoraErrorBoundary>
        <YourApp />
        <TraceoraDevtools /> {/* Floating timeline overlay */}
      </TraceoraErrorBoundary>
    </TraceoraProvider>
  );
}
```

### 2. Trace interactions manually

```tsx
import { useTrace } from '@traceora/react';

export function UserProfile() {
  const startTrace = useTrace();

  const handleSave = () => {
    // Links this click + any subsequent API calls under one Trace ID
    const trace = startTrace('Save_Profile');

    // fetch is already instrumented by TraceoraProvider
    fetch('/api/save', { method: 'POST' });
  };

  return <button onClick={handleSave}>Save</button>;
}
```

---

## 🔗 Related Packages

| Package | Role |
|---|---|
| [`@traceora/core`](../core) | The underlying event engine |
| [`@traceora/vite-plugin`](../vite-plugin) | Auto-injects tracking into every component |
| [`@traceora/next`](../next) | Next.js-specific integration |

---

<div align="center">
  <sub>Part of the <a href="https://github.com/zuhaib-dev/traceora">Traceora</a> ecosystem · Built by <a href="https://zuhaibrashid.com">Zuhaib Rashid</a></sub>
</div>
