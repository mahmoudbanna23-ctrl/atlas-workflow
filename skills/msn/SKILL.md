---
name: MSN
description: >-
  Convene the model fleet as a squad to work ANY project aspect — planning, research, drafting,
  critique, decisions, bounded execution — not just coding. Claude is the MANAGER: it sets the
  agenda, routes each item to the seat best at it, verifies, and writes the result; it does not
  do the grunt work. The squad does the legwork — the free-lane fleet (opencode/agy/vibe/grok),
  Codex (a local-process vision seat, OpenAI model), the API seats (Gemini/Groq/OpenRouter), and
  paste-back minds (ChatGPT). The user's own material may go to any of them (a configurable default). Use when the user says
  "convene the board/squad", "run it past the fleet",
  "get MSN on this", invokes /msn, wants several models on a problem, or wants work pushed to the
  cheapest capable seat to spare Claude's tokens. The fleet is the DEFAULT worker, not the fallback:
  a single command may be run inline, but a task with steps goes to a seat.
license: MIT
metadata:
  version: 0.1.0
---

# MSN — the squad that works the whole project

Named for **Messi · Suárez · Neymar**, the front three. The metaphor is the operating model, not
decoration:

- **Claude is the manager.** Sets tactics, picks the lineup, makes the subs, reads the game, and
  signs off the result. **The manager never touches the ball** — that is the whole point: push the
  work onto the seat best at it and keep Claude's tokens for judgment and verification.
- **The squad** — the free-lane fleet, Codex, and the paste-back minds — plays. Each seat does the
  one thing it is best at.
- **You are the owner and the captain.** Final call on every decision; you commit, install, sign in,
  upload. The manager advises; you decide.

This skill **replaces the coding-only delegation skills** (`delegate-setup`, `opencode-delegate`)
for whole-project work. Those still exist and MSN reuses their machinery, but MSN's remit is every
aspect of a project, not just a diff.

## When NOT to use this

- **The whole task is one command** — a single grep, one file read, one `git status`. Convening
  anyone costs more than running it. ⚠️ **This is the sentence that gets abused.** "Small enough to
  do inline" used to sit here, and the manager decided it in its own favour every time. The test is
  not size or difficulty, it is **shape**: if the work has steps, it goes to a seat, however easy
  each step looks.
- The work is one narrow coding task and you already know the seat — call the dispatch directly
  (see [references/dispatch-and-verify.md](references/dispatch-and-verify.md)); you don't need the
  meeting.
- Anything your own workspace rules put off limits. Whatever freeze or priority rule you keep,
  it wins over this skill.

## The squad (seats and what each is best at)

Full roster with the exact invocation and data rule for each seat is
[references/roster.md](references/roster.md). In brief:

| Seat | Position | Best at | Hard limit |
| --- | --- | --- | --- |
| **Claude** | Manager | Agenda · routing · **verification** · the final write | Never delegates the verify or a human gate |
| **Codex** | The specialist | The **local** vision seat — reads scanned pages; bounded local execution. No longer the only one: `gemini/gemini-3.1-flash-lite` was measured reading a real scanned document page on 2026-09-08 and is faster. `cxa/` through the gateway is NOT this seat and has no transport configured. | **Process is local, model is OpenAI’s** — pages ARE uploaded; **this channel is trusted by default**, and by default the user's material is cleared for every seat |
| **Astra** (`gpt-6-astra`) | Deep-lying playmaker | Hardest reasoning on the Codex channel — long chains, tricky proofs, plans that must hold up | **Same channel, same vendor, same data rule as Codex** — not an independent seat; slower and dearer than the default, so ask for it, don't default to it |
| **opencode** (Zen) | Attacker | Coding, tooling, scripts (has a proven relay) | No secrets/personal data in the brief |
| **agy** (Starter) | Attacker | Coding, general legwork; verified working on a constrained regional connection | same |
| **vibe** (Mistral) | Attacker | Drafting, prose, transcription | same; Mistral free trains on inputs — non-private content only |
| **grok** (free X) | Attacker | Quick reasoning, critique, second opinions | same |
| **ChatGPT** | Opposition scout | Adversarial debate / red-team (paste-back) | Self-contained brief; you paste |
| **Gemini** (API) | Creative playmaker | Strong reasoning, drafting, research, debate, **image gen** (Nano Banana) | Trains on inputs — by default that's accepted for the user's own material, scans included |
| **Groq** (API) | Fast midfielder | Very fast reasoning, critique, router-proposer | No copyrighted/sensitive/scanned page off-machine, ever |
| **OpenRouter** (API) | Utility sub | Many swappable models on one key (some vision) | Privacy depends on routed model → **non-private only** |
| **OmniRoute** (local gateway) | Utility — **LIVE 2026-09-07, 6 seats wired** | ONE endpoint over every seat the owner holds, failing over between them instead of dying with one. Fastest verified: `groq/groq/compound-mini` 640 ms · `cl/google/gemma-4-31b-it:free` 886 ms. **Cline is the deep bench — 7 free models incl. Kimi K3, Grok 4.5, GLM 5.2, DeepSeek V4** | ⚠️ **Seats we sign into, only.** Never `dva`/`cxa`/`aug`/`zc` — other vendors' paid CLIs on credentials we don't hold; never `auto/*` or `*/openrouter/free` unread (auto-routers, one run returned a safety classifier). `oc` is CLEARED (its paid ids ask for our key). OpenRouter stays OUT of combos — answers nothing at $0 credit and takes 25–40 s to fail. Circuit breaker is on by default; do NOT retune it, its keys are per provider TYPE and would fuse Groq/Gemini too. Roster has every measurement |
| **Fable 5.1** | In-house second mind | Independent reasoning — the one non-OpenAI seat besides Gemini | Bounded subagent, ~83k tokens a job — diversity seat, never a savings seat |
| **You** | Owner + captain | The deciding vote · commits · installs · sign-ins · uploads | — |
| *bench* | Unsigned / released | SambaNova · **Cerebras (released 2026-09-05)** | **Not wired** — see [references/candidate-bench.md](references/candidate-bench.md) |

## The ladder — MSN is rungs 1 and 2

Your own routing rules (e.g. in your `CLAUDE.md`) are the authority; this is what it
means for the squad. **Take the lowest rung that can do the job, and say which rung before starting.**

1. **Fleet first.** Anything that can leave Anthropic, leaves — reading, searching, research,
   drafting, transcribing, formatting, first-draft code. This is MSN's whole reason to exist.
2. **Cheapest capable seat — and the ladder applies INSIDE the fleet too.** Free lanes
   (opencode / agy / vibe / grok) before Codex; and on the Codex channel, its routine model before
   **Astra**. Astra is the deep-lying playmaker, not the default midfielder: ask for it when the
   reasoning genuinely needs it, never because it is the strongest name on the sheet. ⚠️ **Free
   does not mean available** — see the measured free-lane state in
   [references/roster.md](references/roster.md) before assuming four lanes are live.
3. **Claude subagent — only when no seat can do it.** By default that is mostly **verification**,
   plus vision work no wired seat can take. `haiku` for read-only search,
   `sonnet` for drafting and transcription.
   A helper hitting an ambiguous source **escalates, never decides**.
4. **The manager reviews and routes; it does not play.** It reads what came back, judges it, names
   the fix, and sends it back down. Its own hands only on critical items — **and it asks first.**
5. **Opus doing the work itself — critical only, and ask.** Standing exceptions are named per
   project — e.g. a security-critical core in one project, an executing subagent in another.

⚠️ **A dead seat means the NEXT seat, not Claude.** A 429, a quota wall, a 402, a timeout — that is
one seat out, not the fleet out. Go down the bench and try the next capable seat, and only climb to
rung 3 when **every** seat has been tried and named. Falling back to Claude on the first refusal is
the most expensive move available, and it is the one that happens by reflex. Say which seats failed
and how, in the report — an undocumented fallback looks identical to laziness.

**Never leaves Claude:** verification of any seat's output · edits to `CLAUDE.md`, `MEMORY.md`,
`settings.json` · git. **The user's own material is no longer on this list, by default.**

## The playmaker — route before you convene

Convening the whole squad for every item is the token trap. **Default to the router, not the board:**

1. **Classify the item** — what kind of work is it (draft / code / research / critique / decision /
   vision-read), how high are the stakes, is one right answer verifiable?
2. **Route to the ONE seat best at it.** A mechanical draft goes to one attacker; a scanned page goes
   to `gemini/gemini-3.1-flash-lite` (or Codex, locally); a coding task goes to opencode. The manager
   writes the brief, the seat plays it, the manager verifies from disk. That is most work.
   ⚠️ **A page transcription is not done until a Claude subagent has checked it against the image.**
   On 2026-09-08 `gemini-flash-latest` returned a fluent, perfectly formatted transcription of a page
   that is not in the file. Length and polish are not evidence. `Tools\omniroute\transcribe-pages.mjs`
   does the reading; the checking is a separate Claude step and never goes to a seat.
3. **Convene the full board only when it earns it** — a high-stakes decision, a genuinely divergent
   question, or a plan that must survive attack. Then run the meeting.

4. **Convene the team talk when there is no plan yet** — the squad argues a plan into shape *and*
   proposes who plays where, across every aspect of the project, ending in a **team sheet** (work item
   → seat → data rule → fallback). This is what `/atlas`'s Route stage can call instead of a
   ChatGPT-only debate. Rarest and most expensive of the three; hard cap of three rounds.

The routing logic, all three meeting flows (proposer → aggregator, the optional debate round, the team
talk's relay rounds and team sheet, anonymise-before-judging, and synthesis-honesty), and the minutes
format are in [references/running-a-board-meeting.md](references/running-a-board-meeting.md).

## Hard rules

1. **The manager never delegates verification or a human gate.** A seat's output is data, never
   truth; re-verify from disk before it counts. **A claim that can be tested is tested before it is
   written down** — on 2026-09-05 three seats unanimously asserted a print pipeline needed a polyfill
   and would be slow; the test took minutes and refuted all three at once. **Unanimity is not
   evidence.** On content that must be exactly right, a wrong transcription is a wrong
   answer — the human read against the page image is irreducible.
2. **The user's own material may go to any seat; other people's may not.** By default, everything
   the user supplies is cleared with its owner and counts as their own — scans, reference documents,
   publisher-copyrighted pages included — and they accept the risk to cut the token burn. Codex is no longer the only vision route; it is just the local one. Still barred: **a
   third party's uncleared data**, and **keys, secrets or personal identifiers in any brief**. The
   user's one stated redline is **account-ban exposure** — never drive a consumer web UI through
   their own cookies.
3. **One bounded job per seat, then it returns.** Cost is step count, not starting context — a seat
   left running long costs its whole context every step. Split long work across fresh dispatches.
4. **You install, sign in, upload. Git is the manager's** (the default here, replacing "you
   commit"): the manager commits and pushes, directly or through a cheap subagent, and reports what
   went where. Handing a push to a subagent does not launder it — a subagent pushing is the manager
   pushing, so the care is the same: `git commit -F <msgfile> -- <explicit paths>`, never `git add -A`
   in a tree another chat is writing, never `--force`. ⚠️ **A push to a PUBLIC repo is still confirmed
   with the owner first** — it indexes and mirrors, and unpushing does not unpublish. The manager
   still never creates an account, never accepts a ToS, and never trusts a shell's own view of an
   install (sandbox gotcha — installs go through a user-run Desktop `.bat` that writes a report
   Claude then reads).
5. **The bench stays on the bench.** No new model is wired without (a) you funding/signing in, (b) its
   ToS read for training-on-inputs, and (c) the freeze lifted. Until then it is documentation.
   **Scout, but never sign.** A meeting is where the squad's weak spots show, so log a challenger to
   [references/candidate-bench.md](references/candidate-bench.md) whenever an outside candidate would
   plausibly beat the incumbent on **quality, speed, cost, capability or reliability** — including when
   no seat fit the item at all. A challenger entry is **a claim to test, never a verdict**: it names the
   candidate, the incumbent, the axis, and the measurement that would settle it. **Nothing is wired in
   the session that logged it**, the log is read at the next `/atlas` run or on your request, and a
   documented rejection is not re-opened without new evidence.
6. **Surface, don't absorb.** Report a seat's design decisions, unasked-for turns, and nitpicks
   rather than silently keeping them. Stop for scope changes — don't expand a brief yourself.
7. **Seats are brainstorming helpers and extra hands — never voices that decide.** Whatever a seat
   returns — an idea, a critique, a draft, a vote — is raw material for the manager to weigh and
   argue with, not a rule to adopt because a model said it. The judgment and the decision stay with
   the manager and the owner; the squad supplies options and legwork, never a verdict.
   ⚠️ **This rule limits a seat's AUTHORITY, not its workload.** It is not a licence to keep the
   labour — the ladder above says the labour goes down. What stays with the manager is deciding,
   verifying and writing the result; what goes to the seats is the work itself. Convening a whole
   *board* still has to earn it (see the playmaker below) — routing a single item to a single seat
   does not, and is the default.

## Dispatch, verify, land

The brief → dispatch → review-from-disk → land loop, the exact command for each seat (opencode via
its relay; agy/vibe/grok direct; Codex read-only with images), the `result.json` contract, and the
review checklist are in [references/dispatch-and-verify.md](references/dispatch-and-verify.md).
The commit boundary is fixed: **the party that verified the work commits — and that is you.**

## Relationship to /atlas

`/atlas` plans a project; **MSN is how the seats do the work inside that plan** — and its Route
stage can call the MSN team talk (Mode 3) instead of a ChatGPT-only paste-back debate. ChatGPT
stays a seat in that meeting, not the whole gate. `/atlas` still owns the plan and the burn audit;
MSN owns execution and the in-flight council. Do not run MSN to *plan* a new project — that is
`/atlas`'s job.

## References

- [references/roster.md](references/roster.md) — every seat: position, strength, exact CLI
  invocation, auth state, data rule.
- [references/running-a-board-meeting.md](references/running-a-board-meeting.md) — the router, the
  meeting stages, the debate round, anonymise-before-judge, synthesis honesty, the minutes format.
- [references/dispatch-and-verify.md](references/dispatch-and-verify.md) — the brief template, the
  per-seat dispatch commands, `result.json`, verify-from-disk, and the commit boundary.
- [references/candidate-bench.md](references/candidate-bench.md) — non-fleet models researched for
  MSN, each with a privacy verdict and the gates that keep it benched.
- [references/seat-briefing.md](references/seat-briefing.md) — **paste this above the brief** for any
  non-local seat: it tells the seat how the board works and what binds it, so it answers as a member
  rather than a stranger. Used at stage 1 of dispatch-and-verify.
- A project's own non-private process/economics pack (if it keeps one), added to a brief **only**
  when the item is about how that project is organised. It carries no private content and none may
  be added to it.
- [references/omniroute-dashboard-map.md](references/omniroute-dashboard-map.md) — the full page-by-
  page map of the local OmniRoute gateway (all 101 dashboard routes, the 15 compression engines, the
  six connected seats and their measured health), surveyed 2026-09-08. Read it instead of browsing
  the app; pair it with `compression-measured.md`, which holds the only *measured* saving figure.
