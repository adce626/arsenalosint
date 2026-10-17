/**
 * Dead-link checker for the vendored tool catalog.
 *
 * Loads src/content/tools/*.json, extracts every tool URL, and probes them with
 * a bounded concurrency. Opt-in and network-dependent — it is not part of the
 * default `npm test` run.
 *
 *   npm run check:links              # report only
 *   npm run check:links -- --strict  # non-zero exit on dead links
 *   npm run check:links -- --limit 25 --json
 *
 * Classification:
 *   ok         2xx/3xx
 *   blocked    401/403/405/429 — the site refuses bots, not necessarily dead
 *   dead       404/410
 *   error      5xx, DNS failure, timeout, TLS error
 */

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';

const TOOLS_DIR = 'src/content/tools';
const CONCURRENCY = 8;
const TIMEOUT_MS = 9000;

const args = process.argv.slice(2);
const strict = args.includes('--strict');
const asJson = args.includes('--json');
const limitArg = args.indexOf('--limit');
const limit =
  limitArg !== -1 && args[limitArg + 1] ? Number(args[limitArg + 1]) : null;

function loadTools() {
  const files = readdirSync(TOOLS_DIR).filter((file) => file.endsWith('.json'));
  const tools = [];
  for (const file of files) {
    const parsed = JSON.parse(readFileSync(join(TOOLS_DIR, file), 'utf8'));
    if (Array.isArray(parsed)) tools.push(...parsed);
  }
  return tools;
}

function classify(status) {
  if (status >= 200 && status < 400) return 'ok';
  if ([401, 403, 405, 429].includes(status)) return 'blocked';
  if ([404, 410].includes(status)) return 'dead';
  return 'error';
}

async function probe(url) {
  const attempt = async (method) => {
    const response = await fetch(url, {
      method,
      redirect: 'follow',
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { 'user-agent': 'ARSENAL-OSINT-LinkCheck/1.0' },
    });
    return response.status;
  };

  try {
    let status = await attempt('HEAD');
    // Many servers reject HEAD but answer GET.
    if (status === 403 || status === 405 || status === 501) {
      status = await attempt('GET');
    }
    return { status, category: classify(status) };
  } catch (error) {
    return { status: null, category: 'error', message: error.message };
  }
}

async function run() {
  const tools = loadTools();
  const targets = [];
  const seen = new Set();
  for (const tool of tools) {
    const url = tool?.url;
    if (typeof url !== 'string' || !/^https?:\/\//i.test(url)) continue;
    if (seen.has(url)) continue;
    seen.add(url);
    targets.push({ name: tool.name ?? '(unnamed)', url });
  }

  const queue = limit ? targets.slice(0, limit) : targets;
  const results = [];
  let cursor = 0;

  async function worker() {
    while (cursor < queue.length) {
      const index = cursor;
      cursor += 1;
      const target = queue[index];
      const outcome = await probe(target.url);
      results.push({ ...target, ...outcome });
      if (!asJson) {
        const label = outcome.category.toUpperCase().padEnd(7);
        process.stdout.write(
          `${label} ${outcome.status ?? '---'}  ${target.name}\n`,
        );
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, queue.length) }, worker),
  );

  const counts = results.reduce((acc, result) => {
    acc[result.category] = (acc[result.category] ?? 0) + 1;
    return acc;
  }, {});

  if (asJson) {
    console.log(JSON.stringify({ counts, results }, null, 2));
  } else {
    console.log(
      `\nChecked ${results.length} of ${targets.length} URLs — ` +
        `ok ${counts.ok ?? 0}, blocked ${counts.blocked ?? 0}, ` +
        `dead ${counts.dead ?? 0}, error ${counts.error ?? 0}`,
    );
    const problems = results.filter(
      (r) => r.category === 'dead' || r.category === 'error',
    );
    for (const problem of problems) {
      console.log(`  ${problem.category}: ${problem.name} — ${problem.url}`);
    }
  }

  const dead = (counts.dead ?? 0) + (counts.error ?? 0);
  process.exitCode = strict && dead > 0 ? 1 : 0;
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
