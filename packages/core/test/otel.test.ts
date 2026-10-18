import { describe, expect, it } from "vitest";
import { fromOpenTelemetrySpans, toOpenTelemetrySpans } from "../src/otel";
import { TraceEvent } from "../src/types";

describe("OpenTelemetry conversion", () => {
  it("converts Traceora events to stable spans and back", () => {
    const events: TraceEvent[] = [
      {
        id: "evt1",
        type: "NETWORK_ERROR",
        timestamp: 100,
        duration: 25,
        traceId: "abc",
        source: "fetch",
        metadata: { status: 500 },
      },
    ];
    const spans = toOpenTelemetrySpans(events);
    expect(spans[0]).toMatchObject({
      name: "NETWORK_ERROR fetch",
      startTimeUnixNano: "100000000",
      endTimeUnixNano: "125000000",
      status: { code: 2 },
    });
    expect(fromOpenTelemetrySpans(spans)[0]).toMatchObject({
      type: "NETWORK_ERROR",
      timestamp: 100,
      duration: 25,
      traceId: spans[0].traceId,
    });
  });
});
