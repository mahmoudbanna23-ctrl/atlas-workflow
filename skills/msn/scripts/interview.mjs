#!/usr/bin/env node
// Department interview harness — MSN factory.
//
// Sends the SAME synthetic test to every allowlisted OmniRoute seat, scores what can be scored by
// machine, and writes a markdown report. Carries no project content: every test below is invented
// for this file, so nothing copyrighted, medical or personal reaches any seat.
//
// Usage (gateway must be running — Desktop\start-omniroute.bat, window stays open):
//   node "C:/Users/<you>/.claude/skills/msn/scripts/interview.mjs"
//   node ... --dept A            # one department only
//   node ... --dept A,B --out "C:/path/report.md"
//
// The report is written incrementally: killing the run mid-way still leaves everything scored so
// far on disk. A partial job reported honestly is a success.
//
// Design notes:
// - Candidates are a PREFIX ALLOWLIST of explicit ids. Never `auto/*`, never dva/cxa/aug/zc,
//   never an auto-router (`*/openrouter/free`), never OpenRouter (answers nothing at $0 credit).
// - max_tokens is never below 200: Gemini's live ids are reasoning models that spend the budget
//   before emitting, and a low cap returns HTTP 200 with empty content.
// - `reasoning` is read as well as `content`: a reasoning model that spends its budget thinking
//   looks silent if you only read `content`.
// - The gateway key is read here and never printed, logged or written to the report.

import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdirSync, mkdtempSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';

const BASE = 'http://localhost:20128';
const VAR = 'OMNIROUTE_API_KEY';
const TIMEOUT_MS = 60000;
const MAX_TOKENS = 900;

// ---------------------------------------------------------------- args

const argv = process.argv.slice(2);
const argOf = (name, fallback) => {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback;
};
const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
const OUT = argOf('--out', join(process.cwd(), `interview-report-${stamp}.md`));
const DEPTS = argOf('--dept', 'A,B,C,D').split(',').map((s) => s.trim().toUpperCase());

// ---------------------------------------------------------------- key

function readKey() {
  if (process.env[VAR]) return process.env[VAR];
  const out = execFileSync('reg', ['query', 'HKCU\\Environment', '/v', VAR], { encoding: 'utf8' });
  const m = out.match(/REG_(?:EXPAND_)?SZ\s+(.+)/);
  if (!m) throw new Error(`${VAR} not found in env or HKCU\\Environment`);
  return m[1].trim();
}

// ---------------------------------------------------------------- candidates

const CANDIDATES = [
  { label: 'Groq compound-mini', id: 'groq/groq/compound-mini' },
  { label: 'Cline Gemma 4-31b', id: 'cl/google/gemma-4-31b-it:free' },
  { label: 'Cline Kimi K3', id: 'cl/moonshotai/kimi-k3' },
  { label: 'Cline Grok 4.5', id: 'cl/x-ai/grok-4.5' },
  { label: 'Cline GLM 5.2', id: 'cl/z-ai/glm-5.2' },
  { label: 'Cline MiniMax M3', id: 'cl/minimax/minimax-m3' },
  { label: 'Cline StepFun 3.7', id: 'cl/stepfun/step-3.7-flash' },
  { label: 'Cline DeepSeek V4', id: 'cl/deepseek/deepseek-v4-flash' },
  { label: 'Zen big-pickle', id: 'opencode-zen/big-pickle' },
  { label: 'Gemini flash-latest', id: 'gemini/gemini-flash-latest' },
];

// ---------------------------------------------------------------- the tests
//
// Every test is synthetic. The DECOY in test A is the point of it: a seat that "helpfully" invents
// a plausible flag is the failure that costs a main-chat step to catch, so it scores as a fail.

const PATHS = [
  'tools/bank-harness/pagecov-ep2.js',
  'progress/WORKFLOW-who-does-what.md',
  'content/peds/qb-pages/index.json',
];

const SEEDED_ROWS = [
  { id: 'zz-ch3-001', page: 41, opts: 4, key: 2 },
  { id: 'zz-ch3-002', page: 41, opts: 4, key: 0 },
  { id: 'zz-ch3-003', page: 42, opts: 5, key: 4 },
  { id: 'zz-ch3-004', page: 43, opts: 4, key: 4 }, // ANOMALY: key 4 with 4 options (valid 0-3)
  { id: 'zz-ch3-005', page: 44, opts: 4, key: 1 },
  { id: 'zz-ch3-006', page: 40, opts: 4, key: 3 }, // ANOMALY: page goes backwards (44 -> 40)
  { id: 'zz-ch3-007', page: 45, opts: 4, key: 2 },
  { id: 'zz-ch3-008', page: 46, opts: 3, key: 1 },
];
const SEEDED_ANSWER = ['zz-ch3-004', 'zz-ch3-006'];

const TESTS = {
  A: {
    name: 'Process drafting — path fidelity',
    prompt:
      'Write a short handoff note, 80-120 words, telling another worker to run a coverage check.\n' +
      'It must name these three paths EXACTLY as written, each once:\n' +
      PATHS.map((p) => `  ${p}`).join('\n') +
      '\nThe check is run with: node tools/bank-harness/pagecov-ep2.js\n' +
      'That command takes NO flags. Do not invent options, flags or extra files.\n' +
      'Output the note only. No preamble.',
    score(text) {
      const notes = [];
      for (const p of PATHS) if (!text.includes(p)) notes.push(`missing path ${p}`);
      // Any flag-looking token after the script name is an invention.
      const invented = text.match(/pagecov-ep2\.js\s+(--?[a-z][\w-]*)/i);
      if (invented) notes.push(`invented flag ${invented[1]}`);
      const words = text.trim().split(/\s+/).length;
      if (words < 56 || words > 156) notes.push(`length ${words} words, outside 80-120 +/-30%`);
      return { pass: notes.length === 0, notes };
    },
  },

  B: {
    name: 'Tooling — small Node script, must fail loudly',
    prompt:
      'Write one Node.js ESM script, no dependencies, no comments needed.\n' +
      'It reads a JSON file path from process.argv[2]. The file holds an array of objects, each\n' +
      '{ id, page, opts, key }. For every object it checks that key is an integer in the range\n' +
      '0 to opts-1 inclusive. It prints one line per bad row: the id and why.\n' +
      'If any row is bad it must exit with code 1. If all rows are good it prints nothing and\n' +
      'exits 0.\n' +
      'Output ONLY the code, inside a single ```javascript fence. No explanation.',
    async score(text) {
      const notes = [];
      const m = text.match(/```(?:javascript|js|mjs)?\s*\n([\s\S]*?)```/);
      if (!m) return { pass: false, notes: ['no fenced code block'] };
      const code = m[1];
      if (!/process\.exit\(\s*1\s*\)|process\.exitCode\s*=\s*1/.test(code))
        notes.push('never sets a non-zero exit');
      // Real syntax check: write it out and let node parse it.
      try {
        const dir = mkdtempSync(join(tmpdir(), 'msn-interview-'));
        const f = join(dir, 'cand.mjs');
        writeFileSync(f, code, 'utf8');
        execFileSync(process.execPath, ['--check', f], { stdio: 'pipe' });
      } catch (e) {
        notes.push('node --check failed (syntax error)');
      }
      if (/require\s*\(/.test(code)) notes.push('used require() in an ESM script');
      return { pass: notes.length === 0, notes };
    },
  },

  C: {
    name: 'Structural audit — seeded, zero false positives required',
    prompt:
      'Below is a list of rows. Each row is: id, page, opts, key.\n' +
      'Two rules: (1) key must be an integer from 0 to opts-1 inclusive. (2) page must never be\n' +
      'lower than the page of the row above it.\n' +
      'List ONLY the ids that break a rule, one per line, nothing else. If a row is fine, say\n' +
      'nothing about it.\n\n' +
      SEEDED_ROWS.map((r) => `${r.id}, page ${r.page}, opts ${r.opts}, key ${r.key}`).join('\n'),
    score(text) {
      const found = SEEDED_ROWS.map((r) => r.id).filter((id) => text.includes(id));
      const missed = SEEDED_ANSWER.filter((id) => !found.includes(id));
      const falsePos = found.filter((id) => !SEEDED_ANSWER.includes(id));
      const notes = [];
      if (missed.length) notes.push(`missed ${missed.join(' ')}`);
      if (falsePos.length) notes.push(`FALSE POSITIVE ${falsePos.join(' ')}`);
      return { pass: notes.length === 0, notes };
    },
  },

  D: {
    name: 'Debate — must produce a position and its strongest objection',
    prompt:
      'A solo operator runs a transcription pipeline. Verification of every batch is done by one\n' +
      'person and cannot be delegated. Someone proposes adding four more drafting workers to\n' +
      'triple the output.\n' +
      'Give your position in under 120 words, then, under a line reading OBJECTION:, give the\n' +
      'strongest argument against your own position. Do not hedge in the position itself.',
    score(text) {
      const notes = [];
      if (!/OBJECTION\s*:/i.test(text)) notes.push('no OBJECTION section');
      if (text.trim().split(/\s+/).length < 40) notes.push('too short to hold a position');
      // Substance is a human read — this only checks the shape.
      return { pass: notes.length === 0, notes, manual: true };
    },
  },
};

// ---------------------------------------------------------------- wire

async function ask(key, id, prompt) {
  const t0 = Date.now();
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), TIMEOUT_MS);
  try {
    const r = await fetch(BASE + '/v1/chat/completions', {
      method: 'POST',
      signal: ac.signal,
      headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: id,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: MAX_TOKENS,
      }),
    });
    const raw = await r.text();
    let j = null;
    try { j = JSON.parse(raw); } catch {}
    const msg = j?.choices?.[0]?.message ?? {};
    // A reasoning model can put the whole answer in `reasoning` and leave `content` empty.
    const text = (msg.content || '') || (msg.reasoning || '');
    return {
      ms: Date.now() - t0,
      status: r.status,
      text,
      err: r.ok ? null : (j?.error?.message || raw.slice(0, 160)),
    };
  } catch (e) {
    return { ms: Date.now() - t0, status: 0, text: '', err: e.name === 'AbortError' ? `timeout ${TIMEOUT_MS}ms` : e.message };
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------------- self-test
//
// `--selftest` exercises the scorers against canned answers and exits. It touches no network and
// needs no gateway, so the harness can be proven correct before a break is spent running it.

if (argv.includes('--selftest')) {
  const cases = [
    ['A good', 'A', `Run the coverage check with node ${PATHS[0]} and read ${PATHS[1]} first. The page map lives in ${PATHS[2]} and it is the file the check reads. Do not add flags to the command; it takes none. When the run exits zero the batch is clean and you may move to the next section. When it exits non zero stop and report the failing page rather than adjudicating it yourself here today.`, true],
    ['A invented flag', 'A', `Run node ${PATHS[0]} --verbose then open ${PATHS[1]} and ${PATHS[2]}. ` + 'x '.repeat(70), false],
    ['A missing path', 'A', `Run node ${PATHS[0]} and read ${PATHS[1]}. ` + 'x '.repeat(70), false],
    ['B good', 'B', '```javascript\nimport {readFileSync} from "node:fs";\nconst rows=JSON.parse(readFileSync(process.argv[2],"utf8"));\nlet bad=0;\nfor(const r of rows){if(!Number.isInteger(r.key)||r.key<0||r.key>r.opts-1){console.log(r.id,"key out of range");bad++;}}\nif(bad)process.exit(1);\n```', true],
    ['B no exit', 'B', '```javascript\nconsole.log("hi");\n```', false],
    ['B syntax error', 'B', '```javascript\nif(  { process.exit(1)\n```', false],
    ['B require', 'B', '```javascript\nconst fs=require("fs");\nprocess.exit(1);\n```', false],
    ['C good', 'C', 'zz-ch3-004\nzz-ch3-006', true],
    ['C false positive', 'C', 'zz-ch3-004\nzz-ch3-006\nzz-ch3-003', false],
    ['C missed', 'C', 'zz-ch3-004', false],
    ['D good', 'D', 'Adding workers is the wrong move because the bottleneck is the single verifier, not the drafting stage, and more drafts simply lengthen the queue waiting on that one person every single day.\nOBJECTION: if drafts are cheap enough, a deeper queue costs nothing and lets the verifier pick the best.', true],
    ['D no objection', 'D', 'Adding workers is the wrong move because the bottleneck is the single verifier and not the drafting stage at all, so more drafts only lengthen the waiting queue.', false],
  ];
  let bad = 0;
  for (const [name, dept, text, want] of cases) {
    const got = await TESTS[dept].score(text);
    const ok = got.pass === want;
    if (!ok) bad++;
    console.log(`${ok ? 'ok  ' : 'FAIL'} ${name.padEnd(18)} pass=${got.pass} want=${want}  ${got.notes.join('; ')}`);
  }
  console.log(bad ? `\n${bad} scorer case(s) wrong` : '\nall scorer cases correct');
  process.exit(bad ? 1 : 0);
}

// ---------------------------------------------------------------- run

const key = readKey();
const results = [];
mkdirSync(dirname(OUT), { recursive: true });

function writeReport() {
  const lines = [
    `# Department interview — ${new Date().toISOString().slice(0, 19).replace('T', ' ')}`,
    '',
    'Synthetic tests only; no project content was sent. Scores are machine checks except where',
    'marked MANUAL, which needs a human read of the transcript below.',
    '',
  ];
  for (const d of DEPTS) {
    const t = TESTS[d];
    if (!t) continue;
    lines.push(`## Department ${d} — ${t.name}`, '', '| Seat | Id | Result | ms | Notes |', '|---|---|---|---|---|');
    const rows = results.filter((r) => r.dept === d).sort((a, b) => (b.pass - a.pass) || (a.ms - b.ms));
    for (const r of rows) {
      const verdict = r.err ? `ERR ${r.status || ''}` : r.pass ? (r.manual ? 'PASS (shape) — MANUAL' : 'PASS') : 'fail';
      lines.push(`| ${r.label} | \`${r.id}\` | ${verdict} | ${r.ms} | ${(r.err || r.notes.join('; ') || '—').slice(0, 120)} |`);
    }
    lines.push('', `**Depth chart ${d}:** ` + (rows.filter((r) => r.pass).map((r) => r.id).join(' → ') || '(nothing passed)'), '');
  }
  lines.push('---', '', '## Transcripts', '');
  for (const r of results) {
    lines.push(`### ${r.dept} · ${r.label}`, '', '```', (r.text || `(no output) ${r.err || ''}`).slice(0, 2000), '```', '');
  }
  writeFileSync(OUT, lines.join('\n'), 'utf8');
}

for (const d of DEPTS) {
  const t = TESTS[d];
  if (!t) { console.log(`skip unknown department ${d}`); continue; }
  console.log(`\n== Department ${d} — ${t.name}`);
  for (const c of CANDIDATES) {
    const a = await ask(key, c.id, t.prompt);
    let pass = false, notes = [], manual = false;
    if (!a.err && a.text) {
      const s = await t.score(a.text);
      pass = s.pass; notes = s.notes; manual = !!s.manual;
    } else if (!a.err) {
      notes = ['empty response'];
    }
    results.push({ dept: d, ...c, ...a, pass, notes, manual });
    console.log(
      `${(a.err ? 'ERR ' : pass ? 'PASS' : 'fail').padEnd(5)} ${String(a.ms).padStart(6)}ms  ${c.id.padEnd(34)} ${a.err || notes.join('; ')}`
    );
    writeReport(); // incremental: a killed run still leaves scored results on disk
  }
}

console.log(`\nreport: ${OUT}`);
