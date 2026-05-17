import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    coverage: {
      provider: "istanbul",
      reporter: ["text", "lcov"],
      include: [
        "apps/api/src/**/*.ts",
        "packages/shared/src/**/*.ts",
      ],
      exclude: [
        "apps/api/src/**/__tests__/**",
        "**/*.d.ts",
        "**/*.schema.ts",
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});