<div align="center">
  <br/>
  <img src="../../logo.svg" alt="Traceora" width="64" height="64" />
  <h1>@traceora/vite-plugin</h1>
  <p><strong>Build-time instrumentation for supported React components.</strong></p>

  <a href="https://www.npmjs.com/package/@traceora/vite-plugin"><img src="https://img.shields.io/npm/v/@traceora/vite-plugin.svg?style=flat-square&color=099268" alt="npm" /></a>&ensp;
  <a href="https://www.npmjs.com/package/@traceora/vite-plugin"><img src="https://img.shields.io/npm/dm/@traceora/vite-plugin?style=flat-square&color=099268" alt="downloads" /></a>&ensp;
  <a href="https://github.com/zuhaib-dev/traceora/blob/main/LICENSE"><img src="https://img.shields.io/github/license/zuhaib-dev/traceora?style=flat-square&color=099268" alt="license" /></a>
  <br/><br/>
</div>

> The Vite plugin uses Babel during your build to inject `useComponentTrace` into supported named function components. It does not instrument every React component shape; use the hook directly for unsupported forms.

---

## 📥 Installation

```bash
npm install -D @traceora/vite-plugin
```

---

## 🔧 Usage

Add it to `vite.config.ts`. **Place it before the React plugin** so it transforms code first.

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { traceoraPlugin } from '@traceora/vite-plugin';

export default defineConfig({
  plugins: [
    traceoraPlugin(),   // ← Must come first
    react(),
  ],
});
```

---

## ⚙️ How It Works

The plugin hooks into Vite's `transform` step and runs a Babel pass on every `.tsx` / `.jsx` file.

**Your code:**

```tsx
export function Profile() {
  return <div>Hello</div>;
}
```

**What the plugin outputs (at build time):**

```tsx
import { useComponentTrace as __useComponentTrace } from '@traceora/react';

export function Profile() {
  __useComponentTrace('Profile');
  return <div>Hello</div>;
}
```

The injection happens entirely at build time — your source files are never modified. The result is:

- ✅ Mounts and renders are tracked for supported components
- ✅ Named function declarations, function expressions, and block-bodied arrow functions are supported
- ✅ Component name is preserved for the DevTools timeline
- ✅ Zero impact on your source code

---

## 🔗 Related Packages

| Package | Role |
|---|---|
| [`@traceora/react`](../react) | The hooks & DevTools UI this plugin injects |
| [`@traceora/core`](../core) | The underlying event engine |

---

<div align="center">
  <sub>Part of the <a href="https://github.com/zuhaib-dev/traceora">Traceora</a> ecosystem · Built by <a href="https://zuhaibrashid.com">Zuhaib Rashid</a></sub>
</div>
