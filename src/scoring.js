/**
 * SPDX-FileCopyrightText: 2026 FOSS Ethics Quiz contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { ARCHETYPES, TIE_PRIORITY } from "./data/archetypes.js";
import { AXES, QUESTIONS, RESPONSE_OPTIONS } from "./data/questions.js";

export const RESPONSE_VALUES = Object.freeze(RESPONSE_OPTIONS.map(({ value }) => value));
export const RUNNER_UP_COMPARISON_THRESHOLD = 0.08;
export const RUNNER_UP_TRAIT_THRESHOLD = 0.12;

/** @param {unknown} value @returns {value is -2|-1|0|1|2} */
export function isResponseValue(value) {
  return Number.isInteger(value) && RESPONSE_VALUES.includes(value);
}

/** @returns {Record<string, -2|-1|0|1|2>} */
export function createNeutralAnswers(questions = QUESTIONS) {
  return Object.fromEntries(questions.map(({ id }) => [id, 0]));
}

/**
 * Normalize a complete answer set to independently scored axes.
 * @param {Record<string, number>} answers
 * @param {ReadonlyArray<Question>} questions
 * @param {ReadonlyArray<Axis>} axes
 * @returns {AxisScores}
 */
export function calculateAxisScores(answers, questions = QUESTIONS, axes = AXES) {
  const totals = Object.fromEntries(axes.map(({ key }) => [key, { raw: 0, maximum: 0 }]));

  for (const question of questions) {
    const answer = answers[question.id];
    if (!isResponseValue(answer)) {
      throw new TypeError(`Missing or invalid answer for question: ${question.id}`);
    }

    for (const [axisKey, weight] of Object.entries(question.weights)) {
      if (!totals[axisKey]) {
        throw new RangeError(`Question ${question.id} has an unknown axis: ${axisKey}`);
      }
      totals[axisKey].raw += answer * weight;
      totals[axisKey].maximum += 2 * Math.abs(weight);
    }
  }

  return Object.fromEntries(
    axes.map(({ key }) => {
      const { raw, maximum } = totals[key];
      if (maximum === 0) {
        throw new RangeError(`Axis ${key} has no weighted questions`);
      }
      return [key, Math.round(((raw + maximum) / (2 * maximum)) * 100)];
    }),
  );
}

/**
 * @param {AxisScores} scores
 * @param {Archetype} archetype
 * @param {Record<string, number>} axisWeights
 */
export function calculatePrototypeDistance(
  scores,
  archetype,
  axisWeights = Object.fromEntries(AXES.map(({ key }) => [key, 1])),
) {
  let weightedSum = 0;
  let weightSum = 0;
  for (const { key } of AXES) {
    const score = scores[key];
    const prototypeScore = archetype.prototype[key];
    const weight = axisWeights[key];
    if (!Number.isFinite(score) || !Number.isFinite(prototypeScore) || !Number.isFinite(weight) || weight <= 0) {
      throw new TypeError(`Invalid distance input for axis: ${key}`);
    }
    weightedSum += weight * ((score - prototypeScore) / 100) ** 2;
    weightSum += weight;
  }
  return Math.sqrt(weightedSum / weightSum);
}

/**
 * @param {AxisScores} scores
 * @param {ReadonlyArray<Archetype>} archetypes
 * @param {ReadonlyArray<string>} tiePriority
 */
export function rankArchetypes(scores, archetypes = ARCHETYPES, tiePriority = TIE_PRIORITY) {
  const priorities = new Map(tiePriority.map((id, index) => [id, index]));
  return archetypes
    .map((archetype) => ({ archetype, distance: calculatePrototypeDistance(scores, archetype) }))
    .sort((left, right) => {
      const difference = left.distance - right.distance;
      if (Math.abs(difference) > Number.EPSILON) return difference;
      return (priorities.get(left.archetype.id) ?? Number.MAX_SAFE_INTEGER)
        - (priorities.get(right.archetype.id) ?? Number.MAX_SAFE_INTEGER);
    });
}

/**
 * Return the dimensions that make the winner a better match than its runner-up.
 * @param {AxisScores} scores
 * @param {Archetype} winner
 * @param {Archetype} [runnerUp]
 * @param {number} limit
 */
export function getExplanationDrivers(scores, winner, runnerUp, limit = 3) {
  return AXES
    .map((axis, index) => {
      const winnerDifference = ((scores[axis.key] - winner.prototype[axis.key]) / 100) ** 2;
      const runnerDifference = runnerUp
        ? ((scores[axis.key] - runnerUp.prototype[axis.key]) / 100) ** 2
        : 1;
      return {
        axis,
        score: scores[axis.key],
        prototypeScore: winner.prototype[axis.key],
        runnerUpScore: runnerUp?.prototype[axis.key],
        advantage: runnerDifference - winnerDifference,
        closeness: 1 - winnerDifference,
        index,
      };
    })
    .sort((left, right) => (
      right.advantage - left.advantage
      || right.closeness - left.closeness
      || left.index - right.index
    ))
    .slice(0, limit);
}

/** @param {AxisScores} scores @param {ReadonlyArray<Archetype>} archetypes */
export function getResult(scores, archetypes = ARCHETYPES) {
  const ranking = rankArchetypes(scores, archetypes);
  const winner = ranking[0];
  const runnerUp = ranking[1];
  const margin = runnerUp ? runnerUp.distance - winner.distance : Infinity;
  const middleAxisCount = AXES.filter(({ key }) => scores[key] >= 40 && scores[key] <= 60).length;
  return {
    winner,
    runnerUp,
    ranking,
    margin,
    drivers: getExplanationDrivers(scores, winner.archetype, runnerUp?.archetype),
    neighborMode: margin <= RUNNER_UP_COMPARISON_THRESHOLD
      ? "comparison"
      : margin <= RUNNER_UP_TRAIT_THRESHOLD
        ? "traits"
        : "none",
    isMixedProfile: middleAxisCount >= 4,
  };
}

/**
 * A deterministic, backtracking constrained shuffle. It never returns adjacent
 * questions with the same primary axis and preserves each question exactly once.
 * @param {ReadonlyArray<Question>} questions
 * @param {() => number} random
 */
export function createConstrainedQuestionOrder(questions = QUESTIONS, random = Math.random) {
  const build = (remaining, previousAxis, output) => {
    if (remaining.length === 0) return output;
    const candidates = remaining
      .map((question, index) => ({ question, index }))
      .filter(({ question }) => question.primaryAxis !== previousAxis);
    if (candidates.length === 0) return null;

    for (let index = candidates.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(random() * (index + 1));
      [candidates[index], candidates[swapIndex]] = [candidates[swapIndex], candidates[index]];
    }

    for (const candidate of candidates) {
      const nextRemaining = remaining.filter((_, index) => index !== candidate.index);
      const result = build(nextRemaining, candidate.question.primaryAxis, [...output, candidate.question.id]);
      if (result) return result;
    }
    return null;
  };

  const order = build([...questions], null, []);
  if (!order) throw new Error("Unable to create a non-adjacent primary-axis question order");
  return order;
}

/** @param {string} seed */
export function createSeededRandom(seed) {
  let state = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    state = Math.imul(state ^ seed.charCodeAt(index), 16777619);
  }
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

/** @param {ReadonlyArray<string>} order @param {ReadonlyArray<Question>} questions */
export function isValidConstrainedOrder(order, questions = QUESTIONS) {
  if (!Array.isArray(order) || order.length !== questions.length || new Set(order).size !== questions.length) {
    return false;
  }
  const byId = new Map(questions.map((question) => [question.id, question]));
  for (let index = 0; index < order.length; index += 1) {
    const question = byId.get(order[index]);
    const previous = index > 0 ? byId.get(order[index - 1]) : null;
    if (!question || (previous && previous.primaryAxis === question.primaryAxis)) return false;
  }
  return true;
}

/**
 * Generate full answer maps for maintained synthetic-persona validation. This
 * intentionally supports the v1 design of five primary +/-1 items per axis.
 * @param {AxisScores} targets
 * @param {ReadonlyArray<Question>} questions
 */
export function createAnswersForAxisTargets(targets, questions = QUESTIONS) {
  const answers = createNeutralAnswers(questions);
  for (const axis of AXES) {
    const axisQuestions = questions.filter((question) => question.primaryAxis === axis.key);
    const maximum = axisQuestions.reduce((sum, question) => sum + 2 * Math.abs(question.weights[axis.key] ?? 0), 0);
    if (!axisQuestions.length || axisQuestions.some((question) => Math.abs(question.weights[axis.key]) !== 1)) {
      throw new Error("Synthetic persona generation requires primary +/-1 question weights");
    }
    let remaining = Math.max(-maximum, Math.min(maximum, Math.round(((targets[axis.key] / 100) * 2 * maximum) - maximum)));
    for (const question of axisQuestions) {
      const contribution = Math.max(-2, Math.min(2, remaining));
      answers[question.id] = contribution * question.weights[axis.key];
      remaining -= contribution;
    }
  }
  return answers;
}

/** @typedef {Record<string, number>} AxisScores */
/** @typedef {import("./data/questions.js").Question} Question */
/** @typedef {Object} Axis @property {string} key @property {string} low @property {string} high */
