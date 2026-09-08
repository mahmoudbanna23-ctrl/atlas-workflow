/**
 * measure-allowlist.mjs — what the current allowlist actually costs per request.
 *
 * Every tool the proxy advertises is JSON schema that a client re-sends on every single request of
 * every session, so the only honest unit for this list is bytes, not tool count. This asks the
 * gateway for its full tools/list over Streamable HTTP, filters it exactly the way mcp-proxy.mjs
 * does, and prints what the filtered payload weighs — plus what each individual tool contributes,
 * so a candidate for removal can be judged against what removing it buys.
 *
 * Run it after any edit to mcp-allowlist.json. The numbers quoted in that file's `_cost` line and
 * in the README are meant to be this script's output, not an estimate.
 */
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const VAR = 'OMNIROUTE_API_KEY';
const key = process.env[VAR] || execFileSync('reg', ['query', 'HKCU\\Environment', '/v', VAR], { encoding: 'utf8' }).match(/REG_(?:EXPAND_)?SZ\s+(.+)/)[1].trim();

const BASE = 'http://localhost:20128';
const ENDPOINT = `${BASE}/api/mcp/stream`;
const allow = new Set(JSON.parse(readFileSync(new URL('../mcp-allowlist.json', import.meta.url), 'utf8')).allow);

// The gateway answers MCP over SSE even for a single reply, so each response has to be unwrapped
// from its `data:` lines before it can be parsed.
function parseSse(text) {
  const lines = text.split(/\r?\n/).filter(l => l.startsWith('data:'));
  const payload = lines.map(l => l.slice(5).trim()).join('');
  return payload ? JSON.parse(payload) : null;
}

let sessionId = null;
async function rpc(method, params, id) {
  const headers = {
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    Accept: 'application/json, text/event-stream',
  };
  if (sessionId) headers['Mcp-Session-Id'] = sessionId;
  const r = await fetch(ENDPOINT, { method: 'POST', headers, body: JSON.stringify({ jsonrpc: '2.0', id, method, params }) });
  const sid = r.headers.get('mcp-session-id');
  if (sid) sessionId = sid;
  const text = await r.text();
  return text.startsWith('data:') || text.includes('\ndata:') ? parseSse(text) : (text ? JSON.parse(text) : null);
}

await rpc('initialize', {
  protocolVersion: '2025-06-18',
  capabilities: {},
  clientInfo: { name: 'measure-allowlist', version: '1.0.0' },
}, 1);

const listed = await rpc('tools/list', {}, 2);
const tools = listed?.result?.tools ?? [];
if (!tools.length) {
  console.error('tools/list returned nothing — is the gateway up?');
  process.exit(1);
}

const size = t => JSON.stringify(t).length;
const kept = tools.filter(t => allow.has(t.name));
const dropped = tools.filter(t => !allow.has(t.name));
const sum = arr => arr.reduce((n, t) => n + size(t), 0);

console.log(`gateway advertises   ${String(tools.length).padStart(4)} tools  ${String(sum(tools)).padStart(7)} bytes`);
console.log(`allowlist passes     ${String(kept.length).padStart(4)} tools  ${String(sum(kept)).padStart(7)} bytes`);
console.log(`proxy withholds      ${String(dropped.length).padStart(4)} tools  ${String(sum(dropped)).padStart(7)} bytes`);

const missing = [...allow].filter(n => !tools.some(t => t.name === n));
if (missing.length) console.log(`\nallowed but not advertised: ${missing.join(', ')}`);

console.log('\nper allowed tool, largest first:');
for (const t of [...kept].sort((a, b) => size(b) - size(a))) {
  console.log(`  ${String(size(t)).padStart(5)}  ${t.name}`);
}
