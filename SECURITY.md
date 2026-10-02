# Security Policy

## Supported Versions

We actively patch security vulnerabilities in the following versions:

| Package | Supported Versions |
|---|---|
| `@traceora/core` | Latest minor release |
| `@traceora/react` | Latest minor release |
| `@traceora/next` | Latest minor release |
| `@traceora/vite-plugin` | Latest minor release |
| `@traceora/express` | Latest minor release |
| `@traceora/node` | Latest minor release |

> Older minor versions receive critical patches on a case-by-case basis. We
> strongly recommend keeping all `@traceora/*` packages on the latest release.

---

## Reporting a Vulnerability

**Please do NOT report security vulnerabilities through public GitHub issues,
discussions, or pull requests.**

Instead, report them privately via one of the following channels:

| Method | Details |
|---|---|
| **Email** | [zuhaibrashid01@gmail.com](mailto:zuhaibrashid01@gmail.com) |
| **GitHub Security Advisories** | [Create a private advisory](https://github.com/zuhaib-dev/traceora/security/advisories/new) |

### What to Include

To help us triage and respond quickly, please include as much of the following
as possible:

- **Description** — A clear summary of the vulnerability.
- **Affected package(s)** — e.g., `@traceora/core`, `@traceora/express`.
- **Affected version(s)** — The version(s) where you observed the issue.
- **Steps to reproduce** — A minimal, step-by-step reproduction.
- **Impact assessment** — What an attacker could achieve (e.g., data exfiltration, XSS, RCE).
- **Proof of concept** — Code, screenshots, or logs demonstrating the issue.
- **Suggested fix** — If you have one in mind, we'd love to hear it.

---

## Response Timeline

| Stage | Target |
|---|---|
| Acknowledgement of report | **48 hours** |
| Initial triage & severity assessment | **5 business days** |
| Patch development & testing | **30 days** (critical issues expedited) |
| Public disclosure (coordinated) | After patch release |

We will keep you informed of progress throughout. If you don't hear back within
48 hours, please follow up — your report may not have been received.

---

## Scope

The following are **in scope** for security reports:

- All packages in the `@traceora/*` namespace published to npm.
- The Traceora DevTools overlay and its client-side behavior.
- Server-side middleware (`@traceora/express`, `@traceora/next`, `@traceora/node`).
- The Traceora website at [traceora-web.vercel.app](https://traceora-web.vercel.app/).
- Build-time code transformations (`@traceora/vite-plugin`).

The following are **out of scope**:

- Third-party dependencies — Please report those to the respective maintainers. However, let us know if a Traceora package uses a vulnerable dependency in a dangerous way.
- Example applications in the `examples/` directory (not intended for production use).
- Social engineering attacks against Traceora maintainers.

---

## Severity Classification

We use the following severity levels (aligned with [CVSS v3.1](https://www.first.org/cvss/)):

| Severity | CVSS Score | Description |
|---|---|---|
| 🔴 **Critical** | 9.0 – 10.0 | Remote code execution, full system compromise |
| 🟠 **High** | 7.0 – 8.9 | Significant data exposure, privilege escalation |
| 🟡 **Medium** | 4.0 – 6.9 | Limited impact, requires user interaction |
| 🟢 **Low** | 0.1 – 3.9 | Minor information disclosure, minimal impact |

---

## Safe Harbor

We consider security research conducted in accordance with this policy to be:

- **Authorized** — We will not pursue legal action against researchers who report vulnerabilities in good faith.
- **Helpful** — We genuinely appreciate your efforts to make Traceora safer.
- **Collaborative** — We will work with you to understand and resolve the issue.

We ask that you:

- Make a good faith effort to avoid privacy violations, data destruction, and service disruption.
- Only interact with accounts you own or with explicit permission from the account holder.
- Give us a reasonable amount of time to address the issue before public disclosure.

---

## Security Best Practices for Users

Since Traceora is a **development-time telemetry tool**, please keep the
following in mind:

1. **Never ship Traceora to production.** Use environment checks to ensure
   Traceora packages are only loaded during development.
2. **Strip DevTools in production builds.** The Vite plugin and React DevTools
   overlay should be excluded from production bundles.
3. **Protect the `X-Traceora-Events` header.** If using `@traceora/express`,
   ensure the CORS `exposedHeaders` configuration is restricted to development
   origins only.
4. **Review auto-instrumentation output.** The Vite plugin transforms your
   source code at build time — review the output if you suspect unintended
   behavior.

---

<div align="center">
  <sub>Thank you for helping keep Traceora and its users safe! 🛡️</sub>
</div>
