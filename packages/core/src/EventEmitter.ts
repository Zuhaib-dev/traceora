import { TraceEvent } from "./types";
import { EventStore } from "./EventStore";

export class EventEmitter {
  private store: EventStore;
  private listeners: Array<(event: TraceEvent) => void> = [];

  constructor(store: EventStore) {
    this.store = store;
  }

  subscribe(listener: (event: TraceEvent) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  emit(event: Omit<TraceEvent, "id" | "timestamp">) {
    const fullEvent: TraceEvent = {
      ...event,
      id: crypto.randomUUID(),
      timestamp: performance.now(),
    };
    this.store.add(fullEvent);
    
    // Notify all subscribers (like the Performance Monitor or DevTools overlay)
    this.listeners.forEach(listener => listener(fullEvent));
    
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
