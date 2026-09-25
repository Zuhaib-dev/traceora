import { EventEmitter } from "./EventEmitter";
import { TraceEvent } from "./types";

export class PerformanceMonitor {
  private emitter: EventEmitter;
  private renderCounts: Record<string, number[]> = {};
  private requestHistory: { url: string, method: string, timestamp: number }[] = [];

  constructor(emitter: EventEmitter) {
    this.emitter = emitter;
    this.emitter.subscribe(this.handleEvent.bind(this));
  }

  private handleEvent(event: TraceEvent) {
    if (event.type === "COMPONENT_RENDER") {
      this.checkExcessiveRendering(event);
    }
    
    if (event.type === "NETWORK_REQUEST") {
      this.checkDuplicateRequests(event);
    }
  }

  private checkExcessiveRendering(event: TraceEvent) {
    const component = event.source || "UnknownComponent";
    const now = event.timestamp;
    
    if (!this.renderCounts[component]) {
      this.renderCounts[component] = [];
    }

    // Keep only renders within the last 1 second
    this.renderCounts[component] = this.renderCounts[component].filter(t => now - t < 1000);
    this.renderCounts[component].push(now);

    // If a component renders more than 5 times in 1 second, flag it!
    if (this.renderCounts[component].length > 5) {
      // Clear to avoid spamming the warning
      this.renderCounts[component] = [];
      
      this.emitter.emit({
        type: "PERFORMANCE_WARNING",
        source: "PerformanceMonitor",
        metadata: {
          issue: "Excessive Rendering",
          component,
          message: `<${component} /> rendered >5 times in 1 second. Check for useEffect loops or unstable object props.`
        }
      });
    }
  }

  private checkDuplicateRequests(event: TraceEvent) {
    const { url, method } = event.metadata || {};
    if (!url || !method) return;

    const now = event.timestamp;
    
    // Clear old history (> 500ms)
    this.requestHistory = this.requestHistory.filter(req => now - req.timestamp < 500);
    
    const isDuplicate = this.requestHistory.some(req => req.url === url && req.method === method);

    if (isDuplicate) {
      this.emitter.emit({
        type: "PERFORMANCE_WARNING",
        source: "PerformanceMonitor",
        metadata: {
          issue: "Duplicate Request",
          message: `Identical ${method} request to ${url} triggered within 500ms. Consider caching or debouncing.`,
          url,
          method
        }
      });
    } else {
      this.requestHistory.push({ url: url as string, method: method as string, timestamp: now });
    }
  }
}
