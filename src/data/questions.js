/**
 * SPDX-FileCopyrightText: 2026 FOSS Ethics Quiz contributors
 * SPDX-License-Identifier: CC-BY-SA-4.0
 */

export const QUIZ_VERSION = "1.0.0";

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
    text: "Open source is mainly a more effective way to build software, rather than a question of user rights.",
    weights: { freedom: -1 },
  }),
  freezeQuestion({
    id: "freedom-compromised",
    primaryAxis: "freedom",
    text: "Software that denies essential user freedoms remains ethically compromised even when it is secure, polished, and free of charge.",
    weights: { freedom: 1 },
  }),
  freezeQuestion({
    id: "reciprocity-modified-source",
    primaryAxis: "reciprocity",
    text: "Anyone may use my code, but distributing a modified version should require sharing its source under the same freedoms.",
    weights: { reciprocity: 1 },
  }),
  freezeQuestion({
    id: "reciprocity-closed-product",
    primaryAxis: "reciprocity",
    text: "A company should be allowed to turn permissively licensed community code into a closed product.",
    weights: { reciprocity: -1 },
  }),
  freezeQuestion({
    id: "reciprocity-fair-exchange",
    primaryAxis: "reciprocity",
    text: "Copyleft is a fair exchange: receiving lasting freedoms creates an obligation to pass them on.",
    weights: { reciprocity: 1 },
  }),
  freezeQuestion({
    id: "reciprocity-friction",
    primaryAxis: "reciprocity",
    text: "License obligations usually create more friction than the downstream openness they preserve is worth.",
    weights: { reciprocity: -1 },
  }),
  freezeQuestion({
    id: "reciprocity-network-service",
    primaryAxis: "reciprocity",
    text: "Offering modified software only as an online service should not be an easy way around source-sharing obligations.",
    clarification: "Some licenses extend source-sharing obligations to people who use modified software over a network.",
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
    text: "A distribution calling itself freedom-respecting should not make nonfree software effortless to install.",
    weights: { purity: 1 },
  }),
  freezeQuestion({
    id: "purity-drivers",
    primaryAxis: "purity",
    text: "Hardware support and everyday usability justify proprietary drivers when no realistic free alternative exists.",
    weights: { purity: -1 },
  }),
  freezeQuestion({
    id: "purity-closed-platforms",
    primaryAxis: "purity",
    text: "Using closed platforms to reach people can be worthwhile even when those platforms conflict with free-software ideals.",
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
    text: "A clear corporate product owner often keeps an open-source project more focused and sustainable.",
    weights: { governance: -1 },
  }),
  freezeQuestion({
    id: "governance-foundations",
    primaryAxis: "governance",
    text: "Independent foundations are generally better long-term stewards of important shared infrastructure than individual vendors.",
    weights: { governance: 1 },
  }),
  freezeQuestion({
    id: "governance-track-record",
    primaryAxis: "governance",
    text: "A benevolent company with a strong track record does not need elaborate community governance.",
    weights: { governance: -1 },
  }),
  freezeQuestion({
    id: "governance-fork-voice",
    primaryAxis: "governance",
    text: "The ability to fork is not a complete substitute for having a meaningful voice in a project’s governance.",
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
    text: "Paid support, hosting, and enterprise features are legitimate ways to fund freely licensed software.",
    weights: { commerce: 1 },
  }),
  freezeQuestion({
    id: "commerce-corruption",
    primaryAxis: "commerce",
    text: "Commercial influence usually corrupts a FOSS project even when the source remains available.",
    weights: { commerce: -1 },
  }),
  freezeQuestion({
    id: "commerce-dual-licensing",
    primaryAxis: "commerce",
    text: "Dual licensing can be an acceptable sustainability strategy when contributors understand and consent to the arrangement.",
    weights: { commerce: 1 },
  }),
  freezeQuestion({
    id: "commerce-volunteers",
    primaryAxis: "commerce",
    text: "Software built for profit is inherently less aligned with FOSS values than volunteer-built software.",
    weights: { commerce: -1 },
  }),
  freezeQuestion({
    id: "sovereignty-export",
    primaryAxis: "sovereignty",
    text: "Users should be able to export their data in a documented format and move to a competing tool.",
    weights: { sovereignty: 1 },
  }),
  freezeQuestion({
    id: "sovereignty-hosted-goodwill",
    primaryAxis: "sovereignty",
    text: "A seamless hosted service is often worth depending on a provider’s continued goodwill.",
    weights: { sovereignty: -1 },
  }),
  freezeQuestion({
    id: "sovereignty-interoperability",
    primaryAxis: "sovereignty",
    text: "Open standards and interoperability matter as much as access to a program’s source code.",
    weights: { sovereignty: 1 },
  }),
  freezeQuestion({
    id: "sovereignty-server-control",
    primaryAxis: "sovereignty",
    text: "For most people, who controls the server matters little if the client software is open source.",
    weights: { sovereignty: -1 },
  }),
  freezeQuestion({
    id: "sovereignty-self-hosting",
    primaryAxis: "sovereignty",
    text: "Important personal or community infrastructure should remain realistically self-hostable.",
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
