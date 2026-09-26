<div align="center">
  <img src="./logo.svg" alt="Traceora Logo" width="100" height="100" style="border-radius: 20px; box-shadow: 0 8px 24px rgba(9, 146, 104, 0.3);" />
</div>

<div align="center">
  <h1>@traceora/next</h1>
  <p><strong>Zero-Config Full-Stack Telemetry for Next.js App Router</strong></p>

  [![npm version](https://img.shields.io/npm/v/@traceora/next.svg?style=flat-square)](https://www.npmjs.com/package/@traceora/next)
</div>

<hr />

## What is it?

`@traceora/next` brings the power of Traceora to the Next.js ecosystem. It seamlessly bridges Client Components, Server Components, Route Handlers (API Routes), and Server Actions into one unified, beautiful timeline.

## Installation

```bash
npm install @traceora/next
```

## Quick Start

### 1. The Client Provider (App Router)

Wrap your `app/layout.tsx` in the `<TraceoraNextProvider>`. This automatically enables frontend tracing, Network (fetch/XHR) tracking, Router tracking, and adds the floating DevTools timeline during development.

```tsx
import { TraceoraNextProvider } from "@traceora/next/client";

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

### 2. Tracing Route Handlers (API Routes)

Use `withTraceora` to automatically intercept frontend requests, establish a trace context, and inject backend events back to the browser timeline.

```tsx
// app/api/users/route.ts
import { NextResponse } from "next/server";
import { withTraceora, emitTraceEvent } from "@traceora/next";

export const GET = withTraceora(async (req: Request) => {
  // Manually emit an event
  emitTraceEvent({
    type: "STATE_CHANGE",
    source: "Next.js API",
    metadata: { info: "Fetching users..." }
  });

  return NextResponse.json({ users: [] });
});
```

### 3. Tracing Server Actions

Wrap your Server Actions with `traceAction` to measure their exact execution time.

```tsx
"use server";
import { traceAction } from "@traceora/next";

export const createUser = traceAction("createUserAction", async (data: any) => {
  // Action logic here...
  return { success: true };
});
```

### 4. Database Auto-Tracking (Prisma & Mongoose)

Just like the Express adapter, `@traceora/next` exports plugins for your ORM so you don't even have to manually emit database queries!

```typescript
// Prisma
import { PrismaClient } from "@prisma/client";
import { traceoraPrismaExtension } from "@traceora/next";

const prisma = new PrismaClient().$extends(traceoraPrismaExtension());

// Mongoose
import mongoose from "mongoose";
import { traceoraMongoosePlugin } from "@traceora/next";

mongoose.plugin(traceoraMongoosePlugin);
```
