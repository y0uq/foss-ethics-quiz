<!-- SPDX-FileCopyrightText: 2026 FOSS Ethics Quiz contributors -->
<!-- SPDX-License-Identifier: CC-BY-SA-4.0 -->

# FOSS Ethics Quiz

A static, privacy-respecting questionnaire for exploring ethical positions in the free-software and open-source ecosystem. It is inspired by the clarity of an “8values”-style result, but it describes a multidimensional profile rather than assigning a moral score.

**Live site:** published with the first GitHub Pages release.

Screenshot: intentionally deferred until the first public release; the interface is fully covered by browser tests.

## What it does

- Asks 30 concrete, balanced statements across six independent axes.
- Calculates results entirely in the browser—no accounts, cookies, analytics, backend, or network data collection.
- Produces an archetype with visible axis scores, explanation drivers, strengths, tensions, and nearby-profile context when appropriate.
- Saves unfinished work only in browser local storage, with explicit resume, restart, review, and deletion controls.
- Generates fragment-only share links that contain an archetype and six rounded scores, never individual responses.

The quiz is exploratory, unofficial, and descriptive. It does not select a license or determine whether a person or project is ethically correct. It is not affiliated with or endorsed by GNU, FSF, OSI, Debian, or any vendor.

## Run it locally

Requires Node 22–26; the project is currently verified with Node 26.

```bash
npm ci
PLAYWRIGHT_BROWSERS_PATH=0 npx playwright install chromium
npm run serve
```

Open `http://127.0.0.1:4173`. The local server also emulates the GitHub project path at `http://127.0.0.1:4173/foss-ethics-quiz/`.

Run the complete quality gate with:

```bash
npm run check
```

That gate performs JavaScript safety/syntax checks, data validation, Node unit tests, static reference checks, and Chromium/axe browser tests. The interface is designed toward WCAG 2.2 AA; automated tests are useful evidence, not a certification.

## Project structure

```text
src/data/       Quiz questions, archetype prototypes, and synthetic personas
src/scoring.js  Pure normalization, matching, explanation, and shuffle logic
src/state.js    Strict localStorage and share-fragment validation
src/ui.js       Safe DOM rendering, focus management, and accessible controls
src/app.js      Application state transitions
tests/          Node unit and Playwright/axe browser coverage
docs/           Methodology and content-review guidance
scripts/        Static server, validation, link, and syntax checks
```

All browser imports and asset references are relative, so the source deploys correctly at both a domain root and a GitHub Pages project subpath. The project intentionally has no build step, service worker, framework, or runtime dependency.

## Privacy

Answers stay on the device. If local storage works, only the versioned question order, answers, current position, completion state, and timestamp are stored under one namespaced key. Corrupt or incompatible saved state is discarded. A shared URL uses the fragment, which normal HTTP requests do not send to a server.

The site makes no remote runtime requests. It uses system fonts and contains no third-party scripts, embeds, analytics, pixels, or cookies.

## Methodology and content changes

See [the methodology](./docs/METHODOLOGY.md) for axes, formulae, prototypes, tie behavior, synthetic reachability fixtures, and limitations. See [the content guide](./docs/CONTENT-GUIDE.md) before changing a question or archetype.

Any change to a scored question, weight, axis, or prototype must increment the independent quiz version and deliberately invalidate or migrate old saved attempts and share links. Content proposals should explain the measured construct, keyed direction, potential bias, and test updates.

## License

Code is [AGPL-3.0-or-later](./LICENSES/AGPL-3.0-or-later.txt). Questionnaire content and documentation are [CC BY-SA 4.0](./LICENSES/CC-BY-SA-4.0.txt). The exact split and SPDX handling are in [LICENSE](./LICENSE).

## Contributing

Keep the project static and privacy-preserving. Do not add tracking, remote runtime resources, or opaque scoring. Run `npm run check` before proposing a change, and preserve the accessible native-control approach unless an equivalent or better alternative is demonstrated.
