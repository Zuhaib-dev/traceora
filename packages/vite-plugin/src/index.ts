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
          "@babel/plugin-syntax-jsx",
          {
            visitor: {
              FunctionDeclaration(path) { injectComponentHook(path); },
              FunctionExpression(path) { injectComponentHook(path); },
              ArrowFunctionExpression(path) {
                if (path.node.body.type === "BlockStatement") injectComponentHook(path);
              },
            }
          }
        ]
      });

      function injectComponentHook(path: any) {
                const parent = path.parentPath;
                const name = path.node.id?.name ||
                  (parent?.isVariableDeclarator() && parent.node.id.type === "Identifier" ? parent.node.id.name : undefined) ||
                  (parent?.isAssignmentExpression() && parent.node.left.type === "Identifier" ? parent.node.left.name : undefined);
                if (name && /^[A-Z]/.test(name)) {
                  // Make sure it returns JSX
                  let hasJSX = false;
                  path.traverse({
                    FunctionDeclaration(inner) { inner.skip(); },
                    FunctionExpression(inner) { inner.skip(); },
                    ArrowFunctionExpression(inner) { inner.skip(); },
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
