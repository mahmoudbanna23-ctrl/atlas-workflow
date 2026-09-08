/**
 * set-settings.mjs — change gateway switches, and prove only the intended ones moved.
 *
 * This is the first script here that writes. A settings endpoint that takes PATCH may still merge in
 * a way the caller did not intend — dropping a field, resetting a sibling, rewriting a nested object
 * wholesale — and a gateway silently reconfigured is far worse than one left alone. So every run
 * snapshots the whole settings object first, applies the change, reads it back, and prints the full
 * diff. If a field moved that was not asked for, it shows up here rather than being discovered weeks
 * later when routing behaves oddly.
 *
 * Credential-shaped fields are never printed, in the diff or anywhere else.
 *
 * Usage: node probes/set-settings.mjs '{"a2aEnabled":true}'
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const VAR = 'OMNIROUTE_API_KEY';
const key = process.env[VAR] || execFileSync('reg', ['query', 'HKCU\\Environment', '/v', VAR], { encoding: 'utf8' }).match(/REG_(?:EXPAND_)?SZ\s+(.+)/)[1].trim();

const BASE = 'http://localhost:20128';
const OUT = 'results/switches-out';
mkdirSync(OUT, { recursive: true });

const SECRET = (k) => k.startsWith('oidc') || /secret|password|token|apikey/i.test(k) || k === 'machineId' || k === 'cloudUrl';
const auth = { Authorization: `Bearer ${key}` };
const get = async () => { const r = await fetch(`${BASE}/api/settings`, { headers: auth }); const b = await r.json(); return b.data ?? b; };

const patch = JSON.parse(process.argv[2] ?? '{}');
if (!Object.keys(patch).length) { console.log('nothing to change; pass a JSON object'); process.exit(1); }

const before = await get();
console.log('intended change:');
for (const [k, v] of Object.entries(patch)) console.log(`  ${k}: ${JSON.stringify(before[k])} -> ${JSON.stringify(v)}`);

const w = await fetch(`${BASE}/api/settings`, {
  method: 'PATCH',
  headers: { ...auth, 'Content-Type': 'application/json' },
  body: JSON.stringify(patch),
});
const wt = await w.text();
console.log(`\nPATCH ${w.status}  ${wt.slice(0, 200).replace(/\s+/g, ' ')}`);

const after = await get();

// Every field that differs, not only the ones asked for. Some fields are bookkeeping the gateway
// updates on its own (a revision counter, a last-run timestamp); those are expected to move and are
// labelled so they do not look like collateral damage.
const BOOKKEEPING = new Set(['settingsRevision', 'provider_limits_auto_sync_last_run', 'learnedRateLimits']);
const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
const moved = [];
for (const k of keys) {
  if (SECRET(k)) continue;
  const a = JSON.stringify(before[k]), b = JSON.stringify(after[k]);
  if (a !== b) moved.push({ k, from: a, to: b, asked: k in patch, bookkeeping: BOOKKEEPING.has(k) });
}

console.log('\nfields that actually moved:');
for (const m of moved) {
  const tag = m.asked ? 'AS ASKED  ' : m.bookkeeping ? 'bookkeeping' : '⚠ UNASKED ';
  console.log(`  ${tag} ${m.k}: ${String(m.from).slice(0, 80)} -> ${String(m.to).slice(0, 80)}`);
}
const unasked = moved.filter(m => !m.asked && !m.bookkeeping);
const missed = Object.keys(patch).filter(k => JSON.stringify(after[k]) !== JSON.stringify(patch[k]));
if (missed.length) console.log(`\n⚠ requested but did NOT take: ${missed.join(', ')}`);
if (unasked.length) console.log(`\n⚠ ${unasked.length} field(s) changed that were not requested — review above.`);
if (!missed.length && !unasked.length) console.log('\nclean: every requested field took, nothing else moved.');

writeFileSync(`${OUT}/set-settings-last.json`, JSON.stringify({ patch, moved, missed }, null, 2));
