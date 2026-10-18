import { describe, expect, it } from "vitest";
import {
  createDiagnosticReport,
  parseDiagnosticReport,
  analyzeTracePerformance,
} from "../src/diagnostics";
import { TraceEvent } from "../src/types";

const event: TraceEvent = {
  id: "event-1",
  type: "NETWORK_RESPONSE",
  timestamp: 1000,
  duration: 1200,
  traceId: "trace1",
  metadata: { url: "/api/users", token: "secret", method: "GET" },
};

describe("diagnostic reports", () => {
  it("creates a portable report with sanitized values and validates imports", () => {
    const report = createDiagnosticReport([event]);
    expect(report.format).toBe("traceora-report");
    expect(report.events[0].metadata?.token).toBe("[REDACTED]");
    expect(parseDiagnosticReport(JSON.stringify(report)).events).toHaveLength(
      1,
    );
  });

  it("rejects unsupported and malformed reports", () => {
    expect(() => parseDiagnosticReport("{}")).toThrow("Unsupported");
    expect(() => parseDiagnosticReport("not json")).toThrow("malformed JSON");
  });

  it("reports evidence and stable event references", () => {
    const findings = analyzeTracePerformance([event]);
    expect(findings[0]).toMatchObject({
      title: "Slow network request",
      eventIds: ["event-1"],
    });
  });
});
