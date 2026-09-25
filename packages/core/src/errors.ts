import { EventEmitter } from "./EventEmitter";

export function setupErrorInstrumentation(emitter: EventEmitter) {
  if (typeof window === "undefined") return;

  // Catch unhandled runtime errors
  window.addEventListener("error", (event) => {
    emitter.emit({
      type: "ERROR",
      source: "window.onerror",
      metadata: {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
      }
    });
  });

  // Catch unhandled promise rejections
  window.addEventListener("unhandledrejection", (event) => {
    emitter.emit({
      type: "ERROR",
      source: "window.unhandledrejection",
      metadata: {
        reason: event.reason instanceof Error ? event.reason.message : String(event.reason),
        stack: event.reason instanceof Error ? event.reason.stack : undefined,
      }
    });
  });
}
