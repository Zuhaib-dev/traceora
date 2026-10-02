import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { PerformanceMonitor } from "../src/performance";
import { EventEmitter } from "../src/EventEmitter";
import { EventStore } from "../src/EventStore";
import { TraceEvent } from "../src/types";

describe("PerformanceMonitor", () => {
  let emitter: EventEmitter;
  let monitor: PerformanceMonitor;
  let now: number;

  beforeEach(() => {
    emitter = new EventEmitter(new EventStore());
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-01T00:00:00Z"));
    now = 0;
    vi.spyOn(performance, "now").mockImplementation(() => now);
    monitor = new PerformanceMonitor(emitter);
  });

  afterEach(() => {
    monitor.dispose();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("should trigger warning for excessive renders", () => {
    const subscriber = vi.fn();
    emitter.subscribe(subscriber);
    
    const component = "TestComponent";

    // Trigger 6 renders in short succession
    for (let i = 0; i < 6; i++) {
      emitter.emit({
        type: "COMPONENT_RENDER",
        source: component,
        metadata: { durationMs: 1 }
      });
      now += 10;
      vi.advanceTimersByTime(10);
    }

    const events = subscriber.mock.calls.map(call => call[0] as TraceEvent);
    const warning = events.find(e => e.type === "PERFORMANCE_WARNING");
    
    expect(warning).toBeDefined();
    expect(warning?.metadata?.issue).toBe("Excessive Rendering");
    expect(warning?.metadata?.component).toBe(component);
  });

  it("should trigger warning for duplicate requests within 500ms", () => {
    const subscriber = vi.fn();
    emitter.subscribe(subscriber);

    // First request
    emitter.emit({
      type: "NETWORK_REQUEST",
      source: "window.fetch",
      metadata: { url: "/api/test", method: "GET" }
    });

    now = 100;
    vi.advanceTimersByTime(100);

    // Duplicate request
    emitter.emit({
      type: "NETWORK_REQUEST",
      source: "window.fetch",
      metadata: { url: "/api/test", method: "GET" }
    });

    const events = subscriber.mock.calls.map(call => call[0] as TraceEvent);
    const warning = events.find(e => e.type === "PERFORMANCE_WARNING");

    expect(warning).toBeDefined();
    expect(warning?.metadata?.issue).toBe("Duplicate Request");
    expect(warning?.metadata?.url).toBe("/api/test");
  });

  it("should not flag identical requests after the 500ms window", () => {
    emitter.emit({
      type: "NETWORK_REQUEST",
      source: "window.fetch",
      metadata: { url: "/api/test", method: "GET" },
    });

    now = 501;
    vi.advanceTimersByTime(501);
    emitter.emit({
      type: "NETWORK_REQUEST",
      source: "window.fetch",
      metadata: { url: "/api/test", method: "GET" },
    });

    expect(emitter.getAll().some(event => event.type === "PERFORMANCE_WARNING")).toBe(false);
  });
});
