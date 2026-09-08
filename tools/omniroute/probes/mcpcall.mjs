/**
 * mcpcall.mjs — call any MCP tool on the gateway, allow list or not.
 *
 * The proxy filters what this workspace exposes to Claude, which is right for daily use and wrong
 * for testing: judging whether a pruned tool deserves restoring meant editing the allow list, and
 * editing the allow list to test a tool is backwards. This talks to the gateway's MCP endpoint
 * directly over HTTP, so any of the 110 tools can be exercised without changing what Claude sees.
 *
 * Replies come back as SSE, so the JSON-RPC payload is unwrapped from the data: lines.
 *
 * Usage: node probes/mcpcall.mjs <tool_name> ['{"arg":"value"}']
 */
import { execFileSync } from 'node:child_process';

const VAR = 'OMNIROUTE_API_KEY';
const key = process.env[VAR] || execFileSync('reg', ['query', 'HKCU\\Environment', '/v', VAR], { encoding: 'utf8' }).match(/REG_(?:EXPAND_)?SZ\s+(.+)/)[1].trim();

const URL_ = 'http://localhost:20128/api/mcp/stream';
const tool = process.argv[2];
const args = JSON.parse(process.argv[3] ?? '{}');
if (!tool) { console.log('usage: node probes/mcpcall.mjs <tool_name> [jsonArgs]'); process.exit(1); }

let sessionId = null;
function parseSse(text) {
  const lines = text.split(/\r?\n/).filter(l => l.startsWith('data:'));
  const payload = lines.map(l => l.slice(5).trim()).join('');
  return payload ? JSON.parse(payload) : null;
}
async function rpc(method, params, id) {
  const headers = { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' };
  if (sessionId) headers['Mcp-Session-Id'] = sessionId;
  const r = await fetch(URL_, { method: 'POST', headers, body: JSON.stringify({ jsonrpc: '2.0', id, method, params }) });
  if (!sessionId) sessionId = r.headers.get('mcp-session-id');
  const t = await r.text();
  return t.includes('data:') ? parseSse(t) : (t ? JSON.parse(t) : null);
}

await rpc('initialize', { protocolVersion: '2025-03-26', capabilities: {}, clientInfo: { name: 'probe', version: '1' } }, 1);
const res = await rpc('tools/call', { name: tool, arguments: args }, 2);

const content = res?.result?.content?.[0]?.text ?? JSON.stringify(res?.result ?? res?.error ?? res);
console.log(String(content).slice(0, 2000));
