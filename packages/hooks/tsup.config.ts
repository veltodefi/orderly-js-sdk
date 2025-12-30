import { defineConfig } from "tsup";

export default defineConfig((options) => ({
  entry: ["src/**/*.ts", "src/**/*.tsx", "!src/**/*.test.*"],
  format: ["esm", "cjs"],
  target: "es2020",
  bundle: false,
  splitting: false,
  sourcemap: true,
  clean: !options.watch,
  // Turn OFF dts here to stop the build from crashing
  dts: false,
  tsconfig: "tsconfig.build.json",
  external: ["react", "react-dom"],
  esbuildOptions(opts) {
    if (!options.watch) {
      opts.drop = ["console", "debugger"];
    }
  },
}));
