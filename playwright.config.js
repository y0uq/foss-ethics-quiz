/** SPDX-License-Identifier: AGPL-3.0-or-later */

import { defineConfig } from "playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:4173";

export default defineConfig({
  testDir: "./tests",
  testMatch: "browser.spec.js",
  timeout: 30_000,
  forbidOnly: Boolean(process.env.CI),
  fullyParallel: false,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL,
    browserName: "chromium",
    headless: true,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: process.env.PLAYWRIGHT_BASE_URL ? undefined : {
    command: "node scripts/server.mjs",
    port: 4173,
    reuseExistingServer: !process.env.CI,
  },
});
