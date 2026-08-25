import { defineConfig } from "vitest/config";
import path from "node:path";

/** Testy jednostkowe parsera raportów (`src/lib/parser`) — reszta serwisu nie ma testów. */
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "./src"),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    testTimeout: 30000,
  },
});
