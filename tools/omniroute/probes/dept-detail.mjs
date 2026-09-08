// Second pass: the four endpoints the scan showed had real content, printed as names only.
const BASE = process.env.OMNIROUTE_BASE_URL || "http://localhost:20128";
const KEY = process.env.OMNIROUTE_API_KEY;
const get = async (p) =>
  (await fetch(BASE + p, { headers: { Authorization: `Bearer ${KEY}` } })).json();

const auto = await get("/api/combos/auto");
console.log(`--- /api/combos/auto : ${auto.combos.length}`);
for (const c of auto.combos) {
  const models = c.models || c.pool || c.entries || [];
  console.log(
    `  ${(c.id || c.slug || c.name || "?").padEnd(34)} strategy=${c.strategy || "?"} seats=${
      Array.isArray(models) ? models.length : "?"
    } ${c.enabled === false ? "DISABLED" : ""}`
  );
}

const combos = await get("/api/combos");
console.log(`\n--- /api/combos (custom) : total=${combos.total} listed=${combos.combos.length}`);

const evals = await get("/api/evals");
console.log(`\n--- /api/evals suites : ${evals.suites.length}`);
for (const s of evals.suites)
  console.log(`  ${(s.name || s.id).padEnd(40)} cases=${s.caseCount ?? s.cases?.length ?? "?"}`);
console.log(`  targets: ${evals.targets.map((t) => t.model || t.name || t.id).join(", ")}`);
console.log(`  recentRuns: ${evals.recentRuns.length}   scorecard: ${JSON.stringify(evals.scorecard).slice(0, 200)}`);

const a2a = await get("/api/a2a/status");
console.log(`\n--- /api/a2a/status`);
console.log(`  online=${a2a.online} enabled=${a2a.enabled} tasks=${JSON.stringify(a2a.tasks)}`);
console.log(`  agent=${JSON.stringify(a2a.agent).slice(0, 300)}`);
console.log(`  capabilities=${JSON.stringify(a2a.capabilities).slice(0, 300)}`);

const bk = await get("/api/db-backups");
console.log(`\n--- /api/db-backups : ${bk.backups.length}`);
for (const b of bk.backups)
  console.log(`  ${b.name || b.file || b.id}  ${b.size ?? "?"}  ${b.createdAt || b.mtime || "?"}`);

const prov = await get("/api/providers");
console.log(`\n--- /api/providers : ${prov.total}`);
for (const c of prov.connections)
  console.log(`  ${(c.provider || c.name).padEnd(16)} enabled=${c.enabled} models=${c.modelCount ?? c.models?.length ?? "?"}`);
