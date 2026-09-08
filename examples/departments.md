# The departments — what the workspace turned out to be able to do

**Built on discovery, not on need** (owner ruling, 2026-09-08): *"don't decide the departments on
what we need now, decide on what you'll find, we don't know what we might need in the future and
always leave the department list open for more in case we discovered some new things later."*

So this is not a plan. Every department below is a capability that was **measured working at least
once**, or a real capability sitting behind a named, specific blocker. Some of them have no job in
any current project. That is deliberate — the point is to know what the building contains before
deciding what to do in it.

**This list is open and expected to grow.** It replaces the A/B/C/D chart in
`factory-departments.md`, which was drawn from what the the example project sprint needed in September.

## How a department gets on this list

Three conditions, all required:

1. **A capability was observed** — a tool answered, a seat produced something, a run finished. Not
   a README claim, not a plausible inference from a name.
2. **It has either a staffed seat or a named blocker.** "Nobody has tried" is not a blocker;
   "needs a token set under Settings > Context Sources" is.
3. **The evidence is written down here**, with the date and what was actually seen.

Nothing is admitted for being useful. Nothing is refused for being useless today.

## The chart

| # | Department | What it does | Status |
|---|---|---|---|
| 1 | **The Scriptorium** | turns a page image into text | 🟢 staffed |
| 2 | **The Reed Room** | writes and reformats prose in our own words | 🟢 staffed |
| 3 | **The Assay Room** | checks work against its source and says where it is wrong | 🟢 staffed |
| 4 | **The Stoa** | argues the other side of a decision | 🟢 staffed |
| 5 | **The Plumb Line** | audits structure — counts, coverage, does it parse | 🟢 staffed, gated |
| 6 | **The Pharos** | watches the machinery: health, quota, breakers, cache | 🟢 staffed |
| 7 | **The Counting House** | says what the work cost and where it went | 🟢 staffed |
| 8 | **The Outriders** | goes outside for facts — live web search | 🟢 staffed, partly |
| 9 | **The Cistern** | parks a large block of text, hands round a reference to it | 🟢 staffed, unused |
| 10 | **The Foundry** | builds the scripts that do bulk work instead of a seat | 🟢 staffed |
| 11 | **The Stacks** | searches and reads a whole folder of local files, cheaply | 🔴 route gone |
| 12 | **The Cartographers** | decides which seat a request goes to, and explains why | 🟢 **40 combos, not 5** |
| 13 | **The Winnowing Floor** | strips noise out of text before it is paid for | 🔴 route gone |
| 14 | **The Chancery** | reads and writes the note vaults (Obsidian, Notion) | 🔴 route gone; use the connector |
| 15 | **The Gatehouse** | the gateway's own memory, skills and plugin machinery | 🟢 staffed, empty |
| 16 | **The Proving Ground** | scores a seat against known answers, so it can be trusted | 🟢 live, never run |
| 17 | **The Long Kiln** | slow bulk inference, submitted and collected later | 🟢 live at `/api/batches`, 0 ever |
| 18 | **The Herald** | lets an outside agent call this gateway as a service | 🟢 switched ON, no agent card |
| 19 | **The Echo Wall** | answers a request already paid for, without paying again | 🟢 staffed, running |
| 20 | **The Strongroom** | holds the keys and scrubs credentials out of traffic | 🟢 staffed |
| 21 | **The Bell Tower** | calls outward when something happens in the gateway | 🟢 live, none configured |
| 22 | **The Undercroft** | keeps restorable copies of the gateway's own database | 🟢 staffed, automatic |

---

## 1. The Scriptorium — page image to text

**What it can do.** Read a scanned page and return what is printed on it.

**Measured.** WPS reads the scans locally at $0 (settled 2026-09-01,
`<project>\progress\ocr-pipeline.md`) — this is the cheap route, and the bottleneck was never
here. Astra (`gpt-6-astra`) read two PNGs on 2026-09-08 and transcribed a synthetic scanned page —
rotated 1.3°, noisy, blurred, 13 lines including `x10^9/L` and `80-100 mg/kg/day` —
**character-exact against the source**; on a noise-only page it said "this page has no readable
text" rather than inventing one.

**Who staffs it.** WPS locally first, $0. Astra where the page is hard or the reading has to be
right. Through the OmniRoute gateway only Gemini reads an image at all.

⚠️ **The standing warning stays.** `gemini-flash-latest` once returned a fluent, confident
transcription of a **different page**. Never judge a transcription by how well it reads; check it
against the image.

## 2. The Reed Room — drafting and reformatting

**What it can do.** Briefs, resume prompts, plans, checklists, handoffs, first-draft code, and
turning notes into prose — in our own words.

**Measured 2026-09-08 (department interview).** `groq/groq/compound-mini` passed the drafting job
in **2.7 s**. Cover seat: `opencode-zen/big-pickle` at 25.5 s — a slow specialist, fine when the
first seat is down and nothing is waiting on it.

⚠️ **The finding was a monoculture.** One seat passed all four of the jobs interviewed that day. A
department with one seat is a single point of failure, and that is the honest state of this one.

## 3. The Assay Room — verification

**What it can do.** Take an item and its source, return the discrepancies or an explicit
acceptance. Not an essay.

**Who may staff it — owner ruling 2026-09-08.** Verification is no longer Claude's alone. Any seat
**measured reliable on that kind of check** may do it. Astra qualifies, measured: it called a
printed answer key wrong (the key said membranous nephropathy for a 4-year-old's nephrotic
syndrome; it answered minimal change disease), refused twice to give a dose for an invented drug,
and flagged an invented index term while separately confirming that the arithmetic around it was
right. Handed a file of answers to audit, it recomputed all ten, failed the one that was wrong,
passed the rest with no false positives, in 60 s.

Three conditions survive, because they are what "reliable" means:

- **Measured before trusted** — against known answers, written down.
- **Never its own work.**
- **Preferably not its own house** — a same-house second opinion is discounted.

Where nothing measured exists for the job, the checker is Claude — the default now, not the rule.

## 4. The Stoa — debate and second opinion

**What it can do.** Take a decision that is about to be made and argue the other side, so the
judgement does not cost main-chat reasoning steps.

**Measured 2026-09-08.** `groq/groq/compound-mini` passed the debate job in **1.7 s** — the fastest
of the four. No cover seat found. For a decision that actually matters, Astra reconciled two
disagreeing sources without declaring either one wrong (measured, run 4).

## 5. The Plumb Line — structural audit

**What it can do.** Page-coverage reports, count reconciliation, index checks, "does this parse" —
reading *structure*, never meaning.

**Measured.** `groq/groq/compound-mini` passed in 2.9 s (2026-09-08).

⚠️ **Gated, and the gate is old blood.** On 2026-09-03 a text seat was given static prose and
pattern audits and **three of its five findings were false**. This department is open only for
audits whose result a script or a count can prove. Never a judgement audit.

## 6. The Pharos — the watchtower

**What it can do.** Report the gateway's live state: uptime, memory, circuit-breaker state per
provider, rate limits, cache hit rate, per-provider latency percentiles, quota remaining.

**Measured 2026-09-08 over MCP**, all answering with live numbers: `omniroute_get_health`,
`omniroute_check_quota`, `omniroute_get_provider_metrics`, `omniroute_cache_stats`,
`omniroute_get_session_snapshot`, `omniroute_pool_status`, `omniroute_browser_pool_status`,
`omniroute_tool_search`.

**What it found on its first look.** Groq quota 37 of 250 used. Semantic cache: 20 hits, 127
misses, 13.6% hit rate, 43,600 tokens saved. Prompt cache: 14,986 tokens saved, about $0.04.
Browser pool: enabled, nothing running, **stealth unavailable** — consistent with the missing
Playwright binary, which stays uninstalled by standing rule.

## 7. The Counting House — cost and usage

**What it can do.** Cost report by period with per-provider and per-model breakdown, request
counts, token counts, average latency, success rate.

**Measured 2026-09-08.** `omniroute_cost_report` answered live. It also surfaced something nobody
asked for: **Groq's success rate over 123 requests was 54.47%.** Nearly half the calls to the seat
that staffs four departments are failing. That number came out of a tool nobody had ever run —
which is the argument for this whole file.

Top models by volume this session: `big-pickle` 70, `gpt-oss-120b` 60, `compound-mini` 54,
`grok-4.5` 26, `gemini-flash-latest` 25.

## 8. The Outriders — going outside for facts

**What it can do.** Live web search through the gateway. **Measured 2026-09-08:**
`omniroute_web_search` answered on `duckduckgo-free` — **no key, no cost** — and the first result
for a paediatric nephrology query was the KDIGO 2025 guideline PDF.

**What it cannot do yet.** `omniroute_web_fetch` (fetch and extract a page) returns *"No
credentials configured for any web-fetch provider"* — it wants a key for Firecrawl, Jina Reader,
Tavily, TinyFish or Context7. So the department can **find** a page but not **read** one.
`omniroute_github_skills_search` is rate-limited without a GitHub token.

⛔ **`omniroute_x_search` was not tested and will not be.** It runs through the xAI browser session;
browser-session seats are barred — an account ban is the one redline.

## 9. The Cistern — the verbatim store

**What it can do.** Store a block of text verbatim in the gateway and hand out a `ccr://` reference
to it, then retrieve, inspect, list or delete it. Caller-isolated.

**Measured 2026-09-08:** `omniroute_ccr_stats` answered. Live limits: 2 MB per block, 16 MB per
caller, 64 MB total, 5,000 entries, 24-hour default life (7 days maximum), 256 KB maximum returned
in one MCP call. Currently empty — **zero entries; nothing has ever used it.**

**Why it is worth a department anyway.** It is the only mechanism found so far for handing a large
piece of content between seats without paying to re-send it every time. Nothing in the workspace
uses it. That is a gap, not a verdict.

## 10. The Foundry — scripts instead of seats

**What it can do.** The standing rule made concrete: bulk per-item work goes in a **script**, files
out and verdicts in, never an agent loop. The harnesses already built are the department's output:
`scripts/compression-test.mjs`, `scripts/interview.mjs`, `scripts/omni.mjs`,
`Tools/omniroute/mcp-proxy.mjs`, `Tools/token-audit.js`.

**Measured, repeatedly.** Astra's own self-report predicted its arithmetic slip class before it
made one — and said formula arithmetic belongs in a script. Then it wrote `(10 x 4) + (2 x 2) = 48`
for a 12 kg child's fluid rate; the correct answer is 44. A script would not have.

**Also here:** `omniroute_rtk_discover` and `omniroute_rtk_learn` — mine captured command output for
recurring noise and draft a filter for it. Both answer; the sample store is empty (0 samples), so
there is nothing to learn from yet.

## 11. The Stacks — the local corpus 🟡

**What it can do.** `local_corpus_search` and `local_corpus_read` search and read a whole folder of
local text files through the gateway, without absolute paths leaving the machine, and without
Claude paying to read each file. Live limits, read off the tool itself: 5,000 files, 1 MB per file,
64 MB total index, 400 lines per read.

**The blocker is one setting.** `local_corpus_status` reports `configured: false`. A root has to be
set under **Settings > Context Sources** in the OmniRoute dashboard. That is a click.

**Why this one matters more than its size suggests.** Point it at the extracted lecture text and
the cached transcripts, and every seat in the fleet can search the study material directly instead
of having text pasted into its brief.

## 12. The Cartographers — routing 🟠

**What it can do, in principle.** `omniroute_simulate_route` dry-runs where a request would go;
`omniroute_explain_route` says why one went where it did, with its scoring factors;
`omniroute_best_combo_for_task` recommends a chain; `omniroute_pick_fastest_model` picks from live
telemetry; and combos can be created, switched and tested.

**What was actually found 2026-09-08.** `omniroute_list_combos` returns `{ "combos": [] }` — **no
combo has ever been defined.** So `best_combo_for_task` answers *"No enabled combos available"* and
`pick_fastest_model` answers *"No matching combos available"*. `simulate_route` and `explain_route`
both work but need arguments nobody is producing yet (a prompt-token estimate, a request id).
`omniroute_list_models_catalog` is dead for the separate reason in department 15.

**So the office is real and the map is blank.** Drawing it — defining combos for the departments
above — is the obvious next piece of building, and it is not started.

## 13. The Winnowing Floor — compression 🟠

**Measured twice on 2026-09-08, and the headline is negative.** End-to-end saving is **0%**: the
master switch is off and a per-request header does not override it. RTK saves 82% on tool output —
and in the measured run it **kept thirty repeated warnings and dropped the failing test line**, the
exit status, the version string and the counter. Caveman on prose measured **6%**, not the 46% the
README's arithmetic assumes. The modes that save nothing still cost 5.9–10.1 s per call, against
1.56–1.87 s for the dead ones.

Full write-up: `compression-measured.md`. Recommendation on record: leave the master switch off.

Over MCP the compression tools are additionally blocked by the bug in department 15.

## 14. The Chancery — the note vaults 🔴

**What it can do.** 21 Obsidian tools — read, write, append, surgical patch at a heading, move,
delete, list the vault, document map, tags, frontmatter metadata, run any Obsidian command,
periodic notes, and a bidirectional desktop-to-mobile sync with conflict resolution. Plus 6 Notion
tools — search, read a page, list blocks, query and read a database, append blocks.

**The blocker.** Both answer *"token not configured. Set it in Settings > Context Sources."*

⚠️ **A standing rule sits on top of the blocker: Obsidian stays a plain vault.** Capability is not
permission. This department is listed because it exists, not because it is wanted.

## 15. The Gatehouse — the gateway's own machinery 🟢

**What it does.** The gateway's memory store, its skill registry and execution history, its plugin
system with hooks into the request pipeline, a model catalogue with capabilities and pricing,
compression configuration, and a gamification layer (XP, badges, leaderboards, token transfer
between keys).

**Opened 2026-09-08 by the transport switch.** This department was red for most of a day. Every one
of its tools returned the same error — the standalone MCP server could not open `storage.sqlite`,
*"better-sqlite3 (failed), node:sqlite (unavailable), sql.js WASM not pre-initialised"*, with its
own message saying `ensureDbInitialized()` was never called at startup. It was diagnosed as a
packaging bug rather than a broken machine: on the same PC, same Node, same file, `better-sqlite3`
imports fine and opens that exact database read-write, no lock, 472 tables.

**Measured after the owner set the dashboard transport to Streamable HTTP.** All thirteen
database-backed tools answered, none returned the driver error: `omniroute_list_models_catalog`
returned the catalogue, `omniroute_memory_search` `{memories: [], count: 0}`,
`omniroute_skills_list` `{skills: [], count: 0}`, `plugin_list` `{plugins: []}`,
`omniroute_compression_status` the real configuration, `gamification_leaderboard` a scored entry.
The tools now execute inside the live gateway, where the database was open all along.

**Staffed but empty.** Every store it manages is at zero — no memories, no skills, no plugins.
Nothing in this workspace has ever written to them. So the department is open for business with
nothing on its shelves, which is a different problem from being shut.

**The standalone stdio spawn is still broken** — re-tested after the switch, same driver error. That
is still worth reporting upstream; it just no longer blocks anything here, because
`mcp-proxy.mjs` was rewritten as a stdio-to-HTTP bridge and does not spawn it any more.

**Still refusing after the switch:** `omniroute_db_health_check` (same driver error),
`omniroute_radar_catalog` and `omniroute_pick_fastest_model` (upstream 404, `model_not_found`).

---

## 16. The Proving Ground — scoring a seat 🟢

`GET /api/evals` answers 200 and carries a **built-in suite: "OmniRoute Golden Set", 10 cases**,
described as baseline evaluation cases for response quality across multiple models. `cli-eval`
covers the same ground from the CLI: create and run suites, watch live progress, view scorecards,
compare models, wire an eval run into CI.

Nothing has ever been run through it.

This is the department that unblocks the others. The 2026-09-08 ruling let verification leave
Claude, but only to a seat **measured reliable against known answers first, and written down**.
Until now that measurement had to be built by hand — `scripts/interview.mjs` exists because there
was nothing else. There was a scorecard engine in the building the whole time.

What it is *not*: department 3, The Assay Room, checks one piece of work against its source. This
one checks a *seat* against a fixed answer key. Assay says "this page is wrong". Proving Ground
says "this model may be trusted with pages".

## 17. The Long Kiln — batch inference 🟢

`GET /v1/batches` answers `{"object":"list","data":[],"total_count":0}` and `GET /api/batches`
answers `{"batches":[]}`. Live, empty, never carried a single request. `cli-batches` covers submit,
monitor, upload files, retrieve results.

The reason to care is arithmetic: batch lanes are typically **half the price** of live calls, paid
for in latency. The workspace's biggest unpriced job is 1,637 pages of scanned books through the
one seat that can read them. That is the shape a batch lane is for — no deadline inside the hour,
enormous volume.

Unmeasured: whether OmniRoute's batch path reaches Gemini at all, or only the OpenAI-shaped
providers. Nothing is claimed until it is submitted.

## 18. The Herald — agent-to-agent 🔴

`a2aEnabled` is **`false`** in `/api/settings`. One switch, no key, no money.

Behind it: JSON-RPC 2.0 agent-to-agent protocol with **six built-in skills** — smart-routing,
quota-management, provider-discovery, cost-analysis, health-report, list-capabilities. `cli-a2a`
sends tasks and inspects execution history.

This is the direction the whole factory is pointed: an agent that is not Claude asking this gateway
for a routing decision, a quota check or a cost report, and getting a structured answer. Today the
only way in is MCP, which only a Claude Code session can use.

⚠️ It opens a listener. That is a surface-area change, not a preference — the owner's call, and
worth pairing with `credentialRedactionEnabled`, which is currently `false`.

## The rest of the product — filed, and why it is not a department

Everything the sweep of 2026-09-08 found and did not turn into a department. Recorded so it is not
re-discovered a third time.

**Infrastructure, not labour.** These run the building; they do no work anyone would assign.
Tunnels (ngrok / Cloudflare / Tailscale — `hideEndpoint*` all `false`, `tailscaleEnabled` `false`),
cloud sync (`cloudConfigured: false`, `cloudUrl` empty), OIDC login (`oidcEnabled: false`), the
version manager (installs and restarts 9Router and CLIProxyAPI), proxy configuration, and database
backups. The backup correction still stands: `POST /api/db-backups` **restores**, it does not
create.

**Owner-only controls.** `omniroute_set_budget_guard` and the `omni-budget` manual — spending
limits, token quotas and rate-limit policy per key or global, with block / degrade / alert on
breach. This is the guard that would have capped the 2026-09-02/03 night. It is gateway
configuration and belongs to the owner, never to a session.

**Settings found switched off** (`/api/settings`, 83 keys, 2026-09-08):
`credentialRedactionEnabled` false · `a2aEnabled` false · `radarEnabled` false — which is why
`omniroute_radar_catalog` returns 404, so that tool is not broken, it is disabled ·
`autoRefreshProviderQuota` false, so Counting House numbers are as stale as the last manual check ·
`comboAutoPromoteEnabled` false · `customSystemPromptEnabled` false.

**Noise.** `gamification_*` (XP, badges, leaderboards, token transfers between keys) and the
`oneproxy_*` free-proxy marketplace. Neither does work.

**Barred.** `omniroute_pool_*` and `omniroute_browser_pool_status` — browser sessions are the
account-ban redline. Status may be read; `pool_warm` opens up to 50 sessions and is never called.

**Webhooks** — `GET /api/webhooks` answers `{"webhooks":[],"total":0}`. Events available include
`request.completed`, `request.failed`, `quota.exceeded`. Not a department because nothing here
listens for a callback; it belongs to the Pharos the day something does.

## The manual library — 46 skills, and the point of them

`omniroute_agent_skills_list` returns **46 SKILL.md manuals**: 23 for the REST API, 21 for the CLI,
1 config walkthrough (Codex CLI), and 1 external (`ponytail`, a minimalism ladder — MIT, unrelated
to OmniRoute). `omniroute_agent_skills_get` fetches one body on demand.

They cost **nothing per turn**. They are not installed, not loaded, and not in any context until
asked for — which is the exact opposite of a `~\.claude\skills` install, where every SKILL.md is
re-sent on every request forever. `omniroute_agent_skills_coverage` reporting `totalSkills: 0` is
about files written to disk, not about the catalogue, which is populated.

**So the rule for this whole product is: read the manual when the job arrives, install nothing.**
Measured example: `omni-combos-routing` is 8,990 characters and carries the exact endpoints for the
failover combo that has never been built, including the trap that a PUT merges but a sent array
replaces outright.

Which manual answers which department:

| Department | Manual to open |
|---|---|
| 6 Pharos | `omni-resilience`, `cli-health` |
| 7 Counting House | `omni-usage-logs`, `omni-budget`, `cli-cost-usage` |
| 8 Outriders | `omni-inference` (search/fetch sit on the inference surface) |
| 11 Stacks | `omni-settings` (the corpus root is a setting) |
| 12 Cartographers | `omni-combos-routing`, `cli-routing` |
| 13 Winnowing Floor | `omni-compression`, `omni-context-rtk`, `cli-compression` |
| 14 Chancery | `omni-mcp` (the vault tools are MCP tools) |
| 15 Gatehouse | `cli-plugins-skills`, `omni-github-skills` |
| 16 Proving Ground | `cli-eval` |
| 17 Long Kiln | `cli-batches` |
| 18 Herald | `omni-agents-a2a`, `cli-a2a` |

## Empty offices — found, unstaffed, no blocker but a person

Not departments yet, because nothing has been measured. Listed so they are not re-discovered:

- **Proxy rotation** — `omniroute_oneproxy_fetch` / `_rotate` / `_stats`. Tested 2026-09-08: all
  three answer, and `_fetch` returned `{items: [], total: 0}` — it lists free **proxy servers**
  from a marketplace, it does not fetch web pages, so it is **not** a substitute for
  `omniroute_web_fetch`. No use case, and network-facing tools deserve a reason first.
- **Session pool warming** — `omniroute_pool_warm` opens up to 50 browser sessions. Barred:
  browser sessions are the account-ban redline.
- **Skill discovery from GitHub** — `omniroute_github_skills_search` / `_scan` / `_install` finds
  agent-skill repositories, scans them for `eval(base64)` and hardcoded secrets, and plans an
  install into an agent directory. The scanner is the interesting half. `_search` was measured
  answering on 2026-09-08; it is rate-limited without a GitHub token, which is why it is not in the
  allowlist.
- **Resilience and budget controls** — `omniroute_set_budget_guard` (block, degrade or alert at a
  spend limit) and `omniroute_set_resilience_profile` (breakers, retries, timeouts, fallback
  depth). Both are gateway configuration and belong to the owner, not to a session.

## What would open department 19

Any of these, and the list grows the same day:

- A tool answers that has not answered before — including one of the 74 currently hidden by the
  proxy allowlist. This is not hypothetical: the transport switch on 2026-09-08 revived thirteen
  of them in one click and turned department 15 from red to green the same afternoon.
- A subsystem is found that the MCP tool list never mentioned. Departments 16, 17 and 18 came from
  exactly that on 2026-09-08: the evals suite, the batch lane and the A2A protocol have **no MCP
  tools at all**, so a sweep of the 110 tools could never have found them. They were found by
  reading the 46-manual catalogue and calling REST endpoints directly. **The tool list is not the
  product.**
- A seat passes a job no seat has passed. The interview harness (`scripts/interview.mjs`) is built
  and re-runnable; the Gemini page-reader ids have still never been interviewed.
- A blocker above gets cleared — the local corpus root, a web-fetch key, the Obsidian/Notion
  tokens. The MCP transport was one of these and was cleared on 2026-09-08.
- Something is discovered that nobody thought to look for. That is the whole reason this file is
  written from what was found rather than from what was wanted.

## Housekeeping

- The gateway's MCP server advertises **110 tools, 55.4 KB of schema**, to every session that loads
  it. The workspace exposes **36** through `Tools/omniroute/mcp-proxy.mjs` — **17.6 KB, a 68%
  cut** — filtered by `Tools/omniroute/mcp-allowlist.json`. Adding a capability to this file means
  adding one line there.
- **`mcp-proxy.mjs` is a stdio-to-HTTP bridge as of 2026-09-08**, not a wrapper round a spawned
  server. It speaks stdio to the client, because that is the only transport a Claude Code MCP
  server may use, and forwards to `/api/mcp/stream` so the tools run inside the live gateway. It
  needs the gateway up (`Desktop\start-omniroute.bat`) and `OMNIROUTE_API_KEY` in the environment;
  if the gateway is down it returns that as the error rather than hanging.
- The allowlist grew from 25 to 36 because the transport switch revived the database tools. It
  costs 4.8 KB more schema per request than the old list and buys a whole department.
- `OMNIROUTE_MCP_SCOPES`, `OMNIROUTE_MCP_ENFORCE_SCOPES` and the description-compression variables
  were all measured on 2026-09-08 and changed the advertised list by **nothing** — 110 tools and
  55,406 bytes in every configuration. The proxy exists because those knobs do not work.

---

# 2026-09-08 — full-access re-scan of the gateway

Every `/api/*` route the notes had ever named was called with the admin key, plus twenty-two
guesses. What follows is what answered, not what the dashboard advertises. Probes:
`Tools\omniroute\probes\dept-scan.mjs` (status + payload shape for 32 routes) and
`dept-detail.mjs` (contents of the ones with something in them).

**Read a 404 carefully.** A 405 means the route exists and wants a different method
(`/api/evals/suites`, `/api/skills/available` both did that). A 404 means no route at that path —
which can still mean *the path in our notes was wrong*, and twice it did: `/api/batch` is
**`/api/batches`**, and `/api/combos` is empty because the real list is **`/api/combos/auto`**.

## What the re-scan changed

| # | Department | Was | Now | Evidence |
|---|---|---|---|---|
| 12 | Cartographers | map blank | **40 auto combos** | `/api/combos/auto` returned 40 ids |
| 17 | Long Kiln | live, never used | live, **correct path found** | `/api/batches` 200, `batches: 0` |
| 18 | Herald | switched off | **on** | `a2aEnabled: true`, `/api/a2a/status` `online: true` |
| 11 | Stacks | one setting away | **route gone** | `/api/context-sources` 404, `/api/settings/context-sources` 404 |
| 13 | Winnowing Floor | measured, mostly dead | **route gone** | `/api/compression` and `/api/compression/status` both 404 |
| 14 | Chancery | no token set | **route gone** | same 404s; the note vaults were reached through context sources |

⚠️ **Three departments lost their route rather than their token.** That is a different blocker from
the one written down in September, and it changes the fix: there is nothing to configure. Either
the build dropped those endpoints or they moved. **Do not spend another session hunting for a
setting to switch on** — ask whether the feature still exists in this build first.

## The 40 auto combos — the big correction

We had **five** written down (`auto`, `auto/coding`, `auto/reasoning`, `auto/vision`,
`auto/coding:reliable`). There are **forty**, and they are all model ids usable directly:

```
auto  auto/chat  auto/coding  auto/reasoning  auto/vision  auto/multimodal
auto/fast  auto/cheap  auto/smart  auto/offline  auto/lkgp  auto/chaos
auto/best-chat  auto/best-coding  auto/best-reasoning  auto/best-vision
auto/best-fast  auto/best-coding-fast  auto/best-free  auto/best-chaos
auto/pro-chat  auto/pro-coding  auto/pro-reasoning  auto/pro-vision  auto/pro-fast
auto/coding:fast  auto/coding:cheap  auto/coding:free  auto/coding:pro  auto/coding:reliable
auto/reasoning:pro
auto/claude-opus  auto/claude-sonnet
auto/glm  auto/minimax  auto/mimo  auto/zai  auto/gemma  auto/llama  auto/gemini
```

⛔ **The `:free` ban still stands** — `auto/coding:free` answered a word question with a bare
float, measured 2026-09-08. `auto/best-free` is untested and inherits the suspicion until it is not.
⚠️ **None of the other 34 has been measured.** The 12/12 result belongs to the five we knew. Treat
`auto/best-*` and `auto/pro-*` as *plausible*, and put anything that matters through the Proving
Ground before trusting it. The single-vendor ones (`auto/glm`, `auto/llama`, `auto/gemini` …) are a
vendor pool, not a quality claim.
⚠️ `/api/combos` (custom combos) is genuinely empty — `total: 0`. Nothing we built is stored there.

## 19. The Echo Wall — the request already paid for

**What it can do.** Return an answer without spending on it again: a **semantic** cache that matches
a request by meaning, and a **prompt** cache that reuses the prefix a provider already ingested.

**Measured 2026-09-08, `/api/cache`.** Semantic: 29 stored entries, **20 hits against 127 misses —
a 13.6% hit rate — and 43,600 tokens saved.** Prompt: 505 requests, 43 carrying cache-control,
14,986 tokens saved for about $0.04, broken down per provider (cline 22 cached of 54, opencode 6 of
24, kilocode 4 of 26).

**Why it matters here.** This is the only department that has already paid for itself without anyone
running it. A 13.6% hit rate is low, which is the interesting part: it means most of what we send is
genuinely new, and the saving would grow if repeat work were routed deliberately rather than by luck.

## 20. The Strongroom — keys and redaction

**What it can do.** Hold provider credentials and scrub them out of traffic that passes through.

**Measured 2026-09-08.** `/api/keys` → 2 keys, and **`allowKeyReveal: false`** — the gateway will
not print a key back, which is the setting we want and it is already correct.
`credentialRedactionEnabled: true`, `proxyEnabled: true`, `autoDisableBannedScope: "all"`,
`customBannedSignals: []`.

⛔ **Nothing in this department is ever changed, revealed or logged.** Keys live in Windows
environment variables; a key never appears in a file under `<workspace>` and never in a brief.
It is on the list because it is a real capability that is *already right*, not because there is work
to do in it.

## 21. The Bell Tower — outward calls

**What it can do.** Fire a webhook when something happens inside the gateway.

**Measured 2026-09-08.** `/api/webhooks` → 200, `total: 0`. The machinery answers; nothing is
configured. Unstaffed by choice, not by blocker.

**What it would be for.** A long batch finishing, a provider tripping its breaker, a spend
threshold — the events worth knowing about without a session sitting there polling.

## 22. The Undercroft — the gateway's own backups

**What it can do.** Keep restorable snapshots of the gateway database.

**Measured 2026-09-08.** `/api/db-backups` → 4 held, and they are **automatic**: three
`health-check-repair` snapshots at 03:55, 09:55 and 16:58 on 2026-09-08 (5.0, 5.7 and 6.2 MB, so the
database is growing), plus one `pre-migration` snapshot from 2026-09-07 at 299 KB.

**Why it is worth naming.** It is running unasked and nobody knew. It also dates the migration: the
gateway's schema changed on 2026-09-07, which is a plausible cause of the three routes that
disappeared above.

## Other measurements taken in the same pass

- **`/api/models` → 79 models**, not the 1,828 figure in the older notes — that count was
  OpenRouter's own catalog, not this gateway's. `/api/models/catalog` reports
  `catalogVersion: model-metadata-v1:static` over 20 entries.
- **`/api/providers` → 6 connections**: opencode-zen, groq, gemini, openrouter, cline, kilocode.
  Matches the roster; Cerebras is gone as expected.
- **The Proving Ground (16) is fully stocked and has still never been run.** `/api/evals` →
  **7 suites, 44 cases** (OmniRoute Golden Set 10, Codex Comparison 8, Safety & Guardrails 6,
  Coding Proficiency 5, Reasoning & Logic 5, Multilingual 5, Instruction Following 5),
  5 targets (`claude-sonnet-4-20250514`, `codex`, `gemini-2.5-flash`, `gpt-4o`, and one unnamed),
  **`recentRuns: 0`, `scorecard: null`.** With 34 unmeasured combos now known, this is the department
  with the largest gap between what it could settle and what it has settled.
- **The Gatehouse (15) is confirmed empty**: `/api/memory` 0 entries, `/api/plugins` 0,
  `/api/skills` 0 installed (5 popular defaults offered). The standing rule holds — read a manual
  when the job arrives, install nothing.
- **Still inert:** `radarEnabled: false` and every `/api/radar/*` path 404s. It accepts a write and
  never persists. Stop retrying it.
- **Switches worth knowing, off on purpose:** `claudeFastMode` (disabled; it lists Fable 5 and Opus
  5/4.8/4.7/4.6 as supported) and `codexServiceTier` (disabled). Neither has been tested here.

## What this pass did not do

No combo was benchmarked, no eval suite was run, no webhook was registered, and no setting was
changed. This was a read-only survey of what the building contains — the same rule the list was
built on. **34 of the 40 combos and both of the off switches above are named capabilities with no
measurement behind them, and they are written down as exactly that.**
