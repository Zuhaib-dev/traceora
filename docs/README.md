# Traceora architecture and capabilities

Traceora is a local-first runtime diagnostics toolkit for React, Next.js, Express, and Node.js. Its core records a bounded event timeline in the application; framework integrations add events and UI. Traceora does not require a hosted service.

## How events flow

1. `@traceora/core` provides the event model, bounded store, network and error instrumentation, diagnostic reports, and OpenTelemetry conversion.
2. `@traceora/react` initializes browser instrumentation, exposes trace context, records React profiler timings, and renders the DevTools timeline.
3. `@traceora/vite-plugin` can instrument supported named function components. It does not instrument every JSX element or every possible component form.
4. For an explicitly correlated browser request, create a trace and use its `trace.fetch()` method. The Express or Next Route Handler integration reads the trace header, gathers server events, and returns them in a response header for the browser timeline.
5. Export a sanitized report for offline review or attach it to Playwright test results. Reports can also be imported into DevTools.

Correlation is opt-in at the request boundary: unrelated events and requests are not automatically joined into one trace. Server Action capture is server-local unless the application forwards its events through a callback.

## Packages

| Package                                            | Purpose                                                                                                                                                                 |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`@traceora/core`](../packages/core)               | Framework-independent event store, network/error instrumentation, diagnostic report parsing/creation, performance heuristics, and OpenTelemetry span conversion/export. |
| [`@traceora/react`](../packages/react)             | React providers, error boundary, DevTools timeline, trace hooks, profiler timings, report import/export, and performance insights.                                      |
| [`@traceora/vite-plugin`](../packages/vite-plugin) | Babel transform for supported named function components.                                                                                                                |
| [`@traceora/next`](../packages/next)               | Next.js client provider, Route Handler wrapper, and server-local `traceAction` capture.                                                                                 |
| [`@traceora/express`](../packages/express)         | Express middleware for incoming trace IDs and response event propagation.                                                                                               |
| [`@traceora/node`](../packages/node)               | Request-scoped event emission and optional Prisma/Mongoose query instrumentation.                                                                                       |
| [`@traceora/playwright`](../packages/playwright)   | Attach a sanitized browser report to failed/flaky Playwright tests.                                                                                                     |

## Diagnostic reports and privacy

Reports are versioned JSON snapshots intended for sharing, offline review, and CI artifacts. They are sanitized before export and bounded to avoid unbounded attachments. Treat any captured metadata as application data: leave request body/header capture disabled unless the data is safe to retain. Traceora stores events in memory by default and does not upload them to a Traceora service.

## State and performance tools

Use `instrumentStore` to wrap a Redux-like or Zustand-like store and emit sanitized state-diff events through a caller-provided snapshot function. This generic adapter avoids coupling core to either state library. React Profiler measurements and event timings feed heuristic suggestions; these are investigation clues tied to evidence, not a diagnosis or an automatic fix.

## OpenTelemetry

Core can convert Traceora events to OpenTelemetry-compatible span objects and can load span-shaped data into the local timeline. The exporter adapter is an integration point; configure your own OpenTelemetry SDK/export pipeline when sending telemetry to an external collector.

## Development

See each package README for installation and usage. The repository is a pnpm workspace. Package versions are maintained independently and should be updated together when preparing a release.

## License

MIT © [Zuhaib Rashid](https://zuhaibrashid.com)
