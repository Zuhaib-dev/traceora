# @traceora/core

> The intelligent, framework-agnostic runtime engine for Traceora.

[![npm version](https://img.shields.io/npm/v/@traceora/core.svg?style=flat-square)](https://www.npmjs.com/package/@traceora/core)

This package contains the core logic for the Traceora ecosystem. It handles event aggregation, trace ID generation, network interception, global error handling, and performance heuristics.

## Installation

```bash
npm install @traceora/core
```

## Features

- **Event Bus (`EventEmitter`)**: A publish-subscribe pattern that decoupled event generation from storage.
- **Trace Context (`TraceID`)**: Correlates events that belong to the same logical interaction (e.g. A user clicks a button, which triggers a network request).
- **Network Interception**: Automatically wraps `window.fetch` to capture request/response data and detect duplicate requests.
- **Error Intelligence**: Captures `window.onerror` and `unhandledrejection` events.
- **Performance Monitor**: Detects spam renders or rapidly repeating network requests.

## Usage

This package is typically used under the hood by framework adapters like `@traceora/react`, but you can use it independently in any JavaScript/TypeScript environment:

```typescript
import { EventStore, EventEmitter, setupNetworkInstrumentation, setupErrorInstrumentation, PerformanceMonitor } from "@traceora/core";

// 1. Initialize the storage and emitter
const store = new EventStore();
const emitter = new EventEmitter(store);

// 2. Automatically intercept window.fetch
setupNetworkInstrumentation(emitter);

// 3. Automatically catch window.onerror and unhandledrejection
setupErrorInstrumentation(emitter);

// 4. Automatically monitor for performance issues
new PerformanceMonitor(emitter);

// 5. Manually track a trace
const trace = emitter.startTrace("User_Login");
trace.emit({ type: "USER_INTERACTION", source: "Submit_Button" });
```

---

### Author
**Zuhaib Rashid**
- 🌍 [zuhaibrashid.com](https://zuhaibrashid.com)
- 🐙 [GitHub: @zuhaib-dev](https://github.com/zuhaib-dev)
