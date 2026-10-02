import { EventEmitter, TraceHandle } from "./EventEmitter";
import { sanitizeTraceData } from "./types";
import type { TraceEventType } from "./types";

const EVENT_TYPES = new Set<TraceEventType>([
  "APP_START", "COMPONENT_MOUNT", "COMPONENT_RENDER", "COMPONENT_UNMOUNT", "USER_INTERACTION",
  "STATE_CHANGE", "NETWORK_REQUEST", "NETWORK_RESPONSE", "NETWORK_ERROR", "PERFORMANCE_WARNING",
  "CONSOLE_WARNING", "CONSOLE_ERROR", "ROUTE_CHANGE", "DATABASE_QUERY", "WEB_VITALS", "SERVER_ACTION", "ERROR",
]);

export interface NetworkInstrumentationConfig {
  allowedTracingOrigins?: (string | RegExp)[];
  captureRequestBodies?: boolean;
  captureRequestHeaders?: boolean;
}

export function setupNetworkInstrumentation(emitter: EventEmitter, instrumentationConfig?: NetworkInstrumentationConfig) {
  if (typeof window === "undefined" || !window.fetch) {
    return;
  }

  const originalFetch = window.fetch;
  let originalXhrOpen: typeof XMLHttpRequest.prototype.open | undefined;
  let originalXhrSend: typeof XMLHttpRequest.prototype.send | undefined;
  let originalXhrSetRequestHeader: typeof XMLHttpRequest.prototype.setRequestHeader | undefined;
  const isTraceId = (value: string | null): value is string => !!value && /^[A-Za-z0-9_-]{1,128}$/.test(value);
  const safeUrl = (value: string) => {
    try {
      const parsed = new URL(value, window.location.origin);
      return `${parsed.origin}${parsed.pathname}`;
    } catch {
      return value.split(/[?#]/, 1)[0];
    }
  };

  window.fetch = async function (...args) {
    const [resource, config] = args;
    
    let url = "";
    if (typeof resource === "string") url = resource;
    else if (resource instanceof Request) url = resource.url;
    else if (resource instanceof URL) url = resource.toString();

    const method = config?.method || (resource instanceof Request ? resource.method : "GET");
    const displayUrl = safeUrl(url);
    
    let headers: Headers;
    headers = new Headers(resource instanceof Request ? resource.headers : undefined);
    new Headers(config?.headers).forEach((value, key) => headers.set(key, value));
    const suppliedTraceId = headers.get("X-Traceora-TraceId");
    const trace = isTraceId(suppliedTraceId)
      ? { traceId: suppliedTraceId, emit: (event: any) => emitter.emit({ ...event, traceId: suppliedTraceId }) }
      : emitter.startTrace(`fetch ${method} ${displayUrl}`, { url: displayUrl, method });
    
    let shouldInject = false;
    try {
      const isRelative = url.startsWith('/');
      const targetUrl = new URL(url, window.location.origin);
      const isSameOrigin = targetUrl.origin === window.location.origin;
      
      if (isRelative || isSameOrigin) {
        shouldInject = true;
      } else if (instrumentationConfig?.allowedTracingOrigins) {
        shouldInject = instrumentationConfig.allowedTracingOrigins.some((origin: string | RegExp) => {
          if (typeof origin === 'string') {
            try { return targetUrl.origin === new URL(origin).origin; } catch { return false; }
          }
          if (origin instanceof RegExp) { origin.lastIndex = 0; return origin.test(targetUrl.origin); }
          return false;
        });
      }
    } catch (e) {
      // Ignore URL parsing errors
    }

    if (shouldInject && !isTraceId(suppliedTraceId)) {
      headers.set("X-Traceora-TraceId", trace.traceId);
    }
    
    const newConfig = { ...(config || {}), headers };
    let newArgs: [RequestInfo | URL, RequestInit?];
    if (resource instanceof Request) {
      newArgs = [new Request(resource, newConfig)];
    } else {
      newArgs = [resource, newConfig];
    }

    // Try to parse GraphQL
    let graphqlOperation = undefined;
    let requestBody = undefined;
    
    try {
      const body = config?.body;
      if (instrumentationConfig?.captureRequestBodies && body && typeof body === "string") {
        requestBody = String(sanitizeTraceData(body));
        const parsed = JSON.parse(body);
        if (parsed.query) {
          graphqlOperation = {
            operationName: parsed.operationName || "AnonymousQuery",
            query: parsed.query,
            variables: parsed.variables
          };
        }
      }
    } catch (e) {
      // Not JSON, ignore
    }

    trace.emit({
      type: "NETWORK_REQUEST",
      source: "window.fetch",
      metadata: { 
        url: displayUrl,
        method,
        graphql: sanitizeTraceData(graphqlOperation),
        // Save config to allow replaying
        ...(instrumentationConfig?.captureRequestHeaders ? {
          requestHeaders: sanitizeTraceData(Object.fromEntries(headers.entries())),
        } : {}),
        ...(instrumentationConfig?.captureRequestBodies ? { replayConfig: { url: displayUrl, method, body: requestBody } } : {})
      }
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
              url: displayUrl,
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
          url: displayUrl,
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
                backendEvents.slice(0, 100).forEach(ev => {
                  if (ev && typeof ev === "object" && EVENT_TYPES.has(ev.type as TraceEventType)) {
                    emitter.emit({ ...ev, traceId: trace.traceId });
                  }
                });
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
          url: displayUrl,
          method, 
          error: error instanceof Error ? error.message : String(error)
        }
      });
      throw error;
    }
  };
  const wrappedFetch = window.fetch;

  if (typeof window.XMLHttpRequest !== "undefined") {
    originalXhrOpen = XMLHttpRequest.prototype.open;
    originalXhrSend = XMLHttpRequest.prototype.send;
    originalXhrSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;

    interface TraceoraXMLHttpRequest extends XMLHttpRequest {
      _traceora_method?: string;
      _traceora_url?: string;
      _traceora_startTime?: number;
      _traceora_trace?: TraceHandle;
      _traceora_headers?: Record<string, string>;
    }

    // @ts-ignore - we are patching a method that has multiple overloads
    XMLHttpRequest.prototype.open = function (method: string, url: string | URL, ...args: any[]) {
      const xhr = this as TraceoraXMLHttpRequest;
      xhr._traceora_method = method;
      xhr._traceora_url = url.toString();
      xhr._traceora_startTime = 0;
      xhr._traceora_headers = {};
      
      xhr._traceora_trace = undefined;

      // @ts-ignore
      return originalXhrOpen!.apply(this, [method, url, ...args]);
    };

    XMLHttpRequest.prototype.setRequestHeader = function (header: string, value: string) {
      const xhr = this as TraceoraXMLHttpRequest;
      if (!xhr._traceora_headers) {
        xhr._traceora_headers = {};
      }
      xhr._traceora_headers[header.toLowerCase()] = value;
      return originalXhrSetRequestHeader!.apply(this, [header, value]);
    };

    XMLHttpRequest.prototype.send = function (...args: any[]) {
      const xhr = this as TraceoraXMLHttpRequest;
      if (xhr._traceora_url) {
        const suppliedTraceId = xhr._traceora_headers?.["x-traceora-traceid"];
        const validTraceId = suppliedTraceId && isTraceId(suppliedTraceId) ? suppliedTraceId : undefined;
        const activeTrace: TraceHandle = validTraceId
          ? { traceId: validTraceId, emit: event => emitter.emit({ ...event, traceId: validTraceId }) }
          : emitter.startTrace(`xhr ${xhr._traceora_method} ${xhr._traceora_url}`, {
            url: safeUrl(xhr._traceora_url ?? ""),
            method: xhr._traceora_method,
          });
        xhr._traceora_trace = activeTrace;
        // Inject TraceId if same-origin or allowed
        let shouldInject = false;
        try {
          const isRelative = xhr._traceora_url!.startsWith('/');
          const targetUrl = new URL(xhr._traceora_url!, window.location.origin);
          const isSameOrigin = targetUrl.origin === window.location.origin;
          
          if (isRelative || isSameOrigin) {
            shouldInject = true;
          } else if (instrumentationConfig?.allowedTracingOrigins) {
            shouldInject = instrumentationConfig.allowedTracingOrigins.some((origin: string | RegExp) => {
              if (typeof origin === 'string') {
                try { return targetUrl.origin === new URL(origin).origin; } catch { return false; }
              }
              if (origin instanceof RegExp) { origin.lastIndex = 0; return origin.test(targetUrl.origin); }
              return false;
            });
          }
        } catch (e) {}

        if (shouldInject && (!xhr._traceora_headers || !xhr._traceora_headers["x-traceora-traceid"])) {
          originalXhrSetRequestHeader!.apply(this, ["X-Traceora-TraceId", activeTrace.traceId]);
        }

        xhr._traceora_startTime = performance.now();
        activeTrace.emit({
          type: "NETWORK_REQUEST",
          source: "XMLHttpRequest",
          metadata: { url: safeUrl(xhr._traceora_url ?? ""), method: xhr._traceora_method }
        });

        const handleLoad = () => {
          const startTime = xhr._traceora_startTime;
          if (startTime == null || startTime <= 0 || !xhr._traceora_trace) return;
          const duration = performance.now() - startTime;
          
          let sizeBytes: number | undefined = undefined;
          const contentLength = xhr.getResponseHeader("content-length");
          if (contentLength) {
            sizeBytes = parseInt(contentLength, 10);
          } else {
            try { sizeBytes = xhr.responseText?.length; } catch { /* responseType is not text */ }
          }

          xhr._traceora_trace.emit({
            type: "NETWORK_RESPONSE",
            source: "XMLHttpRequest",
            duration,
            metadata: { 
              url: safeUrl(xhr._traceora_url ?? ""),
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
                backendEvents.slice(0, 100).forEach((ev: any) => {
                  if (ev && typeof ev === "object" && EVENT_TYPES.has(ev.type as TraceEventType)) {
                    xhr._traceora_trace?.emit({ ...ev, traceId: xhr._traceora_trace.traceId });
                  }
                });
              }
            } catch (e) {
              console.error("[Traceora] Failed to parse backend events from XHR headers", e);
            }
          }
        };

        const handleError = () => {
          const startTime = xhr._traceora_startTime;
          if (startTime == null || startTime <= 0 || !xhr._traceora_trace) return;
          const duration = performance.now() - startTime;
          xhr._traceora_trace.emit({
            type: "NETWORK_ERROR",
            source: "XMLHttpRequest",
            duration,
            metadata: { 
              url: safeUrl(xhr._traceora_url ?? ""),
              method: xhr._traceora_method, 
              error: "Network Error"
            }
          });
        };

        xhr.addEventListener("load", handleLoad, { once: true });
        xhr.addEventListener("error", handleError, { once: true });
        xhr.addEventListener("abort", handleError, { once: true });
        xhr.addEventListener("timeout", handleError, { once: true });
      }

      // @ts-ignore
      return originalXhrSend!.apply(this, args);
    };
  }

  (wrappedFetch as any).__traceoraOriginal = originalFetch;
  const wrappedXhrOpen = typeof window.XMLHttpRequest !== "undefined" ? XMLHttpRequest.prototype.open : undefined;
  const wrappedXhrSend = typeof window.XMLHttpRequest !== "undefined" ? XMLHttpRequest.prototype.send : undefined;
  const wrappedXhrSetRequestHeader = typeof window.XMLHttpRequest !== "undefined" ? XMLHttpRequest.prototype.setRequestHeader : undefined;

  return () => {
    if (window.fetch === wrappedFetch) {
      window.fetch = originalFetch;
    }
    if (typeof window.XMLHttpRequest !== "undefined") {
      if (originalXhrOpen && XMLHttpRequest.prototype.open === wrappedXhrOpen) XMLHttpRequest.prototype.open = originalXhrOpen;
      if (originalXhrSend && XMLHttpRequest.prototype.send === wrappedXhrSend) XMLHttpRequest.prototype.send = originalXhrSend;
      if (originalXhrSetRequestHeader && XMLHttpRequest.prototype.setRequestHeader === wrappedXhrSetRequestHeader) {
        XMLHttpRequest.prototype.setRequestHeader = originalXhrSetRequestHeader;
      }
    }
  };
}
