import { describe, it, expect, vi, beforeEach } from "vitest";
import { PerformanceMonitor } from "../src/performance";
import { EventEmitter } from "../src/EventEmitter";
import { EventStore } from "../src/EventStore";
import { TraceEvent } from "../src/types";

describe("PerformanceMonitor", () => {
  let emitter: EventEmitter;
  let monitor: PerformanceMonitor;

  beforeEach(() => {
    emitter = new EventEmitter(new EventStore());
    monitor = new PerformanceMonitor(emitter);
    vi.useFakeTimers();
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
});
