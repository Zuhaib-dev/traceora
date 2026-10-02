import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EventEmitter } from "../src/EventEmitter";
import { EventStore } from "../src/EventStore";
import { setupNetworkInstrumentation } from "../src/network";

describe("Network instrumentation", () => {
  let emitter: EventEmitter;
  let fetchMock: ReturnType<typeof vi.fn>;
  let cleanup: (() => void) | undefined;

  beforeEach(() => {
    emitter = new EventEmitter(new EventStore());
    fetchMock = vi.fn().mockResolvedValue(new Response("{\"ok\":true}", {
      status: 200,
      headers: { "content-length": "11" },
    }));
    vi.stubGlobal("window", {
      fetch: fetchMock,
      location: { origin: "http://localhost:3000" },
    });
  });

  afterEach(() => {
    cleanup?.();
    cleanup = undefined;
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("correlates same-origin requests and omits query strings and bodies by default", async () => {
    cleanup = setupNetworkInstrumentation(emitter);

    await window.fetch("/api/data?session=private", {
      method: "POST",
      body: JSON.stringify({ password: "private" }),
    });

    const events = emitter.getAll();
    expect(events.map(event => event.type)).toEqual([
      "USER_INTERACTION", "NETWORK_REQUEST", "NETWORK_RESPONSE",
    ]);
    expect(events[1].metadata).toMatchObject({
      url: "http://localhost:3000/api/data",
      method: "POST",
    });
    expect(events[1].metadata).not.toHaveProperty("replayConfig");
    expect(events[1].traceId).toBe(events[0].traceId);
    expect(events[2].traceId).toBe(events[0].traceId);
    expect(events[2].metadata).toMatchObject({ status: 200, sizeBytes: 11 });

    const requestConfig = fetchMock.mock.calls[0][1] as RequestInit;
    expect(new Headers(requestConfig.headers).get("x-traceora-traceid")).toBe(events[0].traceId);
  });

  it("reuses a valid incoming trace ID without creating a new interaction", async () => {
    cleanup = setupNetworkInstrumentation(emitter);

    await window.fetch("/api/data", { headers: { "X-Traceora-TraceId": "trace_existing-1" } });

    expect(emitter.getAll().map(event => event.type)).toEqual(["NETWORK_REQUEST", "NETWORK_RESPONSE"]);
    expect(emitter.getAll().every(event => event.traceId === "trace_existing-1")).toBe(true);
  });

  it("only propagates trace IDs to explicitly allowed external origins", async () => {
    cleanup = setupNetworkInstrumentation(emitter, { allowedTracingOrigins: ["https://api.example.com"] });

    await window.fetch("https://api.example.com/data");
    await window.fetch("https://api.example.com.attacker.invalid/data");

    const firstHeaders = new Headers(fetchMock.mock.calls[0][1]?.headers);
    const secondHeaders = new Headers(fetchMock.mock.calls[1][1]?.headers);
    expect(firstHeaders.get("x-traceora-traceid")).toBeTruthy();
    expect(secondHeaders.has("x-traceora-traceid")).toBe(false);
  });

  it("sanitizes opt-in request bodies before storing them", async () => {
    cleanup = setupNetworkInstrumentation(emitter, { captureRequestBodies: true });

    await window.fetch("/api/login", {
      method: "POST",
      body: JSON.stringify({ password: "private", name: "Ari" }),
    });

    const replayConfig = emitter.getAll().find(event => event.type === "NETWORK_REQUEST")?.metadata?.replayConfig as { body: string };
    expect(replayConfig.body).toContain("[REDACTED]");
    expect(replayConfig.body).not.toContain("private");
  });

  it("records failed requests and rethrows the original error", async () => {
    const networkError = new TypeError("offline");
    fetchMock.mockRejectedValueOnce(networkError);
    cleanup = setupNetworkInstrumentation(emitter);

    await expect(window.fetch("/api/data")).rejects.toBe(networkError);
    expect(emitter.getAll().at(-1)).toMatchObject({
      type: "NETWORK_ERROR",
      metadata: { error: "offline" },
    });
  });

  it("restores fetch when the instrumentation disposer runs", async () => {
    cleanup = setupNetworkInstrumentation(emitter);
    const wrappedFetch = window.fetch;

    cleanup?.();
    cleanup = undefined;

    expect(window.fetch).toBe(fetchMock);
    expect(window.fetch).not.toBe(wrappedFetch);
  });
});
