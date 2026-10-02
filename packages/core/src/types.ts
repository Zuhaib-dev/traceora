export type TraceEventType = 
  | "APP_START"
  | "COMPONENT_MOUNT"
  | "COMPONENT_RENDER"
  | "COMPONENT_UNMOUNT"
  | "USER_INTERACTION"
  | "STATE_CHANGE"
  | "NETWORK_REQUEST"
  | "NETWORK_RESPONSE"
  | "NETWORK_ERROR"
  | "PERFORMANCE_WARNING"
  | "CONSOLE_WARNING"
  | "CONSOLE_ERROR"
  | "ROUTE_CHANGE"
  | "DATABASE_QUERY"
  | "WEB_VITALS"
  | "ERROR";

export interface TraceEvent {
  id: string;
  type: TraceEventType;
  timestamp: number;
  source?: string;
  duration?: number;
  traceId?: string;
  parentId?: string;
  metadata?: Record<string, unknown>;
}

export function sanitizeTraceData(value: unknown, depth = 0): unknown {
  if (depth > 5) return "[Truncated]";
  if (typeof value === "string") return value.slice(0, 2048);
  if (Array.isArray(value)) return value.slice(0, 100).map(item => sanitizeTraceData(item, depth + 1));
  if (value && typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value).slice(0, 100)) {
      result[key] = /authorization|cookie|token|secret|password|credential|api[-_]?key|email|phone|ssn/i.test(key)
        ? "[REDACTED]"
        : sanitizeTraceData(item, depth + 1);
    }
    return result;
  }
  if (typeof value === "bigint" || typeof value === "function" || typeof value === "symbol") return String(value);
  return value;
}
