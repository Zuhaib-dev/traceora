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

    trace.emit({
      type: "NETWORK_REQUEST",
      source: "window.fetch",
      metadata: { url, method }
    });

    const startTime = performance.now();

    try {
      const response = await originalFetch.apply(this, args);
      const duration = performance.now() - startTime;
      
      // Attempt to get content length if available
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
