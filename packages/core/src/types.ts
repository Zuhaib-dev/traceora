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
