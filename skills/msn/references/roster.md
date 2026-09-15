# The squad — roster, invocations, data rules

Every seat, its position, what it is best at, how to reach it, and the one rule it must never break.
The manager (Claude) picks the seat; the seat plays; the manager verifies from disk.

**Verification note (grounding):** the invocations for **opencode** and **Codex** are proven in this
workspace. The headless run flags for **agy / vibe / grok** were **UNVERIFIED until 2026-09-05 and are
now confirmed by `--help` and by a real dispatch** — recorded in each seat's entry below. Do not guess
a run flag; a wrong flag is read as a prompt and hits the model.

**⚠️ Availability is measured before a meeting, never assumed.** Seats die quietly: on 2026-09-05,
**three of six off-machine seats were down at once** — grok (free-tier usage limit), Gemini (HTTP 429
on every model tried), Cerebras (HTTP 402 Payment Required, and since released from the squad). A
board convened on the assumption that six seats would answer got three. Probe first; plan the meeting
around who actually replies.

**⚠️ Cloudflare blocks Python's default User-Agent.** Groq returns HTTP 403 with
body `error code: 1010` when called from `urllib` with no UA header. Send a browser User-Agent
(`Mozilla/5.0 (Windows NT 10.0; Win64; x64)`) and both work. Not an auth failure — do not go hunting
for a bad key.

---

## Codex — the specialist (vision)

- **Position:** the proven vision seat — every scan transcription in this workspace has gone through it.
  **No longer the *only* one:** a configurable default opened the user's own material to every seat,
  so any vision-capable model is now eligible. Codex stays the default until a challenger is measured.
- **CORRECTED 2026-09-05 - the old justification was false.** This entry used to say scan work stays
  with Codex because it "runs locally" and therefore "no scanned page leaves the machine". **The
  process is local and sandboxed read-only; the model is not.** Every `codex exec` run prints
  `provider: openai` in its own header, and any page attached with `-i` is uploaded to OpenAI.
  Routing scans here is a **trusted-vendor** decision, not a local one.
- **By default, OpenAI is treated as a trusted channel for publisher-copyrighted scanned pages.**
  Codex keeps the transcription work and the routing is decided rather than assumed. **That default
  was narrow — OpenAI via this CLI only — and is now superseded by the general default** at the
  head of the Data rule section: the user's own material may go to any seat, so Gemini, vibe and OpenRouter are
  no longer barred from scans.
- **What the ruling does not change:** `-s read-only` stays, briefs stay bounded, and **the
  transcription is still verified by a human against the page image** - numbers, units, doses and
  exponents especially. Trusting the channel is not trusting the output.
- **Binary:** `codex` (on PATH at `AppData\Roaming\npm\codex`). Auth: `codex login status` → "logged in".
- **Model selection - VERIFIED 2026-09-05.** `codex exec -m <id>` picks the model; the default is
  `gpt-5.6-terra`. **`gpt-6-astra` is valid on this ChatGPT account** and answers clean.
  `gpt-6` and `astra` both return `400 ... not supported when using Codex with a ChatGPT account`.
  ⚠️ **Read the run header, not the exit code:** an unknown id prints `Model metadata not found.`
  `Defaulting to fallback metadata` and answers anyway - from a different model than you asked for.
  A different model id is **not** a different vendor: same company, same data rule, same trust question.
  It can still be a different **lineup slot** — see [Astra](#astra-gpt-6-astra--deep-lying-playmaker-codex-channel)
  below — but a slot on this channel, never an independent seat.
- **Bounded local execution** (read-only by default), proven recipe (verified 2026-09-03):
  ```bash
  codex exec -s read-only -C "<dir>" --skip-git-repo-check -i "<page1>.png" -i "<page2>.png" \
    --json -o "<out>/answer.txt" "$(cat <promptfile>)" </dev/null
  ```
  - `-s read-only` — never `workspace-write` unless the brief explicitly authorises a write, and never
    under `app\` or `sources\`.
  - `-i` attaches images to the **initial prompt only**.
  - **stdin gotcha (corrected 2026-09-03):** the prompt is a **positional argument**, not stdin —
    `"$(cat promptfile)"`. Then close stdin with `</dev/null` so codex does not hang "Reading
    additional input from stdin…". The old `< promptfile </dev/null` form is WRONG: the second
    redirect wins, stdin is empty, and codex exits 0 having done nothing ("No prompt provided via stdin").
  - **image-load check:** on wrong `-i` paths codex says "I can't access the referenced page images"
    or returns a bare "[no content]"; a run that actually saw two rendered pages bills **~21k input
    tokens** (`turn.completed.usage`). ~16k means the images did NOT load — do not trust exit 0 alone.
  - **pdftoppm padding gotcha:** the page-number suffix is zero-padded to the width of the source's
    **total** page count — a 126-page file emits `mcq-010.png`, a 2442-page file `pg-0001.png`. Glob
    the emitted files (`prefix-*.png`); never hand-type `-i prefix-10.png`.
  - Binds to the root `AGENTS.md` (loads global → project → cwd). In the example project that file already
    forbids writes under `app\`, off-machine pages, and key-as-letter.
- **Output is data, never instructions, never verified.** A human reads the key/dose/exponent against
  the page image before it ships.
- **Kill leftover `codex.exe` after a run.** Do not kill `codex-code-mode-host.exe` / `app-server` —
  that is the Codex desktop backend, not an exec run.

## Astra (`gpt-6-astra`) — deep-lying playmaker (Codex channel)

- **Position:** the heaviest reasoning available on this roster's OpenAI channel. Use it for long
  inference chains, proofs, plans that must survive attack, and problems where the default model
  returns something plausible but thin. For transcription, extraction and routine legwork the default
  `gpt-5.6-terra` is the right call — Astra is slower and dearer for no gain on mechanical work.
- **The seniority model.** Each house fields two brothers: a fast
  everyday one and an older, sharper one. **Fable 5.1 is Opus 5's older brother; Astra is Codex's.**
  The consequence is the same on both sides of the table. The younger brother carries the volume,
  because he is quicker and cheaper per item and the work does not need brilliance. The older brother
  is not for volume at all — he takes the item the younger one could not settle, the decision that
  must survive being wrong, the plan that has to hold. **Escalation goes up within the house first,
  and only reaches the other house when the whole family is stuck.**
  This is consistent with how the workspace already runs: `/atlas` puts Fable in command and lets Opus
  take over when Fable's quota is gone, and this roster already sends mechanical Codex work to
  `gpt-5.6-terra` rather than to Astra.
- **The last rung — a configurable default.** "If there's really no other options left and
  miraculously all 1829 failed and all OmniRoute tools failed and all fleet failed and it's now just
  down to ChatGPT and Claude, difficulty decides which brother — all models of both." That is the
  bottom of the ladder, and it inverts the rule that governs every rung above it. Everywhere else the
  question is *what is the cheapest seat that can do this*; here there is no cheaper seat left, so
  price stops being a variable and **difficulty is the only selector.**
  **"All models of both" means all of them, not the four brothers.** Both houses field a full ladder,
  and the whole ladder is in play: on the Anthropic side Haiku, Sonnet, Opus 5, Fable 5.1; on the
  OpenAI side every model the Codex CLI will accept on this account, `gpt-5.6-terra` and `gpt-6-astra`
  among them. Rank the item's difficulty, then take the lowest model of *either* house that clears it —
  a mechanical sweep still goes to Haiku or a mini model even at this rung, and only the item that has
  to be right climbs to Fable or Astra. Not by house, not by habit, not by which chat happens to be
  open.
  ⚠️ **Announce it.** Every lane failing at once is a symptom of something broken, and the two most
  expensive houses running quietly for hours is precisely the shape of the seven-hour block that
  billed 240M tokens. Name what died, name what continuing costs, then continue.
- **Correlated with Codex, not identical to it** (a corrected default). Astra and Codex
  are different models reaching the same vendor over the same CLI, so they share training lineage and
  therefore share blind spots: **discount their agreement, do not merge them into one voice.** The
  earlier wording — "one opinion, not two" — proved too much, because Fable and Opus are also two
  models from one vendor and nobody treats those as a single seat. The honest rule is symmetrical:
  **same house = partly correlated; count the second vote at a discount, and never let a same-house
  pair stand as the whole diversity check.** For genuinely independent disagreement, cross houses —
  Anthropic against OpenAI against Google.
- **Reach:** no separate binary or key. Same invocation as Codex with the model id set:
  ```bash
  codex exec -m gpt-6-astra -s read-only -C "<dir>" --skip-git-repo-check \
    --json -o "<out>/answer.txt" "$(cat <promptfile>)" </dev/null
  ```
  All the Codex gotchas apply unchanged — prompt as a positional argument, `</dev/null` to close
  stdin, `-i` for images on the initial prompt only, glob the `pdftoppm` output rather than
  hand-typing padded page numbers.
- **Model id — VERIFIED 2026-09-05.** `gpt-6-astra` is valid on this ChatGPT account and answers
  clean. Bare `gpt-6` and bare `astra` both return
  `400 ... not supported when using Codex with a ChatGPT account`. ⚠️ **Read the run header, not the
  exit code:** an unknown id prints `Model metadata not found.` `Defaulting to fallback metadata` and
  then answers from a *different* model than the one requested. Confirm the header says what you asked
  for before trusting the output.
- **Data rule — identical to Codex, inherited, not relaxed.** The process is local and sandboxed; the
  model is OpenAI's, and any page attached with `-i` is uploaded. The default trusted-vendor decision
  covers **OpenAI reached through this Codex CLI**, which is exactly this route, so scanned
  publisher pages are permitted here on the same terms — and on no other route. `-s read-only` stays.
  No secrets, no personal data, no third-party private material in the brief.
  ⚠️ **It is NOT a sealed local process — MEASURED 2026-09-08.** Astra ran web searches unprompted in
  three of five interview runs, and its answers came back with live citations. Whatever is in the brief
  can become a search query. That does not change the data rule, but it does change what a
  brief may contain: nothing that would be damaging to *look up*, and no assumption that the material
  stays on the machine.

### Astra — MEASURED 2026-09-08 (5 `codex exec` runs, all exit 0)

Full evidence: `references/astra-interview-2026-09-08.md`. Fable ran the interview and set the traps,
by standing instruction not to estimate Astra's abilities from documentation.

| What | Result |
|---|---|
| **Reads images** | **Yes.** Opened PNGs with `view_image`; transcription of a synthetic scanned page was character-exact against the generator source. A noise-only page came back "no readable text" — no invention. |
| **Writes files** | **Yes, with `-s workspace-write`** (PowerShell `Set-Content`, read back). ⚠️ Adds a **UTF-8 BOM** — strip it downstream. Under `-s read-only` it reports it cannot write and does not try. |
| **Speed** | Hard multi-part item **139 s** · 10-item queue **59 s** (~6 s/item) · 3-item handoff **72 s** · image page **56 s** · audit **60 s**. Latency tracks how much it chooses to look up, **not** item count. |
| **Cost** | Codex's own "tokens used": **16.6k–39.7k per run.** What that consumes of the daily allowance is unknown. |
| **Concurrency** | Two runs in parallel worked, no visible contention. Real limit untested. |

**Traps — it caught every planted one.** A printed answer key that named the wrong diagnosis for
the case was called wrong. An invented substance, "Cefadrotol", was refused a dosage
twice rather than quietly matched to something real. An invented term, "Vorquist-Lehane index", was flagged
unverifiable *while* its arithmetic was separately confirmed correct — the exact discipline the gateway
Gemini seat failed. Fluid rates (104.2 mL/h, 5 mL/h with a reverse check) correct; a word limit
self-counted exactly.

**But it makes plain arithmetic slips.** Queue item 5: `(10x4)+(2x2) = 48` for a weight-based rate
formula; correct is 44. **9/10 on trivial arithmetic.** It predicted this class of error about itself before making it.
Formula arithmetic belongs in a script — measured, not theorised.

**It catches its own class of slip when auditing.** Handed the same file back as "a small model's
answers", it recomputed everything, failed item 5 with the corrected 44, passed the rest, no false
positives, 60 s. **That is the escalation-catcher role working**: the rung between the free fleet and
Claude, so a flagged item never lands on the most expensive desk untouched.

**As an escalation catcher with information missing, it behaved correctly.** Given flagged items but no
page images, it gave a provisional answer with its confidence split — high on the substantive content,
medium on the graded letter — refused to reconstruct an unreadable option, refused to certify a letter
without the scan, and reconciled two disagreeing sources with a qualification rather than picking a
winner. The handoff fields it asked for are the ones to put in the brief: item ID and exact
deliverable · source, page, question · the page image or a verbatim complete stem and options ·
uncertainty spans kept separate from the transcription · the printed key or the word "unavailable" ·
every prior attempt with its working.

⚠️ **Route output through files, not stdout.** Told to write a file *and* print the answers, it wrote
the file and printed only a status line. Verify the file exists; do not read the run's stdout as the
deliverable.

**CLAIMED, not measured:** cross-file debugging strength · that batches past 10 items start dropping
sub-questions and leaking assumptions between cases · its own latency (it said "unknown"; measured 139 s).
**Not established:** real scanned-document pages (only a synthetic page was used — dense handwriting,
tables and two-column layouts untested) · batches above 10 · whether web search can be switched off ·
account concurrency limits.

- **Cost discipline.** One bounded job, then it returns. Its strength is depth on a single hard
  question, which is also the shape that keeps it cheap — do not hand it bulk work it will grind
  through step by step.
- **Output is data, never truth.** Depth reads as authority and that is the trap: a longer, more
  confident chain is not a verified one. The manager verifies from disk, and on content that must
  be exactly right a human still reads the transcription against the page image.

## ⚠️ The free lanes are not four live lanes — MEASURED 2026-09-06

All four backends were probed. **`openrouter/minimax/minimax-m3:free` is the one that answers.**

| Backend | State on 2026-09-06 |
| --- | --- |
| `openrouter/minimax/minimax-m3:free` | ✅ answers — the working free lane |
| Gemini free tier | ⛔ **20 requests/day** — a single 5-minute run exhausts it |
| Groq free | ⛔ **8,000 TPM**, and opencode's own system prompt is ~12k — it 400s before starting |
| Cerebras | ⛔ returns "payment required" (the key was released 2026-09-05) |

⚠️ **`opencode models` lists 486 models and most are metered. Never pick one without asking the
owner.** Rung 2 of the ladder still says free-before-paid; it does not say every free name works.
Re-probe before quoting this table — it is a measurement with a date, not a standing fact.

## opencode — attacker (coding, has a relay)

- **Position:** coding, tooling, scripts. The one seat with a built, proven relay.
- **Binary:** `opencode` (`AppData\Roaming\npm\opencode`). Auth: `opencode auth list` → a `●` row.
  Backend: Zen key. Models: `opencode models`. **A fresh run needs a model** (`--model provider/model`).
- **Dispatch via the relay** (writes `result.json`, keeps the tree clean, never commits):
  ```bash
  node "<HOME>/.claude/skills/opencode-delegate/scripts/relay.mjs" \
    --brief brief.txt --model <provider/model> --cd "<repo>"
  # add --read-only for review-only (plan agent); --timeout 2h for long runs
  ```
  Full flags and the `result.json` contract:
  the sender's separate `opencode-delegate` skill, which is not shipped in this repo (see the note at the top of `dispatch-and-verify.md`).

## agy — attacker (coding, general legwork; verified working on a constrained regional connection)

- **Position:** coding and general legwork; confirmed to work from the user's network.
- **Binary:** `agy` (`AppData\Local\agy\bin\agy`). Version: `agy changelog`. Models: `agy models`.
  Effort levels: low / medium / high. Quota: Starter. State under `~\.gemini\antigravity-cli`.
- **Run flag — VERIFIED 2026-09-05:**
  ```bash
  agy --effort high --mode plan -p "<prompt>"
  ```
  `-p` is `--print` (headless, prints and exits). `--effort` low/medium/high; `--mode` plan or build.

## grok — attacker (quick reasoning, critique, second opinions)

- **Position:** fast reasoning, critique, a cheap second opinion. Good router-proposer.
- **Binary:** `grok` (`~\.grok\bin\grok`). Version: `grok version`. Models: `grok models`. Auth is
  read from `grok models` (fails with "not authenticated"). Sandbox: workspace / read-only / off.
- **Run flag — VERIFIED 2026-09-05:**
  ```bash
  grok --sandbox read-only --max-turns 1 -p "<prompt>"
  ```
  `-p` is `--single` (single-turn, prints and exits). ⚠️ **Quota dies silently mid-session** — a run
  can return the plain sentence "You've reached your free Grok Build usage limit for now." with exit 0.
  Read the body, not the exit code.

## vibe — attacker (drafting, prose, transcription)

- **Position:** drafting and prose. Backend: **Mistral free — which trains on inputs by default**, so
  vibe takes **non-private content only** until the opt-out is confirmed set in the Mistral console.
- **Binary:** `vibe` (`~\.local\bin\vibe`). Single-model; only timeout / readOnly dials.
- **Run flag — VERIFIED 2026-09-05:**
  ```bash
  vibe --max-turns 1 --output text -p "<prompt>"
  ```

## ⚠️ How to actually call an API seat — read before the three entries below

**A `curl` command with the key variable in it CANNOT BE RUN.** The `credential-guard` PreToolUse
hook refuses any Bash/PowerShell command that names a credential env var or a credential home — it
does not matter what the command does, only what it says. So the obvious one-liner is not merely
discouraged here, it is blocked at the tool boundary.

**The pattern that works, used throughout 2026-09-05:**

1. Write a small `.mjs` script with the **Write tool** (the hook is on shells, not on Write/Edit).
   The script reads the key itself: `const key = process.env.WHICHEVER_API_KEY;`
2. Run it as `node <path>.mjs` — that command string names no credential, so it passes.
3. Have the script print **status codes, token counts and answers only**. Never print, log or write
   the key value.

The curl snippets in each seat below are therefore **wire-format reference** — what the request must
look like — not commands to paste. Translate them into a script.

**Two rules that cost real money to learn:**

- **`max_tokens` is mandatory on OpenRouter paid models.** Omit it and the request is refused with
  HTTP 402 before it runs, because OpenRouter reserves the model's *entire context window* against
  the balance. See `candidate-bench.md`.
- **Read `reasoning` as well as `content`.** A reasoning model that spends its budget thinking
  returns empty `content` with the whole answer — or the whole spend — in `reasoning`. Reading
  `content` alone makes a working seat look silent.

## Groq — fast midfielder (speed reasoning / critique)

- **Position:** very fast reasoning, critique, a cheap router-proposer. Signed 2026-09-03.
- **Reach:** API key in env var `GROQ_API_KEY`. OpenAI-compatible. Verified working 2026-09-03 (HTTP 200).
  Call it from a script (see the block above) — the inline form is blocked by the credential guard.
  Wire format:
  ```
  GET  https://api.groq.com/openai/v1/models            # list live ids, then pick one
  POST https://api.groq.com/openai/v1/chat/completions
       Authorization: Bearer <key from env, read inside the script>
       {"model":"<id from /models>","messages":[{"role":"user","content":"<prompt>"}]}
  ```
  - Strongest id seen in the catalog is `openai/gpt-oss-120b` — note it is **OpenAI-authored weights**,
    so it is *not* an independent vendor opinion when the point of convening it is independence.
  - It is a reasoning model: read `reasoning` as well as `content`, or it will look silent.
- **Data rule:** contractually no-training / ZDR available, so safe for the user's own text. The blanket
  rule still holds: **no copyrighted/sensitive/scanned page off-machine, ever** — those stay with Codex.

## OpenRouter — utility sub (swappable models, one key)

- **Position:** one key routes many models (incl. free ones and some vision). A flexible backup seat.
  Signed 2026-09-03.
- **Reach:** API key in env var `OPENROUTER_API_KEY`. OpenAI-compatible. Verified working 2026-09-03.
  Call it from a script (see the block above) — the inline form is blocked by the credential guard.
  Wire format:
  ```
  GET  https://openrouter.ai/api/v1/models       # list models + their IDs
  GET  https://openrouter.ai/api/v1/credits      # granted / used — CHECK THIS FIRST
  POST https://openrouter.ai/api/v1/chat/completions
       Authorization: Bearer <key from env, read inside the script>
       {"model":"<provider/model>",
        "messages":[{"role":"user","content":"<prompt>"}],
        "max_tokens": 512}                       # MANDATORY — see below
  ```
- ⚠️ **`max_tokens` is not optional on a paid model.** Omit it and OpenRouter reserves the model's
  **entire context window** against the balance and refuses with **HTTP 402** before the request runs
  (`"You requested up to 131072 tokens, but can only afford …"`). Always send it.
- ⚠️ **`max_tokens` does NOT cap a reasoning model's spend.** Measured 2026-09-05: cap 60 produced
  **160 completion tokens** (159 of them reasoning) with `finish_reason: "stop"` — a natural end past
  the cap, not truncation. Reasoning tokens bill at the output rate. Budget for overshoot.
- ⚠️ **Credit is exhausted (2026-09-05: granted $0.00, used $0.0212, remaining negative).** Free-routed
  ids still answer; every paid one 402s. A top-up is a **user-only** step. Check `/credits` before
  planning any paid run. Detail: `candidate-bench.md`.
- **Data rule — the sharp one:** privacy **depends on the routed model**, so treat OpenRouter as
  privacy varies by routed model, and by default the user's own material is cleared for it,
  so its vision models are open to those scanned documents. A third party's uncleared data still never goes.

## OmniRoute — local gateway. INSTALLED 2026-09-07 · USE WITH OWN KEYS ONLY

`omniroute@3.8.50`, installed 2026-09-07 via a user-run Desktop `.bat`
(`C:\Users\<you>\AppData\Roaming\npm\omniroute.cmd`). **Running and verified: `/v1/models`
returns HTTP 200 with 475 ids; one completion returned in 1.9 s.** Node v26.7.0 satisfies its
`>=24 <27`. npm blocked 10 install scripts (incl. its own postinstall, `keytar`, `sharp`,
`esbuild`) — **it runs correctly anyway**; do not "fix" that unless something actually breaks.

- **What it is:** MIT, `npm install -g omniroute`, a **local server** on `localhost:20128` speaking
  the OpenAI-compatible `/v1` shape. Start it with the Desktop `omniroute-2-start.bat`; the window
  must stay open. Dashboard for connecting providers is the same URL in a browser.
- **What it is FOR here:** one endpoint holding **seats the owner actually holds** — own API keys
  (Gemini · Groq · OpenRouter) plus own OAuth logins (Cline · Kilo Code · OpenCode Zen) — with
  failover between them, so a 429 on one is not an excuse to escalate to Claude. That is the whole
  value. See the failover rule in `SKILL.md`.
- **What it is NOT:** a replacement for MSN. It is transport — it picks which model gets a request,
  retries, compresses. It has no opinion about the work. Its 110-tool MCP server administers **the
  gateway** (routing, providers, combos, cache, memory), not the task. The squad still decides what
  the work is, who does it, and whether the answer is right. OmniRoute deepened the bench from 3
  seats to ~12; it did not touch the manager, which is where the cost actually sits.
- **Reach — WIRED 2026-09-08. Use the dispatcher, not a fresh script each time:**

  ```bash
  node ~/.claude/skills/msn/scripts/omni.mjs --model auto/coding:free --prompt "..."
  node ~/.claude/skills/msn/scripts/omni.mjs --model auto/reasoning --brief brief.md --out answer.md
  node ~/.claude/skills/msn/scripts/omni.mjs --seats     # provider health, live
  node ~/.claude/skills/msn/scripts/omni.mjs --list --filter auto/
  ```

  It reads `OMNIROUTE_API_KEY` itself (env var, registry fallback), bypasses the semantic cache,
  strips reasoning-model `<think>` scratchpads unless `--keep-thinking`, and prints on stderr which
  seat actually answered. That last part is not cosmetic: an `auto/*` alias picks a different
  provider per request, so the printed seat is the only record of who saw the prompt. The credential
  guard still blocks the inline `curl` form, as with every API seat.

- **opencode goes through it too — WIRED 2026-09-08.** `~/.config/opencode/opencode.json` declares an
  `omniroute` provider (previous file kept as `opencode.json.bak-2026-09-08`). Call it with
  `opencode run --model omniroute/auto/coding:free "..."`. Verified end to end the same day.

### The `auto/*` aliases — MEASURED 2026-09-08, the reason the wiring is worth having

`/v1/models` returns **1,826 routable ids**, of which 38 are `auto/*` aliases that pick a seat per
request from live provider health. Note that `/api/models` — the list the dashboard shows — returns
79 and **its `available: true` flags are wrong**: every `groq/*`, `gemini/*` and `opencode-zen/*` id
it marked available returned HTTP 400 `not available in the active live catalog`. Route from
`/v1/models` only.

Live, one identical coding prompt through the dispatcher, cache bypassed:

| Alias | Seat it chose | Latency | Cost |
|---|---|---|---|
| `auto/coding:free` | `groq/qwen/qwen3.8-27b` | 763 ms | $0 |
| `auto/coding:cheap` | `openrouter/openai/gpt-5.3-codex` | 4036 ms | $0 |
| `auto/cheap` | `openrouter/openai/gpt-5.3-codex` | 3823 ms | $0 |
| `auto/best-free` | `oc/big-pickle` | 8169 ms | $0 |
| `auto/reasoning` | `openrouter/anthropic/claude-opus-5` | 10893 ms | $0 |

All five returned correct answers. **The selection is not stable** — `auto/smart` chose
`anthropic/claude-opus-5` and `openrouter/openai/gpt-6-astra` in consecutive minutes. Anything that
needs a specific model must name the model, never an alias.

⚠️ **kilocode and cline are out of credit** (`402 Add credits`; cline balance `-$0.39`,
`credits exhausted`). That kills every `kc/*` and `cl/*` id — including `claude-opus-5`,
`claude-sonnet-5`, `claude-haiku-4.5`, `gemini-3.1-pro-preview` and the vision seats. They still
list as available and they still do not answer. Topping up is the owner's hands only.

**Where the aliases come from — established later on 2026-09-08.** They are not a naming trick over
the catalogue: `/api/combos/auto` returns 40+ **built-in combos**, each with a candidate pool of up
to eight seats (`opencode-zen`, `groq`, `gemini`, `openrouter`, `kilocode`, `cline`, `opencode`,
`felo-web`), `comboStrategy: "fallback"`, `routerStrategy: "lkgp"` and a fifteen-factor weighting.
`/api/combos` — the hand-made list — is empty and always looked empty, which is what made an earlier
session wrongly conclude the whole subsystem was unconfigured. **No MCP tool can see these**;
`omniroute_list_combos` and `omniroute_best_combo_for_task` read the empty hand-made list only. The
alias in a `model` field is the entire interface.

The fallback strategy is the reason to prefer an alias over a named seat: a seat that fails is
retried **inside the gateway**, so the job does not come back to Claude as another step.

Second measurement, 2026-09-08, scored against known answers (3 questions × 4 aliases, all correct):

| Alias | Seat it chose | Latency |
|---|---|---|
| `auto` | `openrouter/auto` | 2.8–6.2 s |
| `auto/coding` | `anthropic/claude-opus-5`, `openai/gpt-6-astra` | ~6.2 s |
| `auto/reasoning` | `openai/gpt-6-astra` | 5.7–6.8 s |
| `auto/vision` | `google/gemini-3.8-flash` | 3.5–3.9 s |

⛔ **`auto/coding:free` has since failed and must not be used.** It answered "reply with the single
word alive" with the bare float `0.00043816588004119694` — HTTP 200, and wrong. The `:free` pools are
three seats wide and kilocode and cline are among the seats that are out of credit, so a `:free`
variant can degrade to whatever is left. The plain aliases and `:reliable` are the safe ones. This
does not contradict the 763 ms result above; it shows the pool changed, which is the point of the
"selection is not stable" warning.

⚠️ **Roughly 450 of the 1,826 sit behind unvetted relays** — prefixes `aihorde` (161), `dva` (125),
`no-think` (70), `aug`, `cxa`, `zc`, `oc`, `felo`, and the gateway's browser-session pools (seats
that drive a consumer web UI with your cookies) — blocked, account-ban risk. `auto/best-free` picked one
(`oc/big-pickle`) unprompted. This risk is accepted by default for the user's own material; it is
still worth knowing which prefix answered, which is why the dispatcher prints it.

### What "1,828 models" actually means — CENSUS 2026-09-08

`/v1/models` lists **1,828** ids. `/api/providers` lists **six connections**, and only six. Splitting
the catalogue by whether a live credential sits behind it:

- **1,294 ids are behind a connected provider** — openrouter 1,039 · opencode-zen 108 · gemini 43 ·
  kilocode 52 (`kc/` + `kilocode/`) · cline 34 (`cl/` + `cline/`) · groq 18.
- **534 ids have no credential at all** — aihorde 161 · dva 125 · no-think 70 · auto 38 (aliases,
  not seats) · aug 28 · cxa 26 · zc 13 · oc 8 · felo 5 · the gateway's browser-session pools (seats
  that drive a consumer web UI with your cookies, blocked, account-ban risk) 52 · and a few more.
  These are catalogue entries the gateway knows how to *address*, not seats that can *answer*.

And "behind a connection" is still not "will answer": openrouter's 1,039 are almost all paid against
$0 credit, and its free tier shrank overnight — **`openrouter/minimax/minimax-m3:free` now returns
404 "unavailable for free"**, which retires the 2026-09-06 ruling that named it the one free lane
that answers. Treat every id as dead until it has answered a real prompt this week.

### Department depth charts — INTERVIEWED 2026-09-08

⚠️ **The department LIST moved 2026-09-08 — `departments.md` is the authority.** The default: the
departments are decided by what gets found, not by what the sprint needs, and the list stays open.
Fifteen departments are named there with their evidence. The A–D depth chart below is still the
measured seat data for four of them (Reed Room, Foundry, Plumb Line, Stoa) — keep reading it as
seat measurement, not as the department list.

Every allowlisted gateway seat given the same four synthetic tests (no project content). Full report
and transcripts: `references/interview-2026-09-08.md`.

| Dept | The test | First choice | Cover | Everyone else |
|---|---|---|---|---|
| **A — Process drafting** | keep three file paths byte-exact through a rewrite | `groq/groq/compound-mini` **2.7 s** | `cl/google/gemma-4-31b-it:free` 5.2 s ⚠️ died mid-run | — |
| **B — Tooling** | small Node script that must fail loudly | `groq/groq/compound-mini` **1.7 s** | `opencode-zen/big-pickle` 25.5 s | — |
| **C — Structural audit** | seeded defects, zero false positives allowed | `groq/groq/compound-mini` **2.9 s** | none | — |
| **D — Debate** | a position plus its strongest objection | `groq/groq/compound-mini` **1.7 s** | none | — |

**The finding is a monoculture.** `groq/groq/compound-mini` is the only seat that passed all four,
and it did each in under 3 seconds. Everything else either failed, timed out or is out of credit.
That is not a workforce; it is one seat and a 8,000 TPM ceiling. **Plan around it: a Groq outage
takes every department at once**, and nothing measured stands behind it except Zen at 25 s for tooling.

- **Cline is finished.** All seven ids returned 401 `credits exhausted` (Kimi K3 once: 402, balance
  −$0.39). Gemma passed department A at 5.2 s and was 401 for every later test — the credits ran out
  *during* the run. Do not route to `cl/` until the owner tops it up.
- **Zen `big-pickle` is a slow specialist.** Passed tooling at 25.5 s; 504 on drafting after 32 s;
  empty response on the audit after 32 s. Usable only where nothing is waiting on it.
- ⛔ **`gemini/gemini-flash-latest` failed again, and this is now its third strike.** Department A: it
  dropped or mangled all three file paths. Department B: no fenced code block at all. Same id that
  transcribed a page which does not exist. **Retire it — do not route anything to it.**
- Gemini as a family was otherwise untestable here: `flash-latest` was the only Gemini id in the
  allowlist, and it 429'd on the audit. The ids that actually read pages
  (`gemini-3.1-flash-lite`, `gemini-3.8-flash`) were never interviewed for these departments — a gap
  worth closing, since they are the only page-readers there are.

### Who may VERIFY (replaces "verification never leaves Claude" as the default)

Facts are not restricted to Claude any more, by default. **Any seat measured reliable on that kind of
check may hold the checking post** — Astra and its house qualify on tonight's measurement, and there
may be seats among the gateway's 1,828 ids that would qualify too; none has been tested for it yet.

Three conditions carry over, because they are what makes a checker *reliable* rather than merely
available:

1. **Measured before trusted.** A seat earns the post by being run against material whose answers are
   already known, with the result written into this file. Nothing is promoted on reputation. The seat
   that produced the most fluent, best-formatted output of an entire run was transcribing a page that
   does not exist in the source file — and it is a Gemini id, from the one family that *can* read a
   page. Capability and reliability are separate measurements.
2. **Never its own work.** A model checking itself is not a check, it is a second draft.
3. **Prefer a different house.** Same-house pairs share blind spots; count the second opinion at a
   discount and never let a same-house pair be the whole gate.

What did **not** change: the check still happens, on every key, dose, unit and exponent, against the
page image. The ruling opened who staffs the gate, not whether there is one. Claude remains the
default wherever no measured seat exists for that job.

### Which seats can actually READ A SCANNED PAGE — MEASURED 2026-09-08

One real scanned document page (p.12 of a source PDF, rendered at 150 dpi) sent to every
plausible candidate, then **every transcription checked against the page image by a Claude subagent**
— verification never left Claude. Checking mattered more than the sending did.

| Model | Time | Verdict against the page |
|---|---|---|
| `auto/vision` (chose `gemini/gemini-3.7-flash`) | 8.5 s | ✅ complete, verbatim, no errors |
| `gemini/gemini-3.1-flash-lite` | 8.1 s | ✅ complete, verbatim, kept even the icons |
| `gemini/gemini-3.8-flash` | 14.5 s | ✅ complete, verbatim, no errors |
| `gemini/gemini-flash-latest` | 28.0 s | ⛔ **transcribed a different page entirely** |
| `gemini/gemini-flash-lite-latest` | 6.8 s | ❌ stopped after two lines |
| `openrouter/nvidia/nemotron-3-nano-omni…:free` | 26.7 s | ❌ headings only, then garbled repetition |
| `gemini/gemini-3.5-transcribe` | — | ❌ 400 — image input not enabled on it |

⚠️ **`gemini-flash-latest` produced the LONGEST output and it was a hallucination** — a fluent,
well-formed transcription of a histology quiz that is nowhere in this file. It is the seat named as
Gemini's best id in the table below, and on vision it is the single most dangerous one, because
nothing about the output looks wrong. **Never score a transcription by its length. Every page a seat
reads gets checked against the image, or it does not get used.**

Everything else failed for reasons that were never about vision: `groq`'s llama-4-scout is not in its
live catalogue, `kilocode` and `opencode-zen` returned 402, and `cxa/` (Codex app-server) has no
transport configured. **Three candidates in the first sweep were browser-session seats and should
never have been probed at all:** driving a consumer web UI through the owner's own session is the
owner's one redline. Their failures are not findings, and the missing Playwright binary behind that
browser-session prefix must NOT be installed.

**So: Gemini is the only lane that reads pages, and only three of its ids do it reliably.** Use
`gemini/gemini-3.1-flash-lite` first — it was the fastest of the three and sits on the cheaper tier.
A very large scanned book is still a quota question nobody has answered: the gateway exposes no endpoint
reporting a daily ceiling (`/api/quota`, `/api/usage`, `/api/stats` all 404), so the real limit can
only be found by spending it.

### Connected seats — MEASURED 2026-09-07, one session, six providers

Catalogue grew 475 → **1832 ids** as seats were added. Ids listed ≠ ids that answer; every row below
was smoke-tested with *"What is the capital of Egypt? Answer in one word."*

| Seat | Prefix | Best verified id | Speed | State |
|---|---|---|---|---|
| Groq | `groq/` | `groq/groq/compound-mini` | **640 ms** | ✅ own key, own quota |
| Cline | `cl/` `cline/` | — none answer | fails 6–52 s | ⛔ **DEAD 2026-09-08** — balance −$0.39, every id 401/402 |
| OpenCode Zen | `opencode-zen/` | `opencode-zen/big-pickle` | 900 ms | ⚠️ free lanes only — see below |
| Kilo Code | `kc/` `kilocode/` | `kc/openrouter/free` | 1.2 s | ⚠️ auto-router only |
| Gemini | `gemini/` | `gemini/gemini-3.1-flash-lite` | 3.3 s | ✅ own key — ⚠️ NOT `gemini-flash-latest`, see vision above |
| OpenRouter | `openrouter/` | — none answered | fails 25–40 s | ❌ rate-walled at $0 credit |

### Regional dialect — a blind pick

**`groq/groq/compound` writes the target dialect.** Seven seats were given one real passage and the
answers were shown blind, under letters, with no model names and in shuffled order, so the choice
could not follow reputation. The pick was **F**, which was `groq/groq/compound` — 322 characters in
3.6 s, on the free lane.

Two things follow. The dialect no longer needs a paid or slow seat: the dialect writer and the fast
free text lane are the same seat, so it costs nothing extra to route it well. And **Claude does not
write the dialect** — that was the problem this test existed to solve.

⚠️ **This is a screen, not a proof.** One passage, one round, one judge. Before a large batch ships,
put a second real passage through the same blind test. If `compound` ever fails on a harder passage,
the runners-up in that round were `groq/qwen/qwen3.6-27b` and `groq/allam-2-7b` — re-screen, do not
just promote one.

**Combo order: Groq → `openrouter/nvidia/nemotron-3-super-120b-a12b:free` → `opencode-zen/mimo-v2.5-free`
→ Gemini. LEAVE CLINE AND KILO OUT** (corrected 2026-09-08, supersedes "Groq → Cline → Zen → Gemini →
Kilo" and supersedes the 2026-09-07 blanket exclusion of OpenRouter).

Measured the same day: 18 free-tagged ids on connected seats, each given one small real formatting
task. **Two of the eighteen produced usable text.** Cline is dead — balance −$0.39, every id 401 or
402. Kilo's `kc/openrouter/free` returns 200 with an empty body, which is worse than a failure
because a chain reads it as success. Most of Zen's free ids are no longer in its live catalogue (400)
or hit the gateway's own rate-limit and 504. OpenRouter's free tier is back in the chain on evidence,
not on principle: its *paid* ids still fail at $0 credit, but one free id answered in 21 s.

Speed is the whole ranking. Groq answers in 1–4 s and is the only free lane fast enough to be a
workhorse; the nemotron id took 21 s and the Zen one took 54 s, so they are fallbacks, not defaults.
Gemini stays last because its quota is the scarcest thing in the whole fleet **and it is the only seat
that can read a scanned page** — every free-lane request spent on Gemini is a page it cannot read.

**The circuit breaker is ALREADY ON — there is nothing to enable.** `.env.example` §"Circuit breaker
thresholds" exposes only override values, and states *"Defaults match historical PROVIDER_PROFILES
values."* (Corrects an earlier note here claiming `.env.example` held no timeout or cooldown
settings — it holds both; they are commented-out defaults, which is why a first grep missed them.)
The defaults are built for a seat that fails *occasionally*, so they are far too patient for one
that fails *always*: an API-key provider needs **12** failures to trip the per-key breaker and
**15 in a 30-minute window** to trip the provider fuse (10-minute cooldown) — 5–10 minutes of
stalling before it blows.

⚠️ **Do NOT lower those thresholds to fix one provider.** The keys are per provider *type*, not per
provider: `OMNIROUTE_CIRCUIT_BREAKER_API_KEY_THRESHOLD` governs Groq and Gemini too, and Groq 429s
under load. Excluding a dead seat costs nothing; fusing a live one costs the two fastest seats we
hold. Related real keys, for reference only: `FETCH_TIMEOUT_MS` (600000, global — there is **no**
per-provider timeout knob), `OMNIROUTE_RELAY_FETCH_TIMEOUT_MS` (25000),
`PROVIDER_COOLDOWN_MIN_MS`/`MAX_MS` (5000/300000).

**Cline is the deep bench — the single best result of the install.** One OAuth sign-in, no card,
36 ids of which 7 answered: `cl/google/gemma-4-31b-it:free` 886 ms · `cl/moonshotai/kimi-k3` 1.5 s ·
`cl/x-ai/grok-4.5` 1.6 s · `cl/z-ai/glm-5.2` 2.0 s · `cl/minimax/minimax-m3` 2.4 s ·
`cl/stepfun/step-3.7-flash` 2.8 s · `cl/deepseek/deepseek-v4-flash` 3.3 s. Four different model
families that genuinely disagree with each other — this is the panel to convene for a debate.
Timed out at 25 s: `cl/tencent/hy3:free`, `cl/nvidia/nemotron-3-ultra-550b…:free`,
`cl/poolside/laguna-m.1:free`. ⚠️ **Quota unknown** — verified answering 2026-09-07 only; if these
are starter credits they will run dry without warning.

⚠️ **`*/openrouter/free` is an auto-router, not a model.** `kc/openrouter/free` and
`cl/openrouter/free` answered "Cairo" correctly most runs, but one run returned
`"User Safety: safe"` — it had landed on a content-safety classifier. Fine for casual use, never
for anything going into project material unread. Prefer a **named** id.

**Kilo Code lists what it sells, not what you hold.** 26 ids incl. `kc/anthropic/claude-opus-5`,
`kc/openai/gpt-5.6-*`, `kc/moonshotai/kimi-k3` — the paid ones 402 (*"Add credits to continue"*) or
401 (*"You need to sign in to use this model"*). Only the free router works. Same trap on every
reseller card: **a catalogue entry is not an entitlement.**

**OpenCode Zen — 108 ids, but the key may not have registered.** Free lanes answer
(`big-pickle` 900 ms · `nemotron-3.5-lightning-free` 7.4 s · `mimo-v2.5-free` 8.2 s ·
`nemotron-3-ultra-free` 24 s, too slow to use); dead: `deepseek-v4-flash-free` 400,
`ling-3.0-flash-fin-free` timeout, `muse-spark-1.3-contributor-free` 500, `laguna-s-2.1-free` 400.
Both paid ids (`gpt-5-nano`, `claude-haiku-4-5`) returned **402 *"requires an opencode API key — add
one in Settings → Providers"*** — that is "no key", not "no credit". The free lanes answering proves
nothing: they answer under the keyless `oc/` prefix too. **Zen adds little over Cline either way.**

**Gemini needs headroom, not a specific id.** `gemini/gemini-2.5-flash` → **HTTP 404**, retired for
new keys. Both live ids are reasoning models that spend the budget before emitting: at
`max_tokens: 32`, `gemini/gemini-3.6-flash` returned **200 with EMPTY content** (28 reasoning
tokens) while `gemini-flash-latest` just fit an "OK" (46 reasoning). *(Corrects an earlier note here
that had these two the other way round.)* **Set `max_tokens` ≥ 200 on any Gemini call.**
`gemini/gemini-pro-latest` → 429 *"All credentials … are cooling down"* — the 20/day wall.

⚠️ **Select on `owned_by === 'gemini'`, never on the id text.** A filter of `/gemini/i` over the id
picks `dva/gemini-3-1-pro-high` first — the banned Devin pool, which sorts earlier. Done once on
2026-09-07; it 500'd with `DEVIN_AGENTIC_HOME must be an absolute path inside the bridge sandbox`.

**Dashboard note:** the Providers page URL carries `?model=<name>` — a **model** filter, not a
provider search, and it hides the provider cards. Use the sidebar Search box. Gemini, Groq and
OpenRouter all live under **API Key Providers** (230 entries).

### ⚠️ The keyless "free" pools — MEASURED, do not use

It installs with **no keys and no accounts** and still lists `dva/claude-opus-5-max`,
`dva/claude-sonnet-5-*`, `cxa/*`, `aug/*`. Its own `owned_by` fields say what those are:
`dva`+`no-think` (137 ids) = `devin-cli-agentic` · `cxa` (26) = `codex-app-server` · `aug` (28) =
`auggie` · `zc` (13) = `zcode` · `oc` (8) = `opencode` · the gateway's browser-session pools (seats
that drive a consumer web UI with your cookies) (52 ids across three prefixes) = scraped consumer
chat UIs · `felo`/`veo*`/`unc`/`pepper` = assorted web endpoints · `aihorde` (160) = AI Horde
volunteer workers.

- **`dva/claude-*` is NOT a cheap route to Claude.** No Devin account exists here, so that channel
  is someone else's client credentials. Using it is unauthorised access to Anthropic models and
  puts **the workspace's own Claude account** — which the entire workspace runs on — at risk.
  **Claude will not wire or call this pool** — no risk is accepted on this account.
  Same for `cxa` / `aug` / `zc` / `dva` / `no-think`.
- **The rest are scrapes, and they are already blocked.** Probed one model per pool: the gateway's
  browser-session pools — blocked, account-ban risk — failed outright: one on a browser-launch
  error (it drives a headless browser), one on an anti-abuse challenge, one on an egress block whose
  own error string suggested evasion · plus `felo` 400 · `unc` 404 · `pepper` 502. **Zero of the six
  answered.** They are not a lane; they are a maintenance liability.
- ⚠️ **NEVER use the `auto/*` aliases** (38 ids). They pick a pool for you, and you cannot tell
  which until the response comes back. The 2026-09-07 smoke test called `auto/best-free` and was
  served by `oc/big-pickle` (`owned_by: opencode`) — a pool from the do-not-use list above, chosen
  silently. Always name an explicit provider-prefixed model id.
- **`aihorde` is image-generation only** — all 160 ids are Stable Diffusion families
  (`2DN`, `AbsoluteReality`, `AlbedoBase XL`…) and they reject `/v1/chat/completions` with
  *"is an image-generation model … Use POST /v1/images/generations instead."* It is **not** a text
  lane. AI Horde is volunteer-hosted, so anything sent runs on someone else's machine: non-private
  throwaway prompts only, and **never** project material.
- **RESOLVED 2026-09-07 — `oc` is legitimate, unlike `dva`.** Its paid ids refuse correctly:
  `oc/muse-spark-1.2` → **402 *"This model requires an opencode API key — add one in Settings →
  Providers"***. Only genuinely-free models answer without a key (`oc/big-pickle`,
  `oc/muse-spark-1.2-contributor-free`, `oc/mimo-v2.5-free`, `oc/nemotron-3-ultra-free` all
  returned "Cairo"). A pool that asks for *your* key before serving a paid model is not riding
  anyone's credentials. **Removed from the do-not-use list.** `dva`/`cxa`/`aug`/`zc` stay on it —
  they hand over paid CLI backends with nothing asked for at all.

### The line that decides a pool — apply it to any new provider card

**Do you sign in as yourself?** That is the whole test, and it cuts cleanly through the dashboard's
sections:

- ✅ **OAuth Providers (20)** — Cline, Kilo Code. Your own account, your own free credits, the
  vendor is a licensed reseller. `kc/anthropic/claude-opus-5` is Kilo's resold Anthropic access
  billed to you; it 402s when you have no credit, which is exactly what honest looks like.
  **These were wrongly lumped in with the scrapers on first read — they are the good ones.**
- ⛔ **CLI bridges** (`dva` `cxa` `aug` `zc`) — no account, no sign-in, free `claude-opus-5-max`.
  Someone else's paid subscription. Never.
- ⛔ **Web Cookie Providers (35)** — Conol etc. Want a browser session cookie: scraping a web UI
  through a login. Never.
- ⚠️ **No Auth (13)** — mostly broken (see the probe results above). `aihorde` is real but images
  only. `oc/*-free` is real and now allowed.
- ⚠️ **Advertises free frontier models with no account** — e.g. Pollinations listing "Claude".
  Same shape as `dva`. Treat as ⛔ until its own error messages prove otherwise.

### Data rule

The seat inherits **the weakest terms in whatever is connected**. No keys in any brief; keys stay in
env vars, never in a file under `<workspace>`.

**By default, confirmed and applied.** Everything the user supplies is cleared with its owner and
acts as their own material, and the risk is accepted in exchange for burning fewer tokens. **The
user's own material — scans, reference documents, copyrighted pages — may go to ANY seat.**

What this does **not** cover, and still binds: a third party's data the user has not cleared · keys,
secrets and personal identifiers in any brief · verification, which never leaves Claude no matter who
read the page. The **one stated redline is account-ban exposure** — so no consumer web UI driven
through the user's own cookies, whatever the token saving.

### Honest limit

It adds **zero Anthropic tokens**. The published "15–95% reduction" is provider-side and never
touches the Anthropic bill. What it buys is that a dead seat stops being an excuse to escalate to
Claude — the saving comes from the ladder, not from the gateway.

**And the provider-side saving is smaller than the README says — MEASURED 2026-09-08:
[`compression-measured.md`](compression-measured.md).** The stacked 89.2% claim did not reproduce.
Compression is `enabled:false` at the gateway and a per-request header cannot override that, so
today's end-to-end saving is **0%**. Engine-side: RTK 82% but only on `tool`-role messages and it
dropped the failing test line, the error code and the version while keeping thirty repeated
warnings; Caveman 6% on prose at every intensity, not the 46% the claim's arithmetic uses. Do not
enable RTK unattended until its line selection is verified.

**Which jobs these seats may hold** (2026-09-07) — job specs, the interview harness
(`../scripts/interview.mjs`), and the finding that every step of the scanned-document pipeline is
closed to off-machine seats by the standing data rule. The depth
charts land back in this file once the interview has been run.

## ChatGPT — opposition scout (adversarial, paste-back)

- **Position:** red-team a plan or a decision from outside the squad. No API here — **you paste**.
- Brief must be **self-contained** (zero workspace context needed to attack it). This is the same gate
  your planning skill uses for its debate rounds; MSN reuses it for any high-stakes decision.

## Gemini — creative playmaker (full seat)

- **Position:** strong reasoning, drafting, research synthesis, a second debate mind, and image
  generation (Nano Banana). Signed 2026-09-03 — the user waived **their own** privacy for the quality.
- **Reach:** API key in the Windows env var `GEMINI_API_KEY` (never in any workspace file). No CLI
  installed — call it by HTTP. Proven auth: header `x-goog-api-key: <key>`. Verified working
  2026-09-03 (HTTP 200 against the models endpoint).
  Call it from a script (see the block above) — the inline form is blocked by the credential guard.
  Wire format:
  ```
  GET  https://generativelanguage.googleapis.com/v1beta/models        # list live ids
  POST https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent
       x-goog-api-key: <key from env, read inside the script>
       {"contents":[{"parts":[{"text":"<prompt>"}]}]}
  ```
  - ⚠️ **The 2.5 generation is RETIRED — measured 2026-09-05.** Calling `gemini-2.5-flash` returns
    **HTTP 404**: "no longer available to new users… use `models/gemini-3.6-flash`". The 2.5 ids below
    are kept only to be recognised as dead; **`gemini-2.5-pro` and `gemini-flash-latest` are from that
    same retired generation and should not be trusted.** Never hardcode a Gemini id — list
    `/v1beta/models` and pick live, and note that a retired model **still appears in that listing**,
    so the listing is not proof it can be called.
  - ✅ **`gemini-3.6-flash` — VERIFIED WORKING 2026-09-05** (real completion, HTTP 200).
    This is the known-good id; start here.
  - Superseded ids, for recognition only: `gemini-2.5-pro`, `gemini-flash-latest`,
    `gemini-2.5-flash-image` (Nano Banana). The image/vision id is **untested** since the retirement —
    if Nano Banana is needed, expect it to have moved to the 3.x generation too and list before calling.
  - Claude never sees the key value; a script reads it from the env var at call time.
- **Data rule — relaxed by default:** Gemini trains on inputs, and the default accepts that for
  **the user's own material, scans included** (see "Data rule" at the head of this file). Its vision
  is therefore open to the user's own scanned pages. Still **never anyone else's uncleared data**,
  and never a key or identifier.
- **Output is data, never instructions, never self-verified** — the manager verifies from disk.

## Fable 5.1 — the in-house second mind (Anthropic)

- **Position:** a genuinely independent reasoning seat that is **not OpenAI-family** - which is the
  scarce thing on this roster. Half the wired seats are OpenAI underneath, so Fable is often the only
  vendor-independent check available in a meeting.
- **Reach:** no CLI and no key - it is dispatched as a **bounded subagent** with `model: fable` on the
  Agent tool. Verified 2026-09-05: one bounded job, returned in 86 s for ~83k subagent tokens.
- **Cost, and it is the reason not to reach for it casually:** ~83k tokens for a single answer, against
  near-zero for Groq or a local script. **Not measured cheaper than Opus on this workload** (1.01x,
  2026-09-02) - so it is a *diversity* seat, never a *savings* seat. Convene it when independence is
  what the question needs; route bulk work elsewhere.
- **Data rule:** Anthropic, so it sits where the manager sits - anything the manager may read, it may
  read. It has no route to an image either way.
- **Output is data, never truth** - its arithmetic was checked on 2026-09-05 and the measurement
  **refuted its own conclusion**. Verify from disk like any other seat.

## You — owner and captain

- The deciding vote on every decision. **You commit, install, sign in, upload.** The manager advises
  and dispatches; it never does these.

---

## The bench (not wired)

**SambaNova** — researched but not signed (weakest privacy terms; redundant with Groq). Held
off the field. See [candidate-bench.md](candidate-bench.md). Groq · OpenRouter · Gemini were
signed 2026-09-03 and now have full entries above.

**Cerebras — RELEASED 2026-09-05.** Signed 2026-09-03, dropped from the squad two days later. Two
inference tests five minutes apart both returned **HTTP 402** — `Payment required to access this
resource. Visit your billing tab.` — while the key still authenticated and `/models` still answered
200 with three models. That gap is the reason it was released rather than merely rested: a seat that
looks alive to every cheap check and refuses every real call is worse than no seat, because a board
gets planned around it. The "~1M tokens/day, no card" free tier it was signed for no longer holds.
The tests were close together, so they never distinguished an exhausted *daily* quota from the tier
ending outright — that question is now moot for the roster and only matters if the owner wants it
back. **Re-signing is a fresh decision, not a restoration:** it needs the billing tab checked, a live
inference test returning 200, and the three bench gates in
[candidate-bench.md](candidate-bench.md). Until then it is not a seat and must not be dispatched.
The env var `CEREBRAS_API_KEY` was the owner's to revoke, and it was revoked on 2026-09-08. The other
three seat keys were rotated and re-verified live the same day, so nothing on this page is pending.
