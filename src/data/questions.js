/**
 * SPDX-FileCopyrightText: 2026 FOSS Ethics Quiz contributors
 * SPDX-License-Identifier: CC-BY-SA-4.0
 */

export const QUIZ_VERSION = "1.1.0";

export const AXES = Object.freeze([
  Object.freeze({
    key: "freedom",
    low: "Outcome-oriented",
    high: "Freedom-first",
    description: "Whether user freedoms are moral requirements or one benefit among several.",
  }),
  Object.freeze({
    key: "reciprocity",
    low: "Permissive",
    high: "Reciprocal",
    description: "Whether downstream redistributors should be obligated to preserve source freedoms.",
  }),
  Object.freeze({
    key: "purity",
    low: "Pragmatic coexistence",
    high: "Libre-only consistency",
    description: "Willingness to use or recommend proprietary components for practical benefit.",
  }),
  Object.freeze({
    key: "governance",
    low: "Vendor-led",
    high: "Community-led",
    description: "Preference for accountable community institutions versus coherent corporate stewardship.",
  }),
  Object.freeze({
    key: "commerce",
    low: "Commercially skeptical",
    high: "Commercially welcoming",
    description: "Comfort with profit, paid services, dual licensing, and business participation around FOSS.",
  }),
  Object.freeze({
    key: "sovereignty",
    low: "Hosted convenience",
    high: "User sovereignty",
    description: "Preference for self-hosting, interoperability, portability, privacy, and local control.",
  }),
]);

export const AXIS_KEYS = Object.freeze(AXES.map(({ key }) => key));

export const RESPONSE_OPTIONS = Object.freeze([
  Object.freeze({ value: -2, label: "Strongly disagree" }),
  Object.freeze({ value: -1, label: "Disagree" }),
  Object.freeze({ value: 0, label: "Neutral / unsure" }),
  Object.freeze({ value: 1, label: "Agree" }),
  Object.freeze({ value: 2, label: "Strongly agree" }),
]);

function freezeQuestion(question) {
  return Object.freeze({ ...question, weights: Object.freeze({ ...question.weights }) });
}

/** @type {ReadonlyArray<Question>} */
export const QUESTIONS = Object.freeze([
  freezeQuestion({
    id: "freedom-rights",
    primaryAxis: "freedom",
    text: "A user’s ability to study, modify, and share software is an ethical right, not merely a development advantage.",
    weights: { freedom: 1 },
  }),
  freezeQuestion({
    id: "freedom-practical-license",
    primaryAxis: "freedom",
    text: "If closed software produces the best practical result, its license is usually a secondary concern.",
    weights: { freedom: -1 },
  }),
  freezeQuestion({
    id: "freedom-public-institutions",
    primaryAxis: "freedom",
    text: "Public institutions should prefer software that citizens are legally allowed to inspect and adapt.",
    weights: { freedom: 1 },
  }),
  freezeQuestion({
    id: "freedom-development-method",
    primaryAxis: "freedom",
    text: "When choosing software, the practical results of open-source development matter more to me than the rights its license gives users.",
    weights: { freedom: -1 },
  }),
  freezeQuestion({
    id: "freedom-compromised",
    primaryAxis: "freedom",
    text: "Even when software is secure, polished, and free of charge, limiting users’ ability to study, modify, and share it remains an important ethical concern.",
    weights: { freedom: 1 },
  }),
  freezeQuestion({
    id: "reciprocity-modified-source",
    primaryAxis: "reciprocity",
    text: "Anyone may use my code, but distributing a modified version should require sharing its source under the same freedoms.",
    weights: { reciprocity: 1 },
  }),
  freezeQuestion({
    id: "reciprocity-redistributed-modifications",
    primaryAxis: "reciprocity",
    text: "When publishing community-oriented software, licenses should generally require redistributed modifications to remain open source.",
    weights: { reciprocity: 1 },
  }),
  freezeQuestion({
    id: "reciprocity-disclosure-choice",
    primaryAxis: "reciprocity",
    text: "People who redistribute modified community software should be free to decide whether to publish their changes.",
    weights: { reciprocity: -1 },
  }),
  freezeQuestion({
    id: "reciprocity-friction",
    primaryAxis: "reciprocity",
    text: "License obligations usually create more friction than the downstream openness they preserve is worth.",
    weights: { reciprocity: -1 },
  }),
  freezeQuestion({
    id: "reciprocity-online-service-changes",
    primaryAxis: "reciprocity",
    text: "When a provider changes community software to run an online service, it should generally share those changes with the people who use that service.",
    clarification: "This asks what licenses should generally require; existing licenses differ.",
    weights: { reciprocity: 1 },
  }),
  freezeQuestion({
    id: "purity-convenience",
    primaryAxis: "purity",
    text: "I would accept a less convenient setup to avoid relying on proprietary software.",
    weights: { purity: 1 },
  }),
  freezeQuestion({
    id: "purity-bridge",
    primaryAxis: "purity",
    text: "Recommending a mostly open system with a few proprietary pieces is often the best way to bring people toward FOSS.",
    weights: { purity: -1 },
  }),
  freezeQuestion({
    id: "purity-distribution",
    primaryAxis: "purity",
    text: "An operating system that presents itself as freedom-respecting should not make proprietary software the easiest option to install.",
    weights: { purity: 1 },
  }),
  freezeQuestion({
    id: "purity-drivers",
    primaryAxis: "purity",
    text: "Hardware support and everyday usability justify proprietary drivers when no realistic free alternative exists.",
    clarification: "Drivers are software that lets an operating system use hardware such as graphics cards or Wi-Fi adapters.",
    weights: { purity: -1 },
  }),
  freezeQuestion({
    id: "purity-closed-platforms",
    primaryAxis: "purity",
    text: "Using proprietary platforms to reach people can be worthwhile even when it means relying on proprietary software.",
    weights: { purity: -1 },
  }),
  freezeQuestion({
    id: "governance-accountability",
    primaryAxis: "governance",
    text: "Major project decisions should be accountable to contributors and users, not ultimately controlled by one company.",
    weights: { governance: 1 },
  }),
  freezeQuestion({
    id: "governance-product-owner",
    primaryAxis: "governance",
    text: "For an open-source project, having one company make final product decisions can be preferable to shared community governance.",
    weights: { governance: -1 },
  }),
  freezeQuestion({
    id: "governance-foundations",
    primaryAxis: "governance",
    text: "Important shared infrastructure should generally be governed by an independent foundation rather than a single vendor.",
    weights: { governance: 1 },
  }),
  freezeQuestion({
    id: "governance-company-control",
    primaryAxis: "governance",
    text: "A project can be responsibly governed by a company even if contributors and users have little formal say in major decisions.",
    weights: { governance: -1 },
  }),
  freezeQuestion({
    id: "governance-fork-voice",
    primaryAxis: "governance",
    text: "The legal option to copy a project and start a new version is not a complete substitute for contributors having a meaningful voice in its current decisions.",
    weights: { governance: 1 },
  }),
  freezeQuestion({
    id: "commerce-profit-contributions",
    primaryAxis: "commerce",
    text: "Companies earning substantial profit from FOSS can strengthen the ecosystem when they contribute back.",
    weights: { commerce: 1 },
  }),
  freezeQuestion({
    id: "commerce-paid-services",
    primaryAxis: "commerce",
    text: "Charging for support around freely licensed software is a legitimate way to fund its development.",
    weights: { commerce: 1 },
  }),
  freezeQuestion({
    id: "commerce-influence-concern",
    primaryAxis: "commerce",
    text: "When a company has substantial influence over a FOSS project, that influence is usually a reason for concern even if the source remains available.",
    weights: { commerce: -1 },
  }),
  freezeQuestion({
    id: "commerce-dual-licensing",
    primaryAxis: "commerce",
    text: "It can be acceptable for a project to offer the same code under a free license for some users and a paid proprietary license for others, when contributors have agreed to that arrangement.",
    weights: { commerce: 1 },
  }),
  freezeQuestion({
    id: "commerce-volunteers",
    primaryAxis: "commerce",
    text: "A profit motive usually makes a FOSS project less aligned with its community than volunteer development does.",
    weights: { commerce: -1 },
  }),
  freezeQuestion({
    id: "sovereignty-export",
    primaryAxis: "sovereignty",
    text: "Users should be able to export their data in a documented format and move to a competing tool.",
    weights: { sovereignty: 1 },
  }),
  freezeQuestion({
    id: "sovereignty-hosted-dependence",
    primaryAxis: "sovereignty",
    text: "For many people, the convenience of a hosted service is worth relying on a provider to keep operating it.",
    weights: { sovereignty: -1 },
  }),
  freezeQuestion({
    id: "sovereignty-interoperability",
    primaryAxis: "sovereignty",
    text: "For software users, the ability to exchange data with other tools through publicly documented standards matters as much as access to the program’s source code.",
    weights: { sovereignty: 1 },
  }),
  freezeQuestion({
    id: "sovereignty-server-control",
    primaryAxis: "sovereignty",
    text: "For most people, it matters little who operates a service’s servers if the software on their own device is open source.",
    weights: { sovereignty: -1 },
  }),
  freezeQuestion({
    id: "sovereignty-self-hosting",
    primaryAxis: "sovereignty",
    text: "People and communities should be able to run important services for themselves without depending on a single provider.",
    weights: { sovereignty: 1 },
  }),
]);

export const QUESTION_COUNT = QUESTIONS.length;

/**
 * @typedef {Object} Question
 * @property {string} id
 * @property {string} primaryAxis
 * @property {string} text
 * @property {string} [clarification]
 * @property {Record<string, number>} weights
 */
