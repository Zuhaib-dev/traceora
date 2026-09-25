import { EventEmitter } from "./EventEmitter";

export function setupNetworkInstrumentation(emitter: EventEmitter) {
  if (typeof window === "undefined" || !window.fetch) {
    return;
  }

  const originalFetch = window.fetch;

  window.fetch = async function (...args) {
    const [resource, config] = args;
    
    let url = "";
    if (typeof resource === "string") url = resource;
    else if (resource instanceof Request) url = resource.url;
    else if (resource instanceof URL) url = resource.toString();

    const method = config?.method || (resource instanceof Request ? resource.method : "GET");
    
    // We start a trace for this network request to connect request -> response
    const trace = emitter.startTrace(`fetch ${method} ${url}`, {
      url,
      method,
    });

    // 1. INJECT TRACE-ID INTO HEADERS
    let headers: Headers;
    if (config?.headers) {
      headers = new Headers(config.headers);
    } else if (resource instanceof Request) {
      headers = new Headers(resource.headers);
    } else {
      headers = new Headers();
    }
    
    headers.set("X-Traceora-TraceId", trace.traceId);
    
    const newConfig = { ...(config || {}), headers };
    let newArgs: [RequestInfo | URL, RequestInit?];
    if (resource instanceof Request) {
      newArgs = [new Request(resource, newConfig)];
    } else {
      newArgs = [resource, newConfig];
    }

    trace.emit({
      type: "NETWORK_REQUEST",
      source: "window.fetch",
      metadata: { url, method }
    });

    const startTime = performance.now();

    try {
      const response = await originalFetch.apply(this, newArgs);
      const duration = performance.now() - startTime;
      
      const contentLength = response.headers.get("content-length");
      const sizeBytes = contentLength ? parseInt(contentLength, 10) : undefined;

      trace.emit({
        type: "NETWORK_RESPONSE",
        source: "window.fetch",
        duration,
        metadata: { 
          url, 
          method, 
          status: response.status, 
          ok: response.ok,
          sizeBytes
        }
      });

      // 2. EXTRACT BACKEND EVENTS FROM RESPONSE HEADERS
      const backendEventsStr = response.headers.get("x-traceora-events");
      if (backendEventsStr) {
        try {
          const backendEvents = JSON.parse(backendEventsStr);
          if (Array.isArray(backendEvents)) {
            backendEvents.forEach(ev => emitter.emit(ev));
          }
        } catch (e) {
          console.error("[Traceora] Failed to parse backend events from headers", e);
        }
      }

      return response;
    } catch (error) {
      const duration = performance.now() - startTime;
      
      trace.emit({
        type: "NETWORK_ERROR",
        source: "window.fetch",
        duration,
        metadata: { 
          url, 
          method, 
          error: error instanceof Error ? error.message : String(error)
        }
      });
      throw error;
    }
  };
}
