import { EventEmitter } from "./EventEmitter";

export function setupSessionRecording(emitter: EventEmitter) {
  if (typeof window === "undefined") return;

  // Batch rrweb events to prevent flooding the emitter
  let eventsBatch: any[] = [];
  
  // Every 5 seconds, emit the batched events as a single TraceEvent
  const interval = setInterval(() => {
    if (eventsBatch.length > 0) {
      emitter.emit({
        type: "SESSION_RECORD",
        source: "rrweb",
        metadata: {
          events: [...eventsBatch],
        }
      });
      eventsBatch = []; // clear the batch
    }
  }, 5000);

  let stopFn: any = null;
  import("rrweb").then(({ record }) => {
    stopFn = record({
      emit(event) {
        eventsBatch.push(event);
      },
      // Optional: add some configuration to limit recording overhead
      sampling: {
        mousemove: false, // Could be true, but false saves a lot of data
        scroll: 150, // throttle scroll
      }
    });
  }).catch(() => {
    // safely ignore if rrweb is missing
  });

  return () => {
    clearInterval(interval);
    if (stopFn) stopFn();
  };
}
