# @traceora/node

The shared backend core for Traceora runtime intelligence.

This package provides the core Node.js instrumentation primitives (like `AsyncLocalStorage` context) and database plugins (Prisma, Mongoose) used by higher-level framework adapters like `@traceora/express` and `@traceora/next`.

## Features

- **Context Preservation**: Uses `AsyncLocalStorage` to preserve `traceId` across async backend boundaries.
- **Prisma Extension**: Automatically traces all Prisma queries and links them to the frontend user action.
- **Mongoose Plugin**: Automatically traces all Mongoose operations.

## Installation

```bash
npm install @traceora/node
```

## Usage

You generally do not need to use this package directly unless you are building a custom backend integration (e.g. for Fastify, NestJS, TRPC) or manually emitting backend events.

### Emitting Custom Backend Events

If your app is already wrapped in a Traceora context (via Express or Next.js middleware), you can emit custom backend events that will appear in the frontend DevTools:

```ts
import { emitTraceEvent } from "@traceora/node";

export async function processPayment() {
  emitTraceEvent({
    type: "NETWORK_REQUEST",
    source: "Stripe API",
    metadata: {
      action: "charge",
      status: "success"
    }
  });
}
```

### Prisma Extension

```ts
import { PrismaClient } from "@prisma/client";
import { traceoraPrismaExtension } from "@traceora/node";

const prisma = new PrismaClient().$extends(traceoraPrismaExtension);
```

### Mongoose Plugin

```ts
import mongoose from "mongoose";
import { traceoraMongoosePlugin } from "@traceora/node";

mongoose.plugin(traceoraMongoosePlugin);
```
