import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { EventEmitter } from "../src/EventEmitter";
import { EventStore } from "../src/EventStore";

describe("EventEmitter", () => {
  let store: EventStore;
  let emitter: EventEmitter;

  beforeEach(() => {
    store = new EventStore();
    emitter = new EventEmitter(store);
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-01T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("should emit an event and add it to the store", () => {
    const event = emitter.emit({
      type: "APP_START",
      source: "test"
    });

    expect(event.id).toBeDefined();
    expect(event.timestamp).toBeDefined();
    expect(event.type).toBe("APP_START");
    expect(event.source).toBe("test");

    const events = store.getAll();
    expect(events).toHaveLength(1);
    expect(events[0]).toEqual(event);
  });

  it("should notify subscribers when an event is emitted", () => {
    const subscriber = vi.fn();
    const unsubscribe = emitter.subscribe(subscriber);

    const event = emitter.emit({
      type: "COMPONENT_MOUNT",
    });

    expect(subscriber).toHaveBeenCalledTimes(1);
    expect(subscriber).toHaveBeenCalledWith(event);

    unsubscribe();
    emitter.emit({
      type: "COMPONENT_UNMOUNT",
    });

    expect(subscriber).toHaveBeenCalledTimes(1); // Should not be called again
  });

  it("should start a trace and attach traceId to emitted events", () => {
    const trace = emitter.startTrace("test_trace", { foo: "bar" });
    
    const events = store.getAll();
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe("USER_INTERACTION");
    expect(events[0].traceId).toBe(trace.traceId);
    expect(events[0].metadata).toEqual({ foo: "bar" });

    const traceEvent = trace.emit({
      type: "STATE_CHANGE",
    });

    expect(traceEvent.traceId).toBe(trace.traceId);
    expect(store.getAll()).toHaveLength(2);
    expect(store.getAll()[1]).toEqual(traceEvent);
  });

  it("should isolate subscriber failures and continue notifying later subscribers", () => {
    const healthySubscriber = vi.fn();
    emitter.subscribe(() => { throw new Error("subscriber failure"); });
    emitter.subscribe(healthySubscriber);

    expect(() => emitter.emit({ type: "APP_START" })).not.toThrow();
    expect(healthySubscriber).toHaveBeenCalledTimes(1);
    expect(store.getAll()).toHaveLength(1);
  });

  it("should cap source names and redact sensitive metadata", () => {
    const event = emitter.emit({
      type: "APP_START",
      source: "x".repeat(300),
      metadata: { password: "not-for-storage", note: "Bearer abc123" },
    });

    expect(event.source).toHaveLength(256);
    expect(event.metadata).toEqual({ password: "[REDACTED]", note: "Bearer [REDACTED]" });
  });

  it("should clear stored events and notify subscribers", () => {
    const subscriber = vi.fn();
    emitter.emit({ type: "APP_START" });
    emitter.subscribe(subscriber);

    emitter.clear();

    expect(store.getAll()).toEqual([]);
    expect(subscriber).toHaveBeenCalledWith(expect.objectContaining({ metadata: { cleared: true } }));
  });
});
