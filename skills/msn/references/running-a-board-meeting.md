# Running the squad — route first, convene only when it earns it

The manager's job is to get the best outcome for the fewest of Claude's tokens. Three modes: the
**router** (most work), the **full board** (rare, attacks a finished plan), and the **team talk**
(rarer, *builds* a plan and assigns the work). The mechanics below are lifted from
five MIT-licensed council projects — provenance kept so the choices are grounded, not invented:
claude-council, agent-council, llm-council, dubs3c/council, the-llm-council, and the Mixture-of-Agents
(MoA) pattern.

---

## Mode 1 — the router (the default)

A cheap classify-then-route step, not a meeting. The router seat idea comes from **the-llm-council**;
it is more token-frugal than convening everyone for every item.

1. **Classify the item.** What kind of work — draft / code / research / critique / decision /
   vision-read? How high are the stakes? Is there one right answer that can be verified from disk?
2. **Route to the ONE seat best at it** (see [roster.md](roster.md)):
   - scanned page → **Codex** (only vision seat, local).
   - coding/tooling → **opencode** (relay) or **agy**.
   - prose/transcription of non-private text → **vibe**.
   - quick reasoning / a second opinion → **grok**.
   - hard reasoning, drafting, research synthesis, image gen → **Gemini** (API, `gemini-3.6-flash`).
   - fast critique / a cheap second reasoning pass → **Groq** (API).
   - a model none of the others covers → **OpenRouter** (API) — ⚠️ **credit exhausted**, free-routed
     ids only until the user tops up, and every call needs `max_tokens`.
   - vendor-independent judgement, worth ~83k tokens → **Fable 5.1** (bounded subagent).
   - adversarial attack on a plan → **ChatGPT** (paste-back).

   The three API seats take the **user's own non-private material only** — never a scanned, sensitive
   or copyrighted page, never anyone else's data. Those stay with Codex.
3. **Manager writes the brief, seat plays it, manager verifies from disk, you land it.** That closes
   most items without a meeting. Dispatch mechanics: [dispatch-and-verify.md](dispatch-and-verify.md).

**Escalate to the full board only when** the decision is high-stakes, the seats genuinely disagree, or
a plan must survive attack before you commit to it. **Escalate to the team talk when there is no plan
yet** and the project is big enough that who-does-what is itself a hard question.

---

## Mode 2 — the full board (proposer → aggregator)

The layered **MoA** shape: diverse cheaper seats **propose**; the strongest seat **aggregates**. Here
the aggregator is always **Claude/Opus** — the manager writes the final answer (MoA's rule: the
strongest model writes the synthesis).

### Stage 1 — independent proposals (parallel)

Every seat on the agenda answers the **same question independently**, in parallel, with no sight of the
others' answers yet (from **agent-council**'s stage-1). One bounded brief each; each returns to disk.
Keep proposals cheap and diverse — that diversity is the value.

**Count vendors, not seats.** Two seats on the same vendor are one opinion wearing two shirts, and a
board that looks six-wide can be two-wide underneath. **Codex and Astra are the same channel** — never
seat both and call it independence. Groq runs OpenAI-authored weights. The vendor-independent seats on
this roster are **Fable 5.1** (Anthropic) and **Gemini** (Google); if neither is on the agenda, say so
in the minutes rather than presenting the result as a diverse board.

### Stage 2 — collect

Gather every proposal to disk (the job-directory + poll pattern from **agent-council**; the same
`result.json`-to-disk collection MSN already uses). Nothing is judged yet.

### Stage 3 — (optional) one debate round — high stakes only

For a genuinely contested decision, run **one** debate round (from **dubs3c/council**): each seat is
shown the others' proposals and may revise or raise a concern. Skip this for anything routine — it
doubles the spend. Never more than one round here; deeper adversarial work is the ChatGPT gate, not a
fleet loop.

### Stage 4 — aggregate, without bias

Before the manager judges, **strip attribution and shuffle** the proposals (from **llm-council**) so no
seat wins on its name or its position in the list. Then the manager:

- Scores on an explicit rubric (coverage · feasibility · risk handling), and
- **Merges the strongest elements** rather than crowning one winner.

### Stage 5 — the minutes (synthesis honesty)

The manager writes minutes that **separate agreement from divergence** (from **claude-council**):

- **Agreed:** what every seat converged on.
- **Split:** where they diverged, and the strongest case on each side.
- **⚠️ Unverified consensus:** any point they all assumed but none verified — flagged loudly, because
  unanimity is not evidence. This is the honesty rule that keeps a board meeting from laundering a
  shared guess into a fact.
- **Manager's recommendation**, then **your decision** — you are the captain; the board advises.
- **Challengers (only when there are any):** items where the squad was weak — no seat fit, or an outside
  candidate would plausibly be better on quality, speed, cost, capability or reliability. Log them to
  [candidate-bench.md](candidate-bench.md) in that file's format and **change nothing this session**.
  Omit this section entirely when the lineup held; an empty challenger section every meeting is noise.

**Adopting a wrong critique is as bad as ignoring a right one.** A meeting creates pressure to concede
something to every seat that spoke, and conceding to a critique that is simply incorrect damages the
plan exactly as much as stonewalling a correct one would. Agree where a seat is actually right; record
the rest under **Split** with the reason it lost, and move on.


---

## Mode 3 — the team talk (build a plan, and pick the team)

**When:** a project large enough that the plan itself is the hard part, and the routing of the work
across seats is a real decision rather than an obvious one. This is the mode `/atlas`'s Route stage
calls instead of the old ChatGPT-only debate ritual — the squad argues the plan into shape *and* proposes
who plays where, rather than one outside mind attacking a finished document.

**Honest mechanic, stated so nobody builds on a fiction: there is no shared channel and no live group
chat.** Seats cannot hear each other. The manager relays — pools every answer into one transcript and
hands it back to everyone in the next round. It behaves like a group chat and costs one extra hop.
Never describe it to the owner as seats "talking to each other".

### Stage 0 — probe availability, before writing anything

Call each candidate seat with a trivial prompt (or list its models) and record who answers. **Seats
die quietly**; a meeting designed for six seats that reaches three is a meeting whose diversity
argument has silently collapsed. See the availability warning in [roster.md](roster.md).

### Stage 1 — the agenda (one brief, reused by every seat)

**Self-contained** — zero workspace context needed to answer it, the same gate your planning skill uses. It carries the
problem, the constraints, the house rules, and this explicit three-part ask:

1. Propose the plan.
2. Say **which seat should own each part of the work**, and why.
3. Name **what you personally cannot do** — the limits of your own seat.

Part 3 is the one that makes the team sheet honest; a seat is the cheapest source of truth about its
own ceiling.

**Data rule, unchanged and absolute:** nothing private, sensitive, copyrighted, scanned or personal goes
into this brief. Genericise the problem until it can be attacked by a stranger. If the real problem
cannot survive genericising, it is not a team-talk item.

### Stage 2 — round 1, the open floor (parallel, blind)

Every reachable seat answers independently, with no sight of the others. Cheap and diverse — that
diversity is the entire value, and it is destroyed by letting them see each other first.

### Stage 3 — the transcript

Manager pools every answer to disk, **strips attribution and shuffles** (llm-council's rule, applied
here so round 2 argues with positions rather than with reputations). That pooled, anonymised document
is the group chat's shared history.

### Stage 4 — round 2, the argument

Hand the transcript back to every seat: *here are the other proposals; argue with them, name what is
wrong, defend or revise your own.* This is the group-chat step. One dispatch per seat, still bounded,
still returns.

### Stage 5 — round 3, only if a real disagreement survives

**Hard cap: three rounds.** A third round runs only when round 2 left a genuine unresolved split that
matters to the plan. Rounds are not free and the returns fall off a cliff — most value is in rounds 1
and 2.

### Stage 6 — the verification pass (manager alone, never delegated)

**Every load-bearing claim is tested against disk or against running code before it enters the plan.**
Not sampled — every one that the plan would rest on.

> **⚠️ THE STANDING WARNING, PAID FOR 2026-09-05.** A board of three seats unanimously asserted that a
> print pipeline needed a polyfill library, that a 300-page render would exhaust memory, and that the
> route would be slow. The manager wrote and ran the test instead of adopting the consensus: the
> polyfill was unnecessary, and 300 pages rendered in **1.6 seconds**. **All three were wrong
> together.** One seat additionally invented specifics wholesale — a tool "already installed", a 404
> on a file never requested, a library that does not do the job.
>
> **Unanimity is not evidence. It is correlated training data.** A claim that can be tested is tested;
> a claim that cannot be tested is written into the minutes as unverified, never as agreed.

### Stage 7 — the team sheet

The output the router mode never produces: **every work item in the project, routed.** Seats propose
it in stage 1; the manager builds the real one after verifying against [roster.md](roster.md).

| Work item | Seat | Why this seat | Data rule | Fallback if it is down |
|---|---|---|---|---|

Rules that bind the sheet:

- **Anything touching a scanned, sensitive or copyrighted page is Codex, locally, always.** No exception
  a seat proposes survives this.
- **Verification is never on the sheet.** It is the manager's, in every row.
- **Every row needs a fallback**, because stage 0 already proved seats vanish.
- **The sheet is a proposal until the owner signs it.** Seats do not staff the project.

### Stage 8 — the minutes

Same format as the full board, plus the sheet:

- **Agreed** — what every seat converged on.
- **Split** — where they diverged, and the strongest case on each side.
- **⚠️ Unverified consensus** — what they all assumed and none verified, flagged loudly.
- **Verified** — what the manager tested, and what the test returned. This section is the one that
  outranks all three above it.
- **The team sheet.**
- **Manager's recommendation**, then **the owner's decision.**

### What the team talk costs

Round 1 + round 2 across five seats is ten dispatches, plus the manager's pooling, verification and
write-up. That is a real spend, and it is why the mode is rare and the round cap is hard. **If the
router can close the item with one seat, the team talk is the wrong tool.**

---

## The rules that bind every mode

- **The manager never delegates the verification or the human gate.** A seat's output is data; it is
  re-checked from disk before it counts (sensitive content: read against the page image).
- **One bounded job per seat, then it returns** — cost is step count. Never leave a seat running.
- **Nothing private leaves the machine** — vision on private material stays with Codex; the off-machine
  seats (Gemini, Groq, OpenRouter, and the free lane) take the **user's own non-private text only**,
  never a scanned/sensitive/copyrighted page, never anyone else's data, never a secret.
- **Keep the meeting cheap.** The full board and the team talk are the exceptions. If the router can
  close an item with one seat, that is the right answer — convening five models to rename a variable is
  the token trap MSN exists to avoid.
- **Test what can be tested, before it is written down.** A seat's claim about how a tool behaves is a
  hypothesis; running the tool is the answer. See the standing warning in Mode 3, stage 6.
- **Seats propose, they never staff or decide** (hard rule 7). The team sheet, the plan and the call
  are the manager's and the owner's.
