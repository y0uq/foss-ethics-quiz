/** SPDX-License-Identifier: AGPL-3.0-or-later */

import assert from "node:assert/strict";
import test from "node:test";

import { AXES, QUESTIONS } from "../src/data/questions.js";
import {
  calculateAxisScores,
  calculatePrototypeDistance,
  createConstrainedQuestionOrder,
  createNeutralAnswers,
  createSeededRandom,
  getExplanationDrivers,
  getResult,
  isValidConstrainedOrder,
  rankArchetypes,
} from "../src/scoring.js";

test("neutral answers normalize to 50 on every axis", () => {
  const scores = calculateAxisScores(createNeutralAnswers());
  assert.deepEqual(scores, Object.fromEntries(AXES.map(({ key }) => [key, 50])));
});

test("theoretical minimum and maximum each normalize to 0 and 100", () => {
  for (const axis of AXES) {
    const minimumAnswers = createNeutralAnswers();
    const maximumAnswers = createNeutralAnswers();
    for (const question of QUESTIONS) {
      const weight = question.weights[axis.key];
      if (weight) {
        minimumAnswers[question.id] = -2 * Math.sign(weight);
        maximumAnswers[question.id] = 2 * Math.sign(weight);
      }
    }
    assert.equal(calculateAxisScores(minimumAnswers)[axis.key], 0, `${axis.key} minimum`);
    assert.equal(calculateAxisScores(maximumAnswers)[axis.key], 100, `${axis.key} maximum`);
  }
});

test("reverse-keyed items move their axis in the opposite direction", () => {
  const answers = createNeutralAnswers();
  answers["freedom-practical-license"] = 2;
  assert.equal(calculateAxisScores(answers).freedom, 40);
  answers["freedom-practical-license"] = -2;
  assert.equal(calculateAxisScores(answers).freedom, 60);
});

test("scores do not depend on question presentation order", () => {
  const answers = Object.fromEntries(QUESTIONS.map((question, index) => [question.id, (index % 5) - 2]));
  assert.deepEqual(calculateAxisScores(answers), calculateAxisScores(answers, [...QUESTIONS].reverse()));
});

test("prototype ranking uses stable tie priority", () => {
  const prototype = Object.fromEntries(AXES.map(({ key }) => [key, 50]));
  const first = { id: "first", prototype };
  const second = { id: "second", prototype };
  const ranked = rankArchetypes(prototype, [first, second], ["second", "first"]);
  assert.equal(ranked[0].archetype.id, "second");
  assert.equal(calculatePrototypeDistance(prototype, first), 0);
});

test("runner-up threshold bands are deterministic", () => {
  const scores = Object.fromEntries(AXES.map(({ key }) => [key, 50]));
  const winner = { id: "winner", prototype: scores };
  const nearby = { id: "nearby", prototype: { ...scores, freedom: 50 + (0.079 * 100 * Math.sqrt(6)) } };
  const traits = { id: "traits", prototype: { ...scores, freedom: 50 + (0.081 * 100 * Math.sqrt(6)) } };
  const distant = { id: "distant", prototype: { ...scores, freedom: 50 + (0.121 * 100 * Math.sqrt(6)) } };
  assert.equal(getResult(scores, [winner, nearby]).neighborMode, "comparison");
  assert.equal(getResult(scores, [winner, traits]).neighborMode, "traits");
  assert.equal(getResult(scores, [winner, distant]).neighborMode, "none");
});

test("explanation drivers prefer dimensions that distinguish the winner", () => {
  const scores = Object.fromEntries(AXES.map(({ key }) => [key, 60]));
  const winner = { id: "winner", prototype: scores };
  const runner = { id: "runner", prototype: { ...scores, freedom: 100 } };
  assert.equal(getExplanationDrivers(scores, winner, runner, 1)[0].axis.key, "freedom");
});

test("constrained shuffle contains every question with no adjacent primary axis", () => {
  for (let seed = 0; seed < 48; seed += 1) {
    const order = createConstrainedQuestionOrder(QUESTIONS, createSeededRandom(`test-${seed}`));
    assert.equal(isValidConstrainedOrder(order), true);
  }
});
