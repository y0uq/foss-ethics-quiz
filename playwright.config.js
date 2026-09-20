/** SPDX-License-Identifier: AGPL-3.0-or-later */

import { defineConfig } from "playwright/test";

export default defineConfig({
  testDir: "./tests",
  testMatch: "browser.spec.js",
  timeout: 30_000,
  forbidOnly: Boolean(process.env.CI),
  fullyParallel: false,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://127.0.0.1:4173",
    browserName: "chromium",
    headless: true,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "node scripts/server.mjs",
    port: 4173,
    reuseExistingServer: !process.env.CI,
  },
});
