// Department re-scan: hit every known gateway endpoint, report status + a shape summary.
// Reads the gateway base and key from the environment, same as every other probe here.
const BASE = process.env.OMNIROUTE_BASE_URL || "http://localhost:20128";
const KEY = process.env.OMNIROUTE_API_KEY;

const PATHS = [
  "/api/a2a/status", "/api/a2a/agents",
  "/api/batch",
  "/api/combos", "/api/combos/auto", "/api/combos/metrics", "/api/combos/suggestions",
  "/api/combos/templates",
  "/api/compression/status",
  "/api/context-sources", "/api/settings/context-sources",
  "/api/db-backups",
  "/api/evals", "/api/evals/suites", "/api/evals/runs", "/api/evals/golden-set",
  "/api/features", "/api/flags",
  "/api/integrations",
  "/api/memory", "/api/memory/stats",
  "/api/plugins", "/api/plugins/available",
  "/api/providers",
  "/api/quota",
  "/api/radar/status", "/api/radar/catalog",
  "/api/routing/decisions",
  "/api/skills", "/api/skills/available",
  "/api/stats", "/api/usage",
];

// Describe a payload without printing it: type, size, and the top-level keys or first item's keys.
function shape(v) {
  if (v === null || v === undefined) return "null";
  if (Array.isArray(v)) {
    if (v.length === 0) return "array[0]";
    const first = v[0];
    const keys = first && typeof first === "object" ? Object.keys(first).slice(0, 8).join(",") : typeof first;
    return `array[${v.length}] of {${keys}}`;
  }
  if (typeof v === "object") {
    const keys = Object.keys(v);
    const counts = keys
      .filter((k) => Array.isArray(v[k]))
      .map((k) => `${k}[${v[k].length}]`)
      .slice(0, 6);
    return `object{${keys.slice(0, 12).join(",")}}${counts.length ? " -- " + counts.join(" ") : ""}`;
  }
  return JSON.stringify(v).slice(0, 80);
}

const rows = [];
for (const p of PATHS) {
  try {
    const r = await fetch(BASE + p, { headers: { Authorization: `Bearer ${KEY}` } });
    let body = "";
    try {
      body = shape(await r.json());
    } catch {
      body = "(not json)";
    }
    rows.push(`${String(r.status).padEnd(4)} ${p.padEnd(34)} ${body}`);
  } catch (e) {
    rows.push(`ERR  ${p.padEnd(34)} ${e.message}`);
  }
}
console.log(rows.join("\n"));
