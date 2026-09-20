<!-- SPDX-FileCopyrightText: 2026 FOSS Ethics Quiz contributors -->
<!-- SPDX-License-Identifier: CC-BY-SA-4.0 -->

# Content guide

## Tone and scope

Write with curiosity and precision. The quiz describes positions within FOSS; it does not grade them, assign purity, or imply that a result is more ethical than another. Treat commercial work, reciprocal licensing, permissive licensing, hosted services, community governance, and libre-only consistency as legitimate subjects of disagreement.

Avoid culture-war bait, unrelated political identity, organization-name recognition, and factual trivia. Keep organization and company names out of scored statements. Do not portray Enterprise OSS as villainy, GNU Purist as hostility to convenience, or FOSS Pluralist as indecision.

## Question design

Each scored statement should:

- Measure one primary construct with a concrete policy choice or scenario.
- Use plain language and include a short clarification when a technical term is essential.
- Avoid double negatives, emotional absolutes, and factual knowledge requirements.
- Have a primary weight of +1 or −1; a secondary weight is exceptional, must be justified, and cannot exceed 0.5.
- Be reviewed for plausible readings by people with different roles, resources, and access constraints.

Every axis must retain exactly five primary items and at least two positive and two negative primary directions. Preserve a constrained shuffle so adjacent questions never share a primary axis.

## Safe scoring changes

Before changing a statement, weight, axis, or prototype:

1. State the construct being measured and why the proposed wording measures it.
2. Identify its direction and any secondary construct it could accidentally touch.
3. Update `src/data/questions.js` or `src/data/archetypes.js`, unit tests, synthetic fixtures, and methodology text together.
4. Increment `QUIZ_VERSION` and decide whether previous local attempts are deliberately invalidated or migrated.
5. Run `npm run check` and inspect every archetype’s explanation for respectful, non-caricatured language.

Do not silently rebalance a result by changing weights or prototypes without documenting the reason and version effect. If community feedback shows that a construct is missing, prefer a clearly documented future version over squeezing it ambiguously into an existing axis.
