import { defineConfig, devices } from "@playwright/test";

const browserTestPort = 4173;
const browserTestUrl = `http://localhost:${browserTestPort}`;

/** Configure deterministic browser checks against an isolated local server. */
export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: "line",
  expect: {
    timeout: 15_000,
  },
  use: {
    baseURL: browserTestUrl,
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: `npm run dev -- --port ${browserTestPort}`,
    url: browserTestUrl,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
