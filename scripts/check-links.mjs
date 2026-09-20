/** SPDX-License-Identifier: AGPL-3.0-or-later */

import { access, readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";

const root = process.cwd();
const files = ["index.html", "404.html", "site.webmanifest"];
const errors = [];

for (const relativeFile of files) {
  try {
    const content = await readFile(resolve(root, relativeFile), "utf8");
    const references = [...content.matchAll(/(?:href|src)="([^"]+)"/g)].map((match) => match[1]);
    for (const reference of references) {
      if (reference.startsWith("#") || reference.startsWith("mailto:") || reference.startsWith("https://")) continue;
      if (reference.startsWith("http://") || reference.startsWith("/")) {
        errors.push(`${relativeFile}: root-relative or insecure reference ${reference}`);
        continue;
      }
      try {
        await access(resolve(dirname(resolve(root, relativeFile)), reference));
      } catch {
        errors.push(`${relativeFile}: missing local reference ${reference}`);
      }
    }
  } catch {
    errors.push(`Missing required file: ${relativeFile}`);
  }
}

if (errors.length) {
  process.stderr.write(`${errors.join("\n")}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write("Static references use relative paths and resolve locally.\n");
}
