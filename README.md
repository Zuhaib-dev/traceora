# Traceora

> Runtime intelligence for modern applications.

Traceora is an open-source debugging toolkit that helps developers understand what their applications are actually doing at runtime.

Instead of hunting through `console.log` statements or trying to decipher isolated crash reports, Traceora reconstructs the exact sequence of events (mounts, renders, clicks, API calls, state changes, and errors) into a unified timeline.

## Packages

- **`@traceora/core`**: The framework-agnostic event engine and memory store. It handles network interception, global error capturing, and performance diagnostics.
- **`@traceora/react`**: React-specific bindings, hooks, context providers, and the floating DevTools timeline.

## Why Traceora?

1. **Causality Tracking**: Group related events (a button click -> 4 state changes -> 2 API calls) under a single `TraceID`.
2. **Performance Intelligence**: Detect excessive component re-renders or duplicate API requests automatically at runtime without manual performance profiling.
3. **Missing Context**: When an error happens, Traceora shows you the exact events that led up to it.

## Development

Traceora uses a `pnpm` monorepo.

```bash
# Install dependencies
pnpm install

# Run the build watcher for the packages
pnpm dev

# Run the playground test app (in a separate terminal)
cd examples/react-vite
pnpm dev
```

## Author

Created by [Zuhaib Rashid](https://zuhaibrashid.com).

**GitHub**: [@zuhaib-dev](https://github.com/zuhaib-dev/traceora)
