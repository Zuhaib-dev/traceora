import { TraceEvent } from "./types";
import { EventStore } from "./EventStore";

export class EventEmitter {
  private store: EventStore;

  constructor(store: EventStore) {
    this.store = store;
  }

  emit(event: Omit<TraceEvent, "id" | "timestamp">) {
    const fullEvent: TraceEvent = {
      ...event,
      id: crypto.randomUUID(),
      timestamp: performance.now(),
    };
    this.store.add(fullEvent);
    
    // TODO: Remove this once we have DevTools! For now, let's show the developer what's happening.
    console.groupCollapsed(`Traceora Event: ${fullEvent.type} (source: ${fullEvent.source || 'unknown'})${fullEvent.traceId ? ` [Trace: ${fullEvent.traceId}]` : ''}`);
    console.log(fullEvent);
    console.groupEnd();

    return fullEvent;
  }

  startTrace(name: string, metadata?: Record<string, unknown>) {
    const traceId = `trace_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;
    
    this.emit({
      type: "USER_INTERACTION",
      source: name,
      traceId,
      metadata,
    });

    return {
      traceId,
      emit: (event: Omit<TraceEvent, "id" | "timestamp" | "traceId">) => {
        return this.emit({ ...event, traceId });
      }
    };
  }
}
