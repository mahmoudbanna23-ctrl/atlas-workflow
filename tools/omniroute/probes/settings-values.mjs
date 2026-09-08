/**
 * settings-values.mjs — the current position of every gateway switch worth reading.
 *
 * switches.mjs established that /api/settings exists and listed its field names. Names alone do not
 * say whether a feature is on, so this reads the values — but not all of them. Four kinds of field
 * are skipped outright rather than filtered afterwards: OIDC credentials, anything whose name ends
 * in Secret, the machine identity, and the cloud URL. A secret that is read and then discarded has
 * still passed through a transcript, so the safe move is never to ask for it.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const VAR = 'OMNIROUTE_API_KEY';
const key = process.env[VAR] || execFileSync('reg', ['query', 'HKCU\\Environment', '/v', VAR], { encoding: 'utf8' }).match(/REG_(?:EXPAND_)?SZ\s+(.+)/)[1].trim();

const BASE = 'http://localhost:20128';
const OUT = 'results/switches-out';
mkdirSync(OUT, { recursive: true });

const SKIP = (k) =>
  k.startsWith('oidc') || /secret|password|token|apikey/i.test(k) || k === 'machineId' || k === 'cloudUrl';

const r = await fetch(`${BASE}/api/settings`, { headers: { Authorization: `Bearer ${key}` } });
const body = await r.json();
const s = body.data ?? body;

const shown = {};
for (const [k, v] of Object.entries(s)) {
  if (SKIP(k)) { shown[k] = '[skipped: credential-shaped]'; continue; }
  shown[k] = v;
}

// Grouped so the reply can be read as decisions rather than as a dump. The groups are chosen by what
// each switch would change about how much work Claude does, which is the only measure that matters.
const GROUPS = {
  'retry and stickiness (fewest steps if a seat fails)': ['requestRetry', 'maxRetryIntervalSec', 'stickyRoundRobinLimit', 'disableSessionStickiness', 'sessionAffinityTtlMs', 'learnedRateLimits'],
  'combos': ['comboStrategy', 'comboConfigMode', 'comboAutoPromoteEnabled', 'comboStickyRoundRobinLimit', 'hideAutoCombos'],
  'agentic': ['a2aEnabled', 'mcpEnabled', 'mcpTransport', 'radarEnabled', 'radarAdminUrl'],
  'cost guards': ['hidePaidModels', 'freeAccessPolicy', 'excludeTosAvoid', 'quotaVisibility', 'autoRefreshProviderQuota', 'autoRefreshProviderQuotaInterval'],
  'caching': ['promptCacheAffinityEnabled', 'alwaysPreserveClientCache', 'idempotencyWindowMs'],
  'safety': ['credentialRedactionEnabled', 'customBannedSignals', 'autoDisableBannedScope', 'proxyEnabled', 'perKeyProxyEnabled'],
  'routing strategy': ['providerStrategies', 'customSystemPromptEnabled', 'preferClaudeCodeForUnprefixedClaudeModels', 'claudeFastMode', 'codexServiceTier'],
};

for (const [label, keys] of Object.entries(GROUPS)) {
  console.log(`\n--- ${label}`);
  for (const k of keys) {
    if (!(k in shown)) { console.log(`  ${k.padEnd(42)} [field absent]`); continue; }
    console.log(`  ${k.padEnd(42)} ${JSON.stringify(shown[k])}`);
  }
}

writeFileSync(`${OUT}/settings-values.json`, JSON.stringify(shown, null, 2));
console.log(`\nwritten: ${OUT}/settings-values.json`);
