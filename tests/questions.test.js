/** SPDX-License-Identifier: AGPL-3.0-or-later */

import assert from "node:assert/strict";
import test from "node:test";

import { AXES, QUESTION_COUNT, QUESTIONS, QUIZ_VERSION } from "../src/data/questions.js";

const replacementQuestion = "When publishing community-oriented software, licenses should generally require redistributed modifications to remain open source.";

test("v1.1.0 replaces the invalid permissive-license item with a positive reciprocity preference", () => {
  assert.equal(QUIZ_VERSION, "1.1.0");
  assert.equal(QUESTIONS.some((question) => question.id === "reciprocity-closed-product"), false);
  const replacement = QUESTIONS.find((question) => question.id === "reciprocity-redistributed-modifications");
  assert.deepEqual(replacement?.weights, { reciprocity: 1 });
  assert.equal(replacement?.primaryAxis, "reciprocity");
  assert.equal(replacement?.text, replacementQuestion);
});

test("the audited set remains thirty questions with balanced primary directions", () => {
  assert.equal(QUESTION_COUNT, 30);
  for (const axis of AXES) {
    const primaryQuestions = QUESTIONS.filter((question) => question.primaryAxis === axis.key);
    const directions = primaryQuestions.map((question) => Math.sign(question.weights[axis.key]));
    assert.equal(primaryQuestions.length, 5, `${axis.key} question count`);
    assert.ok(directions.filter((direction) => direction > 0).length >= 2, `${axis.key} positive balance`);
    assert.ok(directions.filter((direction) => direction < 0).length >= 2, `${axis.key} negative balance`);
  }
});
