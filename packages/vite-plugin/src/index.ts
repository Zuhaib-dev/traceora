import type { Plugin } from "vite";
import * as babel from "@babel/core";
import MagicString from "magic-string";

export function traceoraPlugin(): Plugin {
  return {
    name: "vite-plugin-traceora",
    enforce: "pre", // Run before the standard react plugin
    
    async transform(code: string, id: string) {
      // Only process React files
      if (!id.match(/\.(tsx|jsx)$/)) {
        return null;
      }
      
      // Ignore node_modules
      if (id.includes("node_modules")) {
        return null;
      }

      const s = new MagicString(code);
      let hasInjectedImport = false;

      // A very lightweight Babel pass to find React components and inject the hook
      const result = await babel.transformAsync(code, {
        filename: id,
        presets: ["@babel/preset-typescript"],
        plugins: [
          {
            visitor: {
              FunctionDeclaration(path) {
                // Heuristic: If function name starts with a capital letter, it's likely a React component
                const name = path.node.id?.name;
                if (name && /^[A-Z]/.test(name)) {
                  // Make sure it returns JSX
                  let hasJSX = false;
                  path.traverse({
                    JSXElement() { hasJSX = true; },
                    JSXFragment() { hasJSX = true; }
                  });

                  if (hasJSX) {
                    // Inject the auto-trace hook right at the top of the component body
                    const body = path.node.body;
                    if (body && body.type === "BlockStatement") {
                      s.appendRight(
                        body.start! + 1,
                        `\n  __useComponentTrace("${name}");`
                      );
                      hasInjectedImport = true;
                    }
                  }
                }
              }
            }
          }
        ]
      });

      if (hasInjectedImport) {
        // Prepend the import statement for the hook
        s.prepend(`import { useComponentTrace as __useComponentTrace } from "@traceora/react";\n`);
        
        return {
          code: s.toString(),
          map: s.generateMap({ source: id, includeContent: true }),
        };
      }

      return null;
    }
  };
}
