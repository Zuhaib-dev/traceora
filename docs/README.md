# Traceora Architecture & Documentation

Welcome to the Traceora internal documentation. 

This folder contains architectural notes and future specifications for the Traceora intelligence platform.

## Architecture Diagram

Traceora follows a highly scalable, composable monorepo architecture. 

```text
                TRACEORA ECOSYSTEM
                        │
                  ┌─────▼─────┐
                  │   CORE    │
                  │           │
                  │ Event     │
                  │ Engine    │
                  │ Trace ID  │
                  │ Monitors  │
                  └─────┬─────┘
                        │
         ┌──────────────┼──────────────┐
         │              │              │
  ┌──────▼──────┐┌──────▼──────┐┌──────▼──────┐
  │    REACT    ││   NEXT.JS   ││   EXPRESS   │
  │   ADAPTER   ││   ADAPTER   ││   ADAPTER   │
  └──────┬──────┘└──────┬──────┘└──────┬──────┘
         │              │              │
      Frontend       Server      Backend APIs
```

## Packages

### 1. `@traceora/core`
The core package is completely framework agnostic. It handles:
- **`EventStore`**: In-memory ring buffer storage for events.
- **`EventEmitter`**: Standardized way to emit events with UUIDs and precise timestamps.
- **Interceptors**: Wraps native APIs like `window.fetch`, `window.onerror`, and `unhandledrejection`.

### 2. `@traceora/react`
The React adapter connects React's rendering lifecycle to the core event engine.
- Tracks `COMPONENT_MOUNT`, `COMPONENT_RENDER`.
- Exposes `<TraceoraProvider>` to manage global context.
- Exposes `<TraceoraErrorBoundary>` to catch React-specific render crashes.
- Contains the `TraceoraDevtools` floating UI overlay.

### 3. `@traceora/vite-plugin`
Developer Experience (DX) tooling.
- Analyzes AST during build.
- Auto-injects `@traceora/react` hooks into all functional components.
- Achieves "Zero-Config" tracking.

## Roadmap

- [x] Phase 1: Core Engine & Memory Store
- [x] Phase 2: React Bindings
- [x] Phase 3: Auto-Tracking (Vite Plugin)
- [x] Phase 4: Network & Error Intelligence
- [ ] Phase 5: Next.js SSR & Server Components
- [ ] Phase 6: Express / Node.js Backend Tracing
- [ ] Phase 7: Standalone CLI Dashboard

---

### Author
**Zuhaib Rashid**
- 🌍 [zuhaibrashid.com](https://zuhaibrashid.com)
- 🐙 [GitHub: @zuhaib-dev](https://github.com/zuhaib-dev)
