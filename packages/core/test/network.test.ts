import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { setupNetworkInstrumentation } from "../src/network";
import { EventEmitter } from "../src/EventEmitter";
import { EventStore } from "../src/EventStore";

describe("Network Instrumentation", () => {
  let emitter: EventEmitter;
  let originalFetch: typeof global.fetch;
  
  beforeEach(() => {
    emitter = new EventEmitter(new EventStore());
    
    // Mock global window and fetch
    originalFetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: new Headers({
        "content-length": "15"
      })
    }));
    
    vi.stubGlobal("window", {
      fetch: originalFetch,
      location: { origin: "http://localhost:3000" }
    });
    
    vi.stubGlobal("fetch", originalFetch);
    vi.stubGlobal("Request", class Request {
      url: string;
      method: string;
      headers: Headers;
      constructor(url: string, init: any = {}) {
        this.url = url;
        this.method = init.method || "GET";
        this.headers = new Headers(init.headers);
      }
    });
    vi.stubGlobal("Headers", class Headers {
      private map = new Map<string, string>();
      constructor(init?: any) {
        if (init) {
          if (init instanceof Headers) {
            init.forEach((v, k) => this.set(k, v));
          } else {
            Object.entries(init).forEach(([k, v]) => this.set(k, v as string));
          }
        }
      }
      set(key: string, value: string) { this.map.set(key.toLowerCase(), value); }
      get(key: string) { return this.map.get(key.toLowerCase()) || null; }
      forEach(callback: (value: string, key: string) => void) {
        this.map.forEach(callback);
      }
    });
    vi.stubGlobal("Response", class Response {
      status: number;
      ok: boolean;
      headers: Headers;
      private body: string;
      constructor(body: string, init: any = {}) {
        this.body = body;
        this.status = init.status || 200;
        this.ok = this.status >= 200 && this.status < 300;
        this.headers = new Headers(init.headers);
      }
    });

    setupNetworkInstrumentation(emitter);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("should trace fetch requests", async () => {
    const subscriber = vi.fn();
    emitter.subscribe(subscriber);

    await window.fetch("/api/data", { method: "POST", body: JSON.stringify({ a: 1 }) });

    // Expect 3 events: trace start (USER_INTERACTION), request (NETWORK_REQUEST), response (NETWORK_RESPONSE)
    expect(subscriber).toHaveBeenCalledTimes(3);

    const traceEvent = subscriber.mock.calls[0][0];
    expect(traceEvent.type).toBe("USER_INTERACTION");

    const reqEvent = subscriber.mock.calls[1][0];
    expect(reqEvent.type).toBe("NETWORK_REQUEST");
    expect(reqEvent.metadata.url).toBe("http://localhost:3000/api/data");
    expect(reqEvent.metadata.method).toBe("POST");

    const resEvent = subscriber.mock.calls[2][0];
    expect(resEvent.type).toBe("NETWORK_RESPONSE");
    expect(resEvent.metadata.status).toBe(200);
    expect(resEvent.metadata.sizeBytes).toBe(15);
  });
  
  it("should inject trace ID header for same-origin requests", async () => {
    await window.fetch("/api/data");
    
    // originalFetch is called by the patched fetch
    const fetchCallArgs = (originalFetch as ReturnType<typeof vi.fn>).mock.calls[0];
    const config = fetchCallArgs[1];
    
    expect(config.headers.get("x-traceora-traceid")).toBeTruthy();
  });
});
