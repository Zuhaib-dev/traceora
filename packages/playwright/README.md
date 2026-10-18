# @traceora/playwright

Attach Traceora's sanitized browser timeline to failed or flaky Playwright tests.

```bash
npm install -D @traceora/playwright @playwright/test
```

Add an automatic fixture to your Playwright test setup (for example, `playwright/fixtures.ts`):

```ts
import { test as base } from "@playwright/test";
import { attachTraceoraReport } from "@traceora/playwright";

export const test = base.extend<{ traceoraReport: void }>({
  traceoraReport: [
    async ({ page }, use, testInfo) => {
      await use();
      await attachTraceoraReport(page, testInfo); // failures only by default
    },
    { auto: true },
  ],
});

export { expect } from "@playwright/test";
```

The attachment appears in the Playwright HTML report. Traceora instrumentation must be enabled in the app under test. Events are sanitized by Traceora before they reach the browser store; keep request body/header capture disabled unless your test data is safe to retain.

The helper returns `true` when an attachment was added. Set `onlyOnFailure: false` to attach reports for passing tests too, or `maxEvents` to change the bounded event count.
