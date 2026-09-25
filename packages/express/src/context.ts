import { AsyncLocalStorage } from "node:async_hooks";
import { TraceEvent } from "@traceora/core";

export interface TraceoraContext {
  traceId: string;
  events: TraceEvent[];
}

export const asyncLocalStorage = new AsyncLocalStorage<TraceoraContext>();

/**
 * Get the current Traceora context for the active HTTP request.
 */
export function getTraceoraContext(): TraceoraContext | undefined {
  return asyncLocalStorage.getStore();
}

/**
 * Pushes a backend event into the current request's trace.
 * If there is no active trace (e.g. out of bounds), this is a no-op.
 */
export function emitTraceEvent(event: Omit<TraceEvent, "id" | "traceId" | "timestamp">) {
  const context = getTraceoraContext();
  if (!context) return; // No active request context

  context.events.push({
    ...event,
    id: Math.random().toString(36).substring(2, 9),
    traceId: context.traceId,
    timestamp: Date.now(),
  });
}
