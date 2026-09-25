import { EventEmitter } from "./EventEmitter";

export function setupConsoleInstrumentation(emitter: EventEmitter) {
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;

  console.error = (...args: any[]) => {
    // Process arguments to extract a readable message
    const message = args.map(arg => 
      typeof arg === 'string' ? arg : 
      arg instanceof Error ? arg.message : 
      JSON.stringify(arg)
    ).join(' ');

    emitter.emit({
      type: "CONSOLE_ERROR",
      source: "console.error",
      metadata: { message, rawArgs: args }
    });
    
    // Call the original native console.error so it still prints in the browser
    originalConsoleError.apply(console, args);
  };

  console.warn = (...args: any[]) => {
    const message = args.map(arg => 
      typeof arg === 'string' ? arg : 
      arg instanceof Error ? arg.message : 
      JSON.stringify(arg)
    ).join(' ');

    emitter.emit({
      type: "CONSOLE_WARNING",
      source: "console.warn",
      metadata: { message, rawArgs: args }
    });
    
    originalConsoleWarn.apply(console, args);
  };
}
