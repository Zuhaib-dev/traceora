import { describe, it, expect } from "vitest";
import { traceoraPlugin } from "../src/index";

describe("traceoraPlugin", () => {
  it("should inject useComponentTrace into React FunctionDeclarations", async () => {
    const plugin = traceoraPlugin() as any;
    const transform = plugin.transform.bind(plugin);

    const code = `
export function MyComponent() {
  return <div>Hello</div>;
}
    `;

    const result = await transform(code, "src/MyComponent.tsx");
    
    expect(result).toBeDefined();
    expect(result.code).toContain('import { useComponentTrace as __useComponentTrace } from "@traceora/react";');
    expect(result.code).toContain('__useComponentTrace("MyComponent");');
  });

  it("should not inject into files without JSX", async () => {
    const plugin = traceoraPlugin() as any;
    const transform = plugin.transform.bind(plugin);

    const code = `
export function NotAComponent() {
  return "Hello";
}
    `;

    const result = await transform(code, "src/utils.ts");
    
    expect(result).toBeNull();
  });

  it("should not inject into node_modules", async () => {
    const plugin = traceoraPlugin() as any;
    const transform = plugin.transform.bind(plugin);

    const code = `
export function MyComponent() {
  return <div>Hello</div>;
}
    `;

    const result = await transform(code, "node_modules/my-lib/MyComponent.tsx");
    
    expect(result).toBeNull();
  });
});
