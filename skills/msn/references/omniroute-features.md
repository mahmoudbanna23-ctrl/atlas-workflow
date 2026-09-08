# OmniRoute (v3.8.50) — Feature Map

Built 2026-09-07 from two local files only: `omniroute\README.md` (1,672 lines)
and `omniroute\.env.example` (3,035 lines, 27 numbered sections). No `.env` or
`~\.omniroute\` files opened (live keys). Every fact cites a line range. "Not
found" means the sources don't say it — never a guess. Dashboard:
`http://localhost:20128` (`PORT=20128`, README L86-90, L945).

## OMNIPROXY
Routes OmniRoute's outbound provider calls through a proxy, and disguises TLS
fingerprint (JA3/JA4 via `wreq-js`) so traffic looks like a normal browser, not a
bot — "3-level proxy" + "TLS stealth" (README L1212, L224, L1101). Doc:
`docs/ops/PROXY_GUIDE.md` (L1267).
**Keys** (.env.example §8 L710-757, §21 L2068-2130): `ENABLE_SOCKS5_PROXY`,
`HTTP_PROXY`/`HTTPS_PROXY`/`ALL_PROXY`, `SOCKS_HANDSHAKE_TIMEOUT_MS`,
`PROXY_FAIL_OPEN`, `ENABLE_TLS_FINGERPRINT`, `PROXY_HEALTH_ENABLED`,
`PROXY_AUTO_REMOVE`.
**Free/local:** yes — direct connection is default; a proxy *pool* (1proxy
marketplace) is an external paid add-on if used.

## ANALYTICS
Live usage/quota/token-savings/p95-latency numbers on the dashboard (README L224);
free-tier budget page at `/dashboard/free-tiers` (L20-24).
**Keys:** not found as a dedicated block — fed by `CALL_LOG_*` and
`PROVIDER_LIMITS_SYNC_*` (see MONITORING). No separate on/off switch found.
**Free/local:** yes, local SQLite call log — no external service.

## COSTS
Estimates USD cost per request (even for $0 subscription providers, for
comparison) and can route to the cheapest eligible provider: `cost-optimized`
routing strategy (README L419-421). "Honest flat-rate cost" — subscription/
coding-plan providers read **$0** in cost analytics; budget/quota/routing still
estimate (L549, L1234). `X-OmniRoute-*` cost/usage headers on every response,
cache-HIT savings header, **per-key USD spend quotas** (L551) — that quota is a
Dashboard per-key setting, not found as an env var.
**Keys:** `OMNIROUTE_BUDGET_RESET_JOB_INTERVAL_MS` (600000ms default, L979-980),
`PRICING_SYNC_ENABLED`/`_SOURCES` (§18 L1813-1823, default OFF).
**Free/local:** tracking is free/local; spend depends on which provider tier you
route to (Tier 1 Subscription → Tier 4 Free, L228).

## MONITORING
Health checks, live request stream, structured logs. `omniroute doctor` —
"diagnose providers, ports, native deps" (README L791). Health endpoint:
`OMNIROUTE_HEALTHCHECK_PATH=/api/monitoring/health` (.env.example L142-145).
**Keys:** `LIVE_WS_PORT`, `LIVE_WS_HOST`, `CREDENTIAL_HEALTH_CHECK_INTERVAL`
(§3 L215-260); `APP_LOG_LEVEL`, `APP_LOG_RETENTION_DAYS`,
`CALL_LOG_RETENTION_DAYS`, `ENABLE_REQUEST_LOGS` (§16 L1647-1738).
**Free/local:** yes — all local SQLite/process state, no external service.

## AGENTIC FEATURES
Lets an AI agent control OmniRoute itself (not just chat through it) via protocol,
plus gives OmniRoute its own memory and sandboxed skill execution: MCP server (110
tools, stdio/HTTP/SSE, 33 scopes, README L817-833), A2A (agent-to-agent JSON-RPC
2.0 + SSE, 6 skills, L822), OmniConductor (delegates to your own agent fleet +
voice panel, L545), Memory (off by default, opt-in int8 vector embeddings + typed
decay, per-request `x-omniroute-no-memory` opt-out, L556/.env L2663-2677), Skills
sandbox (isolated container: docker/apple/wsl/orbstack/podman, .env L330-333,
§24 L2543-2557).
**Keys:** `OMNIROUTE_MCP_ENFORCE_SCOPES`, `OMNIROUTE_MCP_SCOPES` (admin, combos,
health, models, routing, budget, metrics, pricing, memory, skills — L888-897),
`MEMORY_TYPED_DECAY_ENABLED` (default off — "the sweep DELETES decayed
memories", L2672-2676), `SKILLS_SANDBOX_NETWORK_ENABLED` (default 0).
**Free/local:** MCP/A2A/memory run local; skills sandbox needs a local container
runtime, no paid service found required.

## OTHER FEATURES
Combos/routing — auto-routes across a model chain, 19 strategies (priority,
weighted, round-robin, cost-optimized, fusion, pipeline… L342-436) plus
zero-config `auto`/`auto/coding`/`auto/fast`/`auto/cheap`/`auto/offline`/
`auto/smart` (L325-337). 352 AI providers, 154 catalog-marked free, one `/v1`
endpoint compatible with OpenAI/Claude/Gemini/Responses (L645-653). Media
generation — one API for image/video/audio (Grok Imagine, Novita AI, ComfyUI,
Freepik, Firefly, EdgeTTS…), plus `/v1/ocr`, `/v1/audio/translations` (L554-555).
35 CLI/agent integrations (Claude Code, Cursor, Cline, Codex, Aider, Goose,
OpenCode, Qwen Code, Gemini CLI, VS Code Copilot Chat — L570-633, L739-762).
Remote mode — drive a VPS OmniRoute from a local CLI via scoped tokens (L795-816).
Webhooks — push usage/quota/error/routing events to your URL (L822). 43-language
UI (L133-186). Free-tier tracking: 455 cataloged entries, ~1.51B free tokens/month
steady, up to ~2.13B first month with signup credits (L16-24).
**Free/local:** mixed by design — individual providers behind combos may be free,
subscription, or pay-per-token.

## CONFIGURATION
`.env` (mirrored by Dashboard → Settings) governs almost everything — 27 sections
covering secrets, storage/DB, network/ports, security/auth, PII sanitization,
routing policy, cloud sync, outbound proxy, CLI/agent/MCP integration, OAuth
creds, fingerprinting, timeouts, logging, memory, pricing/model sync, proxy
health, debugging, quotas/tunnels/skills, tests, radar feed, v3.8.50 additions.
Full reference: `docs/reference/ENVIRONMENT.md` (README L1245). **Required
secrets before first run** (.env L10-27): `JWT_SECRET`, `API_KEY_SECRET`,
`INITIAL_PASSWORD` (default `CHANGEME` — change it).
**Free/local:** the gateway is free/local, MIT-licensed, self-hostable (L1659, L780).

## (a) TOKEN COMPRESSION — claimed savings, engines, switch, caveats

**Headline:** "Save 15–95% Tokens — Automatically" (README L843).
**Default stacked combo `RTK → Caveman`**, exact quoted formula (L870-874):
```
combined = 1 − (1 − RTK) × (1 − Caveman_input)
average  = 1 − (1 − 0.80) × (1 − 0.46) = 89.2%   (range 78.4–94.6%)
```
RTK alone ~80%, Caveman on input ~46%. **Preset savings** (L901-911):

| Mode | Savings | Best for |
|---|---|---|
| Lite | ~15% | Always-on safe default |
| Standard (Caveman) | ~30% | Daily coding |
| Aggressive | ~50% | Long tool-heavy sessions |
| Ultra | ~75% | Maximum savings |
| RTK | 60–90% | Shell/test/build/git output |
| Stacked (RTK→Caveman) | **78–95%** | Mixed prompts + tool logs |

Worked example, Standard mode (L913-916): 69 tokens → 19 tokens = "72% fewer
tokens. Zero accuracy loss."
**12-engine pipeline order** (L863-887): Session-Dedup, CCR, Lite, RTK, Responses
Tool Output, Headroom (~30%, lossless GCF codec), Relevance, Caveman (~65–75% on
output prose), Aggressive, LLMLingua-2 (MobileBERT ONNX), Ultra (heuristic +
small-model tier), OmniGlyph (experimental context-as-image, opt-in, most
aggressive).

**Switch-on:** transparent by default, no client changes (L879). Precedence
high→low (L926): per-request `x-omniroute-compression` header › combo override ›
named profile › adaptive/auto-trigger › panel default › off. Plan echoes in
`X-OmniRoute-Compression: <mode>; source=<source>` response header.

**Caveats stated in source:** code/URLs/JSON/structured data "always
protected/preserved byte-perfect" (L876, L897). "Explicit lossy or experimental
modes may transform eligible content" — OmniGlyph named experimental/opt-in
(L847, L887). Opt-in offline eval harness (`npm run eval:compression`) scores
fidelity vs. savings "before you promote a change" (L930) — implies compression
can affect fidelity. v3.8.x added a "default-on inflation guard" (L546) —
implies compression could previously enlarge some payloads.

## (b) FAILOVER / COMBOS — timeout, retry, cooldown

**Earlier grep was wrong for this package** — §15 "TIMEOUT SETTINGS"
(.env.example L1422-1647) has exactly these:

| Key | Default | Bounds |
|---|---|---|
| `FETCH_TIMEOUT_MS` | 600000 (10min) | Total upstream provider call |
| `FETCH_CONNECT_TIMEOUT_MS` | 30000 | TCP connect |
| `OMNIROUTE_DIRECT_HEADERS_TIMEOUT_MS` | 30000 | Response-start per direct attempt; retries once on expiry |
| `OMNIROUTE_PROVIDER_PROBE_TIMEOUT_MS` | 8000 | Credential validation/model-discovery only — raise if Cerebras/Cloudflare AI/Groq flap active/error |
| `OMNIROUTE_RELAY_FETCH_TIMEOUT_MS` | 25000 (cap 29000) | Relay/proxy fetch, fires before client's ~30s timeout |
| `OMNIROUTE_RETRY_BACKOFF_MS` | 10 | Shared retry-once backoff |

**Circuit breakers, per-key** (L1583-1591): OAuth threshold 8/reset 60000ms ·
API-key threshold 12/reset 30000ms · local threshold 2/reset 15000ms.
**Provider-level breaker/cooldown, whole-provider fuse** (L1593-1610): OAuth
threshold 10/900000ms window/cooldown 300000ms · API-key threshold 15/1800000ms
window/cooldown 600000ms · local threshold 2/300000ms window/cooldown 60000ms.
(README's prose version, L450-456, gives slightly different round numbers —
10×/15×/2× trips, 60s/30s/15s resets; .env.example values above are settable.)

**Emergency fallback:** `OMNIROUTE_EMERGENCY_FALLBACK` (default true) reroutes to
`nvidia/openai/gpt-oss-120b` on a 402 budget error (L985-987). **Combos:**
ordered/scored provider chains, 19 strategies; `auto` scores 15 live factors incl.
health/latency (L438-440) — full list under OTHER FEATURES.

**Direct answer on the stall:** `FETCH_TIMEOUT_MS` (10min default) is the ceiling
for a normal chat call; `OMNIROUTE_PROVIDER_PROBE_TIMEOUT_MS` (8s) and
`OMNIROUTE_RELAY_FETCH_TIMEOUT_MS` (25s) are tighter but path-specific
(validation-only/relay-only). **Not found:** a `<PROVIDER>_TIMEOUT_MS` override
keyed by provider name for ordinary chat calls — only global/path-specific
timeouts exist. A 25-40s hang on the main chat path runs under
`FETCH_TIMEOUT_MS`/`OMNIROUTE_DIRECT_HEADERS_TIMEOUT_MS` and the circuit-breaker
thresholds above, not a per-provider knob.

## (c) SECURITY / BINDING

**Bind host/port:** `PORT` default `20128` (L110-116). `HOST` default `0.0.0.0`
per comment (all interfaces unless changed); `OMNIROUTE_SERVER_HOST` overrides
for `omniroute serve`; `HOSTNAME` explicitly warned against — shell-reserved,
won't work (L296-306). `LIVE_WS_HOST` default `127.0.0.1` (loopback), needs
`LIVE_WS_ALLOWED_ORIGINS` if opened to `0.0.0.0` (L184-186). Split-port mode:
`API_PORT`/`API_HOST`/`DASHBOARD_PORT` (L154-158).

**API-key enforcement:** `REQUIRE_API_KEY` default `false` — "Set true for
multi-user/public deployments" (L354-357). `ALLOW_API_KEY_REVEAL` default `false`
— "Security risk if enabled on shared instances" (L359-362). `AUTH_COOKIE_SECURE`
default `false` — "MUST be true in any non-localhost deployment" (L350-353).

**Network-exposure controls found:** `HOST=0.0.0.0` + `REQUIRE_API_KEY=false` are
both defaults — sources don't name this combination as a risk in prose; flagging
the inference, not the source's claim. SSRF guard:
`OMNIROUTE_ALLOW_PRIVATE_PROVIDER_URLS` (default false),
`OUTBOUND_SSRF_GUARD_ENABLED` (default true) — always blocks cloud-metadata IPs
regardless (L458-478). CORS: `CORS_ALLOWED_ORIGINS`, `CORS_ALLOW_ALL` (default
false, no wildcard sent unless true, L451-456). Optional OIDC SSO gate for
dashboard; password login "always stays available" unless explicitly disabled
(README L558). Credentials encrypted at rest: AES-256-GCM (`API_KEY_SECRET`,
`STORAGE_ENCRYPTION_KEY`, L18-27, L74-78). Guardrails: prompt-injection guard on
every LLM route (`INPUT_SANITIZER_ENABLED`), opt-in PII redaction
(`PII_REDACTION_ENABLED`, default false), opt-in credential-masking
(`CREDENTIAL_REDACTION_ENABLED`, default false) (§5 L490-533).

**Not found:** a bundled "safe to expose on LAN/internet" checklist — each
control above is documented independently, not as one hardening guide.
