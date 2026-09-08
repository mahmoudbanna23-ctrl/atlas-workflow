#!/usr/bin/env node
// Compression measurement — MSN factory, chunk 1.
//
// Measures OmniRoute's claimed "15-95% token savings" against a real provider count, and checks
// whether the answer survives the squeeze. Sends ONE synthetic payload repeatedly, changing only
// the per-request compression mode, and compares `usage.prompt_tokens` reported by the provider.
//
// Usage (gateway must be running — Desktop\start-omniroute.bat, window stays open):
//   node "C:/Users/<you>/.claude/skills/msn/scripts/compression-test.mjs"
//   node ... --selftest                       # scorers only, no network, no gateway
//   node ... --model groq/groq/compound-mini  # override the seat
//   node ... --repeat 3                       # average over N runs per mode
//
// Why prompt_tokens: the README's own honest limit is that the saving is provider-side and never
// touches the Anthropic bill. `usage.prompt_tokens` is what the provider counted, so it is exactly
// the number the claim is about. Anything else would be measuring our own guess.
//
// What is UNVERIFIED and handled rather than assumed: the accepted values of the
// `x-omniroute-compression` header. The README documents the header and says the applied plan echoes
// back in `X-OmniRoute-Compression: <mode>; source=<source>`. This script sends a mode, reads that
// echo, and reports what ACTUALLY applied. A mode that silently does nothing shows up as
// "echo: (none)" with 0% saving rather than as a result.
//
// The payload is invented for this file: no project content, no medical content, no keys.

import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';

const BASE = 'http://localhost:20128';
const VAR = 'OMNIROUTE_API_KEY';
const TIMEOUT_MS = 90000;

const argv = process.argv.slice(2);
const argOf = (n, d) => { const i = argv.indexOf(n); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
const OUT = argOf('--out', join(process.cwd(), `compression-report-${stamp}.md`));
const MODEL = argOf('--model', 'groq/groq/compound-mini');
const REPEAT = Number(argOf('--repeat', '1'));

// Baseline first, then each mode. `off` is the control; everything is measured against it.
const MODES = ['off', 'lite', 'standard', 'aggressive', 'ultra', 'rtk', 'stacked'];

// ---------------------------------------------------------------- payload
//
// Mixed content on purpose — prose, a shell log, JSON, and code — because the stacked default is
// RTK (shell/tool output) then Caveman (prose). A prose-only payload would flatter one engine and
// starve the other. The five FACTS below are planted so fidelity can be machine-checked: the
// README claims code, URLs and JSON survive "byte-perfect", and the exponent mirrors the failure
// mode that has already cost this workspace real errors (a printed 10^6 read back as 10^9).

const PROSE = `
The migration ran overnight and the results were mixed. Throughput on the ingest path improved
noticeably once the batch size was raised, but the tail latency got worse in a way the dashboards
did not show until the following morning. The team agreed that the batching change was worth
keeping and that the retry policy was the thing that actually needed attention, because the
retries were stacking on top of each other during the slow window rather than backing off. A
second observation, made later and less confidently, was that the queue depth metric appears to
be sampled rather than counted, which would explain why it looks smooth while the latency graph
is jagged. Nobody has confirmed that yet. The plan for the next run is to leave the batch size
alone, change only the backoff, and measure the same three graphs so the comparison is honest.
`.trim();

const LOG = `
$ ./build.sh --release
[00:00:01] resolving dependencies (417 packages)
[00:00:09] compiling core                   ok    2.41s
[00:00:12] compiling adapters               ok    3.08s
[00:00:15] compiling cli                    ok    1.77s
[00:00:17] running 284 tests
[00:00:31] 283 passed, 1 failed
[00:00:31] FAILED tests/retry_spec.js:112 expected backoff 2000ms, got 250ms
[00:00:31] build finished with status ERR_BACKOFF_FLOOR
`.trim();

const JSON_BLOB = JSON.stringify(
  {
    service: 'ingest',
    version: '4.19.2',
    endpoint: 'https://status.example-internal.test/v2/health',
    limits: { batch: 512, concurrency: 8, retries: 5 },
    counters: { accepted: 1048576, rejected: 37, retried: 4096 },
  },
  null,
  2
);

const CODE = `function backoff(attempt, base) {
  // capped exponential, jitter added by the caller
  const ms = Math.min(base * Math.pow(2, attempt), 60000);
  return ms;
}`;

const FACTS = {
  version: '4.19.2',
  error_code: 'ERR_BACKOFF_FLOOR',
  endpoint: 'https://status.example-internal.test/v2/health',
  accepted: '1048576',
  cap_ms: '60000',
};

const PAYLOAD =
  `Read the material below, then answer.\n\n--- NOTES ---\n${PROSE}\n\n--- BUILD LOG ---\n${LOG}\n\n` +
  `--- CONFIG ---\n${JSON_BLOB}\n\n--- CODE ---\n${CODE}\n\n--- END ---\n\n` +
  `Answer with ONE JSON object and nothing else, no fence, no commentary, with exactly these keys:\n` +
  `  "version"      - the service version string, exactly as printed\n` +
  `  "error_code"   - the build's failing status token, exactly as printed\n` +
  `  "endpoint"     - the endpoint URL, exactly as printed\n` +
  `  "accepted"     - the accepted counter, digits only\n` +
  `  "cap_ms"       - the millisecond cap in the code, digits only\n` +
  `  "summary"      - one sentence, under 25 words, on what the notes concluded`;

// ---------------------------------------------------------------- scoring

function scoreFidelity(text) {
  const notes = [];
  let obj = null;
  const m = text.match(/\{[\s\S]*\}/);
  if (m) { try { obj = JSON.parse(m[0]); } catch {} }
  if (!obj) return { kept: 0, total: Object.keys(FACTS).length, notes: ['no parseable JSON object'], summary: '' };

  let kept = 0;
  for (const [k, want] of Object.entries(FACTS)) {
    const got = obj[k] === undefined || obj[k] === null ? '' : String(obj[k]).trim();
    if (got === want) kept++;
    else notes.push(`${k}: got ${JSON.stringify(got).slice(0, 40)} want ${JSON.stringify(want)}`);
  }
  return { kept, total: Object.keys(FACTS).length, notes, summary: String(obj.summary || '').trim() };
}

// ---------------------------------------------------------------- self-test

if (argv.includes('--selftest')) {
  const perfect = JSON.stringify({ ...FACTS, summary: 'Keep the batching change and fix the retry backoff.' });
  const cases = [
    ['perfect', perfect, 5],
    ['fenced + prose around it', 'Sure!\n```json\n' + perfect + '\n```\nHope that helps.', 5],
    ['numeric not string', JSON.stringify({ ...FACTS, accepted: 1048576, cap_ms: 60000 }), 5],
    ['exponent flattened', JSON.stringify({ ...FACTS, accepted: '1048576000' }), 4],
    ['url truncated', JSON.stringify({ ...FACTS, endpoint: 'https://status.example-internal.test' }), 4],
    ['error token normalised', JSON.stringify({ ...FACTS, error_code: 'err_backoff_floor' }), 4],
    ['not json at all', 'The version is 4.19.2 and the error was ERR_BACKOFF_FLOOR.', 0],
  ];
  let bad = 0;
  for (const [name, text, want] of cases) {
    const s = scoreFidelity(text);
    const ok = s.kept === want;
    if (!ok) bad++;
    console.log(`${ok ? 'ok  ' : 'FAIL'} ${name.padEnd(26)} kept=${s.kept}/${s.total} want=${want}`);
  }
  console.log(bad ? `\n${bad} scorer case(s) wrong` : '\nall scorer cases correct');
  process.exit(bad ? 1 : 0);
}

// ---------------------------------------------------------------- wire

function readKey() {
  if (process.env[VAR]) return process.env[VAR];
  const out = execFileSync('reg', ['query', 'HKCU\\Environment', '/v', VAR], { encoding: 'utf8' });
  const m = out.match(/REG_(?:EXPAND_)?SZ\s+(.+)/);
  if (!m) throw new Error(`${VAR} not found in env or HKCU\\Environment`);
  return m[1].trim();
}

async function run(key, mode) {
  const t0 = Date.now();
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), TIMEOUT_MS);
  try {
    const r = await fetch(BASE + '/v1/chat/completions', {
      method: 'POST',
      signal: ac.signal,
      headers: {
        Authorization: 'Bearer ' + key,
        'Content-Type': 'application/json',
        'x-omniroute-compression': mode,
        // Without this the gateway serves its own cached response for the second and later modes:
        // identical payload, temperature 0. The first measured run showed every mode returning the
        // baseline's prompt_tokens in 13-25ms, which measures the cache, not the compressor.
        // The value must be the literal string "true" — src/lib/semanticCache.ts compares it
        // lowercased against "true", so "1" is read as cacheable and the run measures the cache.
        'x-omniroute-no-cache': 'true',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: PAYLOAD }],
        max_tokens: 900,
        temperature: 0,
      }),
    });
    const raw = await r.text();
    let j = null; try { j = JSON.parse(raw); } catch {}
    const msg = j?.choices?.[0]?.message ?? {};
    return {
      ms: Date.now() - t0,
      status: r.status,
      echo: r.headers.get('x-omniroute-compression') || '',
      cacheHit: r.headers.get('x-omniroute-cache-hit') || r.headers.get('x-omniroute-cache') || '',
      promptTokens: j?.usage?.prompt_tokens ?? null,
      text: (msg.content || '') || (msg.reasoning || ''),
      err: r.ok ? null : (j?.error?.message || raw.slice(0, 160)),
    };
  } catch (e) {
    return { ms: Date.now() - t0, status: 0, echo: '', promptTokens: null, text: '', err: e.name === 'AbortError' ? `timeout ${TIMEOUT_MS}ms` : e.message };
  } finally { clearTimeout(timer); }
}

// ---------------------------------------------------------------- main

const key = readKey();
const rows = [];
mkdirSync(dirname(OUT), { recursive: true });
console.log(`seat: ${MODEL}   repeat: ${REPEAT}\n`);

for (const mode of MODES) {
  for (let i = 0; i < REPEAT; i++) {
    const a = await run(key, mode);
    const f = a.text ? scoreFidelity(a.text) : { kept: 0, total: 5, notes: [a.err || 'no output'], summary: '' };
    rows.push({ mode, i, ...a, ...f });
    console.log(
      `${mode.padEnd(11)} ${String(a.status).padEnd(4)} ${String(a.promptTokens ?? '-').padStart(7)} prompt-tok  ` +
      `${String(a.ms).padStart(6)}ms  kept ${f.kept}/${f.total}  echo:${a.echo || '(none)'}  cache:${a.cacheHit || '-'}  ${a.err || f.notes[0] || ''}`
    );
  }
}

const base = rows.filter((r) => r.mode === 'off' && r.promptTokens).map((r) => r.promptTokens);
const baseline = base.length ? base.reduce((a, b) => a + b, 0) / base.length : null;

const lines = [
  `# Compression measurement — ${new Date().toISOString().slice(0, 19).replace('T', ' ')}`,
  '',
  `Seat: \`${MODEL}\` · runs per mode: ${REPEAT} · baseline (\`off\`) prompt tokens: **${baseline ?? 'FAILED'}**`,
  '',
  'Saving is measured against the provider\'s own `usage.prompt_tokens`, because the published claim',
  'is provider-side. `echo` is what the gateway said it actually applied — a mode with no echo and 0%',
  'saving did nothing, whatever the docs say. `kept` counts five planted facts that must survive',
  'byte-perfect: version string, error token, URL, a large integer, and a numeric cap.',
  '',
  '| Mode | echo | prompt tokens | saving vs off | kept | ms | note |',
  '|---|---|---|---|---|---|---|',
];
for (const r of rows) {
  const save = baseline && r.promptTokens ? `${(100 * (1 - r.promptTokens / baseline)).toFixed(1)}%` : '—';
  lines.push(
    `| ${r.mode}${REPEAT > 1 ? ` #${r.i + 1}` : ''} | ${r.echo || '(none)'} | ${r.promptTokens ?? '—'} | ${save} | ${r.kept}/${r.total} | ${r.ms} | ${(r.err || r.notes.join('; ') || '—').slice(0, 90)} |`
  );
}
lines.push(
  '',
  '## Verdict to write into roster.md',
  '',
  '- A mode is **usable** only if it saved tokens AND kept 5/5. Saving with a fact dropped is not a',
  '  saving; it is a defect that costs a main-chat step to catch.',
  '- The README claims code, URLs and JSON are preserved byte-perfect. The `kept` column tests that',
  '  claim directly. A failure here is the finding, and it outranks any percentage.',
  '',
  '## Summaries returned (read one, check it is not mush)',
  '',
);
for (const r of rows) lines.push(`- **${r.mode}**: ${r.summary || '(none)'}`);
writeFileSync(OUT, lines.join('\n'), 'utf8');
console.log(`\nreport: ${OUT}`);
