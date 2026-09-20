/**
 * SPDX-FileCopyrightText: 2026 FOSS Ethics Quiz contributors
 * SPDX-License-Identifier: CC-BY-SA-4.0
 */

import { AXIS_KEYS } from "./questions.js";

export const TIE_PRIORITY = Object.freeze([
  "gnu-purist",
  "copyleft-pragmatist",
  "community-steward",
  "user-sovereignty-advocate",
  "permissive-hacker",
  "enterprise-oss",
  "open-core-builder",
  "foss-pluralist",
]);

function freezeArchetype(archetype) {
  return Object.freeze({
    ...archetype,
    prototype: Object.freeze({ ...archetype.prototype }),
    strengths: Object.freeze([...archetype.strengths]),
    tensions: Object.freeze([...archetype.tensions]),
  });
}

/** @type {ReadonlyArray<Archetype>} */
export const ARCHETYPES = Object.freeze([
  freezeArchetype({
    id: "gnu-purist",
    name: "GNU Purist",
    badge: "GP",
    prototype: { freedom: 95, reciprocity: 90, purity: 95, governance: 80, commerce: 25, sovereignty: 90 },
    thesis: "You treat software freedom as a durable ethical commitment and favor structures that keep users, communities, and their tools meaningfully independent.",
    explanation: "Your profile puts user rights, reciprocal sharing, libre-only consistency, and personal or community control near the center of the picture. You are likely to judge a tool not only by what it accomplishes today, but also by whether its users can understand, change, redistribute, and keep using it without another party’s permission. You may see convenience compromises as consequential because they can normalize dependency or weaken the freedom that makes collaboration possible. That is a coherent priority, rather than a dislike of people or useful technology.",
    strengths: [
      "Keeps long-term user rights visible when convenience can dominate the conversation.",
      "Connects licensing, governance, and infrastructure choices to durable community autonomy.",
      "Offers a clear standard for resisting lock-in and preserving repairability.",
    ],
    tensions: [
      "Strict consistency can make adoption harder where hardware, access, or work requirements are constrained.",
      "Others may value a transitional compromise more highly than you do.",
      "Skepticism of commercial incentives can need careful distinction from skepticism of paid libre work.",
    ],
    notNecessarily: "Not necessarily hostile to convenience or professional software work; the emphasis is on refusing convenience that depends on denying essential freedoms.",
  }),
  freezeArchetype({
    id: "copyleft-pragmatist",
    name: "Copyleft Pragmatist",
    badge: "CP",
    prototype: { freedom: 85, reciprocity: 85, purity: 45, governance: 65, commerce: 65, sovereignty: 75 },
    thesis: "You want software freedoms to persist downstream, while allowing practical bridges, professional participation, and gradual movement toward more open systems.",
    explanation: "You strongly favor user rights and reciprocal licensing, especially when others redistribute or build on shared work. At the same time, you are less likely to demand perfect libre-only consistency in every current circumstance. You may see copyleft as a practical social contract: it protects a commons without requiring people to reject useful transition paths, paid services, or commercial participation. Governance and sovereignty matter because they make those freedoms durable in practice. This lens welcomes engagement while keeping the commons protected for later participants.",
    strengths: [
      "Pairs a durable sharing obligation with a realistic view of adoption and maintenance.",
      "Can explain copyleft as mutual responsibility rather than a punishment for business.",
      "Leaves room for paid support and incremental migration toward freer tools.",
    ],
    tensions: [
      "Pragmatic exceptions can be difficult to define consistently over time.",
      "Permissive-license advocates may see downstream obligations as too restrictive.",
      "Libre-only advocates may think some bridges become permanent dependencies.",
    ],
    notNecessarily: "Not necessarily opposed to permissive software; the key preference is preserving freedoms when shared code becomes part of someone else’s product.",
  }),
  freezeArchetype({
    id: "community-steward",
    name: "Community Steward",
    badge: "CS",
    prototype: { freedom: 75, reciprocity: 65, purity: 55, governance: 95, commerce: 45, sovereignty: 75 },
    thesis: "You focus on who gets a durable voice in shared software, treating accountable institutions and forkable communities as essential public infrastructure.",
    explanation: "Your strongest signal is that important projects should answer to their contributors and users rather than depend on a single vendor’s continued goodwill. You likely care about licensing and interoperability partly because they make community governance credible, but governance itself is not reducible to a legal right to fork. Foundations, transparent decision-making, and broad stewardship help you judge whether a project can remain healthy through leadership or market changes. You look for a durable voice before conflict makes a fork necessary.",
    strengths: [
      "Makes power, accountability, and succession planning visible in technical decisions.",
      "Values institutions that can protect shared infrastructure beyond one sponsor’s interests.",
      "Recognizes that a legal fork right is weaker than meaningful participation before a split.",
    ],
    tensions: [
      "Inclusive governance can take more time and process than a single product owner.",
      "Formal structures do not automatically guarantee broad or equitable participation.",
      "A strong governance preference may need to coexist with urgent maintenance realities.",
    ],
    notNecessarily: "Not necessarily anti-company; the concern is concentrated, unaccountable control over infrastructure many people rely on.",
  }),
  freezeArchetype({
    id: "user-sovereignty-advocate",
    name: "User-Sovereignty Advocate",
    badge: "US",
    prototype: { freedom: 75, reciprocity: 60, purity: 55, governance: 70, commerce: 45, sovereignty: 95 },
    thesis: "You prioritize the practical ability to leave, self-host, interoperate, and keep control of data and infrastructure over time in everyday computing.",
    explanation: "Your profile treats source access as important but incomplete without portable data, open standards, realistic self-hosting, and freedom from a provider’s continued permission. You are likely to look for control at the system boundary: can a person export their work, run the service, understand the protocol, or choose another compatible tool? Licensing and governance support that goal, while convenience is welcome when it does not trap users or communities. Control remains meaningful only when an exit path is practical for ordinary people.",
    strengths: [
      "Connects software licensing to data portability, protocols, and operational independence.",
      "Identifies lock-in that can persist even when a client application is open source.",
      "Encourages resilient tools that users and communities can actually keep running.",
    ],
    tensions: [
      "Self-hosting and portability can impose skills, time, or costs unevenly across users.",
      "Interoperability sometimes constrains a product team’s ability to move quickly.",
      "Convenient managed services may still be the responsible choice for some communities.",
    ],
    notNecessarily: "Not necessarily opposed to hosted services; the central question is whether users retain a realistic exit and control path.",
  }),
  freezeArchetype({
    id: "permissive-hacker",
    name: "Permissive Hacker",
    badge: "PH",
    prototype: { freedom: 55, reciprocity: 15, purity: 40, governance: 65, commerce: 70, sovereignty: 60 },
    thesis: "You favor broad reuse and low barriers to experimentation, trusting people and organizations to choose their own downstream paths without restrictive licensing terms.",
    explanation: "You likely see open code as most useful when it can move easily between projects, teams, and products without many conditions attached. That does not make user freedom irrelevant; it means you are more inclined to protect the freedom to reuse, combine, and commercialize code than to require every downstream recipient to share changes. You may value healthy communities and open standards while accepting diverse development and funding models. The desired commons is expansive because participation begins with uncomplicated permission to build.",
    strengths: [
      "Lowers friction for experimentation, reuse, and adoption across many technical settings.",
      "Makes room for independent downstream choices instead of prescribing one redistribution model.",
      "Can help shared tools spread into places that would reject stronger license conditions.",
    ],
    tensions: [
      "Permissive reuse can let private products benefit from a commons without returning changes.",
      "Low license friction does not by itself prevent provider or data lock-in.",
      "Community expectations may need non-license mechanisms to secure sustained contributions.",
    ],
    notNecessarily: "Not necessarily indifferent to freedom; the emphasis is on downstream autonomy and voluntary collaboration rather than reciprocal obligations.",
  }),
  freezeArchetype({
    id: "enterprise-oss",
    name: "Enterprise OSS",
    badge: "EO",
    prototype: { freedom: 45, reciprocity: 30, purity: 20, governance: 20, commerce: 95, sovereignty: 45 },
    thesis: "You see open source as a practical foundation for reliable products, broad adoption, vendor support, and sustainable professional operations at scale.",
    explanation: "Your profile gives substantial weight to operational stability, clear ownership, paid support, and the ability for companies to build durable services around open code. You may value openness for transparency, ecosystem reach, recruiting, and interoperability without treating every proprietary component or vendor-led decision as an ethical failure. For you, the important test is often whether a model delivers useful, maintainable software to the people and organizations relying on it. Support commitments and predictable operations are ethical considerations in their own right.",
    strengths: [
      "Takes maintenance, support obligations, and long-term operational funding seriously.",
      "Makes space for professional teams to invest deeply in open-source ecosystems.",
      "Prioritizes adoption paths that can work inside existing organizations and constraints.",
    ],
    tensions: [
      "Vendor priorities can diverge from those of users and independent contributors.",
      "Open components do not automatically offset lock-in in services, data, or contracts.",
      "Commercial goals may need explicit safeguards for community trust and continuity.",
    ],
    notNecessarily: "Not necessarily a rejection of software freedom; the emphasis is on dependable adoption and sustainable vendor participation alongside openness.",
  }),
  freezeArchetype({
    id: "open-core-builder",
    name: "Open-Core Builder",
    badge: "OC",
    prototype: { freedom: 45, reciprocity: 40, purity: 25, governance: 30, commerce: 90, sovereignty: 55 },
    thesis: "You favor a shared open foundation paired with a clearly defined commercial boundary that can fund focused product development for users and customers.",
    explanation: "You are comfortable with a model that makes a useful core available while reserving selected features, services, or operational layers for a business. You may see this boundary as a practical way to invite adoption and contributions while paying for sustained product work. The ethical question for you is less whether every layer is equally open and more whether the community receives real value, the boundary is candid, and customers understand the tradeoff. Trust depends on explaining that boundary before a community becomes dependent on it.",
    strengths: [
      "Offers a legible path for funding a product while sharing a useful technical foundation.",
      "Can combine broad evaluation and ecosystem participation with focused investment.",
      "Invites explicit discussion of which capabilities belong in the commons and why.",
    ],
    tensions: [
      "The proprietary boundary can shift over time and create distrust if it is not stable or candid.",
      "Community contributors may question who benefits from their work and on what terms.",
      "Open-core availability does not necessarily give users control over the complete product.",
    ],
    notNecessarily: "Not necessarily deceptive or anti-community; the defining issue is whether the open and proprietary boundary is useful, stable, and honestly governed.",
  }),
  freezeArchetype({
    id: "foss-pluralist",
    name: "FOSS Pluralist",
    badge: "FP",
    prototype: { freedom: 60, reciprocity: 50, purity: 35, governance: 60, commerce: 65, sovereignty: 65 },
    thesis: "You see FOSS as a family of complementary practices, choosing licenses, governance, and adoption strategies according to context rather than one universal rule.",
    explanation: "Your profile balances several values without treating any single instrument as the answer in every setting. You may support user rights, community stewardship, interoperability, and commercial sustainability while expecting the right emphasis to vary among public infrastructure, a hobby library, a hosted service, or a business product. That is a positive position: it asks what combination of rights, institutions, and incentives will serve the people affected by a specific project. It requires explaining the context, not simply avoiding a difficult choice.",
    strengths: [
      "Connects different FOSS traditions instead of reducing every decision to one axis.",
      "Can adapt licensing and governance choices to a project’s users, risks, and resources.",
      "Keeps practical adoption and long-term autonomy in the same conversation.",
    ],
    tensions: [
      "Context-sensitive choices can look inconsistent without clear public reasoning.",
      "Compromise can obscure power imbalances when no minimum principles are named.",
      "Projects may need firmer commitments than pluralism alone provides during conflict.",
    ],
    notNecessarily: "Not necessarily undecided; this position treats a reasoned fit between tools, structures, and circumstances as an ethical commitment of its own.",
  }),
]);

export const ARCHETYPE_BY_ID = Object.freeze(
  Object.fromEntries(ARCHETYPES.map((archetype) => [archetype.id, archetype])),
);

export const ARCHETYPE_AXIS_KEYS = AXIS_KEYS;

/**
 * @typedef {Object} Archetype
 * @property {string} id
 * @property {string} name
 * @property {string} badge
 * @property {Record<string, number>} prototype
 * @property {string} thesis
 * @property {string} explanation
 * @property {ReadonlyArray<string>} strengths
 * @property {ReadonlyArray<string>} tensions
 * @property {string} notNecessarily
 */
