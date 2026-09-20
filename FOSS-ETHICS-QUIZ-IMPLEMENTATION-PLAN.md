# FOSS Ethics Quiz — Codex Implementation Plan

## 1. Project mandate

Build a polished, static, privacy-respecting quiz that helps a person describe their ethical position within the free-software/open-source ecosystem. The site must run entirely in the browser, use HTML5, CSS, and JavaScript, require no application backend, and be deployable as a dedicated public GitHub Pages repository.

The experience should feel like an “8values for software freedom,” but it must not imply that one result is morally superior or that a multidimensional philosophy can be reduced to a single purity score. The primary output is an archetype such as **GNU Purist**, **Copyleft Pragmatist**, or **Enterprise OSS**, supported by visible axis scores and a plain-language explanation.

Codex owns the complete implementation and release process: design, content integration, code, automated tests, repository creation, GitHub configuration, deployment, and post-deployment machine verification. There is no pause or handoff for manual testing. Human review can happen after the first working public release.

## 2. Non-goals

- No accounts, server, database, analytics, cookies, advertising, tracking pixels, or third-party embeds.
- No framework, static-site generator, CSS preprocessor, runtime package dependency, or client-side router.
- No political-compass imitation that forces every belief onto two axes.
- No “correct answer,” global virtue score, purity percentage, or shaming copy.
- No personalized legal advice and no claim that the result selects the right software license for a project.
- No collection or transmission of answers. Sharing must encode only the result, never the entire response history.
- No service worker or offline cache in v1; stale-cache complexity is not justified for a tiny site.
- No custom domain in v1. The design must remain compatible with adding one later.
- No manual testing checkpoint, browser GUI dependency, or GitHub web-UI step.

## 3. Product principles

1. **Describe, do not grade.** Every result gets strengths, tradeoffs, and likely points of tension.
2. **Separate beliefs that are often conflated.** Strong software-freedom commitments, copyleft preference, corporate distrust, and practical willingness to use proprietary software are related but not identical.
3. **Make the scoring inspectable.** Include a methodology screen and human-readable data files.
4. **Respect free-software values operationally.** Zero tracking, local computation, accessible source, an explicit libre license, and graceful operation without network requests.
5. **Ask concrete questions.** Prefer scenarios and policy choices over tribal identity statements.
6. **Avoid culture-war bait.** Measure views on software rights, licenses, governance, commerce, and adoption—not unrelated politics.
7. **Remain useful after the novelty result.** Axis explanations should teach users why people within FOSS disagree.

## 4. Audience and success criteria

Primary audience:

- Linux and FOSS users curious about their own philosophy.
- Contributors, maintainers, and developers choosing among licensing/governance instincts.
- People who say “open source” and “free software” interchangeably without yet knowing their own distinctions.

The first release succeeds when:

- A new visitor can start immediately and finish in roughly 4–7 minutes.
- All questions can be answered by keyboard and screen reader.
- Back/forward navigation never silently loses answers.
- Reloading mid-quiz offers to resume local progress.
- Identical answers always produce the same scores and archetype.
- Every archetype is reachable through at least one tested response pattern.
- The result explains *why* it was assigned, shows all axes, and makes retaking easy.
- The site works at both `/` and a GitHub project subpath such as `/foss-ethics-quiz/`.
- A clean checkout can be validated and served with documented commands.
- The GitHub Pages deployment completes and the public URL returns the expected document.

## 5. Information architecture and user flow

Use one `index.html` with distinct semantic views controlled by JavaScript. Do not change paths or require SPA fallback behavior.

### 5.1 Landing view

Include:

- Name: **FOSS Ethics Quiz**.
- One-sentence promise: discover how your software-freedom, licensing, governance, and adoption values fit together.
- “Start the quiz” primary action.
- Estimated length and question count.
- Explicit privacy statement: answers stay in this browser.
- Links/buttons for “How scoring works,” “About,” and repository/source.
- If valid unfinished state exists, show distinct **Resume** and **Start over** actions.

### 5.2 Quiz view

- Present one statement at a time to reduce cognitive load.
- Show `Question N of M` and a real `<progress>` element.
- Use five native radio inputs in a `<fieldset>` with `<legend>`:
  - Strongly disagree
  - Disagree
  - Neutral / unsure
  - Agree
  - Strongly agree
- Include a short optional clarification below questions that contain necessary technical terms.
- Provide Back and Next buttons. Next remains disabled until an answer is selected.
- On selection, do not auto-advance; this avoids accidental progression and is friendlier to assistive technology.
- Preserve answers when navigating backward.
- Add a “Save and exit” link that returns home; state is already saved after each selection.

### 5.3 Results view

Show, in this order:

1. Archetype name and one-sentence thesis.
2. A compact badge/mark generated with HTML/CSS or an inline project-owned SVG.
3. “Why this fits” using the 2–3 dimensions most responsible for the match.
4. Strengths (three concise bullets).
5. Tradeoffs/tensions (two or three respectful bullets).
6. All axis scores, rendered as labeled horizontal bars with numeric values and endpoint labels. Do not rely on color alone.
7. Closest neighboring archetype and a sentence explaining the distinction. Only display it when the runner-up is reasonably close (distance margin threshold defined below).
8. Share result and copy link controls.
9. Retake quiz and review answers controls.
10. Methodology/source links and a disclaimer that the quiz is descriptive, unofficial, and not affiliated with GNU, FSF, OSI, Debian, or named companies/projects.

Do not render a radar chart in v1. Horizontal bars are more legible, accessible, responsive, and honest about the independence of dimensions.

### 5.4 Methodology/about dialog or section

Use a native `<dialog>` only if it is implemented with correct focus return and a non-dialog fallback is unnecessary for the supported browser matrix. Otherwise use an in-page section. Explain:

- Axis definitions.
- Five-point scoring.
- Reverse-keyed items.
- Archetype prototype matching.
- Tie breaking.
- Result limitations.
- Project license, source link, version, and feedback/issues link.

## 6. Psychometric model

### 6.1 Six axes

Keep these separate and score each from 0 to 100. Endpoint names are descriptive, not “bad/good.”

| Key | 0 endpoint | 100 endpoint | What it measures |
| --- | --- | --- | --- |
| `freedom` | Outcome-oriented | Freedom-first | Whether user freedoms are moral requirements or one benefit among several |
| `reciprocity` | Permissive | Reciprocal | Whether downstream redistributors should be obligated to preserve source freedoms |
| `purity` | Pragmatic coexistence | Libre-only consistency | Willingness to use/recommend proprietary components for practical benefit |
| `governance` | Vendor-led | Community-led | Preference for accountable community institutions versus coherent corporate stewardship |
| `commerce` | Commercially skeptical | Commercially welcoming | Comfort with profit, paid editions, dual licensing, and business participation |
| `sovereignty` | Hosted convenience | User sovereignty | Preference for self-hosting, interoperability, portability, privacy, and local control |

Important distinction: `commerce` must measure acceptance of commerce, not acceptance of proprietary licensing. A respondent can strongly support commercial business around fully libre copyleft software.

### 6.2 Response values

Map answers to integers:

| Answer | Value |
| --- | ---: |
| Strongly disagree | -2 |
| Disagree | -1 |
| Neutral / unsure | 0 |
| Agree | 1 |
| Strongly agree | 2 |

Each question has a sparse `weights` object. Usually give the primary axis `+1` or `-1`; use a secondary weight only when the statement unavoidably tests two concepts, and cap its magnitude at `0.5`. Avoid questions that touch three or more axes.

For each axis:

```text
raw = sum(responseValue × questionWeight)
maximum = sum(2 × abs(questionWeight))
score = round(((raw + maximum) / (2 × maximum)) × 100)
```

This normalizes every dimension independently. The data validator must reject an axis with no weighted questions.

### 6.3 Question set

Ship **30 scored statements**, five primarily targeting each axis. Within every axis include at least two positively keyed and two negatively keyed statements. Randomize question order once when a new attempt begins, persist that order, and never randomize response labels.

Initial content specification (Codex may polish grammar but must not alter the measured construct without updating tests and methodology):

#### Freedom-first (`freedom`)

1. “A user’s ability to study, modify, and share software is an ethical right, not merely a development advantage.” (`freedom: +1`)
2. “If closed software produces the best practical result, its license is usually a secondary concern.” (`freedom: -1`)
3. “Public institutions should prefer software that citizens are legally allowed to inspect and adapt.” (`freedom: +1`)
4. “When choosing software, the practical results of open-source development matter more to me than the rights its license gives users.” (`freedom: -1`)
5. “Even when software is secure, polished, and free of charge, limiting users’ ability to study, modify, and share it remains an important ethical concern.” (`freedom: +1`)

#### Reciprocity (`reciprocity`)

6. “Anyone may use my code, but distributing a modified version should require sharing its source under the same freedoms.” (`reciprocity: +1`)
7. “When publishing community-oriented software, licenses should generally require redistributed modifications to remain open source.” (`reciprocity: +1`)
8. “People who redistribute modified community software should be free to decide whether to publish their changes.” (`reciprocity: -1`)
9. “License obligations usually create more friction than the downstream openness they preserve is worth.” (`reciprocity: -1`)
10. “When a provider changes community software to run an online service, it should generally share those changes with the people who use that service.” (`reciprocity: +1`; clarification notes that existing licenses differ)

#### Libre-only consistency (`purity`)

11. “I would accept a less convenient setup to avoid relying on proprietary software.” (`purity: +1`)
12. “Recommending a mostly open system with a few proprietary pieces is often the best way to bring people toward FOSS.” (`purity: -1`)
13. “An operating system that presents itself as freedom-respecting should not make proprietary software the easiest option to install.” (`purity: +1`)
14. “Hardware support and everyday usability justify proprietary drivers when no realistic free alternative exists.” (`purity: -1`)
15. “Using proprietary platforms to reach people can be worthwhile even when it means relying on proprietary software.” (`purity: -1`)

#### Community-led governance (`governance`)

16. “Major project decisions should be accountable to contributors and users, not ultimately controlled by one company.” (`governance: +1`)
17. “For an open-source project, having one company make final product decisions can be preferable to shared community governance.” (`governance: -1`)
18. “Important shared infrastructure should generally be governed by an independent foundation rather than a single vendor.” (`governance: +1`)
19. “A project can be responsibly governed by a company even if contributors and users have little formal say in major decisions.” (`governance: -1`)
20. “The legal option to copy a project and start a new version is not a complete substitute for contributors having a meaningful voice in its current decisions.” (`governance: +1`)

#### Commercial participation (`commerce`)

21. “Companies earning substantial profit from FOSS can strengthen the ecosystem when they contribute back.” (`commerce: +1`)
22. “Charging for support around freely licensed software is a legitimate way to fund its development.” (`commerce: +1`)
23. “When a company has substantial influence over a FOSS project, that influence is usually a reason for concern even if the source remains available.” (`commerce: -1`)
24. “It can be acceptable for a project to offer the same code under a free license for some users and a paid proprietary license for others, when contributors have agreed to that arrangement.” (`commerce: +1`)
25. “A profit motive usually makes a FOSS project less aligned with its community than volunteer development does.” (`commerce: -1`)

#### User sovereignty (`sovereignty`)

26. “Users should be able to export their data in a documented format and move to a competing tool.” (`sovereignty: +1`)
27. “For many people, the convenience of a hosted service is worth relying on a provider to keep operating it.” (`sovereignty: -1`)
28. “For software users, the ability to exchange data with other tools through publicly documented standards matters as much as access to the program’s source code.” (`sovereignty: +1`)
29. “For most people, it matters little who operates a service’s servers if the software on their own device is open source.” (`sovereignty: -1`)
30. “People and communities should be able to run important services for themselves without depending on a single provider.” (`sovereignty: +1`)

Content safeguards:

- Do not place two questions from the same primary axis consecutively after shuffling; use constrained shuffle.
- Avoid organization names inside scored questions.
- Avoid double negatives, absolutes used merely for emotional force, and factual knowledge requirements.
- “Neutral / unsure” must be legitimate and not penalized.
- Put all questions in `src/data/questions.js`; never duplicate them in HTML.

### 6.4 Archetype assignment

Represent each archetype as a six-dimensional prototype with scores from 0–100. Compute normalized weighted Euclidean distance:

```text
distance = sqrt(sum(axisWeight × ((userScore - prototypeScore) / 100)²) / sum(axisWeight))
```

Use equal `axisWeight = 1` in v1. Choose the smallest distance. Exact ties resolve using a stable, documented `tiePriority`, never object iteration order. Display the runner-up only if `runnerUpDistance - winnerDistance <= 0.08`.

Initial prototypes:

| Archetype | freedom | reciprocity | purity | governance | commerce | sovereignty |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| GNU Purist | 95 | 90 | 95 | 80 | 25 | 90 |
| Copyleft Pragmatist | 85 | 85 | 45 | 65 | 65 | 75 |
| Community Steward | 75 | 65 | 55 | 95 | 45 | 75 |
| User-Sovereignty Advocate | 75 | 60 | 55 | 70 | 45 | 95 |
| Permissive Hacker | 55 | 15 | 40 | 65 | 70 | 60 |
| Enterprise OSS | 45 | 30 | 20 | 20 | 95 | 45 |
| Open-Core Builder | 45 | 40 | 25 | 30 | 90 | 55 |
| FOSS Pluralist | 60 | 50 | 35 | 60 | 65 | 65 |

These numbers are editorial hypotheses, not validated psychometrics. Mark the quiz “v1 / exploratory.” Before finalizing implementation, Codex must run a prototype-reachability script across designed synthetic personas. If a prototype is unreachable or almost always dominated, adjust prototypes minimally and record the change in `docs/METHODOLOGY.md`.

Archetype copy requirements:

- Each archetype needs: title, 20–35 word thesis, 80–140 word explanation, three strengths, three tensions, and a “not necessarily” misconception correction.
- GNU Purist must not be a caricature; distinguish principled consistency from hostility to convenience.
- Enterprise OSS must not be a villain label; emphasize adoption, operational stability, support, and sustainable vendor participation.
- Open-Core Builder must candidly describe the boundary between community value and proprietary monetization.
- Permissive Hacker must distinguish downstream autonomy from indifference to freedom.
- FOSS Pluralist must be a coherent “tools and structures depend on context” position, not merely the default bucket.
- Never state or imply organizational endorsement.

Store prototypes and copy in `src/data/archetypes.js`.

### 6.5 Confidence and ambiguity

Do not call the distance a scientific “confidence score.” Derive an internal match margin for presentation logic only:

```text
margin = runnerUpDistance - winnerDistance
```

- `margin > 0.12`: ordinary result copy.
- `0.08 < margin <= 0.12`: add “Your profile also shares some traits with [runner-up].”
- `margin <= 0.08`: show the formal neighboring-archetype comparison.

If four or more axis scores fall between 40 and 60, mention that the respondent has a deliberately mixed or context-dependent profile. Do not override the calculated archetype.

## 7. Technical architecture

### 7.1 Repository layout

```text
foss-ethics-quiz/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── pages.yml
├── docs/
│   ├── CONTENT-GUIDE.md
│   └── METHODOLOGY.md
├── scripts/
│   ├── validate-data.mjs
│   └── check-links.mjs
├── src/
│   ├── data/
│   │   ├── archetypes.js
│   │   └── questions.js
│   ├── app.js
│   ├── scoring.js
│   ├── state.js
│   └── ui.js
├── tests/
│   ├── browser.spec.js
│   ├── scoring.test.js
│   └── state.test.js
├── 404.html
├── LICENSE
├── README.md
├── index.html
├── package-lock.json
├── package.json
├── robots.txt
├── site.webmanifest
└── styles.css
```

All browser imports must use relative URLs (`./src/app.js`, `./styles.css`) so GitHub project Pages works without hard-coded root paths.

### 7.2 Runtime and tooling choices

- Runtime: semantic HTML + modern CSS + native ES modules.
- No production dependencies and no build output. GitHub Pages publishes source files directly.
- Development dependencies only: Playwright for browser tests, `axe-core` or `@axe-core/playwright` for automated accessibility checks, and optionally ESLint if configuration remains small. Prefer Node’s built-in test runner for scoring/state unit tests.
- Pin development dependency versions in `package-lock.json`.
- Set a realistic Node LTS version in `package.json` `engines` and CI; Codex must query the installed/available runtime rather than guessing an obsolete version.
- Use a minimal static server script through an established dev dependency or a small Node script. Tests must run over HTTP, not `file://`.
- Add `.nojekyll` because this is a raw static site and should not be interpreted by Jekyll.
- Use system fonts. No Google Fonts, CDNs, remote scripts, or runtime asset requests.

### 7.3 Module responsibilities

- `questions.js`: immutable question records and schema metadata.
- `archetypes.js`: prototypes, tie priority, public copy, and schema version.
- `scoring.js`: pure functions only—normalize axes, calculate distances, rank matches, compute explanation drivers. No DOM or storage.
- `state.js`: versioned localStorage serialization, validation, migration/discard behavior, result-share parsing.
- `ui.js`: view rendering, focus management, event binding, progress, error announcement.
- `app.js`: small application controller and state transitions.

Avoid a monolithic `app.js`. Use JSDoc typedefs for `Question`, `AxisScores`, `Archetype`, and persisted state.

## 8. State, privacy, and sharing

Persist only in `localStorage` under a namespaced key such as `fossEthicsQuiz:v1:attempt`:

```js
{
  schemaVersion: 1,
  quizVersion: "1.1.0",
  questionOrder: [/* question IDs */],
  answers: { /* question ID: -2..2 */ },
  currentIndex: 0,
  completed: false,
  updatedAt: "ISO-8601 timestamp"
}
```

Rules:

- Validate every loaded field; discard corrupt or incompatible state safely.
- Never store raw HTML, personal information, or arbitrary URL input.
- “Start over” requires confirmation only when progress exists, then deletes the attempt.
- Completing the quiz may retain the attempt for “review answers.” Retaking explicitly replaces it.
- Provide a “Delete my saved quiz data” action in About/Privacy.

Share links should use a URL fragment because fragments are not sent in normal HTTP requests. Encode only the archetype ID, six rounded scores, quiz version, and checksum/version marker. Treat fragment data as untrusted: strict parse, allowlist keys, clamp/reject invalid numbers, and render with `textContent`. A shared result page must visibly say “Shared result” and cannot impersonate a locally completed attempt. If parsing fails, return to the landing view with a polite message.

The copy button should use `navigator.clipboard.writeText` when available and fall back to selecting a temporary text field. Share text must be concise and include the result name, not answers.

## 9. Visual and interaction design

Aim for “serious hacker zine meets clean civic questionnaire,” not corporate SaaS and not a fake terminal.

- Dark-first neutral palette with warm off-white text, charcoal surfaces, one libre-red accent, and a contrasting teal/blue secondary color.
- Respect `prefers-color-scheme`; include a three-way theme control (System / Light / Dark) only if it can be implemented accessibly without delaying core work. Otherwise ship a carefully designed adaptive system theme.
- Minimum body text 16px, content measure about 68 characters, generous line height.
- Clear focus indicators with at least 3:1 contrast against adjacent colors.
- Touch targets at least 44×44 CSS px.
- Use a centered single-column quiz card; result page may widen for axis explanations.
- Motion limited to subtle opacity/translate transitions under 200ms. Disable nonessential motion under `prefers-reduced-motion: reduce`.
- No confetti, flashing, typing simulation, parallax, or result animations that delay access to content.
- All decorative icons must be hidden from assistive technology. Prefer text labels over icon-only buttons.
- Use CSS custom properties for color, spacing, typography, radii, and shadows.

## 10. Accessibility requirements

Target WCAG 2.2 AA in implementation and automated checks.

- One `<h1>`, logical heading order, landmarks (`header`, `main`, `footer`).
- Native controls before ARIA. Radio answers must be real inputs and labels.
- A skip link appears on keyboard focus.
- Every screen transition moves focus to the new view heading; changing questions announces progress through a restrained `aria-live="polite"` region.
- Errors and invalid saved/shared state are announced and visible.
- Results do not rely on hue, bar length, or icon alone; include number and text endpoints.
- Maintain 4.5:1 text contrast and 3:1 large-text/UI contrast.
- At 200% zoom and 320 CSS px width, no horizontal scrolling or clipped controls.
- Honor reduced motion.
- The `lang` attribute is set, page title is meaningful, and metadata is present.
- Automated axe checks must report zero serious or critical violations on landing, an answered question, and results. Automated testing does not prove conformance, so README wording must say “designed toward WCAG 2.2 AA,” not “certified.”

## 11. Security and robustness

- No `innerHTML` for data-derived content. Use DOM construction and `textContent`.
- No `eval`, `new Function`, inline event handlers, or dynamically imported remote code.
- Add a restrictive Content Security Policy meta tag compatible with static Pages: default self, no objects, no frames, and only project-owned style/script/image sources. If inline SVG or styles are used, structure CSP accordingly without `unsafe-eval`; prefer external CSS and static SVG files.
- Add `referrer` meta policy `no-referrer` and use `rel="noopener noreferrer"` on external links.
- Do not place secrets in repository, workflow, source, or history.
- Treat localStorage and URL fragments as hostile input.
- A missing Clipboard or Web Share API must degrade gracefully.
- App must remain understandable if localStorage is unavailable; continue in memory and show a nonblocking message that resume is unavailable.
- Core landing/about content should remain readable if JavaScript fails. The quiz action may show a `<noscript>` explanation.

## 12. Metadata, licensing, and project documentation

- Choose and state a code/content license before publishing. Recommended default: **AGPL-3.0-or-later** for code, plus **CC BY-SA 4.0** for quiz text and explanatory content. Because one repository cannot express that cleanly with a single generic notice, add SPDX headers where practical and document the split precisely in `README.md` and `LICENSE`/`LICENSES/`. If Codex cannot confidently create correct full license texts from installed templates, use `gh`/system package license templates or fetch canonical texts from authoritative sources; never paraphrase license terms.
- Add a conspicuous “Unofficial; not affiliated with or endorsed by GNU, FSF, OSI, Debian, or any vendor” notice.
- README: purpose, screenshot placeholder (do not block release on it), live URL, local usage, test commands, architecture, privacy, licensing, contribution guidance, and content-change policy.
- `docs/METHODOLOGY.md`: axes, formulae, prototypes, reachability results, limitations, versioning.
- `docs/CONTENT-GUIDE.md`: neutral tone, question-writing constraints, reviewing bias, and how to change weights safely.
- Semantic version the quiz independently from git. Any changed question, weight, axis, or prototype increments quiz version and invalidates or migrates saved attempts deliberately.
- Add standard social metadata. Do not delay v1 for a bespoke social image; use a local simple SVG/PNG if one can be generated reproducibly.

## 13. Automated test strategy

### 13.1 Data validation

`npm run validate:data` must fail if:

- Question IDs or archetype IDs are duplicated.
- There are not exactly 30 scored questions.
- Any axis lacks exactly five primary questions.
- Key direction is unbalanced (fewer than two positive or two negative primary weights per axis).
- Weight magnitudes or unknown axes violate schema.
- An archetype omits an axis or has an out-of-range prototype.
- Required copy fields are empty or improperly sized.
- Tie priority is incomplete or duplicated.
- A question order generator can place the same primary axis consecutively.
- Any archetype is unreachable by the maintained synthetic persona fixtures.

### 13.2 Unit tests

Cover:

- All-neutral answers yield 50 on every axis.
- Theoretical minimum/maximum responses yield 0/100 per axis.
- Reverse-keyed questions affect scores in the correct direction.
- Result is independent of question presentation order.
- Prototype distance and tie priority are deterministic.
- Runner-up threshold boundaries.
- Explanation-driver selection.
- State round-trip, corrupt state, unknown question IDs, incompatible schema, unavailable storage.
- Share fragment round-trip and rejection of malformed/oversized payloads.

### 13.3 Browser tests

Use Playwright with Chromium at minimum; add Firefox and WebKit in CI if runtime remains reasonable. Test:

- First visit → start → answer all → result.
- Next disabled before selection.
- Back preserves answer and changing it affects the final result.
- Reload resumes at the correct question.
- Save/exit and resume.
- Start-over confirmation and data deletion.
- Complete quiz entirely with keyboard.
- Result bars and explanation exist; retake works.
- Share link loads the same scores/archetype in a fresh context.
- Invalid fragment recovers safely.
- localStorage-disabled run still completes.
- Mobile viewport and 200% zoom smoke checks.
- No unexpected console errors, page errors, failed local resource requests, or requests to external origins.
- Axe scans on representative views.

Do not attempt exhaustive `5^30` response enumeration. Instead combine unit proofs of normalization with deterministic property-style randomized answer vectors (fixed seed) and explicit synthetic personas.

### 13.4 Static checks

- HTML validation where practical.
- JavaScript lint/format check.
- Internal link and referenced-file check.
- Search repository for accidental `http://`, third-party runtime URLs, TODO/FIXME markers, and secrets-like patterns.
- Verify all root-relative paths are absent except intentionally external URLs.

### 13.5 Required scripts

At minimum:

```json
{
  "scripts": {
    "serve": "...",
    "validate:data": "node scripts/validate-data.mjs",
    "test:unit": "node --test tests/*.test.js",
    "test:browser": "playwright test",
    "lint": "...",
    "check": "npm run lint && npm run validate:data && npm run test:unit && npm run test:browser"
  }
}
```

Codex must fill commands with the selected pinned tooling and keep `npm run check` as the single local quality gate.

## 14. CI and GitHub Pages deployment design

Use two workflows:

### `ci.yml`

- Trigger on pull requests and pushes to `main`.
- Checkout, set up pinned Node LTS, `npm ci`, install Playwright browser dependencies, then `npm run check`.
- Grant only `contents: read`.
- Use npm caching through setup-node.

### `pages.yml`

- Trigger on successful completion of CI for `main` using `workflow_run`, plus `workflow_dispatch` for recovery. Alternatively, use one workflow with a test job and deploy job gated by `needs`; choose the simpler reliable implementation after checking current GitHub Pages recommendations.
- Use official GitHub-maintained Pages actions pinned to current supported major versions.
- Permissions: `contents: read`, `pages: write`, `id-token: write` only where required.
- Use the `github-pages` environment and deployment URL output.
- Add a concurrency group that cancels an obsolete in-progress Pages deployment.
- Upload only deployable static files. Exclude `.git`, tests, node_modules, scripts, and private development artifacts. Prefer preparing a temporary `_site` directory in CI over publishing the repository root if the official action’s exclusion behavior is insufficient.
- Deployment must never run for an untrusted pull request.

GitHub currently supports Pages from a branch or a custom Actions workflow; this plan chooses Actions because it provides a reproducible test gate and explicit deployment artifact while retaining a backend-free static site. The implementation should follow current official Pages action versions and required permissions rather than copying stale version numbers from this plan.

## 15. Codex execution phases and acceptance gates

Codex should execute continuously. A failed gate is a signal to diagnose and repair, not a reason to stop for routine user testing.

### Phase 0 — Preconditions and repository safety

1. Inspect the working directory, `AGENTS.md`, git status, installed Node/npm, git, and GitHub CLI.
2. Do not overwrite unrelated files or initialize inside a nonempty unrelated project.
3. Confirm `gh auth status` noninteractively. If GitHub authentication is absent, that is the one legitimate external blocker: finish and commit the local implementation, then report the exact authentication command required. Do not fabricate credentials or open a browser login flow silently.
4. Determine the authenticated owner and check whether the intended repository name exists.
5. Default repository name: `foss-ethics-quiz`. If occupied by an unrelated repository, do not overwrite it; choose `foss-ethics-values-quiz` or report the collision if identity matters.

Gate: safe empty/new project location, supported tools known, GitHub identity understood.

### Phase 1 — Scaffold and domain model

1. Initialize package metadata and git.
2. Create the layout in §7.1.
3. Implement axes, questions, archetypes, schemas, scoring, and deterministic constrained shuffle.
4. Implement validation and unit tests first enough to lock scoring behavior.
5. Run data validation and unit tests; repair until green.

Gate: deterministic scoring, valid balanced content, every archetype reachable.

### Phase 2 — Accessible application UI

1. Build progressively enhanced semantic HTML shell.
2. Implement landing, quiz, result, methodology/about, and error states.
3. Implement focus, keyboard, progress, live announcements, responsive design, themes, and reduced motion.
4. Add local state and share-fragment handling.
5. Ensure all visible data is rendered safely.

Gate: complete no-backend quiz flow with no external requests.

### Phase 3 — Documentation, hardening, and browser verification

1. Add CSP/referrer metadata, web manifest, robots file, `.nojekyll`, 404 page, project metadata, source links, and disclaimers.
2. Write README and methodology/content guides.
3. Implement Playwright and axe coverage.
4. Run the full `npm run check` repeatedly until green.
5. Serve locally and use scripted HTTP checks to confirm `index.html`, modules, CSS, 404 behavior, and no broken internal links.
6. Inspect Playwright screenshots generated at desktop and mobile sizes if tests fail or visual regressions are suspected. This is Codex’s own verification, not a user checkpoint.

Gate: clean install and full automated suite pass.

### Phase 4 — Git history and release preparation

1. Review `git diff`, generated files, ignored files, and repository size.
2. Ensure `node_modules`, test artifacts, screenshots, coverage, editor files, and secrets are ignored.
3. Make coherent commits, for example:
   - `feat: implement FOSS ethics scoring model`
   - `feat: build accessible quiz experience`
   - `test: add automated quality and accessibility checks`
   - `docs: document methodology and project governance`
   - `ci: add checks and GitHub Pages deployment`
4. If implementation occurred as one inseparable batch, one polished initial commit is acceptable; do not manufacture misleading history.
5. Tag `v1.0.0` only after live deployment verification succeeds.

Gate: clean working tree, meaningful history, no secrets or bulky artifacts.

## 16. Final phase — Codex performs all GitHub work through the command line

This phase is deliberately terminal-only. Do not instruct the user to click repository settings, enable Pages in a browser, inspect an Actions page, or manually test the site.

1. **Create the public repository and remote.** From the completed project directory, use GitHub CLI in noninteractive form, equivalent to:

   ```bash
   gh repo create foss-ethics-quiz \
     --public \
     --description "A private, transparent quiz for mapping free-software and open-source ethics" \
     --source . \
     --remote origin \
     --push
   ```

   Resolve the actual owner/repository dynamically. Do not run the command verbatim if the repository already exists or the chosen name changed.

2. **Configure Pages via API/CLI.** The Pages workflow should normally establish the deployment through the official actions. If the repository still needs its Pages build type set to Actions, use `gh api` against the current REST endpoint and current accepted payload. First query existing Pages configuration; create or update idempotently. Do not assume the older branch-source payload applies to Actions deployments.

3. **Apply repository metadata.** Use `gh repo edit` to set description, homepage once known, and topics such as `foss`, `free-software`, `open-source`, `quiz`, `github-pages`, and `vanilla-javascript`. Enable issues. Do not enable features the project does not use.

4. **Observe CI and deployment.** Obtain the pushed commit SHA and use `gh run list`, `gh run watch --exit-status`, and `gh run view --log-failed` as needed. Wait for both validation and Pages deployment. If a workflow fails, diagnose logs, patch locally, rerun the entire local gate, commit, push, and watch again. Continue until green unless blocked by permissions or a GitHub outage.

5. **Resolve the canonical live URL.** Query repository/Pages metadata with `gh api`, rather than constructing the URL blindly. Update the README live link and repository homepage through CLI, commit and push that metadata change, then observe the resulting checks/deployment.

6. **Machine-verify production.** Poll the canonical URL with bounded retries because Pages publication may lag. Verify:

   - HTTP success after redirects.
   - Final URL is HTTPS.
   - Response contains the expected unique title/version marker.
   - CSS and JavaScript module URLs return success with plausible content types.
   - No root-path bug under the repository subdirectory.
   - A cache-busted request sees the just-deployed release.

   Then run the Playwright smoke flow against the production base URL. This is automated production verification, not a pause for manual testing.

7. **Protect quality if supported without user intervention.** For repositories/plans that allow it, configure `main` branch protection/rules through `gh api` to require the CI check before merging and disallow force pushes/deletion. Do not make initial deployment depend on a paid-plan-only feature. Record a skipped unsupported protection as nonfatal.

8. **Create the release marker.** Once production smoke tests pass, create and push annotated tag `v1.0.0`, then use `gh release create v1.0.0 --generate-notes` with an accurate title. Do not attach `node_modules` or redundant zip artifacts; GitHub already provides source archives.

9. **Final audit.** Use CLI to confirm:

   - Default branch is `main`.
   - Repository is public.
   - Working tree is clean and local `HEAD` equals `origin/main`.
   - CI and Pages runs for the release commit succeeded.
   - Pages URL in repo metadata matches the verified live URL.
   - Release/tag points to the intended commit.
   - No open automated security warning created by accidentally committed secrets.

10. **Report completion only after verification.** Final Codex handoff must include repository URL, live site URL, release/tag, exact test summary, and any explicitly nonblocking limitation. It must not ask the user to perform routine setup or testing.

## 17. Definition of done

The project is done when all of the following are true:

- The 30-question quiz works from landing through shareable result using only static assets.
- Scores are transparent, deterministic, independently normalized, and covered by tests.
- Every archetype is reachable and respectfully described.
- Resume, restart, answer review, retake, share, invalid-state recovery, and storage-unavailable paths work.
- Keyboard use, responsive layout, reduced motion, contrast, semantics, focus, and automated accessibility checks meet the stated gates.
- There are no trackers, cookies, backend calls, remote runtime dependencies, secrets, or unexpected external requests.
- Documentation explains methodology, limitations, privacy, licensing, contribution rules, and local verification.
- `npm ci` followed by `npm run check` passes from a clean checkout.
- GitHub CI and Pages deployment pass.
- Codex has created/configured the repository and release entirely through git/`gh`/`gh api`.
- The production URL passes automated HTTP and Playwright smoke verification.
- `main` is clean, pushed, and tagged `v1.0.0`.

## 18. Deferred improvements after real-world feedback

Do not block v1 on these:

- Community review of wording and prototype calibration.
- Opt-in anonymous aggregate statistics, which would require a separate privacy and backend decision and should not be presumed.
- Localization and right-to-left layout.
- Additional archetypes or a result-comparison tool.
- A license recommendation mode; this should be a separate instrument, not silently inferred from ethics results.
- Formal psychometric validation, factor analysis, or item-response modeling after sufficient ethically collected data exists.
- Custom domain and branded social preview art.

The first public version should invite issue-based feedback on ambiguous questions, missing perspectives, and result fit. Changes to the instrument must be versioned and documented rather than silently altering what an old shared result means.
