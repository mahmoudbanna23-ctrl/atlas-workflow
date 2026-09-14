// token-audit.js — where did the tokens actually go?
//
// Reads the REAL `usage` fields Claude Code writes into its session transcripts. This is
// measurement, not estimation: every figure comes from what the API actually billed.
//
//   node tools/token-audit.js                       # last 24 h, all projects
//   node tools/token-audit.js --since "2026-09-02 20:00"
//   node tools/token-audit.js --project <project-slug>
//   node tools/token-audit.js --agents               # per-subagent growth table
//
// Transcripts live in ~/.claude/projects/<slug>/*.jsonl, with subagents in
// <session-uuid>/subagents/agent-*.jsonl (sometimes nested further, e.g.
// subagents/workflows/wf_*/agent-*.jsonl — walk() recurses, so depth doesn't matter). A
// subagent's transcript is separate from its parent's; BIGGEST TRANSCRIPTS marks each SUB
// row with parent=<session id> so it can be traced back.
//
// --since windows on the timestamp INSIDE each transcript line, not file mtime. mtime is
// still used as a cheap pre-filter to skip files that were never touched since the window
// (an untouched file cannot contain lines newer than its own mtime), but a file that passes
// that check has every usage line checked against its own `timestamp` field — a session
// resumed or retitled after the window closed no longer inflates the totals. Lines with no
// timestamp are kept rather than dropped, since some older transcripts omit it.
//
// ⚠️ Prices below are list prices and WILL drift — check them before quoting a dollar figure.
// Token counts do not drift; they are read from the transcript. Edit the PRICES table to match
// whatever models you actually run; unlisted models fall back to DEFAULT_PRICE.

const fs = require('fs');
const path = require('path');
const os = require('os');

const ROOT = path.join(os.homedir(), '.claude', 'projects');

// $ per million tokens: [input, cache write, cache read, output]
const PRICES = {
  'claude-opus-5':   [5.00, 6.25, 0.50, 25.00],
  'claude-sonnet-5': [2.00, 2.50, 0.20, 10.00],
  'claude-haiku-4-5-20251001': [1.00, 1.25, 0.10, 5.00],
};
const DEFAULT_PRICE = PRICES['claude-opus-5'];

function arg(name, fallback) {
  const i = process.argv.indexOf(name);
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}
const wantAgents = process.argv.includes('--agents');
const wantHelp = process.argv.includes('--help') || process.argv.includes('-h');
const sinceStr = arg('--since', null);
const since = sinceStr ? Date.parse(sinceStr) : Date.now() - 24 * 3600 * 1000;
const onlyProject = arg('--project', null);

if (wantHelp) {
  console.log([
    'token-audit.js — measured token/cost report from Claude Code transcripts',
    '',
    'Usage:',
    '  node tools/token-audit.js',
    '  node tools/token-audit.js --since "2026-09-02 20:00"',
    '  node tools/token-audit.js --project <project-slug>',
    '  node tools/token-audit.js --agents',
    '',
    'Reads from: ' + ROOT,
  ].join('\n'));
  process.exit(0);
}

function walk(dir, out) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith('.jsonl')) out.push(p);
  }
  return out;
}

function readTranscript(file, since) {
  const r = { steps: 0, cr: 0, cw: 0, in: 0, out: 0, first: null, peak: 0, models: new Set() };
  let text;
  try { text = fs.readFileSync(file, 'utf8'); } catch { return r; }
  for (const line of text.split('\n')) {
    if (!line.trim()) continue;
    let j;
    try { j = JSON.parse(line); } catch { continue; }
    const u = j.message && j.message.usage;
    if (!u) continue;
    if (j.timestamp) {
      const t = Date.parse(j.timestamp);
      if (!Number.isNaN(t) && t < since) continue;
    }
    r.steps++;
    if (j.message.model) r.models.add(j.message.model);
    r.cr += u.cache_read_input_tokens || 0;
    r.cw += u.cache_creation_input_tokens || 0;
    r.in += u.input_tokens || 0;
    r.out += u.output_tokens || 0;
    const ctx = (u.cache_read_input_tokens || 0) + (u.cache_creation_input_tokens || 0) + (u.input_tokens || 0);
    if (r.first === null) r.first = ctx;
    if (ctx > r.peak) r.peak = ctx;
  }
  return r;
}

function parentSession(file) {
  // Subagent transcripts live under <project>/<session-uuid>/subagents/...; the directory
  // right before "subagents" is the parent session's own id.
  const parts = file.split(path.sep);
  const i = parts.indexOf('subagents');
  return i > 0 ? parts[i - 1] : null;
}

function cost(r) {
  const model = [...r.models].find(m => PRICES[m]);
  const [pi, pw, pr, po] = model ? PRICES[model] : DEFAULT_PRICE;
  return (r.in * pi + r.cw * pw + r.cr * pr + r.out * po) / 1e6;
}

const M = n => (n / 1e6).toFixed(1) + 'M';
const K = n => (n / 1000).toFixed(0) + 'k';

let projects;
try { projects = fs.readdirSync(ROOT).filter(d => !onlyProject || d === onlyProject); }
catch { console.error('No transcripts at ' + ROOT); process.exit(1); }

const rows = [];
for (const proj of projects) {
  for (const file of walk(path.join(ROOT, proj), [])) {
    let st;
    try { st = fs.statSync(file); } catch { continue; }
    if (st.mtimeMs < since) continue;
    const r = readTranscript(file, since);
    if (!r.steps) continue;
    const isAgent = file.includes('subagents');
    rows.push({
      proj, file,
      isAgent,
      parent: isAgent ? parentSession(file) : null,
      tokens: r.cr + r.cw + r.in + r.out,
      cost: cost(r),
      ...r,
    });
  }
}

if (!rows.length) { console.log('No transcript activity since ' + new Date(since).toISOString()); process.exit(0); }

rows.sort((a, b) => b.tokens - a.tokens);
const sum = k => rows.reduce((t, r) => t + r[k], 0);
const agents = rows.filter(r => r.isAgent);
const mains = rows.filter(r => !r.isAgent);

console.log('SINCE ' + new Date(since).toISOString().slice(0, 16).replace('T', ' '));
console.log('TOTAL ' + M(sum('tokens')) + ' tokens  ~$' + sum('cost').toFixed(0)
  + '   (cache reads ' + M(sum('cr')) + ' = '
  + (100 * sum('cr') / sum('tokens')).toFixed(0) + '% of all tokens)');
console.log('  main sessions ' + M(mains.reduce((t, r) => t + r.tokens, 0))
  + ' over ' + mains.length + ' transcripts, ' + mains.reduce((t, r) => t + r.steps, 0) + ' steps');
console.log('  subagents     ' + M(agents.reduce((t, r) => t + r.tokens, 0))
  + ' over ' + agents.length + ' transcripts, ' + agents.reduce((t, r) => t + r.steps, 0) + ' steps');

console.log('\nBIGGEST TRANSCRIPTS');
for (const r of rows.slice(0, 12)) {
  const parentTag = r.isAgent ? '  parent=' + (r.parent || '?').slice(0, 8) : '';
  console.log('  ' + M(r.tokens).padStart(7) + '  $' + r.cost.toFixed(0).padStart(3)
    + '  steps=' + String(r.steps).padStart(4)
    + '  peak=' + K(r.peak).padStart(5)
    + '  ' + (r.isAgent ? 'SUB   ' : 'MAIN  ') + path.basename(r.file).slice(0, 30)
    + parentTag
    + '  [' + r.proj.slice(0, 34) + ']');
}

// ⚠️ THE POINT OF THIS TOOL. An agent's cost is its STEP COUNT, not where it started:
// context grows as it works, so a long agent averages many times its own start size.
if (wantAgents && agents.length) {
  console.log('\nSUBAGENT GROWTH — start is the cheap end of the run, not the price');
  console.log('  ' + 'start'.padStart(6) + ' ' + 'avg/step'.padStart(9) + ' ' + 'peak'.padStart(6)
    + ' ' + 'steps'.padStart(6) + '  total');
  for (const r of agents.slice(0, 20)) {
    console.log('  ' + K(r.first).padStart(6) + ' ' + K(r.tokens / r.steps).padStart(9)
      + ' ' + K(r.peak).padStart(6) + ' ' + String(r.steps).padStart(6) + '  ' + M(r.tokens));
  }
  console.log('\n  Read it this way: if avg/step is many times start, the agent was too long.');
  console.log('  Fix is fewer steps per agent — split the job — not a leaner agent type.');
}
