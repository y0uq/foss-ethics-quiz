/**
 * SPDX-FileCopyrightText: 2026 FOSS Ethics Quiz contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { ARCHETYPE_BY_ID } from "./data/archetypes.js";
import { AXIS_KEYS, QUESTIONS, QUIZ_VERSION } from "./data/questions.js";
import { isResponseValue } from "./scoring.js";

export const STORAGE_KEY = "fossEthicsQuiz:v1:attempt";
export const ATTEMPT_SCHEMA_VERSION = 1;
export const SHARE_PREFIX = "foss-ethics-v1:";
const SHARE_SCORE_KEYS = Object.freeze(["f", "r", "p", "g", "c", "s"]);
const SHARE_AXIS_BY_KEY = Object.freeze({
  f: "freedom",
  r: "reciprocity",
  p: "purity",
  g: "governance",
  c: "commerce",
  s: "sovereignty",
});

/** @param {ReadonlyArray<string>} questionOrder @param {string} timestamp */
export function createAttempt(questionOrder, timestamp = new Date().toISOString()) {
  return {
    schemaVersion: ATTEMPT_SCHEMA_VERSION,
    quizVersion: QUIZ_VERSION,
    questionOrder: [...questionOrder],
    answers: {},
    currentIndex: 0,
    completed: false,
    updatedAt: timestamp,
  };
}

/** @param {unknown} value */
function isPlainObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

/** @param {unknown} value */
function isIsoTimestamp(value) {
  return typeof value === "string"
    && value.length <= 40
    && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value)
    && !Number.isNaN(Date.parse(value));
}

/**
 * Validate a persisted attempt without accepting arbitrary localStorage content.
 * @param {unknown} attempt
 * @param {ReadonlyArray<Question>} questions
 */
export function validateAttempt(attempt, questions = QUESTIONS) {
  if (!isPlainObject(attempt)) return { valid: false, reason: "not-an-object" };
  if (attempt.schemaVersion !== ATTEMPT_SCHEMA_VERSION || attempt.quizVersion !== QUIZ_VERSION) {
    return { valid: false, reason: "incompatible-version" };
  }
  const questionIds = new Set(questions.map(({ id }) => id));
  if (!Array.isArray(attempt.questionOrder)
    || attempt.questionOrder.length !== questions.length
    || new Set(attempt.questionOrder).size !== questions.length
    || attempt.questionOrder.some((id) => typeof id !== "string" || !questionIds.has(id))) {
    return { valid: false, reason: "invalid-order" };
  }
  if (!isPlainObject(attempt.answers)) return { valid: false, reason: "invalid-answers" };
  const answerEntries = Object.entries(attempt.answers);
  if (answerEntries.some(([id, value]) => !questionIds.has(id) || !isResponseValue(value))) {
    return { valid: false, reason: "invalid-answer-value" };
  }
  if (!Number.isInteger(attempt.currentIndex)
    || attempt.currentIndex < 0
    || attempt.currentIndex >= questions.length
    || typeof attempt.completed !== "boolean"
    || !isIsoTimestamp(attempt.updatedAt)) {
    return { valid: false, reason: "invalid-metadata" };
  }
  if (attempt.completed && attempt.questionOrder.some((id) => !Object.hasOwn(attempt.answers, id))) {
    return { valid: false, reason: "incomplete-completion" };
  }
  return { valid: true, value: cloneAttempt(attempt) };
}

/** @param {Attempt} attempt */
export function cloneAttempt(attempt) {
  return {
    ...attempt,
    questionOrder: [...attempt.questionOrder],
    answers: { ...attempt.answers },
  };
}

/** @param {Attempt} attempt @param {string} questionId @param {number} value @param {string} timestamp */
export function answerQuestion(attempt, questionId, value, timestamp = new Date().toISOString()) {
  if (!attempt.questionOrder.includes(questionId) || !isResponseValue(value)) {
    throw new TypeError("Cannot save an unknown question or invalid response");
  }
  return { ...cloneAttempt(attempt), answers: { ...attempt.answers, [questionId]: value }, updatedAt: timestamp };
}

/** @param {Attempt} attempt @param {number} currentIndex @param {string} timestamp */
export function setCurrentIndex(attempt, currentIndex, timestamp = new Date().toISOString()) {
  if (!Number.isInteger(currentIndex) || currentIndex < 0 || currentIndex >= attempt.questionOrder.length) {
    throw new RangeError("Question index is outside this attempt");
  }
  return { ...cloneAttempt(attempt), currentIndex, updatedAt: timestamp };
}

/** @param {Attempt} attempt @param {string} timestamp */
export function completeAttempt(attempt, timestamp = new Date().toISOString()) {
  if (attempt.questionOrder.some((id) => !Object.hasOwn(attempt.answers, id))) {
    throw new TypeError("Cannot complete an attempt with unanswered questions");
  }
  return { ...cloneAttempt(attempt), completed: true, updatedAt: timestamp };
}

/** @param {Storage|null|undefined} storage */
export function loadAttempt(storage) {
  if (!storage) return { attempt: null, reason: "unavailable" };
  try {
    const serialized = storage.getItem(STORAGE_KEY);
    if (!serialized) return { attempt: null, reason: "missing" };
    const validation = validateAttempt(JSON.parse(serialized));
    if (!validation.valid) {
      storage.removeItem(STORAGE_KEY);
      return { attempt: null, reason: "invalid" };
    }
    return { attempt: validation.value, reason: "loaded" };
  } catch {
    try { storage.removeItem(STORAGE_KEY); } catch { /* unavailable storage stays nonfatal */ }
    return { attempt: null, reason: "invalid" };
  }
}

/** @param {Attempt} attempt @param {Storage|null|undefined} storage */
export function saveAttempt(attempt, storage) {
  if (!storage || !validateAttempt(attempt).valid) return false;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(attempt));
    return true;
  } catch {
    return false;
  }
}

/** @param {Storage|null|undefined} storage */
export function deleteAttempt(storage) {
  if (!storage) return false;
  try {
    storage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

/** @param {Window|typeof globalThis} windowObject */
export function getAvailableStorage(windowObject = globalThis) {
  try {
    const storage = windowObject.localStorage;
    const testKey = "fossEthicsQuiz:storage-test";
    storage.setItem(testKey, "1");
    storage.removeItem(testKey);
    return storage;
  } catch {
    return null;
  }
}

/** @param {string} text */
function checksum(text) {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash = Math.imul(hash ^ text.charCodeAt(index), 16777619);
  }
  return (hash >>> 0).toString(36);
}

/** @param {string} archetypeId @param {AxisScores} scores */
export function createShareFragment(archetypeId, scores) {
  if (!ARCHETYPE_BY_ID[archetypeId]) throw new TypeError("Unknown archetype for share link");
  const values = {
    v: QUIZ_VERSION,
    a: archetypeId,
    f: scores.freedom,
    r: scores.reciprocity,
    p: scores.purity,
    g: scores.governance,
    c: scores.commerce,
    s: scores.sovereignty,
  };
  if (SHARE_SCORE_KEYS.some((key) => !Number.isInteger(values[key]) || values[key] < 0 || values[key] > 100)) {
    throw new TypeError("Share scores must be rounded values from 0 through 100");
  }
  const payload = ["v", "a", ...SHARE_SCORE_KEYS].map((key) => `${key}=${values[key]}`).join("&");
  return `#${SHARE_PREFIX}${payload}&h=${checksum(payload)}`;
}

/** @param {string} fragment */
export function parseShareFragment(fragment) {
  if (typeof fragment !== "string" || fragment.length > 256 || !fragment.startsWith(`#${SHARE_PREFIX}`)) {
    return { valid: false, reason: "not-a-share-fragment" };
  }
  const rawPairs = fragment.slice(SHARE_PREFIX.length + 1).split("&");
  const values = {};
  const allowed = new Set(["v", "a", ...SHARE_SCORE_KEYS, "h"]);
  for (const pair of rawPairs) {
    const match = /^([a-z])=([A-Za-z0-9.-]+)$/.exec(pair);
    if (!match || !allowed.has(match[1]) || Object.hasOwn(values, match[1])) {
      return { valid: false, reason: "malformed-share-fragment" };
    }
    values[match[1]] = match[2];
  }
  if (Object.keys(values).length !== allowed.size
    || values.v !== QUIZ_VERSION
    || !ARCHETYPE_BY_ID[values.a]
    || !/^[a-z0-9-]{3,50}$/.test(values.a)) {
    return { valid: false, reason: "invalid-share-fields" };
  }
  const payload = ["v", "a", ...SHARE_SCORE_KEYS].map((key) => `${key}=${values[key]}`).join("&");
  if (values.h !== checksum(payload)) return { valid: false, reason: "invalid-share-checksum" };
  const scores = {};
  for (const key of SHARE_SCORE_KEYS) {
    if (!/^(?:0|[1-9]\d?|100)$/.test(values[key])) {
      return { valid: false, reason: "invalid-share-score" };
    }
    scores[SHARE_AXIS_BY_KEY[key]] = Number(values[key]);
  }
  if (Object.keys(scores).length !== AXIS_KEYS.length) return { valid: false, reason: "invalid-share-score" };
  return { valid: true, share: { archetypeId: values.a, scores, quizVersion: values.v } };
}

/** @typedef {Object} Attempt
 * @property {number} schemaVersion
 * @property {string} quizVersion
 * @property {string[]} questionOrder
 * @property {Record<string, -2|-1|0|1|2>} answers
 * @property {number} currentIndex
 * @property {boolean} completed
 * @property {string} updatedAt
 */
/** @typedef {import("./scoring.js").AxisScores} AxisScores */
/** @typedef {import("./data/questions.js").Question} Question */
