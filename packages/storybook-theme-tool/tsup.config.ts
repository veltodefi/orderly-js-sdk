import { defineConfig } from "tsup";

export default defineConfig((options) => [
  // Main entry point for preview decorator
  {
    entry: ["src/index.ts"],
    format: ["esm"],
    target: "es2020",
    sourcemap: true,
    treeshake: true,
    dts: true,
    tsconfig: "tsconfig.build.json",
    external: ["react", "react-dom"],
    outDir: "dist",
    clean: !options.watch,
    esbuildOptions(esOptions, context) {
      if (!options.watch) {
        esOptions.drop = ["debugger"];
      }
    },
  },
  // Manager entry point for Storybook addon registration
  // @veltodefi/ui must be bundled (noExternal) because Storybook's manager
  // build uses esbuild which can't resolve pnpm workspace symlinks.
  {
    entry: ["src/manager.ts"],
    format: ["esm"],
    target: "es2020",
    sourcemap: true,
    treeshake: true,
    dts: true,
    tsconfig: "tsconfig.build.json",
    external: ["react", "react-dom"],
    noExternal: ["@veltodefi/ui"],
    outDir: "dist",
    esbuildOptions(esOptions, context) {
      if (!options.watch) {
        esOptions.drop = ["debugger"];
      }
    },
  },
]);
