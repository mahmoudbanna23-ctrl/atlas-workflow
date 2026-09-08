#!/usr/bin/env node
/**
 * omni.mjs — one dispatcher for every OmniRoute seat.
 *
 * Replaces the per-provider scripts the roster used to need (one for Gemini, one for Groq,
 * one for OpenRouter). The gateway on localhost:20128 holds every credential, so this script
 * carries none: it reads a single key from the environment and names a model.
 *
 * Usage:
 *   node omni.mjs --model auto/coding:free --prompt "..."            one-shot
 *   node omni.mjs --model auto/reasoning --brief brief.md --out answer.md
 *   node omni.mjs --list                                             live routable models
 *   node omni.mjs --seats                                            provider health
 *
 * Every run prints which seat actually answered. An `auto/*` alias picks a different provider
 * per request, so the reported seat is the only reliable record of who saw the prompt.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const BASE = process.env.OMNIROUTE_BASE_URL || 'http://localhost:20128';
const KEY_VAR = 'OMNIROUTE_API_KEY';

/**
 * The key lives in a Windows user environment variable. A shell that was started before the
 * variable was set will not have it, so fall back to reading the registry directly rather than
 * failing on a stale shell.
 */
function apiKey() {
  if (process.env[KEY_VAR]) return process.env[KEY_VAR];
  try {
    const out = execFileSync('reg', ['query', 'HKCU\\Environment', '/v', KEY_VAR], { encoding: 'utf8' });
    const m = out.match(/REG_(?:EXPAND_)?SZ\s+(.+)/);
    if (m) return m[1].trim();
  } catch {
    /* fall through to the error below */
  }
  console.error(`No ${KEY_VAR} found. Set it as a Windows user environment variable.`);
  process.exit(2);
}

function arg(name, fallback = null) {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? fallback : process.argv[i + 1];
}
const flag = (name) => process.argv.includes(`--${name}`);

const KEY = apiKey();
const headers = { authorization: `Bearer ${KEY}` };

async function list() {
  const r = await fetch(`${BASE}/v1/models`, { headers });
  const ids = (await r.json()).data.map((m) => m.id);
  const filter = arg('filter');
  const shown = filter ? ids.filter((i) => i.includes(filter)) : ids;
  console.log(shown.join('\n'));
  console.error(`\n${shown.length} shown of ${ids.length} routable`);
}

async function seats() {
  const r = await fetch(`${BASE}/api/provider-metrics`, { headers });
  const metrics = (await r.json()).metrics;
  const rows = Object.entries(metrics).sort((a, b) => b[1].successRate - a[1].successRate);
  for (const [name, m] of rows) {
    console.log(
      `${name.padEnd(14)} ${String(m.successRate).padStart(3)}% success  ` +
        `${String(Math.round(m.avgLatencyMs)).padStart(6)}ms avg  ` +
        `${String(m.totalRequests).padStart(4)} calls  last ${m.lastStatus ?? '-'}`,
    );
  }
}

async function ask() {
  const model = arg('model', 'auto/coding:free');
  const briefPath = arg('brief');
  const prompt = briefPath ? readFileSync(briefPath, 'utf8') : arg('prompt');
  if (!prompt) {
    console.error('Give --prompt "..." or --brief <file>.');
    process.exit(2);
  }

  const body = {
    model,
    messages: [{ role: 'user', content: prompt }],
    max_tokens: Number(arg('max-tokens', 4096)),
  };
  if (arg('temperature')) body.temperature = Number(arg('temperature'));

  const started = Date.now();
  const r = await fetch(`${BASE}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      ...headers,
      'content-type': 'application/json',
      // Without this the gateway serves an earlier answer for an identical prompt and reports
      // the requested mode back as though it had run. See references/compression-measured.md.
      'x-omniroute-no-cache': 'true',
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(Number(arg('timeout-ms', 600000))),
  });

  const text = await r.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* non-JSON error body: reported raw below */
  }

  const seat = r.headers.get('x-omniroute-model') || json?.model || '?';
  const provider = r.headers.get('x-omniroute-provider') || '?';
  const cost = r.headers.get('x-omniroute-response-cost');
  const usage = json?.usage;

  if (r.status !== 200) {
    console.error(`FAILED ${r.status} via ${provider}: ${json?.error?.message ?? text.slice(0, 300)}`);
    process.exit(1);
  }

  // Several free seats are reasoning models that emit their scratchpad inline. Strip it unless
  // asked to keep it — one free-lane run spent 1465 output tokens thinking about a one-liner.
  const raw = json?.choices?.[0]?.message?.content ?? '';
  const answer = flag('keep-thinking')
    ? raw
    : raw.replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/^\s*<think>[\s\S]*$/i, '').trim();

  const outPath = arg('out');
  if (outPath) writeFileSync(outPath, answer, 'utf8');
  else console.log(answer);

  // Provenance goes to stderr so it never contaminates a piped or written answer.
  console.error(
    `\n[seat ${provider}/${seat} · ${Date.now() - started}ms · ` +
      `${usage?.prompt_tokens ?? '?'} in / ${usage?.completion_tokens ?? '?'} out` +
      `${cost ? ` · $${Number(cost).toFixed(6)}` : ''}]`,
  );
  if (!answer.trim()) {
    console.error('[warning] the seat returned an empty answer — try a different model]');
    process.exit(1);
  }
}

if (flag('list')) await list();
else if (flag('seats')) await seats();
else await ask();
