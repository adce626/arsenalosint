/**
 * Production smoke test.
 *
 * Boots the built standalone server on a throwaway port and requests every
 * public route, asserting each returns 200. Fails loudly if the build output
 * is missing. Cross-platform (Windows process-tree kill included).
 *
 *   npm run build && npm run smoke
 */

import { spawn, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import process from 'node:process';

const PORT = process.env.SMOKE_PORT ?? '5199';
const BASE = `http://127.0.0.1:${PORT}`;
const SERVER_ENTRY = '.next/standalone/server.js';

const ROUTES = [
  '/',
  '/tools',
  '/guides',
  '/playbooks',
  '/playbooks/geolocate-a-photo',
  '/playbooks/trace-a-username',
  '/glossary',
  '/reference',
  '/mapping',
  '/robots.txt',
  '/sitemap.xml',
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForServer(attempts = 40) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(`${BASE}/`, {
        signal: AbortSignal.timeout(3000),
      });
      if (response.ok) return true;
    } catch {
      // not up yet
    }
    await sleep(500);
  }
  return false;
}

function stopServer(child) {
  if (!child || child.killed) return;
  if (process.platform === 'win32') {
    spawnSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], {
      stdio: 'ignore',
    });
  } else {
    child.kill('SIGTERM');
  }
}

async function main() {
  if (!existsSync(SERVER_ENTRY)) {
    console.error(
      `Missing ${SERVER_ENTRY}. Run "npm run build" before "npm run smoke".`,
    );
    process.exit(1);
  }

  const child = spawn(process.execPath, [SERVER_ENTRY], {
    env: { ...process.env, PORT, HOSTNAME: '127.0.0.1' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  child.stdout.on('data', () => {});
  child.stderr.on('data', (chunk) => {
    const text = String(chunk);
    if (!text.includes('ExperimentalWarning')) process.stderr.write(text);
  });

  let failures = 0;
  try {
    const ready = await waitForServer();
    if (!ready) {
      console.error(`Server did not become ready on ${BASE}.`);
      process.exitCode = 1;
      return;
    }

    for (const route of ROUTES) {
      try {
        const response = await fetch(`${BASE}${route}`, {
          signal: AbortSignal.timeout(10000),
        });
        const ok = response.status === 200;
        if (!ok) failures += 1;
        console.log(`${ok ? 'ok  ' : 'FAIL'}  ${response.status}  ${route}`);
      } catch (error) {
        failures += 1;
        console.log(`FAIL  ---  ${route}  (${error.message})`);
      }
    }
  } finally {
    stopServer(child);
  }

  if (failures > 0) {
    console.error(`\n${failures} route(s) failed.`);
    process.exitCode = 1;
  } else {
    console.log(`\nAll ${ROUTES.length} routes returned 200.`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
