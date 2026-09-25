<div align="center">
  <img src="./logo.svg" alt="Traceora Logo" width="100" height="100" style="border-radius: 20px; box-shadow: 0 8px 24px rgba(9, 146, 104, 0.3);" />
</div>

# @traceora/vite-plugin

> Zero-configuration auto-tracking for React components.

[![npm version](https://img.shields.io/npm/v/@traceora/vite-plugin.svg?style=flat-square)](https://www.npmjs.com/package/@traceora/vite-plugin)

Don't want to manually add `useComponentTrace("ComponentName")` to hundreds of React files? Neither do we.

This plugin uses a highly optimized Babel pass during your Vite build process to scan your codebase, detect React components, and invisibly inject the Traceora tracking hooks into them. 

## Installation

```bash
npm install -D @traceora/vite-plugin
```

## Usage

Simply add it to your `vite.config.ts` (or `vite.config.js`). 

**Important:** Make sure you place `traceoraPlugin()` **before** the official React plugin so that it can transform the code before React compiles the JSX.

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { traceoraPlugin } from '@traceora/vite-plugin'

export default defineConfig({
  plugins: [
    traceoraPlugin(), 
    react()
  ],
})
```

## How it works

When Vite processes a file like `Profile.tsx`:

```tsx
// Your Code:
export function Profile() {
  return <div>Hello</div>
}
```

The plugin intercepts the file and transforms it into:

```tsx
// Transformed Code:
import { useComponentTrace as __useComponentTrace } from "@traceora/react";

export function Profile() {
  __useComponentTrace("Profile");
  return <div>Hello</div>
}
```

This guarantees 100% coverage of your component mounting and rendering timelines without cluttering your source code.

---

### Author
**Zuhaib Rashid**
- 🌍 [zuhaibrashid.com](https://zuhaibrashid.com)
- 🐙 [GitHub: @zuhaib-dev](https://github.com/zuhaib-dev)
