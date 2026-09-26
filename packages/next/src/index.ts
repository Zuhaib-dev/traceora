import { NextResponse } from "next/server";
import { asyncLocalStorage, TraceoraContext, emitTraceEvent } from "./context";
import { traceoraPrismaExtension } from "./prisma";
import { traceoraMongoosePlugin } from "./mongoose";

export { emitTraceEvent, traceoraPrismaExtension, traceoraMongoosePlugin };

/**
 * Wraps a Next.js API Route handler to trace it and inject backend events.
 */
export function withTraceora(handler: Function) {
  return async function (req: Request, ...args: any[]) {
    const traceId = req.headers.get("x-traceora-traceid");

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
          const newHeaders = new Headers(response.headers);
          newHeaders.set("X-Traceora-Events", JSON.stringify(currentContext.events));
          
          return new NextResponse(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: newHeaders
          });
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
export function traceAction<T extends (...args: any[]) => any>(actionName: string, action: T): T {
  return (async (...args: Parameters<T>) => {
    // Note: Server actions don't cleanly support TraceId injection from the client yet via headers
    // because React obscures the network request. But we can still time the action itself!
    const startTime = Date.now();
    try {
      const result = await action(...args);
      // In a real implementation, we would want to somehow stream this event back, 
      // but Server Actions return pure data, not HTTP Responses.
      return result;
    } catch (error) {
      throw error;
    }
  }) as T;
}
