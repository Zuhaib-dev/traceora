<div align="center">
  <br/>
  <img src="../../logo.svg" alt="Traceora" width="80" height="80" />
  <h1>Architecture & Internal Documentation</h1>
  <p><strong>A deep dive into how Traceora works under the hood.</strong></p>
  <br/>
</div>

---

## 🏗️ Architecture Overview

Traceora follows a **layered, composable architecture**. The core engine is entirely framework-agnostic — framework adapters (React, Next.js, Express) extend it with bindings specific to their runtime.

```
                    ┌─────────────────────────────┐
                    │       YOUR APPLICATION       │
                    └──────────────┬──────────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              │                    │                    │
     ┌────────▼────────┐  ┌───────▼────────┐  ┌───────▼────────┐
     │  @traceora/react │  │ @traceora/next │  │@traceora/express│
     │  ──────────────  │  │ ─────────────  │  │ ──────────────  │
     │  • Provider      │  │ • NextProvider │  │ • Middleware     │
     │  • ErrorBoundary │  │ • withTraceora │  │ • AsyncLocal-   │
     │  • DevTools UI   │  │ • traceAction  │  │   Storage ctx   │
     │  • useTrace()    │  │ • DB plugins   │  │ • Header inject │
     └────────┬────────┘  └───────┬────────┘  └───────┬────────┘
              │                    │                    │
              └────────────────────┼────────────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │       @traceora/core        │
                    │       ─────────────         │
                    │  • EventStore (ring buffer)  │
                    │  • EventEmitter (pub/sub)    │
                    │  • TraceID correlation       │
                    │  • fetch / XHR interceptors   │
                    │  • Error instrumentation      │
                    │  • Performance monitor        │
                    └─────────────────────────────┘
```

### Data Flow

1. **Frontend** — `@traceora/core` intercepts `fetch`, `XHR`, `onerror`, and the History API. The React/Next adapter adds component lifecycle events. Everything flows into a shared `EventStore`.
2. **Backend** — When a traced `fetch` fires, the React adapter attaches a `X-Traceora-TraceId` header. The Express / Next.js middleware picks it up, creates an `AsyncLocalStorage` context, and collects backend events.
3. **Bridge** — On response, the backend serializes collected events into the `X-Traceora-Events` header. The frontend deserializes them and merges them into the same timeline under the same Trace ID.
4. **DevTools** — The `<TraceoraDevtools />` overlay reads the `EventStore` in real-time and renders a glassmorphism timeline with filters, search, and one-click IDE jump.

---

## 📦 Package Breakdown

### [`@traceora/core`](../packages/core)

The foundation. No framework dependencies.

| Module | Purpose |
|---|---|
| `EventStore` | Bounded in-memory buffer — keeps the latest 1,000 events by default. |
| `EventEmitter` | Pub/sub system — each event gets a UUID + high-res timestamp. |
| `setupNetworkInstrumentation()` | Monkey-patches `fetch` and `XHR` to capture request/response pairs. |
| `setupErrorInstrumentation()` | Hooks `window.onerror` and `unhandledrejection`. |
| `PerformanceMonitor` | Detects spam renders and rapid duplicate network calls. |

### [`@traceora/react`](../packages/react)

Connects React's lifecycle to the core engine.

| Export | Purpose |
|---|---|
| `<TraceoraProvider>` | Initializes core, instruments `fetch`/`XHR`/`History`, shares context. |
| `<TraceoraErrorBoundary>` | Catches React render crashes → logs to timeline → shows fallback. |
| `<TraceoraDevtools />` | Floating real-time timeline overlay for development. |
| `useTrace()` | Manual hook to trace specific user interactions. |
| `useComponentTrace()` | Injected by the Vite plugin into supported named function components with block bodies. |

### [`@traceora/vite-plugin`](../packages/vite-plugin)

Zero-config DX magic.

- Runs a Babel pass during Vite's `transform` step.
- Detects all React functional components via AST analysis.
- Injects `useComponentTrace("ComponentName")` at the top of each component body.
- Result: 100% component coverage with zero manual effort.

### [`@traceora/next`](../packages/next)

Full-stack tracing for Next.js App Router.

| Export | Purpose |
|---|---|
| `<TraceoraNextProvider>` | Client-side provider — same as React but optimized for Next.js hydration. |
| `withTraceora()` | Wraps Route Handlers to create a backend trace context. |
| `traceAction()` | Collects server-local action events; an `onTrace` callback is needed to access them. |
| `traceoraPrismaExtension()` | Auto-traces every Prisma query within a request. |
| `traceoraMongoosePlugin` | Auto-traces every Mongoose operation within a request. |

### [`@traceora/express`](../packages/express)

Express middleware adapter.

| Export | Purpose |
|---|---|
| `traceora()` | Middleware — reads `X-Traceora-TraceId`, creates `AsyncLocalStorage` context, injects events into response headers. |

### [`@traceora/node`](../packages/node)

Shared backend primitives used by both `@traceora/express` and `@traceora/next`.

| Export | Purpose |
|---|---|
| `emitTraceEvent()` | Pushes an event into the current request's trace context. Safe no-op outside a request. |
| `traceoraPrismaExtension()` | Prisma client extension for automatic query tracing. |
| `traceoraMongoosePlugin` | Mongoose plugin for automatic operation tracing. |

---

## 🗺️ Roadmap

| Status | Phase | Milestone |
|---|---|---|
| ✅ | Phase 1 | Core Engine & Memory Store |
| ✅ | Phase 2 | React Bindings & DevTools UI |
| ✅ | Phase 3 | Auto-Tracking (Vite Plugin) |
| ✅ | Phase 4 | Network & Error Intelligence |
| 🔄 | Phase 5 | Next.js SSR & Server Components |
| 📋 | Phase 6 | Express / Node.js Backend Tracing |
| 📋 | Phase 7 | Standalone CLI Dashboard |

---

## 📄 License

MIT © [Zuhaib Rashid](https://zuhaibrashid.com)

<div align="center">
  <br/>
  <a href="https://github.com/zuhaib-dev">GitHub</a>&ensp;·&ensp;
  <a href="https://zuhaibrashid.com">Portfolio</a>&ensp;·&ensp;
  <a href="https://x.com/xuhaib_x9">Twitter</a>
  <br/><br/>
</div>
