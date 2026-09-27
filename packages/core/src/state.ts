import { EventEmitter } from "./EventEmitter";

/**
 * Zustand Middleware to track state changes
 * Usage: create(traceoraZustand(emitter, 'MyStore')( (set) => ({ ... }) ))
 */
export const traceoraZustand = (emitter?: EventEmitter, storeName: string = "ZustandStore") => (config: any) => (set: any, get: any, api: any) => {
  const patchedSet = (...args: any[]) => {
    const activeEmitter = emitter || (typeof window !== "undefined" ? (window as any).__traceora_emitter : null);
    
    const prevState = get();
    // call the original set
    set(...args);
    const nextState = get();

    // Avoid emitting if nothing really changed (shallow check approximation)
    if (prevState === nextState) return;

    if (activeEmitter) {
      activeEmitter.emit({
        type: "STATE_CHANGE",
        source: storeName,
        metadata: {
          action: "setState",
          prevState,
          nextState,
        },
      });
    }
  };
  return config(patchedSet, get, api);
};

/**
 * Redux Middleware to track state changes
 * Usage: configureStore({ middleware: [traceoraRedux(emitter)] })
 */
export const traceoraRedux = (emitter?: EventEmitter) => (store: any) => (next: any) => (action: any) => {
  const activeEmitter = emitter || (typeof window !== "undefined" ? (window as any).__traceora_emitter : null);
  
  const prevState = store.getState();
  const result = next(action);
  const nextState = store.getState();

  if (activeEmitter) {
    activeEmitter.emit({
      type: "STATE_CHANGE",
      source: "Redux",
      metadata: {
        action: action.type || "UNKNOWN_ACTION",
        payload: action.payload,
        prevState,
        nextState,
      },
    });
  }

  return result;
};
