import { sanitizeTraceData, TraceEvent } from "./types";

export interface TraceoraDiagnosticReport {
  format: "traceora-report";
  version: 1;
  createdAt: string;
  eventCount: number;
  events: TraceEvent[];
}

export interface DiagnosticReportOptions {
  /** Optional extra metadata keys to redact, matched case-insensitively. */
  redactKeys?: string[];
  maxEvents?: number;
}

const DEFAULT_REDACT_KEYS = [
  "authorization",
  "cookie",
  "token",
  "secret",
  "password",
  "credential",
  "api[-_]?key",
  "email",
  "phone",
  "ssn",
];

function redact(value: unknown, keys: string[], depth = 0): unknown {
  if (depth > 8) return "[Truncated]";
  if (Array.isArray(value))
    return value.slice(0, 500).map((item) => redact(item, keys, depth + 1));
  if (value && typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value).slice(0, 500)) {
      result[key] = keys.some((pattern) => new RegExp(pattern, "i").test(key))
        ? "[REDACTED]"
        : redact(item, keys, depth + 1);
    }
    return result;
  }
  return sanitizeTraceData(value, depth);
}

/** Build a portable, JSON-safe report. Data is re-sanitized at export time. */
export function createDiagnosticReport(
  events: TraceEvent[],
  options: DiagnosticReportOptions = {},
): TraceoraDiagnosticReport {
  const maxEvents = Math.max(1, Math.min(5000, options.maxEvents ?? 1000));
  const redactKeys = [...DEFAULT_REDACT_KEYS, ...(options.redactKeys ?? [])];
  const safeEvents = events
    .slice(-maxEvents)
    .map((event) => redact(event, redactKeys) as TraceEvent);
  return {
    format: "traceora-report",
    version: 1,
    createdAt: new Date().toISOString(),
    eventCount: safeEvents.length,
    events: safeEvents,
  };
}

/** Parse and validate a report from disk before displaying or importing it. */
export function parseDiagnosticReport(
  input: string | unknown,
): TraceoraDiagnosticReport {
  let value: unknown = input;
  if (typeof input === "string") {
    try {
      value = JSON.parse(input);
    } catch {
      throw new Error("Invalid Traceora report: malformed JSON");
    }
  }
  if (!value || typeof value !== "object")
    throw new Error("Invalid Traceora report: expected an object");
  const report = value as Partial<TraceoraDiagnosticReport>;
  if (
    report.format !== "traceora-report" ||
    report.version !== 1 ||
    !Array.isArray(report.events)
  ) {
    throw new Error("Unsupported Traceora report format or version");
  }
  if (
    report.events.length > 5000 ||
    report.events.some(
      (event) =>
        !event ||
        typeof event !== "object" ||
        typeof event.id !== "string" ||
        typeof event.type !== "string" ||
        typeof event.timestamp !== "number",
    )
  ) {
    throw new Error(
      "Invalid Traceora report: events are malformed or exceed the 5,000 event limit",
    );
  }
  return {
    format: "traceora-report",
    version: 1,
    createdAt:
      typeof report.createdAt === "string"
        ? report.createdAt
        : new Date(0).toISOString(),
    eventCount: report.events.length,
    events: report.events.map(
      (event) => redact(event, DEFAULT_REDACT_KEYS) as TraceEvent,
    ),
  };
}

/** Suggest likely bottlenecks using transparent thresholds and evidence. */
export function analyzeTracePerformance(events: TraceEvent[]) {
  const findings: Array<{
    severity: "warning" | "info";
    title: string;
    detail: string;
    eventIds: string[];
  }> = [];
  for (const event of events) {
    const duration = Number(event.duration ?? event.metadata?.durationMs);
    if (!Number.isFinite(duration)) continue;
    if (event.type === "DATABASE_QUERY" && duration >= 500)
      findings.push({
        severity: "warning",
        title: "Slow database query",
        detail: `${event.source ?? "Query"} took ${Math.round(duration)} ms.`,
        eventIds: [event.id],
      });
    if (event.type === "NETWORK_RESPONSE" && duration >= 1000)
      findings.push({
        severity: "warning",
        title: "Slow network request",
        detail: `${String(event.metadata?.method ?? "Request")} ${String(event.metadata?.url ?? "")} took ${Math.round(duration)} ms.`,
        eventIds: [event.id],
      });
    if (
      (event.type === "COMPONENT_RENDER" || event.type === "COMPONENT_MOUNT") &&
      duration >= 16
    )
      findings.push({
        severity: "info",
        title: "Long component render",
        detail: `${event.source ?? "Component"} took ${Math.round(duration * 100) / 100} ms to render.`,
        eventIds: [event.id],
      });
  }
  const renderGroups = new Map<string, TraceEvent[]>();
  for (const event of events)
    if (event.type === "COMPONENT_RENDER" && event.source)
      renderGroups.set(event.source, [
        ...(renderGroups.get(event.source) ?? []),
        event,
      ]);
  for (const [source, renders] of renderGroups)
    if (renders.length >= 10)
      findings.push({
        severity: "info",
        title: "Frequent component renders",
        detail: `${source} rendered ${renders.length} times in the captured window. Inspect its state and props updates.`,
        eventIds: renders.map((event) => event.id),
      });
  return findings;
}
