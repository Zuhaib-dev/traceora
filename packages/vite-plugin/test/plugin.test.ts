import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { traceoraPlugin } from "../src/index";

const { spawnMock } = vi.hoisted(() => ({ spawnMock: vi.fn() }));
vi.mock("node:child_process", () => ({ spawn: spawnMock }));

const projectRoot = resolve(fileURLToPath(new URL("../", import.meta.url)));

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

function getTransform() {
  const plugin = traceoraPlugin() as any;
  return plugin.transform.bind(plugin) as (code: string, id: string) => Promise<{ code: string } | null>;
}

describe("traceoraPlugin transform", () => {
  it("instruments named function declarations", async () => {
    const result = await getTransform()("export function MyComponent() { return <div /> }", "src/MyComponent.tsx");

    expect(result?.code).toContain("__useComponentTrace(\"MyComponent\")");
    expect(result?.code).toContain("from \"@traceora/react\"");
  });

  it("instruments named function expressions and block-bodied arrows", async () => {
    const code = `
      const FirstComponent = function() { return <span /> };
      const SecondComponent = () => { return <span /> };
    `;
    const result = await getTransform()(code, "src/components.tsx");

    expect(result?.code).toContain("__useComponentTrace(\"FirstComponent\")");
    expect(result?.code).toContain("__useComponentTrace(\"SecondComponent\")");
  });

  it("does not instrument files without JSX or unsupported concise arrows", async () => {
    const transform = getTransform();

    await expect(transform("export function Utility() { return 'ok' }", "src/utility.tsx")).resolves.toBeNull();
    await expect(transform("const MyComponent = () => <div />", "src/component.tsx")).resolves.toBeNull();
  });

  it("does not infer a parent component from JSX inside a nested function", async () => {
    const code = `function Container() { function Nested() { return <div /> } return null }`;
    const result = await getTransform()(code, "src/Container.tsx");

    expect(result?.code).toContain('__useComponentTrace("Nested")');
    expect(result?.code).not.toContain('__useComponentTrace("Container")');
  });

  it("ignores non-React extensions and node_modules", async () => {
    const transform = getTransform();
    const code = "export function MyComponent() { return <div /> }";

    await expect(transform(code, "src/component.ts")).resolves.toBeNull();
    await expect(transform(code, "node_modules/my-lib/component.tsx")).resolves.toBeNull();
  });
});

describe("traceoraPlugin editor middleware", () => {
  it("rejects source paths outside the Vite project", () => {
    const plugin = traceoraPlugin() as any;
    let middleware: (request: any, response: any, next: () => void) => void = () => {};
    plugin.configureServer({
      config: { root: projectRoot },
      middlewares: { use: (handler: typeof middleware) => { middleware = handler; } },
    });
    const response = { writeHead: vi.fn(), end: vi.fn() };

    middleware(
      { method: "GET", url: "/__open-in-editor?file=..%2F..%2FREADME.md%3A1%3A1" },
      response,
      vi.fn(),
    );

    expect(response.writeHead).toHaveBeenCalledWith(400, { "content-type": "application/json" });
    expect(response.end).toHaveBeenCalledWith(JSON.stringify({ error: "The source file must be inside the project" }));
  });

  it("passes unrelated requests through to Vite", () => {
    const plugin = traceoraPlugin() as any;
    let middleware: (request: any, response: any, next: () => void) => void = () => {};
    plugin.configureServer({
      config: { root: projectRoot },
      middlewares: { use: (handler: typeof middleware) => { middleware = handler; } },
    });
    const next = vi.fn();

    middleware({ method: "GET", url: "/not-the-editor" }, {}, next);

    expect(next).toHaveBeenCalledOnce();
  });

  it("launches the editor for a source file inside the project", () => {
    vi.stubEnv("TRACEORA_EDITOR", "");
    const plugin = traceoraPlugin() as any;
    let middleware: (request: any, response: any, next: () => void) => void = () => {};
    plugin.configureServer({
      config: { root: projectRoot },
      middlewares: { use: (handler: typeof middleware) => { middleware = handler; } },
    });
    const response = { writeHead: vi.fn(), end: vi.fn() };
    const child = {
      once: vi.fn(function (this: any, event: string, callback: () => void) {
        if (event === "spawn") callback();
        return this;
      }),
      unref: vi.fn(),
    };
    spawnMock.mockReturnValue(child);

    middleware({ method: "GET", url: "/__open-in-editor?file=src%2Findex.ts%3A3%3A1" }, response, vi.fn());

    expect(spawnMock).toHaveBeenCalledWith("code", ["--goto", `${projectRoot}/src/index.ts:3:1`], {
      detached: true,
      stdio: "ignore",
    });
    expect(child.unref).toHaveBeenCalledOnce();
    expect(response.writeHead).toHaveBeenCalledWith(200, { "content-type": "application/json" });
    expect(response.end).toHaveBeenCalledWith(JSON.stringify({ opened: true }));
  });
});
