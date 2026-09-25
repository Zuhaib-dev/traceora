# @traceora/core

The core, framework-agnostic runtime intelligence engine for Traceora.

Traceora is not just an error logger. It's an intelligent runtime toolkit that reconstructs the exact sequence of events (mounts, renders, clicks, API calls, and errors) that occur in your application.

## Installation

```bash
npm install @traceora/core
```

## Usage

This package is typically used under the hood by framework adapters like `@traceora/react`, but you can use it independently in any JavaScript/TypeScript environment:

```typescript
import { EventStore, EventEmitter, setupNetworkInstrumentation, setupErrorInstrumentation, PerformanceMonitor } from "@traceora/core";

const store = new EventStore();
const emitter = new EventEmitter(store);

// Automatically intercept window.fetch
setupNetworkInstrumentation(emitter);

// Automatically catch window.onerror and unhandledrejection
setupErrorInstrumentation(emitter);

// Automatically monitor for performance issues (e.g., duplicate requests)
new PerformanceMonitor(emitter);

// Manually track a trace
const trace = emitter.startTrace("User_Login");
trace.emit({ type: "USER_INTERACTION", source: "Submit_Button" });
```

## Author

Created by [Zuhaib Rashid](https://zuhaibrashid.com) | [GitHub: zuhaib-dev](https://github.com/zuhaib-dev/traceora)
