/** SPDX-License-Identifier: AGPL-3.0-or-later */

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const runtimeFiles = [
  "index.html",
  "404.html",
  "styles.css",
  "site.webmanifest",
  "src/app.js",
  "src/config.js",
  "src/ui.js",
  "src/scoring.js",
  "src/state.js",
  "src/data/questions.js",
  "src/data/archetypes.js",
];
const errors = [];

for (const relativeFile of runtimeFiles) {
  const source = await readFile(resolve(root, relativeFile), "utf8");
  const externalUrls = [...source.matchAll(/https?:\/\/[^\s"']+/g)].map((match) => match[0]);
  const approvedUrls = new Set([
    "https://github.com/y0uq/foss-ethics-quiz",
    "https://y0uq.github.io/foss-ethics-quiz/",
  ]);
  if (externalUrls.some((url) => !approvedUrls.has(url))) {
    errors.push(`${relativeFile}: runtime files must not contain unapproved external URLs`);
  }
  if (/(?:href|src)="\//.test(source)) errors.push(`${relativeFile}: root-relative asset path found`);
  if (/-----BEGIN(?: [A-Z]+)? PRIVATE KEY-----|\b(?:ghp_|github_pat_|AKIA)[A-Za-z0-9_\-]+/.test(source)) {
    errors.push(`${relativeFile}: possible credential pattern found`);
  }
}

if (errors.length) {
  process.stderr.write(`${errors.join("\n")}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write("Runtime audit found no external URLs, root-relative assets, or credential patterns.\n");
}
