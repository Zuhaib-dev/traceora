import { Request, Response, NextFunction } from "express";
import { asyncLocalStorage, TraceoraContext, serializeTraceEvents } from "@traceora/node";

/**
 * Express middleware that initializes a Traceora trace for the incoming request.
 * It reads the `X-Traceora-TraceId` header from the frontend fetch request.
 * If present, it creates a context and intercepts the response to inject
 * the backend events back to the frontend.
 */
export function traceora() {
  return (req: Request, res: Response, next: NextFunction) => {
    // Check if the frontend sent a trace ID
    const headerValue = req.headers["x-traceora-traceid"];
    const traceId = typeof headerValue === "string" && /^[A-Za-z0-9_-]{1,128}$/.test(headerValue)
      ? headerValue
      : undefined;
    
    if (!traceId) {
      // No trace ID, just proceed normally
      return next();
    }

    const context: TraceoraContext = {
      traceId,
      events: [],
    };

    // Run the rest of the request inside the AsyncLocalStorage context
    asyncLocalStorage.run(context, () => {
      // Intercept the response headers to inject our events before it gets sent
      const originalSend = res.send;
      
      // Wrap Express send without changing its original overload behavior.
      res.send = function (body: any) {
        try {
          const currentContext = asyncLocalStorage.getStore();
          if (currentContext && currentContext.events.length > 0) {
            // Inject the events as a JSON string in a custom header
            // The frontend network interceptor will parse this header.
            res.setHeader("X-Traceora-Events", serializeTraceEvents(currentContext.events));
          }
        } catch (e) {
          console.error("[Traceora] Failed to serialize trace events", e);
        }
        
        return originalSend.call(this, body);
      };

      next();
    });
  };
}
