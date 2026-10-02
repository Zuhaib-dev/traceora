# Contributing to Traceora

Thanks for your interest in contributing! 🎉 This guide will get you set up quickly.

---

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Code Style](#code-style)
- [Pull Request Guidelines](#pull-request-guidelines)

---

## Prerequisites

- **Node.js** ≥ 18
- **pnpm** — Install with `npm install -g pnpm`
- **Git**

---

## Getting Started

```bash
# 1. Fork & clone
git clone https://github.com/<your-username>/traceora.git
cd traceora

# 2. Install dependencies
pnpm install

# 3. Build all packages in watch mode
pnpm dev

# 4. Run the playground (in a new terminal)
cd examples/react-vite
pnpm dev
```

The playground runs at `http://localhost:5173` and hot-reloads when you edit any package.

---

## Project Structure

```
traceora/
├── packages/
│   ├── core/           # Framework-agnostic event engine
│   ├── react/          # React bindings & DevTools UI
│   ├── next/           # Next.js App Router integration
│   ├── vite-plugin/    # Babel auto-tracking plugin
│   ├── express/        # Express middleware adapter
│   └── node/           # Shared backend primitives
├── examples/
│   ├── react-vite/     # React + Vite playground
│   └── express-server/ # Express test server
├── apps/
│   └── web/            # Traceora marketing website
└── docs/               # Architecture & internal docs
```

---

## Development Workflow

| Command | Description |
|---|---|
| `pnpm install` | Install all workspace dependencies. |
| `pnpm dev` | Build all packages in watch mode (`tsup --watch`). |
| `pnpm build` | One-shot production build of all packages. |
| `pnpm test` | Run all tests with Vitest. |
| `pnpm test:watch` | Run tests in watch mode. |
| `pnpm lint` | Lint all `.ts` / `.tsx` files with ESLint. |
| `pnpm format` | Format everything with Prettier. |
| `pnpm clean` | Remove all `dist/` directories. |

### Tips

- **Edit a package** → Changes are picked up instantly by the playground via `pnpm dev`.
- **Add a dependency** → Use `pnpm add <pkg> --filter @traceora/<package-name>`.
- **Test in isolation** → Run `pnpm test` from a specific package directory.

---

## Code Style

- **TypeScript** — Strict mode. No `any` escapes unless absolutely necessary.
- **Formatting** — Prettier handles it. Run `pnpm format` before committing.
- **Linting** — ESLint with `@typescript-eslint`. Run `pnpm lint` to check.
- **Naming** — `camelCase` for variables/functions, `PascalCase` for components/classes, `UPPER_SNAKE` for constants.

---

## Pull Request Guidelines

1. **Fork the repo** and create your branch from `main`.
2. **Keep PRs focused** — one feature or fix per PR.
3. **Add tests** if you're touching core logic.
4. **Run `pnpm lint && pnpm test`** before pushing.
5. **Write a clear PR description** — what changed, why, and how to test it.
6. **Link any related issues** in the description.

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the [MIT License](./LICENSE).

---

<div align="center">
  <sub>Thank you for helping make Traceora better! 💚</sub>
</div>
