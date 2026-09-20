/** SPDX-License-Identifier: AGPL-3.0-or-later */

import assert from "node:assert/strict";
import test from "node:test";

import { ARCHETYPES } from "../src/data/archetypes.js";
import { QUESTIONS } from "../src/data/questions.js";
import { createNeutralAnswers, createConstrainedQuestionOrder, createSeededRandom } from "../src/scoring.js";
import {
  answerQuestion,
  completeAttempt,
  createAttempt,
  createShareFragment,
  deleteAttempt,
  loadAttempt,
  parseShareFragment,
  saveAttempt,
  validateAttempt,
} from "../src/state.js";

class MemoryStorage {
  constructor() { this.values = new Map(); }
  getItem(key) { return this.values.get(key) ?? null; }
  setItem(key, value) { this.values.set(key, value); }
  removeItem(key) { this.values.delete(key); }
}

const order = createConstrainedQuestionOrder(QUESTIONS, createSeededRandom("state-test"));
const timestamp = "2026-01-02T03:04:05.000Z";

test("attempt state round-trips through storage", () => {
  const storage = new MemoryStorage();
  let attempt = createAttempt(order, timestamp);
  attempt = answerQuestion(attempt, order[0], 2, timestamp);
  assert.equal(saveAttempt(attempt, storage), true);
  assert.deepEqual(loadAttempt(storage), { attempt, reason: "loaded" });
});

test("corrupt and unknown answer state is discarded", () => {
  const storage = new MemoryStorage();
  storage.setItem("fossEthicsQuiz:v1:attempt", "{");
  assert.equal(loadAttempt(storage).reason, "invalid");
  assert.equal(storage.getItem("fossEthicsQuiz:v1:attempt"), null);
  const attempt = createAttempt(order, timestamp);
  attempt.answers["not-a-question"] = 1;
  assert.equal(validateAttempt(attempt).valid, false);
});

test("incompatible schema versions are rejected", () => {
  const attempt = createAttempt(order, timestamp);
  attempt.quizVersion = "0.0.1";
  assert.deepEqual(validateAttempt(attempt), { valid: false, reason: "incompatible-version" });
});

test("unavailable storage remains nonfatal", () => {
  assert.deepEqual(loadAttempt(null), { attempt: null, reason: "unavailable" });
  assert.equal(saveAttempt(createAttempt(order, timestamp), null), false);
  assert.equal(deleteAttempt(null), false);
});

test("completion requires every question and validates when complete", () => {
  const incomplete = createAttempt(order, timestamp);
  assert.throws(() => completeAttempt(incomplete, timestamp));
  const complete = { ...incomplete, answers: createNeutralAnswers(), currentIndex: order.length - 1 };
  const completed = completeAttempt(complete, timestamp);
  assert.equal(completed.completed, true);
  assert.equal(validateAttempt(completed).valid, true);
});

test("share fragment round-trips and malformed payloads are rejected", () => {
  const scores = { freedom: 95, reciprocity: 90, purity: 95, governance: 80, commerce: 25, sovereignty: 90 };
  const fragment = createShareFragment(ARCHETYPES[0].id, scores);
  assert.deepEqual(parseShareFragment(fragment), {
    valid: true,
    share: { archetypeId: ARCHETYPES[0].id, scores, quizVersion: "1.0.0" },
  });
  assert.equal(parseShareFragment("#foss-ethics-v1:v=1.0.0&a=gnu-purist").valid, false);
  assert.equal(parseShareFragment(`#${"x".repeat(257)}`).valid, false);
  assert.equal(parseShareFragment(`${fragment}&f=50`).valid, false);
});
