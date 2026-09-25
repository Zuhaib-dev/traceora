<div align="center">
  <img src="./logo.svg" alt="Traceora Logo" width="100" height="100" style="border-radius: 20px; box-shadow: 0 8px 24px rgba(9, 146, 104, 0.3);" />
</div>

# @traceora/react

> React bindings, Context Providers, and UI components for Traceora.

[![npm version](https://img.shields.io/npm/v/@traceora/react.svg?style=flat-square)](https://www.npmjs.com/package/@traceora/react)

Traceora connects React's lifecycle, your network requests, and your unhandled errors into a single, comprehensive timeline.

## Installation

```bash
npm install @traceora/react @traceora/core
```

*(Note: We highly recommend also installing `@traceora/vite-plugin` for zero-config auto-tracking of all your components).*

## Features

- `<TraceoraProvider>`: Initializes the core engine, instruments `fetch`, catches global errors, and makes the `EventEmitter` available via React Context.
- `<TraceoraErrorBoundary>`: A robust error boundary that intercepts React render crashes and logs them to the Traceora timeline before showing a fallback UI.
- `<TraceoraDevtools />`: A floating, real-time visual timeline that you can drop into your app during development.
- `useTrace()`: A manual hook to trace specific interactions (like complex button clicks).

## Basic Usage

1. Wrap your application in the Traceora Provider and Error Boundary:

```tsx
import { TraceoraProvider, TraceoraErrorBoundary, TraceoraDevtools } from "@traceora/react";

function App() {
  return (
    <TraceoraProvider>
      <TraceoraErrorBoundary>
        <YourApp />
        
        {/* Floating timeline overlay for development */}
        <TraceoraDevtools />
      </TraceoraErrorBoundary>
    </TraceoraProvider>
  );
}
```

2. Trace interactions manually:

```tsx
import { useTrace } from "@traceora/react";

export function UserProfile() {
  const startTrace = useTrace();

  const handleSave = () => {
    // Links this click and any subsequent API calls to the same Trace ID
    const trace = startTrace("Save_Profile");
    
    // The native window.fetch is already instrumented by TraceoraProvider!
    fetch('/api/save', { method: 'POST' }); 
  };
  
  return <button onClick={handleSave}>Save</button>;
}
```

---

### Author
**Zuhaib Rashid**
- 🌍 [zuhaibrashid.com](https://zuhaibrashid.com)
- 🐙 [GitHub: @zuhaib-dev](https://github.com/zuhaib-dev)
