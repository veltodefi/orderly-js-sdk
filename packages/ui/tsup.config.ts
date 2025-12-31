import { defineConfig } from "tsup";

export default defineConfig((options) => [
  // Main UI components bundle
  {
    entry: ["src/**/*.ts", "src/**/*.tsx", "!src/**/*.test.*"],
    format: ["esm", "cjs"],
    target: "es2022",
    // minify: !options.watch,
    bundle: false,
    splitting: false,
    sourcemap: true,
    clean: !options.watch,
    // Turn OFF dts here to stop the build from crashing
    dts: false,
    tsconfig: "tsconfig.build.json",
    external: ["react", "react-dom"],
    esbuildOptions(esOptions, context) {
      if (!options.watch) {
        esOptions.drop = ["console", "debugger"];
      }
    },
  },
  // Tailwind plugins bundle (minified, CJS only for Node.js)
  {
    entry: {
      "tailwind/base": "src/tailwind/base.ts",
      "tailwind/chart": "src/tailwind/chart.ts",
      "tailwind/components": "src/tailwind/components.ts",
      "tailwind/gradient": "src/tailwind/gradient.ts",
      "tailwind/position": "src/tailwind/position.ts",
      "tailwind/scrollBar": "src/tailwind/scrollBar.ts",
      "tailwind/size": "src/tailwind/size.ts",
      "tailwind/theme": "src/tailwind/theme.ts",
    },
    format: ["cjs"],
    target: "node16",
    minify: !options.watch,
    splitting: true,
    sourcemap: false,
    treeshake: true,
    dts: false,
    tsconfig: "tsconfig.build.json",
    external: ["tailwindcss"],
    outDir: "dist",
  },
]);
