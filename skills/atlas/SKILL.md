---
name: atlas
description: The workflow for any substantial piece of work - frame it, route it to the cheapest machinery that can do it, run it, gate the result, deliver. Covers planning a new project, opening a major phase, and running a batch of real work. Use when the user says "plan project X", "new project", "run this through atlas", or invokes /atlas. Not for a single question or a one-line fix.
---

# atlas — the workflow

atlas is the door. Everything else is machinery underneath it: MSN routes and runs the seats,
delegate spawns them, spec-kit builds large software. None of those decide whether they are needed —
**Stage 2 decides, every time.**

**OmniRoute is not one of them — it runs under all five stages, not just the middle one.** An earlier
version of this file called it "the traffic", which was true only of Stage 3, and only because the
1,828 model ids were the part that had been looked at. The gateway carries a layer at every stage:
research tools in Frame, a routing table and real success rates in Route, combo workers in Do, an
evaluation harness and a repo scanner in Gate, per-seat accounting in Deliver. Each stage below says
what its layer is and what it is measured to be worth. **None of it is automatic** — Stage 2 still
names what runs.

Five stages, always in order: **Frame → Route → Do → Gate → Deliver.**

**Size the ceremony to the job.** A 40-page transcription gets three framing questions and goes
straight to Route. A new year-long project gets the full research pass and a team talk. Running a
big ceremony on small work is the most common way this skill wastes money — when in doubt, run it
light and escalate if Frame turns up something genuinely unknown.

## Command structure (non-negotiable economics)

- **Fable is the commander.** Fable frames, routes, judges and writes. Fable never does grunt work.
  If Fable's usage limit is hit, **Opus takes the commander role** (the user switches the chat
  model) — same rules, and the Stage 2 team talk becomes more important as the quality check.
- **Main chat orchestrates; it does not labour.** It plans, writes briefs, spins up agents, reads
  short reports, judges, integrates — never a bulk read, never opens a worker's raw output
  directly (Stage 3). One-line fixes and a single grep stay inline; anything with steps goes down.
- **Subagents do the legwork: 1–2 at a time, hard cap 3.** Agents burn tokens too. Roles, cheapest
  model that clears each job — definitions ship in `agents/`:

  | Role | Model | Job |
  |---|---|---|
  | Scout | Haiku | finds files/symbols/locations, reports locations — never dumps files |
  | Researcher | Sonnet | reads docs/sources, reports facts, marks anything unverifiable as unverified |
  | Builder | lean-drafter (Sonnet) | builds from a clear spec, runs its own checks |
  | Refuter | Opus | reviews builder work, re-runs checks itself, never trusts a "done" claim |
  | Debugger | Opus | hard root-cause work only |

- **Every brief carries marching orders**: goal · exact files/URLs in scope · what it may change ·
  what it must verify · what not to do · output format · output length cap · facts already known.
- **Cost is step count, not starting context** (your workspace rules). A long-running agent costs its full
  context on every remaining step. One bounded job, then return. **Session budget ~80 main-chat
  steps**, then write a handoff and start a fresh session — `tools/guard/drift-guard.js` reminds you
  at the threshold once wired as a PostToolUse hook (`SETUP.md`).
- **The default worker is a coding agent CLI through a gateway** (updated ruling) — it now sits
  first on the lane ladder (Stage 2 §1), ahead of the fleet and Claude roles: a gateway combo first,
  a second CLI through the same gateway if it alone is out, the CLI's own vendor login if the
  gateway is down. Stage 4's independent check is still never that same CLI reviewing its own
  draft — see the self-review rule there.

---

## Stage 1 — Frame

Interview the user in **one batched set of questions, never one at a time**: what is it, who is it
for, what does done look like, deadline (**convert to an ISO date before writing it anywhere**),
what it may cost, and — for a real project — **who commands, Fable or Opus.** If the user picks a
model other than the one running the chat, ask them to switch before Stage 2; a session cannot
switch its own model. Ask when two readings would produce materially different work; make routine
calls silently. Write nothing yet.

**Legality / ToS / account gate, first thing.** Does any part require violating a service's terms,
or automating an account? A doomed branch dies HERE, before research spends a token (lesson: the
declined auto-sniper). Name what was cut and offer the compliant version.

**The data rule as it now stands (a standing ruling that replaced an older off-machine ban):** the
user's own material — scans, coursework, reference documents included — may go to any seat, because
everything the user supplies is cleared with its owner and counts as their own. What still never
leaves: a third party's uncleared data, secrets, personal identifiers. And **never a seat that drives
a consumer web UI through your own browser cookies** — an account ban is the one redline.

**Then, scaled to the job:**

- **Arsenal review** (one Haiku/Sonnet agent) — what already exists before researching anything new:
  root `MEMORY.md` environment facts and standing rules (**never re-litigate a documented rejection
  without new evidence**), installed skills, the free-lane CLIs and their *current* sign-in state
  (verify, don't assume), the user's subscriptions. ⚠️ **Search the project's own `progress\` folder
  for prior work on this exact question before proposing anything** — a settled answer on disk beats
  a fresh opinion, and rebuilding something already solved is this workflow's most expensive failure.
- **The gateway's research layer — use it before Claude's own tools** (all measured 2026-09-08;
  reasons and per-tool costs in `Tools\omniroute\mcp-allowlist.json`). Three things live here and
  nowhere else in the workflow:
  - `omniroute_web_search` — free and verified against a live query. **Use it before Claude's own
    WebSearch**, which is metered.
  - `omniroute_agent_skills_list` / `_get` / `_coverage` — 46 manuals, free per turn. **Read one when
    the job arrives and INSTALL NOTHING**; an installed skill is a per-session context tax forever.
  - `omniroute_github_skills_search` + `_scan` — the GitHub half of the research pass, placed here by
    the standing rule: *see what exists, take only the part this job needs, install nothing.*
    **Pruned from the allow list on cost** (+43% per request, permanently), so call them on demand
    with `probes\mcpcall.mjs`. Measured limits: a handful of deliberate queries trips the rate limit,
    which clears in a minute — and **its error text blames a missing token when it means slow down**,
    so do not go re-checking credentials. The first real hit had no skill file and a scraped
    description: **a result is a lead to verify, never an index to trust.** ⚠️ **Always `_scan`
    before reading a repo further** (hardcoded secrets, `eval(base64)`, `os.system`-style calls), and
    **never `_install`.**
- **Research** (1–2 Sonnet agents, honest verdicts) — only for a genuinely new project, and only in
  the tracks that apply: **Execution** (existing tools/repos worth adopting; most are redundant or
  token-negative, say so), **Functions** (how the best comparable things work — a ranked steal
  this / skip this list), **Design** (3–5 concrete referenced directions, never "make it modern"),
  and a **free-AI sweep** for the weak spots (verify a free tier is real, not a trial). The commander
  picks the sources per domain before dispatching. **Grounding is absolute:** every verdict cites
  what was actually read, findings land in the plan file with links so research is never repeated,
  and anything unconfirmable is marked unconfirmed.
- **Burn audit** — rank the planned tasks by expected token cost and flag the heavy ones (bulk
  reading, image work, repetitive generation, long sessions). For each, find an offload route in
  strict price order, stopping at the first that survives: free and already installed → free
  external → cheap one-time paid (state the exact total and get an explicit yes) → Claude-native,
  cheapest model that survives verification. Record the chosen route, its price, and why the cheaper
  options lost. Finding nothing to offload is a valid result — say it.
  ⚠️ **Measure before you buy.** The OCR ladder of 2026-08-30 planned two paid routes and a
  confidence-gate build; a direct measurement on 2026-09-01 found a tool already on the machine did
  the job at $0, and the whole ladder was closed unbuilt. **Any unverified component enters the plan
  only with a small measured pilot against ground truth as its first step** — never adopted on
  reputation.
- **Give the project its home before any work goes into it** (standing ruling). A project
  that starts without one leaks its state into the root `MEMORY.md`, which is what pushed that file
  against its 200-line cap four times in eight days. Three things, in this order:
  1. **The folder** — a direct subfolder of `<workspace>`, named for what it is in a way that still
     reads a year from now. Its own output stays inside it (your workspace rules on where output goes).
  2. **The storage — its own `CLAUDE.md` and `MEMORY.md`.** `CLAUDE.md` holds the rules and names the
     authority file; `MEMORY.md` holds live state, a "Resume here" block, and nothing else.
     ⚠️ **`CLAUDE.md` must end with `@MEMORY.md`** — without that import the memory file exists and
     never loads, which is a silent failure, not a visible one. Verified 2026-09-08: one project had
     had a `MEMORY.md` for two weeks that had never once reached a session.
     Both load **only when the session's working directory is inside the project** — that is the
     whole saving, so open the session in the project folder, not at the workspace root.
  3. **The connections — a "Connections to other projects" block in its `MEMORY.md`.** Name which
     projects it reads from, writes to, or shares sources with, and say **"none"** explicitly when
     there are none; an empty section reads as an unanswered question. This is what a root file was
     genuinely providing, and it is the only part worth keeping central-shaped. Sources shared with
     another project are named **read-only** unless the other project's own rules say otherwise.
  Then add **one line** to the root `MEMORY.md` pointer table — name, path, where to start. Anything
  more than that line belongs in the project's own files, not the root's.
  ⚠️ **On an existing project, check these three rather than assume them** — the folder may exist
  while the pair does not, or the pair may exist without the import.

---

## Stage 2 — Route

**Nothing below this stage decides whether it is needed.** Route names the machinery, out loud,
before any of it starts. Four decisions:

**1. Which lane does the work?** Take the lowest that can do the job (your workspace rules), in
this order:

| Lane | Use it for | Warning |
|---|---|---|
| **Inline main chat** | One-liner fixes or a single grep only | Anything with steps goes down. |
| **Coding CLI through the local gateway** (default worker) | Real drafting/build work | Use `auto/coding`, or `auto/coding:reliable` for must-be-right work. Codex runs through `tools/omniroute/codex-gw.sh`. |
| **Second coding CLI through the gateway** | The default CLI is out but the gateway is alive | Use the same combo. |
| **Coding CLI on its own login** | The gateway is down but a CLI is alive | A routine model for routine work; a stronger model for must-be-right work. |
| **Fleet** (MSN) | Both CLI routes are out | Rest of the fleet direct, no gateway; every output is checked. |
| **Claude roles** | Fleet all out | Scout (Haiku), researcher (Sonnet), builder (Sonnet), refuter (Opus), debugger (Opus, rare). |
| **Claude window low** | The Claude window is low | Stop, write a handoff, and resume after the reset. |

⚠️ **Bulk per-item work goes in a script, never an agent loop** — a script sends one item and forgets it; an agent re-sends every previous item on every step.

Main chat orchestrates throughout; it is not a rung. For large, complex software builds, **ask the
user before initializing spec-kit anywhere new** — it re-feeds artifacts and burns 20–50k a turn in
the implement phase. Seed it in one project first, not everywhere; spec-kit plans, the default
worker implements.

**1a. In the gateway coding-CLI rungs, hand the seat choice to the gateway rather than naming a seat.** This is
the layer that makes OmniRoute part of Route and not only of Do. The built-in combos — `auto`,
`auto/coding`, `auto/reasoning`, `auto/vision`, `auto/coding:reliable` — are **model ids**, each an
eight-seat pool with strategy `fallback`, so a seat that fails is retried **inside the gateway**
instead of handing the job back as another step here. Measured 2026-09-08: 12 of 12 correct, against
named-seat rates of 22–64%. Route names a specific seat only when the job needs that seat's one
capability — Gemini or `auto/vision` for a scanned page, nothing else reads one. ⛔ **Never a `:free`
variant** — `auto/coding:free` answered a word question with a bare float. ⚠️ **Leave a big
`max_tokens`**: these ids spend the cap on hidden reasoning and return 200 with an empty string.

Route on measured numbers, not on reported ones. `omniroute_get_provider_metrics` and the per-seat
table inside `omniroute_cost_report` are real (the report's own totals are 0, and it costs ~9k tokens
to fetch — pull it when the per-seat numbers are the decision, never to check a total). ⚠️
**`omniroute_check_quota` LIES** — 100% and "valid" for every connection including the ones that are
out of credit. Never route off it.

Probe liveness once with one tiny request per rung before a batch. On a limit or connection error,
drop one rung; do not retry in a loop, and never trust a quota tool.

**1b. The last resort — only after the gateway is down and every later rung is gone** (standing
ruling). If the gateway is down, the fleet is dead, and the coding CLI's own vendor login (§1, rung
4) is also exhausted, the roster collapses to two houses: the coding CLI's vendor and Claude. The
coding CLI's vendor counts only through a login or model it still has quota on. There is no cost
ladder left to climb, so **difficulty alone decides who takes it — across every model of both
houses, not just a named handful.** Both houses field a full ladder and all of it is in play: Haiku,
Sonnet, Opus 5, Fable 5.1 on one side; every model the coding CLI's own account accepts, routine and
must-be-right tiers alike, on the other. Rank the item's difficulty, then take the lowest model of
*either* house that clears it — a mechanical sweep still goes to a Haiku or a mini model here, and
only the item that must be right climbs to the top of either house. Do not pick by house, and do not
pick by price — at this rung price has stopped being the variable. **On the Claude side, route
through the named roles** (scout / researcher / builder / refuter / debugger — `agents/*.md`), never
into main chat directly; the roles are that side's own ladder, not a substitute for it.

⚠️ **Say out loud that this rung has been entered, and why.** Everything failing at once is a
symptom, not a weather event; running the two most expensive houses silently for hours is exactly how
a seven-hour block once billed 240M tokens. Name the failure, name what it costs to continue, and
keep working — but visibly.

**2. Does this need a team talk?** The MSN squad meeting (Mode 3) is now **called, not automatic.**
Call it for an expensive or hard-to-reverse decision, a plan with a real fork in it, or a question
where being wrong costs days. Skip it for routine execution — several models reviewing a
transcription plan buys nothing. When it runs, `~/.claude/skills/msn/references/running-a-board-meeting.md`
is the **single authority** on stages, the anonymise-before-judging step, the round cap and the
minutes format; this file deliberately does not restate them, because two copies of one procedure
drift apart invisibly. **Cost, so waiving is informed:** two rounds across five seats is ten
dispatches plus pooling and verification. The burn audit's routing is binding **unless the meeting
overturns it**; if they disagree, the meeting wins and the audit entry is rewritten to say why. The
team sheet becomes part of the plan file. **One meeting per moment** — this gate closes framing, and
MSN owns the in-flight council after that.

**3. What are the acceptance criteria?** Written before work starts, in the plan file. Stage 4
enforces exactly these and nothing invented later.

**4. What is the stopping condition?** The point at which the lane gives up and escalates rather
than improvising. A worker hitting an ambiguous source **escalates, never decides.**

---

## Stage 3 — Do

The lane runs. Two rules that hold in every lane:

- **A brief carries instructions and file paths — never the material itself.** The worker reads its
  own sources; pasting content into a brief pays for it twice.
- **Files out, verdicts in.** Work products land on disk. The commander's context holds the verdict
  line, not the transcription, not the draft, not the page image. An image read in the main
  conversation is re-sent with every later request for the rest of the session. **Main chat never
  opens a worker's raw output** to check it directly — it reads only the worker's short report and
  a failures list; large output stays on disk for the next agent to read.
- **In the Fleet lane the gateway is the worker, and its fallback is the only measured step-count
  saver in this workflow.** Everything else here trims the size of a step; the combo pool retries a
  failed seat internally, so a failure costs no step at all on Claude's side. That is why Stage 2
  routes to a combo id by default. It changes who answers — **it does not change the shape of the
  loop**: bulk per-item work still belongs in a script, exactly as the Stage 2 table says.

For a new project, the plan file written here also contains, each as its own short section:
work-block slicing (your workspace session rules, each with a "done when" line and a mini resume prompt —
never one monolithic prompt) · a cost forecast with a **mandatory checkpoint after block 1**, where
2× over estimate means STOP and re-route · **two priced shapes when routes genuinely differ** (free
but slower vs paid but fast — in tokens, money and calendar days; the user picks, never bury a real
price choice inside one recommendation) · a **user-labour audit** with realistic times for every
install, sign-in, upload and device step · a **pre-mortem** naming the three most likely failures
with a tripwire and a plan B each (external killers included: a free tier vanishing, a lane dying) ·
**backup-before-build**, flagging any asset that exists in only one place · the `ideas-parking.md`
pointer for mid-build ideas · and an **afterlife** line: who maintains it, what finished means.

---

## Stage 4 — Gate

**The fleet's failure mode is not refusing to answer. It is answering confidently and wrongly.**
Measured 2026-09-08: a vision model returned the longest, most fluent, best-formatted output of an
entire run — a transcription of a page that does not exist in the source file. Nothing in the text
looked wrong. **Length is not evidence of quality.**

**Two layers are the default, every time:**

1. **Machine/script checks first** — they reject broken work at zero model cost: missing or
   duplicated items, sequence breaks (question numbers must run in order across pages), incomplete
   option sets, empty output, absurd length, repeated passages. Cheap and honest. **But structural
   checks cannot catch fabrication** — the invented page passed every one of them.
2. **ONE independent checker — never the drafter.** Either an outside seat *measured* reliable on
   this kind of check (see "Who may check" below) when one fills that slot, or the Opus **refuter**
   subagent (`agents/refuter.md`) otherwise. It re-runs the checks itself against the brief and
   reports pass/fail plus a defect list; it never trusts a "done" claim on its own say-so. One
   failed sample re-runs the whole batch.

That is the floor for every batch — nothing ships past it unchecked. **For high-stakes work**
(work that must be exactly right, an irreversible action, anything where being wrong costs
days), add whichever of these fits, on top of the two-layer floor, never instead of it:

- **An independent second reader**, of a different *kind* of tool, not a second model from the same
  family — two models sharing a provider share a failure mode, and their agreement is an alarm
  system, not a certificate.
- **A measured checker on a sample plus every failure**, beyond the one required in layer 2 — it
  gets the item and its source, and returns discrepancies or an explicit acceptance, not an essay.
- **The partner pass — the coding CLI revises and fixes**, when available and it did not draft the
  item itself. This is the one extra layer that *repairs* rather than only reports: it returns
  corrected work plus a list of what it changed, so the required layer-2 check reads a fixed draft
  instead of a raw one. Its verdict is not overridden simply because it came from the other house.
  Layer 2 stays the final check, not the first reviser.

  - **Difficulty picks the model, nothing else** — the same rule as rung 1b, and for the same
    reason: at this step price is not the variable. Routine batches go to the CLI's routine model;
    an item that must be right climbs to its strongest model, when that house is measured reliable
    at exactly this kind of check (record what it caught and missed before relying on it).
  - **Run it non-interactively, on files** — `codex exec -m <model>` with the paths, or `codex
    review` for a code change — never a pasted body of material, same rule as every other brief.
  - ⚠️ **The coding CLI never revises what it drafted itself.** Since it is now Stage 2's default
    worker (§1), this pass collapses into self-review and is skipped far more often than not — the
    item then goes straight to the layer-2 checker with that fact stated.
  - ⚠️ **It is a paid pass whenever it runs, so a Stage 1 burn audit that plans on it carries it as
    a line item.** A gate nobody prices is how a cost forecast silently doubles.

**Who may check — a standing ruling that replaced "verification never leaves Claude".** This kind
of check is no longer Claude's alone. Any seat that has been **measured reliable on that kind of
check** may do it — record the measurement (what it caught, what it missed) before trusting a
seat with this job; there may be several among the gateway's ids that nobody has tested yet. Two conditions survive the ruling, because they are what "reliable" means:

- **Measured, not assumed.** A seat earns the checking job by being run against known-answer material
  first, with the result written down. Reputation and model size are not evidence. The one seat that
  produced the most confident, best-formatted output of an entire run was transcribing a page that
  does not exist.
- **Never its own work or, for an outside provider, its own house; a Claude builder's work goes to a
  separate refuter run.** A model checking itself is not a check. Two models from one vendor share
  blind spots — count the second at a discount (`roster.md`).

Where nothing measured exists for the job, the checker is Claude — the default, no longer the rule.

**The gateway's evaluation harness is where a seat earns the word "measured."** Found 2026-09-08 at
`/api/evals`: a built-in suite of 10 cases, and `POST /api/evals/suites` takes a custom one as
`{name, cases}` — each case a model, an input, and an `expected` graded by `contains` or `regex`.
That is the "run it against known answers and write the result down" step above, by machine and
repeatable across seats. Its limit is that grading method: it qualifies a seat, and it cannot tell
you a transcription is invented, which is the failure this stage exists for. It replaces none of the
layers above, default or optional. ⚠️ **No run route answered from outside** (`/run`, `/execute`, `/runs` all refused), so
running a suite is a dashboard action until proven otherwise — **never call a seat qualified on a
suite that was written but not run.**

**Anything Frame pulled off GitHub is `_scan`ned before it is read further and is never installed** —
same ruling as Stage 1, repeated here because this is where a skipped scan gets caught.

**Say exactly what was checked.** If a sample was checked, the corpus is not verified — it is
sampled, and the delivery says so. Name whether the partner pass ran, which Codex model took it, and
what it changed — a fix nobody records is indistinguishable from a fix nobody made. For work that
must be exactly right, every unit actually promoted gets compared against its source: stem, all options, answer key,
and any explanation being relied upon. Pay attention to negations, numbers, units and inequalities —
but do not check only those.

Quality is never traded for token savings. Savings come from routing, not from cutting the gate.

---

## Stage 5 — Deliver

- Output **inside the project folder** (your workspace rules on where output goes), with the decision log.
- A one-paragraph plain-language summary for the user — **no jargon, no technical background
  assumed.**
- **The project's own `MEMORY.md` updated** — live state, decisions and rejected options with
  reasons, deadlines as ISO dates, and the "Resume here" block left accurate. The root `MEMORY.md`
  gets **one pointer line and nothing else**; detail written there instead of in the project is what
  puts that file back against its cap. Both stay under 200 lines — prune before adding, history to
  the archive.
- A ready-to-paste **resume prompt** pointing at the plan file. It must be executable by a fresh
  session with no memory of this one — **if a fact lives only in this chat, it is not delivered.**
- **What the fleet actually cost, from the gateway rather than from memory.** The per-seat tables in
  `omniroute_cost_report` and the model histogram in `omniroute_get_session_snapshot` are the real
  numbers behind the block-1 cost checkpoint of Stage 3; `omniroute_cache_stats` says whether the
  cache carried any of it. ⚠️ Both tools report **0 for every total, request count and token count**
  while their detail underneath is correct, and the cost report alone is ~9k tokens — so read the
  per-seat rows, quote no total from them, and pull it once at delivery rather than during the work.
  Claude's own side of the bill comes from your own token-accounting script, if you have one.
- **Confirm the Stage 1 project home actually landed**: the pair exists, `CLAUDE.md` ends with
  `@MEMORY.md`, the "Connections to other projects" block answers rather than sits empty, and the
  root pointer line is there. Plus the rest of the standard scaffold — a `progress\` folder and an
  empty `ideas-parking.md`. Scaffolding is the ONE build exception during framing — skeletons only,
  no content work.

## Standing guards

- **Installs are the user's job** (sandbox gotcha, 2026-08-30): anything needed goes through a
  user-run Desktop `.bat` that writes a report file Claude then reads. Never trust the shell's own
  view of an install. Never let Claude create accounts, enter credentials, or accept terms.
- **Git is Claude's** (2026-09-07) — `git commit -F <msg> -- <paths>`, never `add -A` in a shared
  tree, never `--force`. A public push is confirmed with the user first.
- Report faithfully: failed research, dead lanes and unconfirmed facts are named as such. Never let
  silence imply success.
- All workspace rules — grounding, citations, coding standards, session hygiene — apply throughout.
  This skill adds to `CLAUDE.md`; it never overrides it.
