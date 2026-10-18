import { createDiagnosticReport, TraceEvent } from "@traceora/core";

export interface TraceoraPage {
  evaluate<T>(pageFunction: () => T | Promise<T>): Promise<T>;
}

export interface TraceoraTestInfo {
  status: string | null;
  expectedStatus: string;
  attach(
    name: string,
    options: { body: string; contentType: string },
  ): Promise<void>;
}

export interface AttachTraceoraOptions {
  onlyOnFailure?: boolean;
  maxEvents?: number;
}

/** Attach the current browser event buffer to a Playwright test result. */
export async function attachTraceoraReport(
  page: TraceoraPage,
  testInfo: TraceoraTestInfo,
  options: AttachTraceoraOptions = {},
) {
  const onlyOnFailure = options.onlyOnFailure ?? true;
  if (onlyOnFailure && testInfo.status === testInfo.expectedStatus)
    return false;
  const payload = await page.evaluate(() => {
    const host = window as typeof window & {
      __traceora_emitter?: { getAll?: () => unknown[] };
    };
    return host.__traceora_emitter?.getAll?.() ?? [];
  });
  if (!Array.isArray(payload) || payload.length === 0) return false;
  const maxEvents = Math.max(1, Math.min(5000, options.maxEvents ?? 1000));
  const report = createDiagnosticReport(payload as TraceEvent[], { maxEvents });
  await testInfo.attach("traceora-report.json", {
    body: JSON.stringify(report, null, 2),
    contentType: "application/json",
  });
  return true;
}
