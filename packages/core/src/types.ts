export type TraceEventType = 
  | "APP_START"
  | "COMPONENT_MOUNT"
  | "COMPONENT_RENDER"
  | "COMPONENT_UNMOUNT"
  | "USER_INTERACTION"
  | "STATE_CHANGE"
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
