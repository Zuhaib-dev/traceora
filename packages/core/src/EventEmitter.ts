import { TraceEvent } from "./types";
import { EventStore } from "./EventStore";
import { sanitizeTraceData } from "./types";

export type TraceHandle = Pick<ReturnType<EventEmitter["startTrace"]>, "traceId" | "emit">;

export class EventEmitter {
  private store: EventStore;
  private listeners: Array<(event: TraceEvent) => void> = [];

  constructor(store: EventStore) {
    this.store = store;
  }

  getAll() {
    return this.store.getAll();
  }

  clear() {
    this.store.clear();
    for (const listener of this.listeners) {
      try {
        listener({ id: "__traceora_clear__", type: "APP_START", timestamp: Date.now(), metadata: { cleared: true } });
      } catch { /* listeners must not interrupt the host application */ }
    }
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
      source: event.source?.slice(0, 256),
      metadata: event.metadata ? sanitizeTraceData(event.metadata) as Record<string, unknown> : undefined,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    this.store.add(fullEvent);
    
    // Notify all subscribers (like the Performance Monitor or DevTools overlay)
    for (const listener of this.listeners) {
      try { listener(fullEvent); } catch { /* listeners must not interrupt the host application */ }
    }
    

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
      },
      fetch: (input: RequestInfo | URL, init: RequestInit = {}) => {
        const headers = new Headers(input instanceof Request ? input.headers : undefined);
        new Headers(init.headers).forEach((value, key) => headers.set(key, value));
        headers.set("X-Traceora-TraceId", traceId);
        return fetch(input, { ...init, headers });
      },
    };
  }
}
