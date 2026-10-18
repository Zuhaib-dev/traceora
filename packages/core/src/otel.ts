import { sanitizeTraceData, TraceEvent } from "./types";
import { EventEmitter } from "./EventEmitter";

export interface OpenTelemetrySpanData {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  name: string;
  kind: 1;
  startTimeUnixNano: string;
  endTimeUnixNano: string;
  attributes: Array<{
    key: string;
    value: {
      stringValue?: string;
      intValue?: string;
      doubleValue?: number;
      boolValue?: boolean;
    };
  }>;
  status: { code: 0 | 1 | 2; message?: string };
}

export interface OpenTelemetrySpanInput {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  name: string;
  startTimeUnixNano: string;
  endTimeUnixNano: string;
  attributes?: Array<{ key: string; value: Record<string, unknown> }>;
  status?: { code: number; message?: string };
}

function hexHash(value: string, length: number) {
  let output = "";
  for (let chunk = 0; chunk < length / 8; chunk++) {
    let hash = 2166136261 ^ Math.imul(chunk + 1, 0x9e3779b1);
    for (let i = 0; i < value.length; i++)
      hash = Math.imul(hash ^ value.charCodeAt(i), 16777619);
    output += (hash >>> 0).toString(16).padStart(8, "0");
  }
  return output.slice(0, length);
}

function attribute(
  key: string,
  value: unknown,
): OpenTelemetrySpanData["attributes"][number] {
  if (typeof value === "boolean") return { key, value: { boolValue: value } };
  if (typeof value === "number")
    return {
      key,
      value: Number.isInteger(value)
        ? { intValue: String(value) }
        : { doubleValue: value },
    };
  return {
    key,
    value: {
      stringValue: typeof value === "string" ? value : JSON.stringify(value),
    },
  };
}

/** Convert Traceora events into an OTLP-compatible span data shape without requiring an SDK. */
export function toOpenTelemetrySpans(
  events: TraceEvent[],
): OpenTelemetrySpanData[] {
  return events.map((event, index) => {
    const traceId = hexHash(event.traceId ?? event.id, 32);
    const spanId = hexHash(event.id, 16);
    const duration = Math.max(
      0,
      Number(event.duration ?? event.metadata?.durationMs ?? 0),
    );
    const attributes = [attribute("traceora.event.type", event.type)];
    if (event.source)
      attributes.push(attribute("code.function.name", event.source));
    if (event.metadata)
      for (const [key, value] of Object.entries(
        sanitizeTraceData(event.metadata) as Record<string, unknown>,
      ))
        attributes.push(attribute(`traceora.${key}`, value));
    return {
      traceId,
      spanId,
      ...(event.parentId
        ? { parentSpanId: hexHash(event.parentId, 16) }
        : index > 0 && events[index - 1].traceId === event.traceId
          ? { parentSpanId: hexHash(events[index - 1].id, 16) }
          : {}),
      name: `${event.type}${event.source ? ` ${event.source}` : ""}`.slice(
        0,
        256,
      ),
      kind: 1 as const,
      startTimeUnixNano: String(Math.round(event.timestamp * 1_000_000)),
      endTimeUnixNano: String(
        Math.round((event.timestamp + duration) * 1_000_000),
      ),
      attributes,
      status: {
        code: event.type.includes("ERROR") ? (2 as const) : (1 as const),
      },
    };
  });
}

/** Convert OTLP-style spans into Traceora events so existing timelines can inspect them. */
export function fromOpenTelemetrySpans(
  spans: OpenTelemetrySpanInput[],
): TraceEvent[] {
  return spans.map((span) => {
    const attrs = Object.fromEntries(
      (span.attributes ?? []).map((item) => {
        const value = item.value;
        return [
          item.key,
          value.stringValue ??
            value.intValue ??
            value.doubleValue ??
            value.boolValue ??
            value,
        ];
      }),
    );
    const eventType = String(
      attrs["traceora.event.type"] ??
        (span.status?.code === 2 ? "ERROR" : "STATE_CHANGE"),
    );
    const timestamp = Number(BigInt(span.startTimeUnixNano) / 1_000_000n);
    const end = Number(BigInt(span.endTimeUnixNano) / 1_000_000n);
    return {
      id: span.spanId,
      type: eventType as TraceEvent["type"],
      timestamp,
      duration: Math.max(0, end - timestamp),
      traceId: span.traceId,
      ...(span.parentSpanId ? { parentId: span.parentSpanId } : {}),
      source:
        typeof attrs["code.function.name"] === "string"
          ? (attrs["code.function.name"] as string)
          : span.name,
      metadata: sanitizeTraceData(attrs) as Record<string, unknown>,
    };
  });
}

/** Forward converted spans to any OpenTelemetry SDK/exporter adapter supplied by the host. */
export function createOpenTelemetryExporter(
  exportSpans: (spans: OpenTelemetrySpanData[]) => void | Promise<void>,
) {
  return (events: TraceEvent[]) => exportSpans(toOpenTelemetrySpans(events));
}

/** Subscribe an event stream to an OTel-compatible span sink in small batches. */
export function attachOpenTelemetryExporter(
  emitter: EventEmitter,
  exportSpans: (spans: OpenTelemetrySpanData[]) => void | Promise<void>,
  options: { batchSize?: number; onError?: (error: unknown) => void } = {},
) {
  const batchSize = Math.max(1, Math.min(500, options.batchSize ?? 50));
  let batch: TraceEvent[] = [];
  let closed = false;
  const flush = async () => {
    if (closed || batch.length === 0) return;
    const current = batch;
    batch = [];
    try {
      await exportSpans(toOpenTelemetrySpans(current));
    } catch (error) {
      options.onError?.(error);
    }
  };
  const unsubscribe = emitter.subscribe((event) => {
    batch.push(event);
    if (batch.length >= batchSize) void flush();
  });
  return {
    flush,
    dispose: async () => {
      await flush();
      closed = true;
      unsubscribe();
    },
  };
}
