import { copyFileSync, mkdirSync } from "fs";
import { globSync } from "glob";
import { dirname } from "path";
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
  async onSuccess() {
    // Copy JSON files to dist, preserving directory structure
    const jsonFiles = globSync("src/**/*.json");
    for (const file of jsonFiles) {
      const destPath = file.replace(/^src/, "dist");
      mkdirSync(dirname(destPath), { recursive: true });
      copyFileSync(file, destPath);
      console.log(`Copied: ${file} -> ${destPath}`);
    }
  },
}));
