<div align="center">
  <br/>
  <img src="../../logo.svg" alt="Traceora" width="64" height="64" />
  <h1>@traceora/next</h1>
  <p><strong>Full-stack telemetry for Next.js App Router — zero config.</strong></p>

  <a href="https://www.npmjs.com/package/@traceora/next"><img src="https://img.shields.io/npm/v/@traceora/next.svg?style=flat-square&color=099268" alt="npm" /></a>&ensp;
  <a href="https://www.npmjs.com/package/@traceora/next"><img src="https://img.shields.io/npm/dm/@traceora/next?style=flat-square&color=099268" alt="downloads" /></a>&ensp;
  <a href="https://github.com/zuhaib-dev/traceora/blob/main/LICENSE"><img src="https://img.shields.io/github/license/zuhaib-dev/traceora?style=flat-square&color=099268" alt="license" /></a>
  <br/><br/>
</div>

> Seamlessly bridges **Client Components**, **Server Components**, **Route Handlers**, and **Server Actions** into one unified timeline. If it runs in your Next.js app, Traceora can trace it.

---

## 📥 Installation

```bash
npm install @traceora/next
```

---

## ✨ Exports

| Export | Type | Description |
|---|---|---|
| `<TraceoraNextProvider>` | Client Component | Frontend provider — initializes tracing, instruments `fetch`/`XHR`, adds DevTools overlay. |
| `withTraceora()` | HOF | Wraps Route Handlers to establish a backend trace context and inject events into the response. |
| `traceAction()` | HOF | Wraps Server Actions to measure execution time and link them to the frontend trace. |
| `emitTraceEvent()` | Function | Manually emit a backend event within a traced request. |
| `traceoraPrismaExtension()` | Prisma Extension | Auto-traces every Prisma query within a request. |
| `traceoraMongoosePlugin` | Mongoose Plugin | Auto-traces every Mongoose operation within a request. |

---

## 🔧 Usage

### 1. Client Provider

Wrap your root layout to enable frontend tracing:

```tsx
// app/layout.tsx
import { TraceoraNextProvider } from '@traceora/next/client';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <TraceoraNextProvider>
          {children}
        </TraceoraNextProvider>
      </body>
    </html>
  );
}
```

### 2. Trace Route Handlers

Wrap your API routes with `withTraceora` to bridge backend events to the frontend:

```ts
// app/api/users/route.ts
import { NextResponse } from 'next/server';
import { withTraceora, emitTraceEvent } from '@traceora/next';

export const GET = withTraceora(async (req: Request) => {
  emitTraceEvent({
    type: 'STATE_CHANGE',
    source: 'Next.js API',
    metadata: { info: 'Fetching users...' },
  });

  return NextResponse.json({ users: [] });
});
```

### 3. Trace Server Actions

Wrap Server Actions with `traceAction` to capture execution time:

```ts
'use server';
import { traceAction } from '@traceora/next';

export const createUser = traceAction('createUserAction', async (data: any) => {
  // Your action logic...
  return { success: true };
});
```

### 4. Auto-Track Database Queries

Plug in your ORM — every query is traced automatically:

<details>
<summary><strong>Prisma</strong></summary>

```ts
import { PrismaClient } from '@prisma/client';
import { traceoraPrismaExtension } from '@traceora/next';

const prisma = new PrismaClient().$extends(traceoraPrismaExtension());
```
</details>

<details>
<summary><strong>Mongoose</strong></summary>

```ts
import mongoose from 'mongoose';
import { traceoraMongoosePlugin } from '@traceora/next';

mongoose.plugin(traceoraMongoosePlugin);
```
</details>

---

## 🔗 Related Packages

| Package | Role |
|---|---|
| [`@traceora/core`](../core) | The underlying event engine |
| [`@traceora/react`](../react) | React bindings (used internally by the Next.js provider) |
| [`@traceora/node`](../node) | Shared backend primitives (`AsyncLocalStorage`, DB plugins) |

---

<div align="center">
  <sub>Part of the <a href="https://github.com/zuhaib-dev/traceora">Traceora</a> ecosystem · Built by <a href="https://zuhaibrashid.com">Zuhaib Rashid</a></sub>
</div>
