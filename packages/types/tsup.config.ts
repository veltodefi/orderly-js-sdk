import { defineConfig } from "tsup";

export default defineConfig((options) => ({
  entry: ["src/index.ts"],
  splitting: true,
  format: ["cjs", "esm"],
  target: "es6",
  sourcemap: true,
  clean: !options.watch,
  dts: true,
  tsconfig: "tsconfig.json",
}));
