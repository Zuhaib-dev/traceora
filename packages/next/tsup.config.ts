import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/client.tsx"],
  format: ["cjs", "esm"],
  dts: true,
  clean: true,
  external: ["react", "next"],
});
