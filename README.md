# Traceora

> **Runtime intelligence for modern applications.**

**Traceora** is an open-source runtime intelligence and debugging toolkit designed to help developers understand what their applications are actually doing at runtime.

Instead of relying entirely on `console.log()`, browser DevTools, scattered error messages, and manual debugging, Traceora collects structured runtime events and connects them into meaningful timelines and traces.

## Project Structure

This is a monorepo managed with `pnpm`.

- `packages/core`: The framework-agnostic runtime event engine.
- `packages/react`: React instrumentation and components.
- `examples/`: Example applications demonstrating Traceora.
- `docs/`: Project documentation.

## Quick Start (Development)

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Build packages:**
   ```bash
   pnpm build
   ```

3. **Run tests:**
   ```bash
   pnpm test
   ```

## Philosophy

- **Developer First:** Solves real developer problems with minimal configuration.
- **TypeScript First:** Built with strong types.
- **Privacy First:** Local development by default, no automatic uploads.
- **Framework Agnostic Core:** The core engine doesn't depend on React.

## Documentation

See the [docs](./docs/README.md) directory for more detailed architectural and usage documentation.
