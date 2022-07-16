/// <reference types="vitest" />
import { defineConfig } from "vite";

export default defineConfig({
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: "./setup.ts",
    coverage: {
      exclude: ["**/*.test.ts", "**/*.test.tsx", "setup.ts"],
      reporter: ["text", "json", "html"]
    }
  },
});
