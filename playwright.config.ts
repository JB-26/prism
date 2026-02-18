import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E configuration for Prism.
 *
 * Tests live in e2e/ and run against a locally-started Next.js dev server.
 * Only Chromium is targeted by default (desktop-only app).
 *
 * Run:
 *   npx playwright test           -- headless
 *   npx playwright test --headed  -- visible browser
 *   npx playwright test --ui      -- interactive UI mode
 */
export default defineConfig({
  testDir: "./e2e",

  /* Each test file runs in parallel; tests within a file run sequentially. */
  fullyParallel: true,

  /* No retries locally; enable on CI. */
  retries: process.env.CI ? 2 : 0,

  /* One worker locally to avoid port conflicts with the dev server. */
  workers: process.env.CI ? 1 : 1,

  /* HTML report written to playwright-report/. */
  reporter: "html",

  /* Shared settings for every test. */
  use: {
    /* Base URL — page.goto('/') resolves to http://localhost:3000/ */
    baseURL: "http://localhost:3000",

    /* Capture a Playwright trace on the first retry so failures are diagnosable. */
    trace: "on-first-retry",

    /* Take a screenshot on failure. */
    screenshot: "only-on-failure",

    /* Desktop viewport — Prism is desktop-only. */
    viewport: { width: 1280, height: 720 },
  },

  /* Test projects — Chromium only (app is desktop-only, no mobile support). */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  /**
   * Spin up the Next.js dev server before the test suite runs.
   * Playwright waits until localhost:3000 is accepting connections.
   * `reuseExistingServer` lets you keep a manual `deno task dev` running
   * and skip the startup overhead.
   */
  webServer: {
    command:
      "deno run -A --unstable-bare-node-builtins --unstable-sloppy-imports npm:next dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
