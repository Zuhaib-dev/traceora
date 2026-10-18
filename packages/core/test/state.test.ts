import { describe, expect, it } from "vitest";
import { EventEmitter } from "../src/EventEmitter";
import { EventStore } from "../src/EventStore";
import { instrumentStore } from "../src/state";

describe("instrumentStore", () => {
  it("captures state transitions, redacts configured paths, and unsubscribes", () => {
    let state = { count: 0, auth: { token: "hidden" } };
    const listeners = new Set<() => void>();
    const store = {
      getState: () => state,
      subscribe: (listener: () => void) => {
        listeners.add(listener);
        return () => {
          listeners.delete(listener);
        };
      },
    };
    const emitter = new EventEmitter(new EventStore());
    const stop = instrumentStore(store, emitter, {
      name: "app",
      redactPaths: ["auth.token"],
    });
    state = { count: 1, auth: { token: "new-secret" } };
    listeners.forEach((listener) => listener());
    expect(emitter.getAll()[0].metadata).toEqual({
      prevState: { count: 0, auth: { token: "[REDACTED]" } },
      nextState: { count: 1, auth: { token: "[REDACTED]" } },
    });
    stop();
    expect(listeners.size).toBe(0);
  });
});
