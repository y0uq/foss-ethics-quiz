<!-- SPDX-FileCopyrightText: 2026 FOSS Ethics Quiz contributors -->
<!-- SPDX-License-Identifier: CC-BY-SA-4.0 -->

# Methodology

FOSS Ethics Quiz v1.1.0 is an exploratory, editorial instrument. It is designed to make distinct traditions inside free and open-source software easier to discuss; it is not psychometrically validated, diagnostic, or a license-selection tool.

## Version history

### 1.1.0 — question-set audit

This content release replaces an invalid reciprocity item that asked whether a permissive license should allow conduct it deliberately authorizes. The new statement asks directly whether redistribution should carry a source-sharing condition, and is positively keyed for reciprocity. To retain the required reverse-keying balance, a separate reciprocity item now asks whether redistributors should be free to choose disclosure and is negatively keyed.

The release also removes undefined specialist terms, loaded labels, false either/or framings, and bundled claims from other statements. It explains online-service sharing, driver, server-control, and data-exchange scenarios in ordinary language. The six axes, question count, scoring formula, prototypes, and archetype reachability targets are unchanged. Because wording and six question IDs changed, v1.1.0 deliberately rejects saved attempts and share fragments created by v1.0.0.

## Axes

| Key | 0 endpoint | 100 endpoint | Measures |
| --- | --- | --- | --- |
| `freedom` | Outcome-oriented | Freedom-first | Whether user freedoms are moral requirements or one benefit among several. |
| `reciprocity` | Permissive | Reciprocal | Whether downstream redistributors should preserve source freedoms. |
| `purity` | Pragmatic coexistence | Libre-only consistency | Willingness to use or recommend proprietary components for practical benefit. |
| `governance` | Vendor-led | Community-led | Preference for accountable community institutions versus coherent corporate stewardship. |
| `commerce` | Commercially skeptical | Commercially welcoming | Comfort with profit, paid services, dual licensing, and business participation around FOSS. |
| `sovereignty` | Hosted convenience | User sovereignty | Preference for self-hosting, interoperability, portability, privacy, and local control. |

`commerce` deliberately measures acceptance of commerce, not acceptance of proprietary licensing. A respondent can support paid work around fully libre copyleft software.

## Questionnaire and scoring

There are 30 statements: five primarily target each axis. Every primary axis has at least two positively keyed and two negatively keyed items. Responses map to −2, −1, 0, +1, and +2 from strongly disagree through strongly agree. Neutral is a meaningful answer, not a penalty.

Each question has sparse weights. In v1 every item has one primary weight of +1 or −1; the data schema permits one secondary weight no larger than 0.5 when future content genuinely requires it. Question order is shuffled once per attempt with a constrained deterministic algorithm, persisted with the attempt, and never places two items from one primary axis together.

For each axis:

```text
raw     = Σ(response value × question weight)
maximum = Σ(2 × |question weight|)
score   = round(((raw + maximum) / (2 × maximum)) × 100)
```

Every dimension is independently normalized, so changing the number or magnitude of another axis’s items does not affect it. The validator rejects an axis without weighted questions.

## Archetype matching

An answer profile is compared with these editorial prototype profiles. Equal weights are used for all six axes in v1.

| Archetype | Freedom | Reciprocity | Purity | Governance | Commerce | Sovereignty |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| GNU Purist | 95 | 90 | 95 | 80 | 25 | 90 |
| Copyleft Pragmatist | 85 | 85 | 45 | 65 | 65 | 75 |
| Community Steward | 75 | 65 | 55 | 95 | 45 | 75 |
| User-Sovereignty Advocate | 75 | 60 | 55 | 70 | 45 | 95 |
| Permissive Hacker | 55 | 15 | 40 | 65 | 70 | 60 |
| Enterprise OSS | 45 | 30 | 20 | 20 | 95 | 45 |
| Open-Core Builder | 45 | 40 | 25 | 30 | 90 | 55 |
| FOSS Pluralist | 60 | 50 | 35 | 60 | 65 | 65 |

The normalized weighted Euclidean distance is:

```text
distance = sqrt(Σ(axis weight × ((user score - prototype score) / 100)²) / Σ(axis weight))
```

The smallest distance is the result. Exact ties use this stable priority rather than object iteration order: GNU Purist, Copyleft Pragmatist, Community Steward, User-Sovereignty Advocate, Permissive Hacker, Enterprise OSS, Open-Core Builder, then FOSS Pluralist.

The runner-up margin is an internal presentation aid, not a scientific confidence value:

- Above 0.12: show the ordinary result.
- Above 0.08 through 0.12: mention that the profile shares traits with the runner-up.
- At or below 0.08: show a formal neighboring-archetype comparison.

When at least four scores are between 40 and 60, the result also notes a deliberately mixed or context-dependent profile. It does not override the calculated match.

## Explanation drivers

The result’s “Why this fits” dimensions are selected by comparing each axis’s squared distance contribution for the winner and runner-up. Axes that help the winner more sort first, with closeness to the winner as a deterministic fallback. This makes the explanation inspectable without implying causal certainty.

## Reachability check

The data validator maintains one named synthetic response profile per archetype. It converts each profile’s stated targets into valid v1 ±1 primary-item response patterns, calculates scores, and requires the designated archetype to win. In v1, all eight prototype targets are attainable in five-point score increments and each fixture reaches its intended archetype:

| Synthetic persona | Intended result | Validation result |
| --- | --- | --- |
| GNU Purist | GNU Purist | reachable |
| Copyleft Pragmatist | Copyleft Pragmatist | reachable |
| Community Steward | Community Steward | reachable |
| User-Sovereignty Advocate | User-Sovereignty Advocate | reachable |
| Permissive Hacker | Permissive Hacker | reachable |
| Enterprise OSS | Enterprise OSS | reachable |
| Open-Core Builder | Open-Core Builder | reachable |
| FOSS Pluralist | FOSS Pluralist | reachable |

This check establishes implementation reachability, not that the prototypes are empirically distinct or representative.

## Limits and versioning

The questions and prototype values are editorial hypotheses. They can contain cultural, linguistic, or project-context bias; two people may read a practical constraint differently; and real views can change by context. The archetype is a conversation starter, not a label to impose on a person.

Quiz semantic versioning is independent of git history. Any change to questions, weights, axes, scoring, or prototypes must increase the quiz version and explicitly decide whether saved attempts and share links can migrate. Version 1.1.0 rejects incompatible local storage and fragments rather than silently changing an old result’s meaning.
