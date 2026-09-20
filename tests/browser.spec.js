/** SPDX-License-Identifier: AGPL-3.0-or-later */

import assert from "node:assert/strict";

import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "playwright/test";

import { getResult } from "../src/scoring.js";
import { createShareFragment } from "../src/state.js";

const neutralScores = { freedom: 50, reciprocity: 50, purity: 50, governance: 50, commerce: 50, sovereignty: 50 };
const browserErrors = new WeakMap();

async function answerCurrentQuestion(page, label = "Neutral / unsure") {
  await page.getByRole("radio", { name: label, exact: true }).check();
}

async function finishQuiz(page, label = "Neutral / unsure") {
  for (let index = 0; index < 30; index += 1) {
    await answerCurrentQuestion(page, label);
    await page.getByRole("button", { name: index === 29 ? "See results" : "Next" }).click();
  }
}

async function expectNoSeriousAxeViolations(page) {
  const report = await new AxeBuilder({ page }).analyze();
  const violations = report.violations.filter((violation) => ["serious", "critical"].includes(violation.impact));
  assert.deepEqual(violations, [], `Axe violations: ${violations.map((item) => item.id).join(", ")}`);
}

test.beforeEach(async ({ page }) => {
  const consoleErrors = [];
  browserErrors.set(page, consoleErrors);
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(error.message));
  page.on("requestfailed", (request) => consoleErrors.push(`Failed request: ${request.url()}`));
});

test.afterEach(async ({ page }) => {
  assert.deepEqual(browserErrors.get(page), []);
});

test("landing, answered question, and results have no serious axe violations", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "FOSS Ethics Quiz" })).toBeVisible();
  await expectNoSeriousAxeViolations(page);

  await page.getByRole("button", { name: "Start the quiz" }).click();
  await answerCurrentQuestion(page, "Agree");
  await expectNoSeriousAxeViolations(page);

  await finishQuiz(page);
  await expect(page.getByText("Your six axes")).toBeVisible();
  await expectNoSeriousAxeViolations(page);
});

test("quiz navigation preserves answers, resumes after reload, and supports restarting", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Start the quiz" }).click();
  await expect(page.getByRole("button", { name: "Next" })).toBeDisabled();
  await answerCurrentQuestion(page, "Agree");
  await page.getByRole("button", { name: "Next" }).click();
  await answerCurrentQuestion(page, "Neutral / unsure");
  await page.getByRole("button", { name: "Back" }).click();
  await expect(page.getByRole("radio", { name: "Agree", exact: true })).toBeChecked();
  await page.getByRole("radio", { name: "Strongly disagree", exact: true }).check();
  await page.getByRole("button", { name: "Next" }).click();
  await page.reload();
  await expect(page.getByRole("button", { name: "Resume quiz" })).toBeVisible();
  await page.getByRole("button", { name: "Resume quiz" }).click();
  await expect(page.locator("#app").getByText("Question 2 of 30", { exact: true })).toBeVisible();

  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Save and exit" }).click();
  await page.getByRole("button", { name: "Start over" }).click();
  await expect(page.locator("#app").getByText("Question 1 of 30", { exact: true })).toBeVisible();
});

test("keyboard input can select an answer and results expose bars, review, and retake", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Start the quiz" }).click();
  const firstRadio = page.getByRole("radio", { name: "Agree", exact: true });
  await firstRadio.focus();
  await page.keyboard.press("Space");
  await expect(firstRadio).toBeChecked();
  await finishQuiz(page);
  await expect(page.locator("progress")).toHaveCount(6);
  await expect(page.getByText("Why this fits")).toBeVisible();
  await page.getByRole("button", { name: "Review answers" }).click();
  await expect(page.getByRole("heading", { name: "Review your answers" })).toBeVisible();
  await page.getByRole("button", { name: "Retake quiz" }).click();
  await expect(page.locator("#app").getByText("Question 1 of 30", { exact: true })).toBeVisible();
});

test("valid shared profile renders without local answers and malformed fragments recover", async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  const result = getResult(neutralScores);
  const fragment = createShareFragment(result.winner.archetype.id, neutralScores);
  await page.goto(`/${fragment}`);
  await expect(page.getByText("Shared result", { exact: false })).toBeVisible();
  await expect(page.getByRole("heading", { name: result.winner.archetype.name })).toBeVisible();
  await context.close();

  const invalidContext = await browser.newContext();
  const invalidPage = await invalidContext.newPage();
  await invalidPage.goto("/#not-a-valid-shared-result");
  await expect(invalidPage.getByRole("heading", { name: "FOSS Ethics Quiz" })).toBeVisible();
  await expect(invalidPage.getByText("We couldn’t read that shared result link.")).toBeVisible();
  await invalidContext.close();
});

test("storage-disabled sessions and the GitHub Pages project subpath both remain usable", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 320, height: 800 } });
  await context.addInitScript(() => {
    Object.defineProperty(window, "localStorage", { get() { throw new Error("disabled for test"); } });
  });
  const page = await context.newPage();
  await page.goto("/foss-ethics-quiz/");
  await expect(page.getByRole("heading", { name: "FOSS Ethics Quiz" })).toBeVisible();
  await expect(page.getByText("Browser storage is unavailable", { exact: false })).toBeVisible();
  await page.getByRole("button", { name: "Start the quiz" }).click();
  await answerCurrentQuestion(page);
  await expect(page.getByRole("button", { name: "Next" })).toBeEnabled();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await context.close();
});

test("the browser makes no requests to external origins", async ({ page }) => {
  const externalRequests = [];
  page.on("request", (request) => {
    if (new URL(request.url()).origin !== "http://127.0.0.1:4173") externalRequests.push(request.url());
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Start the quiz" }).click();
  await answerCurrentQuestion(page);
  assert.deepEqual(externalRequests, []);
});
