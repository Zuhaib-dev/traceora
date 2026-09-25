import { Request, Response, NextFunction } from "express";
import { asyncLocalStorage, TraceoraContext } from "./context";

/**
 * Express middleware that initializes a Traceora trace for the incoming request.
 * It reads the `X-Traceora-TraceId` header from the frontend fetch request.
 * If present, it creates a context and intercepts the response to inject
 * the backend events back to the frontend.
 */
export function traceora() {
  return (req: Request, res: Response, next: NextFunction) => {
    // Check if the frontend sent a trace ID
    const traceId = req.headers["x-traceora-traceid"] as string;
    
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
      
      // @ts-ignore
      res.send = function (body: any) {
        try {
          const currentContext = asyncLocalStorage.getStore();
          if (currentContext && currentContext.events.length > 0) {
            // Inject the events as a JSON string in a custom header
            // The frontend network interceptor will parse this header.
            res.setHeader("X-Traceora-Events", JSON.stringify(currentContext.events));
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
