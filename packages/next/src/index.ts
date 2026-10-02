import { asyncLocalStorage, TraceoraContext, emitTraceEvent, traceoraPrismaExtension, traceoraMongoosePlugin, serializeTraceEvents } from "@traceora/node";
import type { TraceEvent } from "@traceora/core";

export { emitTraceEvent, traceoraPrismaExtension, traceoraMongoosePlugin };

/**
 * Wraps a Next.js API Route handler to trace it and inject backend events.
 */
export function withTraceora(handler: Function) {
  return async function (req: Request, ...args: any[]) {
    const requestedTraceId = req.headers.get("x-traceora-traceid");
    const traceId = requestedTraceId && /^[A-Za-z0-9_-]{1,128}$/.test(requestedTraceId) ? requestedTraceId : null;

    if (!traceId) {
      return handler(req, ...args);
    }

    const context: TraceoraContext = {
      traceId,
      events: [],
    };

    return asyncLocalStorage.run(context, async () => {
      try {
        const response: Response = await handler(req, ...args);
        
        // Next.js Response objects are immutable, so we need to clone them to add headers
        // But only if we have events to send back!
        const currentContext = asyncLocalStorage.getStore();
        if (currentContext && currentContext.events.length > 0) {
          try {
            // We mutate the headers directly instead of recreating the Response.
            // Recreating the response (e.g. new NextResponse(response.body, ...)) destroys Next.js
            // internal symbols for redirects (307) and rewrites, causing protected routes to hang!
            response.headers.set("X-Traceora-Events", serializeTraceEvents(currentContext.events));
          } catch (e) {
            // Headers might be read-only in some environments.
            console.error("[Traceora] Failed to attach backend events to headers", e);
          }
        }
        
        return response;
      } catch (error) {
        throw error;
      }
    });
  };
}

/**
 * Wraps a Next.js Server Action to automatically trace its execution.
 */
export function traceAction<T extends (...args: any[]) => any>(
  actionName: string,
  action: T,
  onTrace?: (events: TraceEvent[]) => void,
): T {
  return (async (...args: Parameters<T>) => {
    const context: TraceoraContext = {
      traceId: `trace_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`,
      events: [],
    };
    return asyncLocalStorage.run(context, async () => {
      const startTime = performance.now();
      emitTraceEvent({ type: "USER_INTERACTION", source: `Server Action: ${actionName}`, metadata: { action: actionName } });
      try {
        const result = await action(...args);
        emitTraceEvent({
          type: "SERVER_ACTION",
          source: actionName,
          duration: performance.now() - startTime,
          metadata: { status: "success" },
        });
        return result;
      } catch (error) {
        emitTraceEvent({
          type: "SERVER_ACTION",
          source: actionName,
          duration: performance.now() - startTime,
          metadata: { status: "error", error: error instanceof Error ? error.message : String(error) },
        });
        throw error;
      } finally {
        try { onTrace?.(context.events.slice()); } catch (error) {
          console.error("[Traceora] onTrace callback failed", error);
        }
      }
    });
  }) as T;
}
