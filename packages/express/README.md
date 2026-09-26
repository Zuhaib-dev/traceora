<div align="center">
  <img src="./logo.svg" alt="Traceora Logo" width="100" height="100" style="border-radius: 20px; box-shadow: 0 8px 24px rgba(9, 146, 104, 0.3);" />
</div>

<div align="center">
  <h1>@traceora/express</h1>
  <p><strong>Zero-Config Full-Stack Telemetry for Express.js</strong></p>

  [![npm version](https://img.shields.io/npm/v/@traceora/express.svg?style=flat-square)](https://www.npmjs.com/package/@traceora/express)
</div>

<hr />

## What is it?

`@traceora/express` bridges the gap between your frontend React application and your Express.js backend. 

It intercepts incoming API requests from your Traceora-instrumented frontend, creates an isolated tracing context using Node's native `AsyncLocalStorage`, and automatically injects backend events back to the frontend timeline via HTTP Response Headers. 

**Zero WebSockets, zero Redis queues, zero extra servers.**

## Installation

```bash
npm install @traceora/express
```

## Quick Start

1. Import and use the `traceora` middleware in your Express application.
2. Ensure you have `cors` configured to expose the `X-Traceora-Events` header, otherwise the frontend browser won't be able to read it!

```typescript
import express from "express";
import cors from "cors";
import { traceora, emitTraceEvent } from "@traceora/express";

const app = express();

// 1. MUST expose the custom header for the React DevTools to intercept it!
app.use(cors({
  exposedHeaders: ["X-Traceora-Events"],
}));

// 2. Add the Traceora middleware before your routes
app.use(traceora());

// 3. (Optional) Manually emit backend events
app.get("/api/users", async (req, res) => {
  
  // Log a database query or backend error!
  emitTraceEvent({
    type: "STATE_CHANGE", 
    source: "MySQL",
    metadata: {
      query: "SELECT * FROM users WHERE active = 1",
      durationMs: 145,
    }
  });

  res.json({ success: true });
});

app.listen(4000);
```

### Database Auto-Tracking (Prisma & Mongoose)

Traceora can automatically capture every database query (including filters, arguments, and exact execution duration) and stream them to your frontend timeline without manually emitting events.

#### Prisma
```typescript
import { PrismaClient } from "@prisma/client";
import { traceoraPrismaExtension } from "@traceora/express";

const prisma = new PrismaClient().$extends(traceoraPrismaExtension());
```

#### Mongoose
```typescript
import mongoose from "mongoose";
import { traceoraMongoosePlugin } from "@traceora/express";

mongoose.plugin(traceoraMongoosePlugin);
```

## How it Works

1. Your React frontend (using `@traceora/react`) automatically injects `X-Traceora-TraceId` into every `fetch()` request.
2. The `traceora()` Express middleware catches this ID and spins up an `AsyncLocalStorage` sandbox.
3. You call `emitTraceEvent()` anywhere in your backend (even nested deeply in controllers or services—no need to pass `req` around!).
4. Right before Express sends the HTTP response, the middleware intercepts it and injects all collected backend events into the `X-Traceora-Events` HTTP header.
5. The frontend extracts this header and beautifully paints the backend events exactly where they belong in the frontend timeline.

## API Reference

### `traceora()`
Returns the Express middleware. Must be used after `cors()` and before your application routes.

### `emitTraceEvent(event: Omit<TraceEvent, "id" | "traceId" | "timestamp">)`
Pushes an event into the current request's trace context. 
If called outside of an active HTTP request context (or if the frontend didn't initiate a trace), it safely ignores the event (no-op).
