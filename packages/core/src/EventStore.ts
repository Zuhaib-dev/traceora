import { TraceEvent } from "./types";

export class EventStore {
  private events: TraceEvent[] = [];

  constructor(private readonly maxEvents = 1000) {
    if (!Number.isInteger(maxEvents) || maxEvents < 1) {
      throw new RangeError("maxEvents must be a positive integer");
    }
  }

  add(event: TraceEvent) {
    this.events.push(event);
    if (this.events.length > this.maxEvents) {
      this.events.splice(0, this.events.length - this.maxEvents);
    }
  }

  getAll(): TraceEvent[] {
    return [...this.events];
  }

  clear() {
    this.events = [];
  }
}
