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
  "src/ui.js",
  "src/scoring.js",
  "src/state.js",
  "src/data/questions.js",
  "src/data/archetypes.js",
];
const errors = [];

for (const relativeFile of runtimeFiles) {
  const source = await readFile(resolve(root, relativeFile), "utf8");
  if (/https?:\/\//.test(source)) errors.push(`${relativeFile}: runtime files must not contain external URLs`);
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
