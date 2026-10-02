<div align="center">
  <br/>
  <img src="../../logo.svg" alt="Traceora" width="64" height="64" />
  <h1>@traceora/node</h1>
  <p><strong>Shared backend primitives for the Traceora ecosystem.</strong></p>

  <a href="https://www.npmjs.com/package/@traceora/node"><img src="https://img.shields.io/npm/v/@traceora/node.svg?style=flat-square&color=099268" alt="npm" /></a>&ensp;
  <a href="https://www.npmjs.com/package/@traceora/node"><img src="https://img.shields.io/npm/dm/@traceora/node?style=flat-square&color=099268" alt="downloads" /></a>&ensp;
  <a href="https://github.com/zuhaib-dev/traceora/blob/main/LICENSE"><img src="https://img.shields.io/github/license/zuhaib-dev/traceora?style=flat-square&color=099268" alt="license" /></a>
  <br/><br/>
</div>

> The shared backend core that powers both `@traceora/express` and `@traceora/next`. Contains `AsyncLocalStorage` context management, database plugins, and the `emitTraceEvent` function.

---

## 📥 Installation

```bash
npm install @traceora/node
```

---

## ✨ Exports

| Export | Description |
|---|---|
| `emitTraceEvent()` | Pushes a custom event into the current request's trace context. Safe no-op outside a request. |
| `traceoraPrismaExtension()` | Prisma client extension — auto-traces every query with filters, args, and execution time. |
| `traceoraMongoosePlugin` | Mongoose plugin — auto-traces every operation. |

---

## 🔧 Usage

> **Note:** You generally don't need this package directly unless you're building a custom backend integration (e.g., for Fastify, NestJS, tRPC) or emitting manual events.

### Emit Custom Events

If your app is already wrapped in a Traceora context (via `@traceora/express` or `@traceora/next`), you can emit custom events that appear in the frontend DevTools:

```ts
import { emitTraceEvent } from '@traceora/node';

export async function processPayment() {
  emitTraceEvent({
    type: 'NETWORK_REQUEST',
    source: 'Stripe API',
    metadata: {
      action: 'charge',
      status: 'success',
    },
  });
}
```

### Auto-Track Prisma

```ts
import { PrismaClient } from '@prisma/client';
import { traceoraPrismaExtension } from '@traceora/node';

const prisma = new PrismaClient().$extends(traceoraPrismaExtension());
```

### Auto-Track Mongoose

```ts
import mongoose from 'mongoose';
import { traceoraMongoosePlugin } from '@traceora/node';

mongoose.plugin(traceoraMongoosePlugin);
```

---

## 🔗 Related Packages

| Package | Role |
|---|---|
| [`@traceora/express`](../express) | Express middleware that uses this package |
| [`@traceora/next`](../next) | Next.js adapter that uses this package |

---

<div align="center">
  <sub>Part of the <a href="https://github.com/zuhaib-dev/traceora">Traceora</a> ecosystem · Built by <a href="https://zuhaibrashid.com">Zuhaib Rashid</a></sub>
</div>
