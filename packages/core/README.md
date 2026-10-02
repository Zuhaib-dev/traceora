<div align="center">
  <br/>
  <img src="../../logo.svg" alt="Traceora" width="64" height="64" />
  <h1>@traceora/core</h1>
  <p><strong>The framework-agnostic runtime intelligence engine.</strong></p>

  <a href="https://www.npmjs.com/package/@traceora/core"><img src="https://img.shields.io/npm/v/@traceora/core.svg?style=flat-square&color=099268" alt="npm" /></a>&ensp;
  <a href="https://www.npmjs.com/package/@traceora/core"><img src="https://img.shields.io/npm/dm/@traceora/core?style=flat-square&color=099268" alt="downloads" /></a>&ensp;
  <a href="https://github.com/zuhaib-dev/traceora/blob/main/LICENSE"><img src="https://img.shields.io/github/license/zuhaib-dev/traceora?style=flat-square&color=099268" alt="license" /></a>
  <br/><br/>
</div>

> This package contains the core logic for the entire Traceora ecosystem. It is **completely framework-agnostic** — no React, no Express, no Next.js dependencies. Framework adapters build on top of it.

---

## 📥 Installation

```bash
npm install @traceora/core
```

---

## ✨ What's Inside

| Module | Description |
|---|---|
| **`EventStore`** | In-memory ring buffer that efficiently stores the last *N* events. |
| **`EventEmitter`** | Pub/sub system — every event gets a UUID and a high-resolution timestamp. |
| **`TraceID`** | Correlation engine — links related events (click → network request → response) under one trace. |
| **`setupNetworkInstrumentation()`** | Wraps `window.fetch` and `XMLHttpRequest` to capture request/response data and detect duplicates. |
| **`setupErrorInstrumentation()`** | Hooks `window.onerror` and `unhandledrejection` for automatic error capture. |
| **`PerformanceMonitor`** | Detects spam renders and rapidly repeating network requests. |

---

## 🔧 Usage

Most apps will use `@traceora/core` indirectly through `@traceora/react` or `@traceora/next`. But you can use it standalone in **any** JavaScript / TypeScript environment:

```typescript
import {
  EventStore,
  EventEmitter,
  setupNetworkInstrumentation,
  setupErrorInstrumentation,
  PerformanceMonitor,
} from '@traceora/core';

// 1. Initialize storage + emitter
const store = new EventStore();
const emitter = new EventEmitter(store);

// 2. Auto-intercept fetch & XHR
setupNetworkInstrumentation(emitter);

// 3. Auto-catch global errors
setupErrorInstrumentation(emitter);

// 4. Monitor for performance issues
new PerformanceMonitor(emitter);

// 5. Manually trace a flow
const trace = emitter.startTrace('User_Login');
await trace.fetch('/api/login', { method: 'POST' });
```

The trace handle's `fetch()` method attaches its trace ID to that request. Ordinary requests are recorded as their own traces. Request bodies and headers are omitted unless explicitly enabled in the React provider configuration.

---

## 🔗 Related Packages

| Package | Role |
|---|---|
| [`@traceora/react`](../react) | React bindings & DevTools UI |
| [`@traceora/vite-plugin`](../vite-plugin) | Build-time instrumentation for supported named function components |
| [`@traceora/next`](../next) | Next.js App Router integration |

---

<div align="center">
  <sub>Part of the <a href="https://github.com/zuhaib-dev/traceora">Traceora</a> ecosystem · Built by <a href="https://zuhaibrashid.com">Zuhaib Rashid</a></sub>
</div>
