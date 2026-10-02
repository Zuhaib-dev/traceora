import { EventEmitter } from "./EventEmitter";
import { sanitizeTraceData } from "./types";

export function setupConsoleInstrumentation(emitter: EventEmitter) {
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;

  console.error = (...args: any[]) => {
    // Process arguments to extract a readable message
    const message = args.map(arg => 
      typeof arg === 'string' ? arg : 
      arg instanceof Error ? arg.message : 
      JSON.stringify(sanitizeTraceData(arg))
    ).join(' ');

    emitter.emit({
      type: "CONSOLE_ERROR",
      source: "console.error",
      metadata: { message }
    });
    
    // Call the original native console.error so it still prints in the browser
    originalConsoleError.apply(console, args);
  };

  const wrappedError = console.error;
  console.warn = (...args: any[]) => {
    const message = args.map(arg => 
      typeof arg === 'string' ? arg : 
      arg instanceof Error ? arg.message : 
      JSON.stringify(sanitizeTraceData(arg))
    ).join(' ');

    emitter.emit({
      type: "CONSOLE_WARNING",
      source: "console.warn",
      metadata: { message }
    });
    
    originalConsoleWarn.apply(console, args);
  };

  const wrappedWarn = console.warn;
  return () => {
    if (console.error === wrappedError) console.error = originalConsoleError;
    if (console.warn === wrappedWarn) console.warn = originalConsoleWarn;
  };
}
