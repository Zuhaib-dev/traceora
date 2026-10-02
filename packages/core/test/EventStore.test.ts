import { describe, it, expect, beforeEach } from "vitest";
import { EventStore } from "../src/EventStore";
import { TraceEvent } from "../src/types";

describe("EventStore", () => {
  let store: EventStore;

  beforeEach(() => {
    store = new EventStore();
  });

  it("should add and retrieve events", () => {
    const event: TraceEvent = {
      id: "1",
      type: "APP_START",
      timestamp: 1000,
    };

    store.add(event);
    const events = store.getAll();

    expect(events).toHaveLength(1);
    expect(events[0]).toEqual(event);
  });

  it("should clear events", () => {
    store.add({
      id: "1",
      type: "APP_START",
      timestamp: 1000,
    });
    
    store.clear();
    expect(store.getAll()).toHaveLength(0);
  });

  it("should return a copy of the events array", () => {
    const event: TraceEvent = {
      id: "1",
      type: "APP_START",
      timestamp: 1000,
    };

    store.add(event);
    const events = store.getAll();
    events.push({
      id: "2",
      type: "COMPONENT_MOUNT",
      timestamp: 2000,
    });

    expect(store.getAll()).toHaveLength(1);
  });
});
