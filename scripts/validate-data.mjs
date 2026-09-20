/** SPDX-License-Identifier: AGPL-3.0-or-later */

import { ARCHETYPES, TIE_PRIORITY } from "../src/data/archetypes.js";
import { SYNTHETIC_PERSONAS } from "../src/data/personas.js";
import { AXES, AXIS_KEYS, QUESTIONS } from "../src/data/questions.js";
import {
  calculateAxisScores,
  createAnswersForAxisTargets,
  createConstrainedQuestionOrder,
  createSeededRandom,
  isValidConstrainedOrder,
  rankArchetypes,
} from "../src/scoring.js";

const errors = [];
const addError = (message) => errors.push(message);
const words = (text) => text.trim().split(/\s+/).filter(Boolean).length;
const requireUnique = (items, label) => {
  if (new Set(items).size !== items.length) addError(`${label} must be unique`);
};

if (QUESTIONS.length !== 30) addError(`Expected exactly 30 questions, found ${QUESTIONS.length}`);
requireUnique(QUESTIONS.map(({ id }) => id), "Question IDs");
requireUnique(ARCHETYPES.map(({ id }) => id), "Archetype IDs");

for (const axis of AXES) {
  const primary = QUESTIONS.filter((question) => question.primaryAxis === axis.key);
  if (primary.length !== 5) addError(`${axis.key} must have exactly five primary questions`);
  const directions = primary.map((question) => Math.sign(question.weights[axis.key] ?? 0));
  if (directions.filter((direction) => direction > 0).length < 2
    || directions.filter((direction) => direction < 0).length < 2) {
    addError(`${axis.key} must have at least two positive and two negative primary items`);
  }
}

for (const question of QUESTIONS) {
  if (!question.id || !question.text || !AXIS_KEYS.includes(question.primaryAxis)) {
    addError(`Question ${question.id || "(missing ID)"} has incomplete required fields`);
  }
  const entries = Object.entries(question.weights ?? {});
  if (entries.length < 1 || entries.length > 2 || !Object.hasOwn(question.weights, question.primaryAxis)) {
    addError(`Question ${question.id} must have a primary weight and at most one secondary weight`);
  }
  for (const [axis, weight] of entries) {
    if (!AXIS_KEYS.includes(axis) || !Number.isFinite(weight) || weight === 0 || Math.abs(weight) > 1) {
      addError(`Question ${question.id} has an invalid weight for ${axis}`);
    }
    if (axis !== question.primaryAxis && Math.abs(weight) > 0.5) {
      addError(`Question ${question.id} secondary weight for ${axis} exceeds 0.5`);
    }
  }
}

for (const archetype of ARCHETYPES) {
  const prototypeKeys = Object.keys(archetype.prototype).sort();
  if (prototypeKeys.join(",") !== [...AXIS_KEYS].sort().join(",")) {
    addError(`${archetype.id} does not define every axis exactly once`);
  }
  for (const axis of AXIS_KEYS) {
    const score = archetype.prototype[axis];
    if (!Number.isInteger(score) || score < 0 || score > 100) addError(`${archetype.id} has an invalid ${axis} prototype`);
  }
  if (words(archetype.thesis) < 20 || words(archetype.thesis) > 35) {
    addError(`${archetype.id} thesis must be 20–35 words`);
  }
  if (words(archetype.explanation) < 80 || words(archetype.explanation) > 140) {
    addError(`${archetype.id} explanation must be 80–140 words`);
  }
  if (archetype.strengths.length !== 3 || archetype.tensions.length !== 3
    || [...archetype.strengths, ...archetype.tensions].some((item) => !item.trim())) {
    addError(`${archetype.id} needs three nonempty strengths and three nonempty tensions`);
  }
  if (words(archetype.notNecessarily) < 8) addError(`${archetype.id} needs a substantive misconception correction`);
}

requireUnique(TIE_PRIORITY, "Tie priority");
if (TIE_PRIORITY.length !== ARCHETYPES.length
  || TIE_PRIORITY.some((id) => !ARCHETYPES.some((archetype) => archetype.id === id))) {
  addError("Tie priority must contain every archetype exactly once");
}

for (let seed = 0; seed < 128; seed += 1) {
  const order = createConstrainedQuestionOrder(QUESTIONS, createSeededRandom(`validation-${seed}`));
  if (!isValidConstrainedOrder(order, QUESTIONS)) {
    addError(`Constrained question order failed for seed ${seed}`);
    break;
  }
}

for (const persona of SYNTHETIC_PERSONAS) {
  const answers = createAnswersForAxisTargets(persona.axisTargets);
  const scores = calculateAxisScores(answers);
  const winner = rankArchetypes(scores)[0]?.archetype.id;
  if (winner !== persona.targetArchetypeId) {
    addError(`Synthetic persona ${persona.id} reaches ${winner}, not ${persona.targetArchetypeId}`);
  }
}

if (errors.length) {
  for (const error of errors) process.stderr.write(`Data validation: ${error}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write(`Data validation passed: ${QUESTIONS.length} questions, ${ARCHETYPES.length} reachable archetypes.\n`);
}
