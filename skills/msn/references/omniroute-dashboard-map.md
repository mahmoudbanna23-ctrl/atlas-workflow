# OmniRoute dashboard — the full map, 2026-09-08

Every page of the local gateway at `http://localhost:20128`, surveyed page by page in the owner's
signed-in Chrome, then cross-checked against the gateway's own API. Written so the app never has to
be browsed again.

**Method and its limit.** Six agents walked all 101 dashboard routes found in the installed package
(`grep '"/dashboard/…"'` over `src`, `open-sse`, `bin`). The dashboard renders client-side, and most
data-heavy pages were still showing `Loading…` after a 10-second wait — so the browser pass is
reliable for *what each page is and what controls it offers*, and unreliable for *live values*. Live
values below come from a direct probe of the 160 `/api` routes the source references (63 answered
200). Where the two disagree, the API wins.

---

## What the gateway actually holds, measured

| | |
|---|---|
| Version | 3.8.50, build `dea6bb8`, Node v26.7.0, PID 16608, up 23 h |
| Routable model ids | **1,829** (`/api/v1/models`) |
| Connected seats | **6** |
| Combos defined | 0 |
| Lifetime traffic | 360 requests · 315,356 prompt + 186,948 completion tokens · **$0.0073 total** |
| Semantic cache | 37 in memory, 29 on disk, 20 hits / 127 misses (13.6%), 43,600 tokens saved |
| Provider prompt cache | 14,026 tokens saved, ≈$0.04 |
| MCP | **disabled** |
| A2A | **disabled** |
| Compression master switch | **off** |

### The six connected seats and their measured health

| Seat | Auth | Success | Avg latency | Requests | Last status |
|---|---|---|---|---|---|
| `gemini` | api key | 96% | 819 ms | 328 | 200 |
| `kilocode` | OAuth | 96% | **181 ms** | 319 | 200 |
| `openrouter` | api key | 94% | 795 ms | 330 | 200 |
| `groq` | api key | 88% | 937 ms | 419 | 200 |
| `opencode-zen` | api key | 83% | 3,265 ms | 384 | 200 |
| `cline` | OAuth | **46%** | 23,599 ms | 71 | **401** |

⚠️ **Correction to the earlier note in `roster.md`.** Kilocode is *not* uniformly dead: at gateway
level it is the fastest and joint-healthiest seat, quota reads 100% remaining, and its last call
returned 200. The `402 Add credits` seen earlier was per-model, not per-provider. **Cline is the
seat actually in trouble** — 46% success, 401 on its last call, 23-second average. Treat `cl/*` ids
as unreliable and prefer `kc/*` over them.

Quota endpoint reports 100% remaining on every seat except Groq (1 of 1000 used).

### Catalogue by provider — where the 1,829 ids come from

openrouter 1081 · aihorde 161 · devin-cli-agentic 137 · opencode-zen 116 · kilocode 58 · gemini 43 ·
combo 38 (the `auto/*` aliases) · cline 36 · auggie 28 · theoldllm 26 · codex-app-server 26 ·
cloudflare-playground 20 · groq 18 · zcode 13 · opencode 8 · duckduckgo-web 6 · felo-web 5 ·
veoaifree-web 4 · uncloseai 3 · chipotle 1.

---

## The compression engine — 15 engines, all but one off

`/api/compression/engines` lists **15**, not the 12 the settings object tracks. Three are present in
the engine registry but absent from the settings toggles: `ionizer`, `llm`, `read-lifecycle`.

| Engine | Priority | What it does |
|---|---|---|
| `session-dedup` | 3 | Content-addressed cross-turn dedup; repeated blocks become short markers |
| `ccr` | 4 | Replaces large blocks with retrieve markers; original fetched back via an MCP tool. Principal-scoped |
| `lite` | 5 | Whitespace, tool-result and image-URL reduction |
| `read-lifecycle` | 5 | **Collapses superseded file-Reads** — re-read the same path and earlier Reads become stubs. Opt-in, default off |
| `rtk` | 10 | Command-aware tool-output compression with declarative filters |
| `codex-responses` | 12 | Lossless-first compression for Responses-API tool output |
| `ionizer` | 13 | Lossy sampling of oversized JSON arrays; keeps schema + error rows + first/last + a seeded middle sample, full array recoverable from CCR |
| `headroom` | 15 | **Lossless** columnar compaction of homogeneous JSON arrays, with `[N rows]` audit markers |
| `relevance` | 18 | Extractive sentence scoring against the last user query |
| `caveman` | 20 | Rule-based message compression with preservation and validation |
| `aggressive` | 30 | Summarisation, tool-result compression, progressive aging |
| `llmlingua` | 35 | Semantic pruning via LLMLingua-2 ONNX in a worker thread; TinyBERT 57 MB lazily downloaded. Fail-opens |
| `llm` | 38 | Opt-in LLM-tier compression through a pluggable chat backend. No-op until a backend is wired |
| `ultra` | 40 | Heuristic pruning with optional local SLM fallback |
| `omniglyph` | 90 | Context-as-image for Claude Fable 5 on the direct route |

**Current state:** master `enabled:false`, `defaultMode:"off"`, `autoTriggerTokens:0`. Only
`caveman` is flagged on, at level `lite` — and the master switch makes that inert. A stacked
pipeline is **defined but not running**: `rtk` at `standard`, then `caveman` at `full`.
`preserveSystemPrompt: always`. `mcpDescriptionCompressionEnabled: true`.

`/dashboard/compression/studio` offers per-layer testing with a **"Verify fidelity (reject any layer
that corrupts content)"** gate, a fuzzy-dedup option, a sensitive-content risk gate, "QuantumLock"
cache-prefix stabilisation, and a saliency heatmap. `/dashboard/compression/exclusions` takes
wildcard patterns (`openai/*`, `*embedding*`) that pass a request through byte-identical.

**OmniGlyph's own page claims** ~10× fewer tokens and 59–70% end-to-end saving measured, with a
worked example of 254 text tokens rendering to 84. It says only the Claude Fable 5 path is enabled;
GPT-5.6 is structurally supported but held pending a provider fidelity receipt. ⚠️ This is the
app's claim on its own page, **not** something measured here — and the README's stacked claim did
not survive measurement (see `compression-measured.md`). Treat it as a lead, not a number.

---

## Capabilities found that were not previously known

**Media generation** (`/dashboard/cache/media`) — image, video, music, text-to-speech and
transcription, with 43 / 25 / 7 / 25 / 18 providers respectively. Endpoints
`POST /api/v1/images|videos|music/generations`, `/api/v1/audio/speech`, `/api/v1/audio/transcriptions`.
Firefly models need an `adobe-firefly` key.

**Batch API** (`/dashboard/batch`) — asynchronous bulk requests at a stated **50% discount**, 24-hour
window, 30-day retention, JSONL in and out. Currently empty.

**33 browser-session providers** (`/api/vnc-session`) — the gateway can drive web UIs through the
owner's own logged-in cookies rather than an API key: `chatgpt-web`, `claude-web`, `gemini-web`,
`grok-web`, `perplexity-web`, `poe-web`, `huggingchat`, `kimi-web`, `qwen-web`, `lmarena`,
`notion-web`, `adobe-firefly` and 21 more. **No sessions are active.** ⚠️ Using a consumer web UI
through automation is against most of those services' terms; this stays off unless the owner
decides otherwise, per seat.

**AgentBridge** (`/dashboard/tools/agent-bridge`) — an HTTPS intercept on port 443 for 10 IDE
agents, **Claude Code among them**. Server stopped, no certificate generated (`exists:false`),
diagnose reports unhealthy. Paired with `/dashboard/tools/traffic-inspector` (HAR export, three
capture modes, 0/10000 captured, not recording).

**Conductor** (`/dashboard/conductor`) — a CLI-agent fleet hub with a chat and *voice* front end
called Faro, with speech-to-text and text-to-speech model pickers. Says destructive commands ask
for confirmation. Runners and task list never loaded.

**Provider Discovery** (`/dashboard/discovery`) — scans a named provider for free or unlimited
access routes. Explicitly loopback-only and opt-in. Not run.

**Quota Share** (`/dashboard/costs/quota-share`) — pools one provider's quota across API keys with
percentage allocations, callable as `qtSd/<group>/<provider>/<model>`. Marked **Beta, bugs
expected**. 0 pools.

**Token economy** (`/dashboard/tokens`) — send tokens to another key, create invite codes, redeem
codes, connect community servers. Balance 0, nothing connected.

**Ollama-compatible surface** — `/api/tags` answers with an Ollama-shaped model list, so tools that
speak Ollama can point here.

**Scheduled jobs** (`/api/jobs`) — `budget_reset` every 10 min (on, last run succeeded),
`token_health_check` every 60 s (on, succeeded), `warmup` at 07:00 daily (**off, never run**).

**Reasoning routing rules** (`/dashboard/settings/routing`) — per-scope rules that rewrite reasoning
effort (`none/low/medium/high/xhigh/max/ultra`) by API key, combo, model or connection. **0 rules
configured.** The same page offers 19 routing strategies: Priority, Weighted, Round Robin, Context
Relay, Fill First, P2C, Random, Least Used, Cost Opt, Reset-Aware RR, reset-window, headroom, Strict
Random, Auto Combo, LKGP Mode, Context Optimized, Cache Optimized, fusion, pipeline.

**AI settings** (`/dashboard/settings/ai`) — thinking-budget mode (Passthrough / Auto-strip / Custom
/ **Adaptive**), global system prompt toggle, `previous_response_id` handling, usage token buffer
(2000), Codex Fast Tier, Codex Quota Auto-Ping, Claude Fast Mode, and auto-sync of the model
database from models.dev.

**Security** (`/dashboard/settings/security`) — `requireLogin: true` (confirmed), IP access control
(off / blacklist / whitelist / whitelist-priority), brute-force protection, CORS origin list, and
individual **block** buttons for 100+ providers including Claude Code.

**Database maintenance** (`/dashboard/settings/general`) — export/import of the whole SQLite store
(`~/.omniroute/storage.sqlite`), tar.gz export, JSON export, manual VACUUM, log purges, usage reset,
backup now. **No backup has ever been taken.** Auto-backup is off. Retention: call logs 90 d, usage
history 365 d, memory 180 d, most audit tables 30 d, auto-cleanup on.

---

## Page inventory — 101 routes

Grouped by what they are for. "empty" means the feature exists and holds no data.

**Landing and account.** `/dashboard/` (redirects to `/home`) · `profile` · `onboarding` ·
`leaderboard` (All Time / Weekly / Monthly / Tokens Shared) · `changelog` (News / Changelogs) ·
`tokens` (token economy, balance 0).

**Providers and models.** `providers` (6 connections) · `providers/services` (embedded local
services, empty) · `provider-stats` · `radar` ("free model catalog enriched with community
intelligence") · `free-provider-rankings` (ranked by Arena ELO; filters for No Signup / OAuth Login
/ API Key, and by Coding / Review / Documentation / Debugging) · `free-tiers` (empty) ·
`pricing` **404** · `costs/pricing` (per-token custom pricing) · `quota` · `costs/quota-share`.

**Routing.** `combos` (0) · `combos/live` (Combo Studio, live cascade view) · `endpoint` ·
`api-endpoints` · `api-manager` (1 key, named "Claumni", reveal disabled) · `translator`
(OpenAI ↔ Claude ↔ Gemini format conversion) · `playground`.

**Compression.** `context/settings` plus one page per engine: `lite` · `caveman` · `aggressive` ·
`ultra` · `rtk` · `ccr` · `headroom` · `llmlingua` · `omniglyph` · `session-dedup` · `combos`
(compression pipelines, distinct from routing combos) · `compression/studio` ·
`compression/exclusions` · `analytics/compression`.
The Caveman page reports **0 requests, 0 tokens saved** and states the master switch is off. The RTK
page reports **0 filters active, 0% average saving**, and can mine raw output to *suggest* new
filters for review. The compression-combos page lists 12 engines as pipeline steps and has no combo
saved.

**Analytics and monitoring.** `analytics` (Overview / Evals / Search / Utilization / Combo Health /
Cache Health / Route Trace) · `analytics/combo-health` · `analytics/evals` · `analytics/search` ·
`analytics/utilization` · `health` · `runtime` (three-layer resilience: provider circuit breakers,
connection cooldowns, model lockouts — all 0, "100% providers healthy") · `resilience/connections`
(6 connections, all healthy, 0 cooling) · `resilience` **404** · `activity` (filter by Providers /
Combos / API Keys / Settings / Quota / Auth / System) · `logs` · `logs/console` (0 entries) ·
`logs/proxy` (0 total) · `logs/timeline` · `conversations` · `cache` (Prompt Cache / Semantic Cache
/ **Reasoning Replay**) · `cache/media` (the generation studio) · `costs` · `costs/budget` ·
`provider-stats` · `evals` **404** · `cost` **404** · `tunnels` **404**.

**Agentic.** `acp-agents` = `agents` (15 agents defined, **2 installed**: Codex CLI 0.153.2 and
OpenCode 1.18.25; not installed: claude, gemini, goose, openclaw, aider, zcode, cline, qwen, forge,
amazon-q, interpreter, cursor-cli, warp) · `cli-agents` (9 visible, "You → CLI Agent → OmniRoute →
Provider") · `cli-code` = `cli-tools` (writes Codex and Claude Code profile files; **auto-sync off**,
and it only writes profiles, never changes the active config) · `cloud-agents` · `conductor` ·
`mcp` (**disabled**, "37 tools across 13 scopes, 3 transports") · `a2a` (**disabled**) ·
`agent-skills` (outbound SKILL.md vs inbound Omni Skills; MCP URL `/api/mcp/sse`, agent card
`/.well-known/agent.json`) · `omni-skills` = `skills` · `search-tools` (Search / Scrape / Compare /
Rerank, provider **"Auto (cheapest)"**) · `chaos` (Chaos Mode) · `discovery` · `batch` ·
`batch/files` · `memory` (semantic search + FTS5, empty) · `plugins` (0) · `webhooks` (0; 10 s
timeout, 5 retries with exponential backoff).

**Audit.** `audit` (0 of 0 events; filters by event type, actor, severity, date; export) ·
`audit/mcp` (0) · `audit/a2a` (0).

**Infrastructure.** `system/proxy` (no global proxy; per-key assignment available; bulk healthcheck)
· `tools/agent-bridge` · `tools/traffic-inspector` · `runtime`.

**Settings.** `settings` · `general` (database) · `routing` · `ai` · `cache` (catalog TTL, currently
60,000 ms) · `resilience` · `security` · `advanced` (payload rules, request limits, proxy API) ·
`feature-flags` · `modality-bridge` (vision settings, moved here from AI settings) ·
`access-tokens` · `appearance` · `sidebar`.

---

## What is worth switching on, and what is not

**Worth trying, cheap to reverse:**
- `read-lifecycle` — collapsing superseded file-Reads targets exactly the workspace's measured
  problem (context regrowing every step). Opt-in, lossy, and **not exposed in the settings toggles**,
  so it would have to be enabled through the API or the studio.
- `headroom` — lossless, with audit markers. The safest of the large-saving engines.
- The `warmup` job at 07:00, currently off.
- A backup. The database has never been backed up and holds every credential the gateway proxies.

**Do not switch on without a measurement first:**
- Anything under the compression master switch. `compression-measured.md` records RTK keeping 30
  noise lines and dropping the failing test line at 82% "saving".
- OmniGlyph. Its own page claims 59–70%; nothing here has verified it.

**Owner-only or off-limits:**
- The 33 browser-session providers — terms-of-service exposure on the owner's own accounts.
- AgentBridge — it intercepts Claude Code's own HTTPS traffic and needs a trusted root certificate.
- Provider Discovery scans.
- `~/.omniroute/.env` (166.3 KB of live credentials) and the `apiKey` field on `/api/providers`.
  Never opened, never printed, never written under `<workspace>`.

---

## Known gaps in this survey

Honest list of what was not established:

- Live values for ~30 data-heavy pages. They never finished rendering inside a 10-second wait while
  several agents shared one browser. The API probe covers most of the same state; where it does not
  (`radar`, `free-provider-rankings`, `provider-stats`, `health`, `omni-skills`, `translator`,
  `discovery`, the per-engine context pages), **the current values are simply unknown**.
- 97 of the 160 API routes did not answer 200 — mostly 404 on directory-style paths and 405 on
  POST-only endpoints. That is expected, not a fault.
- Nothing was clicked. Every toggle state above is as-found.
- `/dashboard/settings/access-tokens` was surveyed under a rule not to transcribe secret values, and
  returned nothing readable.
