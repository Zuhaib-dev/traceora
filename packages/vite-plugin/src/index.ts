import type { Plugin } from "vite";
import { spawn } from "node:child_process";
import { existsSync, realpathSync } from "node:fs";
import { isAbsolute, relative, resolve, sep } from "node:path";
import * as babel from "@babel/core";
import MagicString from "magic-string";

export function traceoraPlugin(): Plugin {
  return {
    name: "vite-plugin-traceora",
    enforce: "pre", // Run before the standard react plugin

    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const requestUrl = new URL(request.url ?? "/", "http://localhost");
        if (requestUrl.pathname !== "/__open-in-editor") return next();
        if (request.method !== "GET") {
          response.writeHead(405, { "content-type": "application/json" });
          response.end(JSON.stringify({ error: "Method not allowed" }));
          return;
        }

        const match = /^(.*):(\d+):(\d+)$/.exec(requestUrl.searchParams.get("file") ?? "");
        if (!match) {
          response.writeHead(400, { "content-type": "application/json" });
          response.end(JSON.stringify({ error: "A file, line, and column are required" }));
          return;
        }

        try {
          let fileName = match[1];
          if (/^https?:\/\//i.test(fileName)) fileName = new URL(fileName).pathname;
          else if (fileName.startsWith("file://")) fileName = new URL(fileName).pathname;
          fileName = decodeURIComponent(fileName);
          const projectRoot = resolve(server.config.root);
          const isProjectAbsolute = fileName === projectRoot || fileName.startsWith(`${projectRoot}${sep}`);
          const targetPath = isAbsolute(fileName) && isProjectAbsolute
            ? resolve(fileName)
            : resolve(projectRoot, fileName.replace(/^[/\\]+/, ""));
          const targetRelative = relative(projectRoot, targetPath);
          if (!targetRelative || targetRelative === ".." || targetRelative.startsWith(`..${sep}`) || isAbsolute(targetRelative)) {
            throw new Error("The source file must be inside the project");
          }

          if (!existsSync(targetPath)) throw new Error("Source file not found");
          const realTarget = realpathSync(targetPath);
          const realRelative = relative(realpathSync(projectRoot), realTarget);
          if (realRelative === ".." || realRelative.startsWith(`..${sep}`) || isAbsolute(realRelative)) {
            throw new Error("The source file must be inside the project");
          }

          const location = `${realTarget}:${match[2]}:${match[3]}`;
          const candidates: Array<[string, string[]]> = process.env.TRACEORA_EDITOR
            ? [[process.env.TRACEORA_EDITOR, ["--goto", location]]]
            : [
                ["code", ["--goto", location]],
                ["cursor", ["--goto", location]],
                ...(process.platform === "darwin" ? [
                  ["open", ["-a", "Visual Studio Code", "--args", "--goto", location]] as [string, string[]],
                  ["open", ["-a", "Cursor", "--args", "--goto", location]] as [string, string[]],
                ] : []),
              ];

          const launch = (index: number) => {
            const candidate = candidates[index];
            if (!candidate) {
              response.writeHead(501, { "content-type": "application/json" });
              const message = process.env.TRACEORA_EDITOR
                ? "Could not launch TRACEORA_EDITOR. Set it to an editor executable that accepts --goto."
                : "Could not launch an editor. Install the VS Code or Cursor CLI, or set TRACEORA_EDITOR.";
              response.end(JSON.stringify({ error: message }));
              return;
            }
            const child = spawn(candidate[0], candidate[1], { detached: true, stdio: "ignore" });
            child.once("error", () => launch(index + 1));
            child.once("spawn", () => {
              child.unref();
              response.writeHead(200, { "content-type": "application/json" });
              response.end(JSON.stringify({ opened: true }));
            });
          };
          launch(0);
        } catch (error) {
          response.writeHead(400, { "content-type": "application/json" });
          response.end(JSON.stringify({ error: error instanceof Error ? error.message : "Unable to open source file" }));
        }
      });
    },

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
                    FunctionDeclaration(inner: any) { inner.skip(); },
                    FunctionExpression(inner: any) { inner.skip(); },
                    ArrowFunctionExpression(inner: any) { inner.skip(); },
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
