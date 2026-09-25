import { TraceEvent } from "./types";

export class EventStore {
  private events: TraceEvent[] = [];

  add(event: TraceEvent) {
    this.events.push(event);
  }

  getAll(): TraceEvent[] {
    return [...this.events];
  }

  clear() {
    this.events = [];
  }
}
