import { EventEmitter } from "./EventEmitter";
import { sanitizeTraceData } from "./types";

/** Zustand middleware retained for compatibility with earlier Traceora releases. */
export const traceoraZustand =
  (emitter?: EventEmitter, storeName = "ZustandStore") =>
  (config: any) =>
  (set: any, get: any, api: any) => {
    const patchedSet = (...args: any[]) => {
      const activeEmitter =
        emitter ||
        (typeof window !== "undefined"
          ? (window as any).__traceora_emitter
          : null);
      const previous = get();
      set(...args);
      const next = get();
      if (previous === next) return;
      activeEmitter?.emit({
        type: "STATE_CHANGE",
        source: storeName,
        metadata: { action: "setState" },
      });
    };
    return config(patchedSet, get, api);
  };

/** Redux middleware retained for compatibility with earlier Traceora releases. */
export const traceoraRedux =
  (emitter?: EventEmitter) => (store: any) => (next: any) => (action: any) => {
    const result = next(action);
    const activeEmitter =
      emitter ||
      (typeof window !== "undefined"
        ? (window as any).__traceora_emitter
        : null);
    activeEmitter?.emit({
      type: "STATE_CHANGE",
      source: "Redux",
      metadata: {
        action: action?.type || "UNKNOWN_ACTION",
        payload: sanitizeTraceData(action?.payload),
      },
    });
    return result;
  };

export interface ObservableStore<State> {
  getState(): State;
  subscribe(listener: () => void): (() => void) | { unsubscribe(): void };
}

export interface StoreTraceOptions<State> {
  name?: string;
  select?: (state: State) => unknown;
  /** State key paths to omit, e.g. ["auth.token", "user.email"]. */
  redactPaths?: string[];
}

function redactPaths(
  value: unknown,
  paths: string[],
  current = "",
  depth = 0,
): unknown {
  if (depth > 8 || value == null || typeof value !== "object") return value;
  if (Array.isArray(value))
    return value.map((item, index) =>
      redactPaths(item, paths, `${current}.${index}`, depth + 1),
    );
  const result: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    const path = current ? `${current}.${key}` : key;
    result[key] = paths.includes(path)
      ? "[REDACTED]"
      : redactPaths(item, paths, path, depth + 1);
  }
  return result;
}

/** Subscribe to a Redux/Zustand-like store and emit bounded, sanitized before/after snapshots. */
export function instrumentStore<State>(
  store: ObservableStore<State>,
  emitter: EventEmitter,
  options: StoreTraceOptions<State> = {},
) {
  const select = options.select ?? ((state: State) => state);
  const project = (state: State) =>
    redactPaths(select(state), options.redactPaths ?? []);
  let previous = project(store.getState());
  let stopped = false;
  const unsubscribe = store.subscribe(() => {
    if (stopped) return;
    const next = project(store.getState());
    emitter.emit({
      type: "STATE_CHANGE",
      source: options.name ?? "Store",
      metadata: { prevState: previous, nextState: next },
    });
    previous = next;
  });
  return () => {
    stopped = true;
    if (typeof unsubscribe === "function") unsubscribe();
    else unsubscribe.unsubscribe();
  };
}
