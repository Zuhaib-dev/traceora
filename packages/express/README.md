<div align="center">
  <br/>
  <img src="../../logo.svg" alt="Traceora" width="64" height="64" />
  <h1>@traceora/express</h1>
  <p><strong>Full-stack telemetry for Express.js — zero config, zero extra servers.</strong></p>

  <a href="https://www.npmjs.com/package/@traceora/express"><img src="https://img.shields.io/npm/v/@traceora/express.svg?style=flat-square&color=099268" alt="npm" /></a>&ensp;
  <a href="https://www.npmjs.com/package/@traceora/express"><img src="https://img.shields.io/npm/dm/@traceora/express?style=flat-square&color=099268" alt="downloads" /></a>&ensp;
  <a href="https://github.com/zuhaib-dev/traceora/blob/main/LICENSE"><img src="https://img.shields.io/github/license/zuhaib-dev/traceora?style=flat-square&color=099268" alt="license" /></a>
  <br/><br/>
</div>

> Bridges your React frontend and Express backend into one timeline. Backend events appear exactly where they belong — inline with the frontend trace. **No WebSockets, no Redis, no extra infrastructure.**

---

## 📥 Installation

```bash
npm install @traceora/express
```

---

## 🔧 Quick Start

Two steps: add CORS headers, add the middleware.

```ts
import express from 'express';
import cors from 'cors';
import { traceora } from '@traceora/express';
import { emitTraceEvent } from '@traceora/node';

const app = express();

// 1. MUST expose the custom header so the browser can read it
app.use(cors({ exposedHeaders: ['X-Traceora-Events'] }));

// 2. Add Traceora middleware BEFORE your routes
app.use(traceora());

// 3. Emit backend events anywhere — no need to pass `req` around
app.get('/api/users', async (req, res) => {
  emitTraceEvent({
    type: 'STATE_CHANGE',
    source: 'MySQL',
    metadata: {
      query: 'SELECT * FROM users WHERE active = 1',
      durationMs: 145,
    },
  });

  res.json({ success: true });
});

app.listen(4000);
```

---

## ⚙️ How It Works

```
React Frontend                       Express Backend
──────────────                       ───────────────
1. fetch('/api/users')
   + X-Traceora-TraceId header  →  2. Middleware reads TraceId
                                       Creates AsyncLocalStorage context

                                    3. emitTraceEvent() pushes events
                                       into the current request's store
                                       (works anywhere — controllers,
                                       services, deeply nested code)

                                    4. Before sending response, middleware
                                       serializes events into:
                                       X-Traceora-Events header

5. Frontend reads header       ←  
   Merges backend events into
   the same timeline under the
   same Trace ID

6. DevTools renders backend
   events inline with frontend
```

---

## 🗄️ Auto-Track Database Queries

No manual `emitTraceEvent()` needed for database operations:

<details>
<summary><strong>Prisma</strong></summary>

```ts
import { PrismaClient } from '@prisma/client';
import { traceoraPrismaExtension } from '@traceora/node';

const prisma = new PrismaClient().$extends(traceoraPrismaExtension());
```
</details>

<details>
<summary><strong>Mongoose</strong></summary>

```ts
import mongoose from 'mongoose';
import { traceoraMongoosePlugin } from '@traceora/node';

mongoose.plugin(traceoraMongoosePlugin);
```
</details>

---

## 📖 API Reference

### `traceora()`

Returns the Express middleware function. Must be used **after** `cors()` and **before** your routes.

### `emitTraceEvent(event)`

```ts
emitTraceEvent(event: Omit<TraceEvent, 'id' | 'traceId' | 'timestamp'>): void
```

Pushes an event into the current request's trace context. If called outside an active HTTP request (or the frontend didn't initiate a trace), it safely no-ops.

---

## 🔗 Related Packages

| Package | Role |
|---|---|
| [`@traceora/node`](../node) | Shared backend primitives (used by this package) |
| [`@traceora/react`](../react) | Frontend counterpart that sends the Trace ID |
| [`@traceora/core`](../core) | The underlying event engine |

---

<div align="center">
  <sub>Part of the <a href="https://github.com/zuhaib-dev/traceora">Traceora</a> ecosystem · Built by <a href="https://zuhaibrashid.com">Zuhaib Rashid</a></sub>
</div>
