/** SPDX-License-Identifier: AGPL-3.0-or-later */

import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, normalize, resolve } from "node:path";

const root = resolve(process.cwd());
const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || "127.0.0.1";
const projectPrefix = "/foss-ethics-quiz/";
const types = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
};

createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, `http://${request.headers.host}`).pathname);
    const localPath = pathname === projectPrefix.slice(0, -1)
      ? "/"
      : pathname.startsWith(projectPrefix)
        ? pathname.slice(projectPrefix.length - 1)
        : pathname;
    const candidate = resolve(root, `.${normalize(localPath)}`);
    if (!candidate.startsWith(`${root}/`) && candidate !== root) throw new Error("outside root");
    let file = candidate;
    if ((await stat(file)).isDirectory()) file = resolve(file, "index.html");
    response.writeHead(200, {
      "Content-Type": types[extname(file)] || "application/octet-stream",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    });
    createReadStream(file).pipe(response);
  } catch {
    const fallback = resolve(root, "404.html");
    try {
      response.writeHead(404, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
      createReadStream(fallback).pipe(response);
    } catch {
      response.writeHead(404).end("Not found");
    }
  }
}).listen(port, host, () => {
  process.stdout.write(`Serving ${root} at http://${host}:${port}\n`);
});
