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

    // -- PHASE 2: LIVE NETWORK MOCKING --
    const mocks = (window as any).__TRACEORA_MOCKS__;
    if (mocks) {
      for (const [pattern, mockRes] of Object.entries(mocks) as [string, any][]) {
        if (url.includes(pattern)) {
          const duration = 12; // Fake duration
          const bodyStr = typeof mockRes.body === 'string' ? mockRes.body : JSON.stringify(mockRes.body);
          
          const fakeResponse = new Response(bodyStr, {
            status: mockRes.status || 200,
            headers: { 'Content-Type': 'application/json', 'x-traceora-mocked': 'true' }
          });
          
          trace.emit({
            type: "NETWORK_RESPONSE",
            source: "window.fetch (MOCKED)",
            duration,
            metadata: { 
              url, 
              method, 
              status: fakeResponse.status, 
              ok: fakeResponse.ok,
              mocked: true,
              sizeBytes: bodyStr.length
            }
          });
          
          return fakeResponse;
        }
      }
    }

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

  if (typeof window.XMLHttpRequest !== "undefined") {
    const originalXhrOpen = XMLHttpRequest.prototype.open;
    const originalXhrSend = XMLHttpRequest.prototype.send;
    const originalXhrSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;

    interface TraceoraXMLHttpRequest extends XMLHttpRequest {
      _traceora_method?: string;
      _traceora_url?: string;
      _traceora_startTime?: number;
      _traceora_trace?: ReturnType<EventEmitter["startTrace"]>;
      _traceora_headers?: Record<string, string>;
    }

    // @ts-ignore - we are patching a method that has multiple overloads
    XMLHttpRequest.prototype.open = function (method: string, url: string | URL, ...args: any[]) {
      const xhr = this as TraceoraXMLHttpRequest;
      xhr._traceora_method = method;
      xhr._traceora_url = url.toString();
      xhr._traceora_startTime = performance.now();
      
      xhr._traceora_trace = emitter.startTrace(`xhr ${method} ${url}`, {
        url: xhr._traceora_url,
        method: xhr._traceora_method,
      });

      // @ts-ignore
      return originalXhrOpen.apply(this, [method, url, ...args]);
    };

    XMLHttpRequest.prototype.setRequestHeader = function (header: string, value: string) {
      const xhr = this as TraceoraXMLHttpRequest;
      if (!xhr._traceora_headers) {
        xhr._traceora_headers = {};
      }
      xhr._traceora_headers[header.toLowerCase()] = value;
      return originalXhrSetRequestHeader.apply(this, [header, value]);
    };

    XMLHttpRequest.prototype.send = function (...args: any[]) {
      const xhr = this as TraceoraXMLHttpRequest;
      if (xhr._traceora_trace) {
        // Inject TraceId
        if (!xhr._traceora_headers || !xhr._traceora_headers["x-traceora-traceid"]) {
          originalXhrSetRequestHeader.apply(this, ["X-Traceora-TraceId", xhr._traceora_trace.traceId]);
        }

        xhr._traceora_trace.emit({
          type: "NETWORK_REQUEST",
          source: "XMLHttpRequest",
          metadata: { url: xhr._traceora_url, method: xhr._traceora_method }
        });

        const handleLoad = () => {
          if (!xhr._traceora_startTime || !xhr._traceora_trace) return;
          const duration = performance.now() - xhr._traceora_startTime;
          
          let sizeBytes: number | undefined = undefined;
          const contentLength = xhr.getResponseHeader("content-length");
          if (contentLength) {
            sizeBytes = parseInt(contentLength, 10);
          } else if (xhr.responseText) {
            sizeBytes = xhr.responseText.length;
          }

          xhr._traceora_trace.emit({
            type: "NETWORK_RESPONSE",
            source: "XMLHttpRequest",
            duration,
            metadata: { 
              url: xhr._traceora_url, 
              method: xhr._traceora_method, 
              status: xhr.status, 
              ok: xhr.status >= 200 && xhr.status < 300,
              sizeBytes
            }
          });

          // EXTRACT BACKEND EVENTS
          const backendEventsStr = xhr.getResponseHeader("x-traceora-events");
          if (backendEventsStr) {
            try {
              const backendEvents = JSON.parse(backendEventsStr);
              if (Array.isArray(backendEvents)) {
                backendEvents.forEach((ev: any) => emitter.emit(ev));
              }
            } catch (e) {
              console.error("[Traceora] Failed to parse backend events from XHR headers", e);
            }
          }
        };

        const handleError = () => {
          if (!xhr._traceora_startTime || !xhr._traceora_trace) return;
          const duration = performance.now() - xhr._traceora_startTime;
          xhr._traceora_trace.emit({
            type: "NETWORK_ERROR",
            source: "XMLHttpRequest",
            duration,
            metadata: { 
              url: xhr._traceora_url, 
              method: xhr._traceora_method, 
              error: "Network Error"
            }
          });
        };

        xhr.addEventListener("load", handleLoad);
        xhr.addEventListener("error", handleError);
        xhr.addEventListener("abort", handleError);
        xhr.addEventListener("timeout", handleError);
      }

      // @ts-ignore
      return originalXhrSend.apply(this, args);
    };
  }
}
