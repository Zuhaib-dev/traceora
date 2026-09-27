import { EventEmitter } from "./EventEmitter";
import ErrorStackParser from "error-stack-parser";

export function setupErrorInstrumentation(emitter: EventEmitter) {
  if (typeof window === "undefined") return;

  // Catch unhandled runtime errors
  window.addEventListener("error", (event) => {
    let frames: any[] = [];
    if (event.error) {
      try {
        frames = ErrorStackParser.parse(event.error);
      } catch (e) {
        // ignore
      }
    }

    emitter.emit({
      type: "ERROR",
      source: "window.onerror",
      metadata: {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        frames
      }
    });
  });

  // Catch unhandled promise rejections
  window.addEventListener("unhandledrejection", (event) => {
    let frames: any[] = [];
    if (event.reason instanceof Error) {
      try {
        frames = ErrorStackParser.parse(event.reason);
      } catch (e) {
        // ignore
      }
    }

    emitter.emit({
      type: "ERROR",
      source: "window.unhandledrejection",
      metadata: {
        reason: event.reason instanceof Error ? event.reason.message : String(event.reason),
        stack: event.reason instanceof Error ? event.reason.stack : undefined,
        frames
      }
    });
  });
}
