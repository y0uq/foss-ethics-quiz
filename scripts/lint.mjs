/** SPDX-License-Identifier: AGPL-3.0-or-later */

import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const ignored = new Set([".git", "node_modules", "test-results", "playwright-report"]);
const violations = [];

async function collect(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (ignored.has(entry.name)) continue;
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collect(path));
    if (entry.isFile() && entry.name.endsWith(".js") || entry.isFile() && entry.name.endsWith(".mjs")) files.push(path);
  }
  return files;
}

for (const file of await collect(root)) {
  try {
    execFileSync(process.execPath, ["--check", file], { stdio: "pipe" });
  } catch (error) {
    violations.push(`${file}: ${error.stderr.toString().trim()}`);
  }
  const source = await readFile(file, "utf8");
  const prohibited = [
    [/\binnerHTML\s*=/, "data rendering must not use innerHTML"],
    [/\beval\s*\(/, "eval is prohibited"],
    [/new\s+Function\s*\(/, "Function constructor is prohibited"],
    [/\bT(?:ODO)\b|\bFIX(?:ME)\b/, "release files must not contain unresolved markers"],
  ];
  for (const [pattern, message] of prohibited) {
    if (pattern.test(source)) violations.push(`${file}: ${message}`);
  }
}

if (violations.length) {
  process.stderr.write(`${violations.join("\n")}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write("JavaScript syntax and safety checks passed.\n");
}
