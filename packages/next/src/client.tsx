"use client";

import React from "react";
import { TraceoraProvider, TraceoraErrorBoundary, TraceoraDevtools, TraceoraProviderConfig } from "@traceora/react";

/**
 * A Next.js App Router compatible provider.
 * This is marked with "use client" so it can be safely used in your root layout.tsx.
 */
export function TraceoraNextProvider({ children, config }: { children: React.ReactNode; config?: TraceoraProviderConfig }) {
  return (
    <TraceoraProvider config={config}>
      <TraceoraErrorBoundary>
        {children as any}
        {process.env.NODE_ENV === "development" && <TraceoraDevtools />}
      </TraceoraErrorBoundary>
    </TraceoraProvider>
  );
}
