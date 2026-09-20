/**
 * SPDX-FileCopyrightText: 2026 FOSS Ethics Quiz contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { AXES, QUESTION_COUNT, QUESTIONS, QUIZ_VERSION, RESPONSE_OPTIONS } from "./data/questions.js";
import { REPOSITORY_URL } from "./config.js";

/** @param {string} tag @param {Record<string, unknown>} options @param {Array<Node|string>} children */
function element(tag, options = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(options)) {
    if (value === undefined || value === null || value === false) continue;
    if (key === "text") node.textContent = String(value);
    else if (key === "className") node.className = String(value);
    else if (key === "onClick") node.addEventListener("click", value);
    else if (key === "onChange") node.addEventListener("change", value);
    else if (key === "htmlFor") node.htmlFor = String(value);
    else if (key in node && key !== "role") node[key] = value;
    else node.setAttribute(key, String(value));
  }
  for (const child of children) node.append(child instanceof Node ? child : document.createTextNode(child));
  return node;
}

function heading(level, text, className = "") {
  return element(`h${level}`, { text, className, tabindex: level === 1 ? -1 : undefined });
}

function button(text, onClick, className = "button", disabled = false) {
  return element("button", { type: "button", text, className, disabled, onClick });
}

function list(items, className = "content-list") {
  return element("ul", { className }, items.map((item) => element("li", { text: item })));
}

function notice(message, kind = "info") {
  return element("p", { className: `notice notice--${kind}`, role: kind === "error" ? "alert" : undefined, text: message });
}

function actionRow(children, className = "action-row") {
  return element("div", { className }, children);
}

function scoreDirection(axis, score) {
  if (score >= 65) return `leans toward ${axis.high}`;
  if (score <= 35) return `leans toward ${axis.low}`;
  return "is relatively balanced between both endpoints";
}

function findQuestion(id) {
  return QUESTIONS.find((question) => question.id === id);
}

function answerLabel(value) {
  return RESPONSE_OPTIONS.find((option) => option.value === value)?.label ?? "Not answered";
}

/** @param {HTMLElement} root */
export function focusViewHeading(root) {
  requestAnimationFrame(() => root.querySelector("h1")?.focus());
}

/** @param {HTMLElement} root @param {string} message */
export function announce(root, message) {
  const announcer = root.ownerDocument.getElementById("announcements");
  if (announcer) announcer.textContent = message;
}

/**
 * @param {HTMLElement} root
 * @param {{attempt: import("./state.js").Attempt|null, storageAvailable: boolean, message?: string, events: Record<string, Function>}} model
 */
export function renderLanding(root, model) {
  document.title = "FOSS Ethics Quiz — map your FOSS values";
  const { attempt, storageAvailable, message, events } = model;
  const card = element("section", { className: "hero card" });
  card.append(
    element("p", { className: "eyebrow", text: "A private, exploratory questionnaire" }),
    heading(1, "FOSS Ethics Quiz", "hero__title"),
    element("p", {
      className: "lede",
      text: "Discover how your software-freedom, licensing, governance, and adoption values fit together.",
    }),
  );
  if (message) card.append(notice(message, message.startsWith("We couldn’t") ? "error" : "info"));

  const hasProgress = Boolean(attempt && Object.keys(attempt.answers).length > 0);
  const actions = [];
  if (attempt && !attempt.completed) {
    actions.push(button("Resume quiz", events.resume, "button button--primary"));
    actions.push(button("Start over", events.startOver, "button button--quiet"));
  } else if (attempt?.completed) {
    actions.push(button("Review saved answers", events.review, "button button--primary"));
    actions.push(button("Take it again", events.retake, "button button--quiet"));
  } else {
    actions.push(button("Start the quiz", events.start, "button button--primary"));
  }
  card.append(actionRow(actions));
  card.append(element("div", { className: "hero__facts" }, [
    element("p", { text: `${QUESTION_COUNT} statements · about 4–7 minutes` }),
    element("p", { text: "Your answers stay in this browser. No account, cookies, analytics, or network requests." }),
  ]));
  if (!storageAvailable) {
    card.append(notice("Browser storage is unavailable, so this attempt will work but cannot be resumed after you close the page."));
  } else if (hasProgress) {
    card.append(element("p", { className: "muted", text: "Your incomplete answers are saved only in this browser until you delete them." }));
  }

  const principles = element("section", { className: "info-grid", "aria-labelledby": "principles-heading" });
  principles.append(
    heading(2, "A map, not a grade", "section-heading"),
    element("p", { text: "There is no correct answer or purity score. The result describes a pattern of commitments, including its strengths and tradeoffs." }),
    element("div", { className: "mini-grid" }, [
      element("article", { className: "mini-card" }, [heading(3, "Six distinct axes"), element("p", { text: "Freedom, reciprocity, practical consistency, governance, commerce, and user sovereignty stay separate." })]),
      element("article", { className: "mini-card" }, [heading(3, "Inspectable scoring"), element("p", { text: "Questions, weights, prototypes, and methodology are part of the project files." })]),
      element("article", { className: "mini-card" }, [heading(3, "Private by design"), element("p", { text: "Results are calculated locally. Shared links contain a result profile, never your individual answers." })]),
    ]),
  );

  const secondary = actionRow([
    button("How scoring works", events.methodology, "button button--text"),
    element("a", { href: REPOSITORY_URL, target: "_blank", rel: "noopener noreferrer", className: "button button--text", text: "Project source & docs" }),
  ], "action-row action-row--secondary");
  root.replaceChildren(card, principles, secondary);
  focusViewHeading(root);
}

/**
 * @param {HTMLElement} root
 * @param {{attempt: import("./state.js").Attempt, question: import("./data/questions.js").Question, storageAvailable: boolean, events: Record<string, Function>}} model
 */
export function renderQuiz(root, model) {
  const { attempt, question, storageAvailable, events } = model;
  const questionNumber = attempt.currentIndex + 1;
  document.title = `Question ${questionNumber} of ${attempt.questionOrder.length} — FOSS Ethics Quiz`;

  const mainCard = element("section", { className: "quiz-card card" });
  mainCard.append(
    element("p", { className: "eyebrow", text: `Question ${questionNumber} of ${attempt.questionOrder.length}` }),
    heading(1, "FOSS Ethics Quiz", "screen-title"),
    element("label", { className: "progress-label", htmlFor: "quiz-progress", text: `${questionNumber} of ${attempt.questionOrder.length} answered in this sequence` }),
    element("progress", { id: "quiz-progress", max: attempt.questionOrder.length, value: questionNumber - 1, "aria-describedby": "progress-detail" }),
    element("p", { id: "progress-detail", className: "sr-only", text: "Choose an answer, then select Next to continue." }),
  );

  const fieldset = element("fieldset", { className: "question-fieldset" });
  const legend = element("legend", { className: "question-legend", text: question.text });
  fieldset.append(legend);
  const clarificationId = `clarification-${question.id}`;
  if (question.clarification) fieldset.append(element("p", { id: clarificationId, className: "clarification", text: question.clarification }));

  const choices = element("div", { className: "answer-options" });
  const savedValue = attempt.answers[question.id];
  for (const option of RESPONSE_OPTIONS) {
    const inputId = `answer-${question.id}-${option.value}`.replace("-", "negative-");
    const input = element("input", {
      id: inputId,
      type: "radio",
      name: question.id,
      value: String(option.value),
      checked: savedValue === option.value,
      "aria-describedby": question.clarification ? clarificationId : undefined,
      onChange: () => {
        events.answer(option.value);
        const next = root.querySelector("[data-next]");
        if (next) next.disabled = false;
      },
    });
    const label = element("label", { className: "answer-option", htmlFor: inputId }, [input, element("span", { text: option.label })]);
    choices.append(label);
  }
  fieldset.append(choices);
  mainCard.append(fieldset);

  const isLastQuestion = questionNumber === attempt.questionOrder.length;
  const controls = actionRow([
    button("Back", events.back, "button button--quiet", attempt.currentIndex === 0),
    element("span", { className: "nav-spacer" }),
    button(isLastQuestion ? "See results" : "Next", events.next, "button button--primary", savedValue === undefined),
  ]);
  controls.querySelector("button:last-child")?.setAttribute("data-next", "true");
  mainCard.append(controls);
  mainCard.append(actionRow([
    button("Save and exit", events.saveAndExit, "button button--text"),
    element("span", { className: "muted", text: storageAvailable ? "Saved in this browser after each choice." : "This browser cannot save progress." }),
  ], "action-row action-row--secondary"));
  root.replaceChildren(mainCard);
  focusViewHeading(root);
}

function renderAxisBars(scores) {
  const section = element("section", { className: "result-section" });
  section.append(heading(2, "Your six axes", "section-heading"), element("p", { className: "muted", text: "Each scale is independent. A higher number means closer to the right-hand label, not better." }));
  const axisList = element("div", { className: "axis-list" });
  for (const axis of AXES) {
    const score = scores[axis.key];
    const item = element("article", { className: "axis-score" });
    item.append(
      element("div", { className: "axis-score__heading" }, [
        heading(3, axis.high),
        element("span", { className: "score-number", text: `${score} / 100` }),
      ]),
      element("p", { className: "axis-description", text: axis.description }),
      element("progress", { max: 100, value: score, "aria-label": `${axis.low} to ${axis.high}: ${score} out of 100` }),
      element("div", { className: "axis-endpoints" }, [element("span", { text: `0 · ${axis.low}` }), element("span", { text: `100 · ${axis.high}` })]),
    );
    axisList.append(item);
  }
  section.append(axisList);
  return section;
}

function renderDrivers(result) {
  const section = element("section", { className: "result-section" });
  section.append(heading(2, "Why this fits", "section-heading"));
  const items = result.drivers.map((driver) => {
    const direction = scoreDirection(driver.axis, driver.score);
    return `${driver.axis.high}: your ${driver.score}/100 score ${direction}; it sits near this profile’s ${driver.prototypeScore}/100 reference point.`;
  });
  section.append(list(items));
  return section;
}

function renderNeighbor(result) {
  if (result.neighborMode === "none") return null;
  const neighbor = result.runnerUp.archetype;
  const section = element("section", { className: "neighbor-note" });
  if (result.neighborMode === "traits") {
    section.append(heading(2, "A nearby perspective", "section-heading"), element("p", { text: `Your profile also shares some traits with ${neighbor.name}. Its emphasis differs most in how it balances the same six dimensions.` }));
  } else {
    const keyDifference = result.drivers[0];
    section.append(
      heading(2, "Closest neighboring archetype", "section-heading"),
      element("p", { text: `${neighbor.name} is also close. The main distinction here is ${keyDifference.axis.high}: your score is ${keyDifference.score}/100, compared with ${neighbor.name}’s ${keyDifference.runnerUpScore}/100 reference point.` }),
    );
  }
  return section;
}

/**
 * @param {HTMLElement} root
 * @param {{scores: import("./scoring.js").AxisScores, result: ReturnType<import("./scoring.js").getResult>, shared: boolean, message?: string, events: Record<string, Function>}} model
 */
export function renderResults(root, model) {
  const { scores, result, shared, message, events } = model;
  const archetype = result.winner.archetype;
  document.title = `${archetype.name} — FOSS Ethics Quiz`;
  const intro = element("section", { className: "result-intro card" });
  if (shared) intro.append(notice("Shared result — this link contains only the result profile and axis scores, never individual answers."));
  if (message) intro.append(notice(message));
  intro.append(
    element("p", { className: "eyebrow", text: shared ? "A shared FOSS profile" : "Your FOSS profile" }),
    element("div", { className: "result-title-row" }, [
      element("div", { className: "archetype-badge", "aria-hidden": "true", text: archetype.badge }),
      element("div", {}, [heading(1, archetype.name, "result-title"), element("p", { className: "lede", text: archetype.thesis })]),
    ]),
  );
  if (result.isMixedProfile) intro.append(notice("Several of your scores sit near the middle, suggesting a deliberately mixed or context-dependent profile. The archetype is still the closest prototype, not a verdict."));
  const explanation = element("section", { className: "result-section" }, [heading(2, "About this profile", "section-heading"), element("p", { text: archetype.explanation })]);
  const strengths = element("section", { className: "result-section result-columns", "aria-label": "Strengths and tensions" }, [
    element("div", {}, [heading(2, "Strengths", "section-heading"), list(archetype.strengths)]),
    element("div", {}, [heading(2, "Tradeoffs and tensions", "section-heading"), list(archetype.tensions)]),
  ]);
  const misconception = element("aside", { className: "not-necessarily" }, [heading(2, "Not necessarily", "section-heading"), element("p", { text: archetype.notNecessarily })]);
  const neighbor = renderNeighbor(result);
  const actions = actionRow([
    button("Share result", events.share, "button button--primary"),
    button("Copy link", events.copy, "button button--quiet"),
    ...(!shared ? [button("Review answers", events.review, "button button--quiet"), button("Retake quiz", events.retake, "button button--text")] : [button("Take the quiz", events.start, "button button--quiet")]),
  ]);
  const closing = element("section", { className: "result-closing" }, [
    actions,
    actionRow([button("How scoring works", events.methodology, "button button--text"), element("a", { href: REPOSITORY_URL, target: "_blank", rel: "noopener noreferrer", className: "button button--text", text: "Project source & docs" })], "action-row action-row--secondary"),
    element("p", { className: "disclaimer", text: "Exploratory and descriptive, not a license recommendation. Unofficial; not affiliated with or endorsed by GNU, FSF, OSI, Debian, or any vendor." }),
  ]);
  const sections = [intro, renderDrivers(result), explanation, strengths, misconception, renderAxisBars(scores), neighbor, closing].filter(Boolean);
  root.replaceChildren(...sections);
  focusViewHeading(root);
}

/** @param {HTMLElement} root @param {{attempt: import("./state.js").Attempt, events: Record<string, Function>}} model */
export function renderReview(root, model) {
  document.title = "Review answers — FOSS Ethics Quiz";
  const section = element("section", { className: "review card" });
  section.append(
    element("p", { className: "eyebrow", text: "Saved locally in this browser" }),
    heading(1, "Review your answers", "screen-title"),
    element("p", { className: "lede", text: "These are the statements and answers used to calculate your local result. Nothing is sent anywhere." }),
  );
  const items = element("ol", { className: "review-list" });
  for (const id of model.attempt.questionOrder) {
    const question = findQuestion(id);
    if (!question) continue;
    items.append(element("li", {}, [
      element("p", { className: "review-question", text: question.text }),
      element("p", { className: "review-answer", text: answerLabel(model.attempt.answers[id]) }),
    ]));
  }
  section.append(items, actionRow([
    button("Back to results", model.events.results, "button button--primary"),
    button("Retake quiz", model.events.retake, "button button--quiet"),
  ]));
  root.replaceChildren(section);
  focusViewHeading(root);
}

/** @param {HTMLElement} root @param {{storageAvailable: boolean, events: Record<string, Function>}} model */
export function renderMethodology(root, model) {
  document.title = "How scoring works — FOSS Ethics Quiz";
  const section = element("section", { className: "methodology card" });
  section.append(
    element("p", { className: "eyebrow", text: `Version ${QUIZ_VERSION} · exploratory` }),
    heading(1, "How scoring works", "screen-title"),
    element("p", { className: "lede", text: "This questionnaire describes a profile; it does not measure virtue, political identity, or the one correct license for a project." }),
    heading(2, "Six independent axes", "section-heading"),
  );
  const axisList = element("dl", { className: "methodology-axes" });
  for (const axis of AXES) {
    axisList.append(element("dt", { text: `${axis.low} ↔ ${axis.high}` }), element("dd", { text: axis.description }));
  }
  section.append(axisList);
  section.append(
    heading(2, "Five-point responses", "section-heading"),
    element("p", { text: "Responses map from −2 (strongly disagree) to +2 (strongly agree). Some statements are reverse-keyed, so agreement can move an axis toward either endpoint. Neutral answers contribute zero and are a valid response." }),
    heading(2, "From answers to a result", "section-heading"),
    element("p", { text: "For each axis, weighted responses are added and independently normalized to 0–100. Your six scores are compared with editorial prototype profiles using equal-weight normalized Euclidean distance. The smallest distance wins; an exact tie follows a documented stable priority. A close runner-up is shown rather than hidden." }),
    heading(2, "Limits", "section-heading"),
    element("p", { text: "The prototypes are editorial hypotheses, not validated psychometrics. They are meant to make disagreements within FOSS clearer, not to define people or settle a project decision. Question and prototype changes create a new quiz version." }),
    heading(2, "Privacy and source", "section-heading"),
    element("p", { text: "Answers and unfinished attempts are stored only in local browser storage when available. Share links include an archetype and six rounded scores, never the individual response history. Read the full methodology, content guide, and license notices in the project documentation." }),
  );
  const actions = [button("Back to home", model.events.home, "button button--primary")];
  if (model.storageAvailable) actions.push(button("Delete my saved quiz data", model.events.deleteData, "button button--danger"));
  section.append(actionRow(actions), element("p", { className: "disclaimer", text: "Unofficial; not affiliated with or endorsed by GNU, FSF, OSI, Debian, or any vendor." }));
  root.replaceChildren(section);
  focusViewHeading(root);
}
