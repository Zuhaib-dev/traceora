# Traceora Documentation

Welcome to the Traceora documentation folder.

## Architecture

Traceora follows a scalable, composable architecture.

```text
                TRACEORA
                    │
              ┌─────▼─────┐
              │   CORE    │
              │           │
              │ Event     │
              │ Engine    │
              │ Trace     │
              │ Context   │
              └─────┬─────┘
                    │
             ┌──────▼──────┐
             │    REACT    │
             │   ADAPTER   │
             └──────┬──────┘
                    │
             React Application
```

### `@traceora/core`
The core package is completely framework agnostic. It handles:
- Defining the shape of a `TraceEvent`.
- `EventStore`: In-memory storage for events.
- `EventEmitter`: Standardized way to emit events with UUIDs and precise timestamps.

### `@traceora/react`
The React adapter connects React's rendering lifecycle to the core event engine.
- Tracks `COMPONENT_MOUNT`, `COMPONENT_RENDER`, `COMPONENT_UNMOUNT`.
- Exposes `<TraceoraProvider>` to wrap the application.

*More documentation to be added as features are developed.*
