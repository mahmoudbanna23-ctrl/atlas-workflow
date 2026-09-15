# OmniRoute — capability survey, 2026-09-08

What the gateway on `http://localhost:20128` can actually do today. Every line below came from a
live call on 2026-09-08: dashboard pages read through Chrome, APIs probed from node, seats pinged
with a real completion. Nothing is estimated, and nothing on the gateway was changed.

Companion file: `compression-measured.md` (the compression claim, measured the same day).

## The catalogue — and the stale list that misreports it

- `GET /v1/models` returns **1,828 routable ids** across 24 provider prefixes. This is the live
  catalogue and the one to trust.
- `GET /api/models` — the list the dashboard shows — returns only 79, and **its `available: true`
  flags are wrong**. Every `groq/*`, `gemini/*` and `opencode-zen/*` id it marked available returned
  HTTP 400 `Model '<x>' is not available in the active live catalog` when actually called. Do not
  route from `/api/models`.
- Prefix counts from `/v1/models`: `openrouter` 1039, `aihorde` 161, `dva` 125, `opencode-zen` 108,
  `no-think` 70, `gemini` 43, `auto` 38, `aug` 28, `kc`/`kilocode` 26 each, `cxa` 26,
  `groq` 18, `cl`/`cline` 17, `zc` 13, `oc` 8, `felo` 5, the gateway's browser-session pools (seats
  that drive a consumer web UI with your cookies) — blocked, account-ban risk — 52 combined across
  three prefixes, plus a few singletons.

## The `auto/*` virtual routes — the one genuinely new capability

38 of them (`auto/best-free`, `auto/cheap`, `auto/smart`, `auto/fast`, `auto/vision`,
`auto/coding:free`, `auto/coding:cheap`, `auto/reasoning:pro`, `auto/claude-opus`, …). Each picks a
seat per request from live provider health, and reports the choice back in response headers.

Live pings, 16 max tokens, cache bypassed:

| Route | Status | Latency | Seat chosen | Reply |
|---|---|---|---|---|
| `auto/best-free` | 200 | 1147 ms | `big-pickle` | `pong` |
| `auto/fast` | 200 | 4446 ms | `anthropic/claude-opus-5` | `pong` |
| `auto/vision` | 200 | 4461 ms | `anthropic/claude-opus-5` | `pong` |
| `auto/smart` | 200 | 6282 ms | `anthropic/claude-opus-5` | `pong` |
| `auto/smart` (repeat) | 200 | 3880 ms | `openrouter` → `openai/gpt-6-astra` | `pong` |
| `auto/cheap` | 200 | 6626 ms | `openai/gpt-oss-120b` | *(empty)* |
| `auto/coding:free` | 200 | 441 ms | `openai/gpt-oss-120b` | *(empty)* |

The selection is not stable across calls — `auto/smart` chose two different providers in two
minutes. Anything depending on a specific model must name that model, not an `auto` alias.

Every response carries the decision in headers, so the choice is auditable per request:
`x-omniroute-decision` (`strategy=auto; provider=openrouter; latency_ms=2050`),
`x-omniroute-model`, `x-omniroute-provider`, `x-omniroute-response-cost`,
`x-omniroute-tokens-in/out`, `x-omniroute-combo-trace`, `x-omniroute-request-id`.

## Anthropic-shaped endpoint

`POST /v1/messages` exists and routes (it returned a provider-level 402, not a 404 — the route is
real, the seat behind it was out of credit). `POST /anthropic/v1/messages` is 404. So a client that
speaks the Anthropic API — Claude Code included — can be pointed at this gateway by base URL.

## Provider health, measured by the gateway itself

`GET /api/provider-metrics`, cumulative:

| Provider | Requests | Success | Avg latency | Last status |
|---|---|---|---|---|
| kilocode | 296 | 99% | 103 ms | 200 |
| gemini | 312 | 96% | 760 ms | 200 |
| openrouter | 307 | 94% | 742 ms | 200 |
| groq | 400 | 88% | 957 ms | 200 |
| opencode-zen | 372 | 83% | 3336 ms | 200 |
| cline | 69 | **48%** | **24 275 ms** | 401 |

All six connections are active, priority 1, backoff 0. kilocode and cline are OAuth; the rest are
API keys.

## What is out of credit — check before planning around it

- **kilocode: `[402] Add credits to continue, or switch to a free model.`** Every `kc/*` id is
  affected, including the vision and Claude ones.
- **cline: balance `-$0.39`, `All 1 connection(s) credits exhausted — please reconnect`.** Every
  `cl/*` id is affected.

That kills, for now, the whole `kc`/`cl` seat list — `claude-opus-5`, `claude-sonnet-5`,
`claude-haiku-4.5`, `gemini-3.1-pro-preview`, `gpt-5.6-*`, `qwen3.8-max`, `kimi-k3`, with vision.
They are listed as available; they do not answer. Topping either up is an owner-only step.

## Agent surfaces

- **ACP reverse execution** (`GET /api/acp/agents`) — Omni spawns a local CLI as a backend.
  Installed and spawnable: **codex 0.153.2** (`codex --quiet`) and **opencode 1.18.25**. Not
  installed: claude, gemini, goose, openclaw, aider, zcode, cline, qwen, forge, amazon-q,
  interpreter, cursor-cli, warp.
- **MCP server: off.** `GET /api/mcp/status` → `{"status":"offline","online":false,"enabled":false,
  "transport":"stdio"}`. Heartbeat file `C:\Users\<you>\.omniroute\runtime\mcp-heartbeat.json`.
  The catalogue behind it is 110 tools over 33 scopes (`src/lib/agentSkills/openapiParser.ts`).
- **Combos: none stored.** `GET /api/combos` → `{"combos":[],"total":0}`. Requests still carry an
  `x-omniroute-combo-trace` header — the `auto` strategy synthesises one per request rather than
  reading a saved combo.
- **Skills and memory stores: empty.** `/api/skills` and `/api/memory` both return 0 rows.
- **Webhooks: none.**

## Caches

`GET /api/cache`: semantic cache 20 hits / 127 misses (**13.6%**), 43,600 tokens saved, 37 in-memory
and 29 DB entries. Prompt cache: 293 requests, 142,237 input tokens, 11,370 cached, ~$0.03 saved.

## Routes that do not exist

404 on: `/api/free-tier*`, `/api/quota`, `/api/analytics*`, `/api/costs`, `/api/usage*`,
`/api/routing*`, `/api/failover`, `/api/conductor/*`, `/api/discovery`, `/api/agent-bridge/status`,
`/api/combos/templates`, `/api/logs`, `/api/call-logs`, `/api/circuit-breakers`, `/api/cli-tools`,
`/api/monitoring/providers`. `/api/rate-limit` returns 401.

The matching dashboard pages (`/dashboard/free-tiers`, `/dashboard/combos/live`, `/dashboard/quota`)
render their shell and nav only — there is no server data behind them on this install.

## Cautions

- **Unvetted relay prefixes.** Of the 1,828 ids, roughly 450 sit behind aggregators of unknown
  provenance: `aihorde`, `dva`, `no-think`, `aug`, `cxa`, `zc`, `oc`, `felo`, and the gateway's
  browser-session pools (seats that drive a consumer web UI with your cookies) — blocked,
  account-ban risk. `auto/best-free` selected `oc/big-pickle` unprompted. Treat any
  `auto/*free*` route as sending the prompt to a third party nobody here has vetted.
- **The vision seats in this catalogue do not reopen scanned material.** The workspace rule bans
  scanned, sensitive and copyrighted pages from leaving Claude because of who receives them, not
  because no remote model can see them. Local Codex remains the only vision seat for those.
- **`GET /api/providers` returns an `apiKey` field.** Never print it, never write it into any file
  under `<workspace>`, never into a brief.

---

# Second pass — read from the source, 2026-09-08

The section above was written from probed endpoints and two summary documents. It undercounted
badly. The installed package is at `%APPDATA%\npm\node_modules\omniroute` — **3,343 source files**,
`src/lib` alone holding **80+ modules**. `README.md` is 124 KB and `.env.example` 166 KB. The
earlier "404" list was mostly wrong endpoint names, not missing features.

⚠️ `~\.omniroute\.env` holds live credentials. Never opened, never to be opened.

## The real API surface

**330 distinct `/api/...` routes**, biggest areas: settings 27, v1 26, tools 23, cli-tools 19,
services 17, oauth 16, providers 15, usage 10, mcp 8, compression 8, memory 7, context 7, auth 7,
skills 6.

The areas that returned 404 on the first pass exist under different names: `/api/usage/analytics`,
`/api/usage/budget`, `/api/usage/quota`, `/api/quota/plans`, `/api/quota/pools`, `/api/quota/preview`,
`/api/budget`, `/api/context/analytics`, `/api/jobs`, `/api/evals/suites`, `/api/discovery/`,
`/api/telegram/`, `/api/playground/presets`, `/api/modality-bridge/video/extract`.

**54 `/v1/...` endpoints.** Beyond chat: `/v1/ocr`, `/v1/images/generations`, `/v1/images/edits`,
`/v1/images/upscale`, `/v1/videos/generations`, `/v1/music/generations`, `/v1/audio/speech`,
`/v1/audio/transcriptions`, `/v1/embeddings`, `/v1/multimodal-embeddings`, `/v1/rerank`,
`/v1/moderations`, `/v1/search`, `/v1/web/fetch`, `/v1/batches`, `/v1/files`, `/v1/responses`,
`/v1/messages` + `/v1/messages/count_tokens`, `/v1/runners`, `/v1/tasks`, `/v1/agents`,
`/v1/traces`, `/v1/rate-limits`, `/v1/credits`, plus a dozen named `flux-*` image models.

## Reading images — MEASURED 2026-09-08, and this is the one that matters

A synthetic 900×300 PNG was rendered locally (`System.Drawing`, no source material touched) carrying
three lines: a domain-specific data list, a weight-based value, and a citation with a planted error token.
Sent as an ordinary chat message with an `image_url` part:

| Route | Seat it chose | Latency | Transcription |
|---|---|---|---|
| `auto/vision` | `gemini/gemini-3.7-flash` | 12025 ms | exact |
| `auto/multimodal` | `gemini/gemini-3.7-flash` | 10110 ms | exact |
| `auto/best-vision` | `gemini/gemini-3.7-flash` | 5390 ms | exact |
| `auto/pro-vision` | `gemini/gemini-3.7-flash` | 4512 ms | exact |

All four returned every word byte-perfect — the value `0.6 units/kg, max 16 units`, the citation
`p.142`, and the planted token `ERR_TEST_4419`. **There is a working off-machine vision seat.**

Two caveats. Every route chose Gemini, so this rides entirely on the Gemini key — it is one seat, not
four. And the standing workspace rule still sends scanned pages to Codex only; a later permission
default would change that, but your `CLAUDE.md` and `MEMORY.md` need to be updated for it to take
effect, and until they are, the rule binds.

`/v1/ocr` itself is **not usable**: it is hardwired to Mistral (`No credentials for provider:
mistral`). The working shape, for the record, is
`POST /v1/ocr {model, document:{type:"image_url", image_url:"<data url>"}}` — the other two shapes
tried were rejected at validation. Chat-with-image is the route that works today.

## MCP tool catalogue — 45, not the 110 the README claims

`GET /api/mcp/tools` returns 45 mapped tools. By scope: compression 11, combos 7, health 5,
search 3 (`web_search`, `x_search`, `web_fetch` — the only ones that do work rather than administer
the gateway), proxies 3, agent-skill catalog 3, completions 2, usage 2, cache 2, and one each for
tools, quota, models, radar, budget, resilience, pricing-sync. Server state:
`{"status":"offline","online":false,"enabled":false,"transport":"stdio","scopesEnforced":false}`.

## A2A — live now

`/.well-known/agent-card.json` serves a valid card (also `/.well-known/agent.json`, in Chinese).
Six advertised skills: smart-routing, quota-management, provider-discovery, cost-analysis,
health-report, list-capabilities. `POST /a2a` is the endpoint (`GET` returns 405, so it is mounted).
The card advertises `http://0.0.0.0:20128/a2a` — the bind address, not a hostname.

## Gateway memory — present, off

`GET /api/settings/memory` → `{"enabled":false,"maxTokens":2000,"retentionDays":30,
"strategy":"hybrid","skillsEnabled":true,"primaryBackend":"sqlite","vectorStore":"auto"}`.

## Live settings worth knowing

`GET /api/settings`: `comboStrategy:"fallback"`, `requestRetry:3`, `maxRetryIntervalSec:30`,
`stickyRoundRobinLimit:3`, `promptCacheAffinityEnabled:true`, `requireLogin:true`,
`cloudEnabled:true`, `tailscaleEnabled:false`, `oidcEnabled:false`.

**Correction to the first pass:** an unauthenticated `GET /v1/models` returns **401**, not 200. The
gateway does require a key. It binds to `0.0.0.0` (confirmed by `netstat`, PID 16608), so it is
reachable across the network, but not open to anyone without the key.

## Not yet examined — named so nobody assumes they were

`src/lib` modules never opened: `localCorpus`, `obsidian`, `notion`, `telegram`, `jobs`,
`jobRegistry`, `batches`, `evals`, `routerEval`, `guardrails`, `inspector`, `issueAgent`,
`playground`, `plugins`, `gamification`, `chaos`, `discovery`, `cloudAgent`, `copilot`, `cursor`,
`vscode`, `zed-oauth`, `vncSession`, `warmupScheduler`, `spend`, `radar`, `reasoningRouting`,
`translator`, `search`, `security`, `compliance`, `mitm`. `localCorpus` and `obsidian` look directly
relevant to the example project and should be read before the next build session.
