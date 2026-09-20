/**
 * SPDX-FileCopyrightText: 2026 FOSS Ethics Quiz contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { QUESTIONS } from "./data/questions.js";
import {
  calculateAxisScores,
  createConstrainedQuestionOrder,
  createSeededRandom,
  getResult,
} from "./scoring.js";
import {
  answerQuestion,
  completeAttempt,
  createAttempt,
  createShareFragment,
  deleteAttempt,
  getAvailableStorage,
  loadAttempt,
  parseShareFragment,
  saveAttempt,
  setCurrentIndex,
} from "./state.js";
import {
  announce,
  renderLanding,
  renderMethodology,
  renderQuiz,
  renderResults,
  renderReview,
} from "./ui.js";

const root = document.getElementById("app");
let storage = getAvailableStorage(window);
let attempt = null;
let message = "";

function persist() {
  if (saveAttempt(attempt, storage)) return true;
  storage = null;
  message = "Browser storage became unavailable. You can continue, but this attempt cannot be resumed after closing the page.";
  return false;
}

function resultForAttempt() {
  if (!attempt?.completed) return null;
  return { scores: calculateAxisScores(attempt.answers), result: getResult(calculateAxisScores(attempt.answers)) };
}

function questionForAttempt() {
  const questionId = attempt?.questionOrder[attempt.currentIndex];
  return QUESTIONS.find((question) => question.id === questionId) ?? null;
}

function createSeed() {
  const values = new Uint32Array(2);
  if (window.crypto?.getRandomValues) window.crypto.getRandomValues(values);
  else values[0] = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
  return `${Date.now()}-${values[0]}-${values[1]}`;
}

function clearShareFragment() {
  if (window.location.hash) window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
}

function startNewAttempt() {
  clearShareFragment();
  attempt = createAttempt(createConstrainedQuestionOrder(QUESTIONS, createSeededRandom(createSeed())));
  persist();
  showQuiz();
}

function showLanding(nextMessage = message) {
  message = nextMessage;
  renderLanding(root, {
    attempt,
    storageAvailable: Boolean(storage),
    message,
    events: {
      start: startNewAttempt,
      resume: showQuiz,
      startOver,
      retake: startNewAttempt,
      review: showReview,
      methodology: showMethodology,
    },
  });
}

function showQuiz() {
  if (!attempt) return startNewAttempt();
  if (attempt.completed) return showResults();
  const question = questionForAttempt();
  if (!question) {
    attempt = null;
    return showLanding("We couldn’t restore that saved quiz, so it was safely discarded.");
  }
  renderQuiz(root, {
    attempt,
    question,
    storageAvailable: Boolean(storage),
    events: { answer: saveAnswer, back: previousQuestion, next: nextQuestion, saveAndExit: () => showLanding("Your progress is saved in this browser.") },
  });
  announce(root, `Question ${attempt.currentIndex + 1} of ${attempt.questionOrder.length}`);
}

function saveAnswer(value) {
  const question = questionForAttempt();
  if (!question || !attempt) return;
  attempt = answerQuestion(attempt, question.id, value);
  if (!persist()) announce(root, message);
}

function previousQuestion() {
  if (!attempt || attempt.currentIndex === 0) return;
  attempt = setCurrentIndex(attempt, attempt.currentIndex - 1);
  persist();
  showQuiz();
}

function nextQuestion() {
  if (!attempt) return;
  const question = questionForAttempt();
  if (!question || attempt.answers[question.id] === undefined) return;
  if (attempt.currentIndex < attempt.questionOrder.length - 1) {
    attempt = setCurrentIndex(attempt, attempt.currentIndex + 1);
    persist();
    showQuiz();
    return;
  }
  attempt = completeAttempt(attempt);
  persist();
  showResults();
}

function startOver() {
  const hasProgress = Boolean(attempt && Object.keys(attempt.answers).length > 0);
  if (hasProgress && !window.confirm("Start over? Your saved answers for this attempt will be replaced.")) return;
  deleteAttempt(storage);
  message = "";
  startNewAttempt();
}

function showResults() {
  const localResult = resultForAttempt();
  if (!localResult) return showLanding("Complete a quiz to see a local result.");
  renderResults(root, {
    ...localResult,
    shared: false,
    message,
    events: {
      share: shareResult,
      copy: copyResultLink,
      review: showReview,
      retake: startNewAttempt,
      methodology: showMethodology,
      start: startNewAttempt,
    },
  });
  message = "";
}

function showReview() {
  if (!attempt?.completed) return showLanding("There are no completed local answers to review.");
  renderReview(root, { attempt, events: { results: showResults, retake: startNewAttempt } });
}

function showMethodology() {
  renderMethodology(root, {
    storageAvailable: Boolean(storage),
    events: { home: () => showLanding(""), deleteData: deleteSavedData },
  });
}

function deleteSavedData() {
  if (!window.confirm("Delete the saved quiz data in this browser? This cannot be undone.")) return;
  deleteAttempt(storage);
  attempt = null;
  showLanding("Your saved quiz data was deleted from this browser.");
}

function shareUrl() {
  const localResult = resultForAttempt();
  if (!localResult) return null;
  const url = new URL(window.location.href);
  url.hash = createShareFragment(localResult.result.winner.archetype.id, localResult.scores).slice(1);
  return { url: url.toString(), archetype: localResult.result.winner.archetype.name };
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const input = document.createElement("textarea");
  input.className = "copy-buffer";
  input.value = text;
  input.setAttribute("aria-label", "Share link");
  document.body.append(input);
  input.select();
  const copied = document.execCommand("copy");
  input.remove();
  if (!copied) throw new Error("Copy command failed");
}

async function copyResultLink() {
  const payload = shareUrl();
  if (!payload) return;
  try {
    await copyText(payload.url);
    announce(root, "Share link copied to your clipboard.");
  } catch {
    announce(root, "Copying was unavailable. You can copy the address from your browser’s address bar.");
  }
}

async function shareResult() {
  const payload = shareUrl();
  if (!payload) return;
  const text = `My FOSS Ethics Quiz profile is ${payload.archetype}.`;
  if (navigator.share) {
    try {
      await navigator.share({ title: "FOSS Ethics Quiz", text, url: payload.url });
      return;
    } catch (error) {
      if (error?.name === "AbortError") return;
    }
  }
  await copyResultLink();
}

function showSharedResult(share) {
  const result = getResult(share.scores);
  if (result.winner.archetype.id !== share.archetypeId) {
    showLanding("We couldn’t verify that shared result, so it was not displayed.");
    return;
  }
  renderResults(root, {
    scores: share.scores,
    result,
    shared: true,
    events: {
      share: () => shareSharedResult(share),
      copy: () => copySharedLink(share),
      start: startNewAttempt,
      methodology: showMethodology,
    },
  });
}

async function copySharedLink(share) {
  const url = new URL(window.location.href);
  url.hash = createShareFragment(share.archetypeId, share.scores).slice(1);
  try {
    await copyText(url.toString());
    announce(root, "Share link copied to your clipboard.");
  } catch {
    announce(root, "Copying was unavailable. You can copy the address from your browser’s address bar.");
  }
}

async function shareSharedResult(share) {
  const result = getResult(share.scores);
  const url = new URL(window.location.href);
  url.hash = createShareFragment(share.archetypeId, share.scores).slice(1);
  if (navigator.share) {
    try {
      await navigator.share({ title: "FOSS Ethics Quiz", text: `A shared profile is ${result.winner.archetype.name}.`, url: url.toString() });
      return;
    } catch (error) {
      if (error?.name === "AbortError") return;
    }
  }
  await copySharedLink(share);
}

function routeFromFragment() {
  if (!window.location.hash) return showLanding("");
  const parsed = parseShareFragment(window.location.hash);
  if (parsed.valid) return showSharedResult(parsed.share);
  return showLanding("We couldn’t read that shared result link. You can still take the quiz locally.");
}

function initialize() {
  const loaded = loadAttempt(storage);
  attempt = loaded.attempt;
  if (loaded.reason === "invalid") message = "We couldn’t restore saved quiz data, so it was safely discarded.";
  if (loaded.reason === "unavailable") message = "Browser storage is unavailable, so resume is not available in this session.";
  routeFromFragment();
}

window.addEventListener("hashchange", routeFromFragment);
initialize();
