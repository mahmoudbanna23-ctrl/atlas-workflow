---
name: fleet
description: Stop doing the work in the main chat and re-route it down the ladder — a script for bulk per-item calls first, then one bounded agentic attempt on a measured seat, then Claude roles when both are out. Use when the user invokes /fleet, or says the chat has forgotten the rules, is burning tokens, is doing the work itself, should delegate, or should use the fleet/squad/seats. With an argument (e.g. "/fleet the transcription"), re-route only that piece.
---

# Fleet — you drifted. Re-route.

The user fired this because the main chat started doing the labour itself. That is the single most
expensive failure mode this workflow guards against, and it is invisible from the inside: each step
feels reasonable, and the bill is in the step count, not the step (see `README.md`, "Cost is step
count").

Do not apologise, do not write a plan about delegating. **Re-route the actual work, in this reply.**

## 1. Name what happened — one or two sentences

Say plainly what you were doing that should not have been yours: transcribing, drafting, searching,
formatting, bulk reading, writing a first draft, sweeping files. If you were genuinely on the right
rung, say so and why — with the reason, not a defence.

## 2. Check the fleet, then pick a rung

Capability, not liveness: once per session run one tiny real task per seat (a tool call, a number
read off an image) and write the results to a capability file (e.g. `seats-alive.json`). A pong
proves nothing. Two failed dispatches on a job → a Claude role, never a third try; never a retry loop.

1. **Inline in main chat:** a one-liner fix or a single grep, nothing with steps.

2. **Bulk per-item work:** a script making single-shot gateway calls, one POST per item to a named
   priority-failover combo you built from seats you measured (e.g. `work-text` / `work-vision`).
   Free seats hold single calls, never an agentic loop. Never `auto/*` — measured 0 of 221 successful
   requests over a week; free-tier caps hold single calls, not 30–60-turn agent loops.

3. **A job with steps:** ONE agentic attempt, under a wall clock, on a seat your capability file
   marks capable — a coding CLI through the gateway (`tools/omniroute/codex-gw.sh`, set
   `CODEX_GW_MODEL`, no default — without its flags Codex's extra tool types make the gateway return
   no tool calls, and the run edits nothing), a coding CLI on its own login, or dispatch through
   `/msn` (`skills/msn/SKILL.md`) for one bounded draft or check. Pick a seat by roster entry, never
   by matching text in a model id. Every output is checked.

4. **Fleet all out:** re-route to Claude roles, never to main chat itself:

- **scout** = Haiku — finds files/symbols/locations, reports locations, not file dumps.
- **researcher** = Sonnet — reads docs/sources, reports facts, marks anything unverifiable as unverified.
- **builder** = lean-drafter on Sonnet — builds from a clear spec, runs the checks.
- **refuter** = Opus — reviews the builder's work, re-runs the checks itself, never trusts a "done" claim.
- **debugger** = Opus, rare — hard root-cause work only.

Definitions for all five: `agents/scout.md`, `agents/researcher.md`, `agents/refuter.md`,
`agents/lean-drafter.md`, `agents/debugger.md`.
Any role hitting an ambiguous source **escalates, never decides.**

5. **Claude window low:** stop, write a handoff, and resume after the reset.

**Main chat = orchestrator only** — plans, writes briefs, reads short reports, judges, integrates.
Claude doing the work itself directly is critical-only, and ask first.

Run a script check, then one independent checker. An outside provider never checks its own work; a
Claude builder's work goes to a separate refuter run.

## 3. Data rule

Your own material may go to any seat you have cleared it for — set that policy once and follow it.
**Never:** a third party's uncleared data, secrets, or personal identifiers, to any seat. **Never a
browser-session seat driven through your own logged-in cookies** — account ban is the one redline
that is never worth the tokens saved.

**Verification may leave Claude** — to a seat *measured* reliable on that kind of check, and never
the seat that produced the item being checked.

**Never leaves Claude:** edits to your own config/rules files (whatever plays the role of
`CLAUDE.md` / `MEMORY.md` / `settings.json` here), and git.

## 4. Marching orders — every brief carries this

Goal · exact files/URLs in scope · what it may change · what it must verify · what not to do ·
output format · output length cap · facts already known (so it doesn't re-discover them).

## 5. Reports stay short

A worker reports back short: verdict plus file paths, not the work itself. Large output goes to a
scratch file the next agent reads. **Main chat never opens a worker's raw output.**

## 6. The dispatch loop — a coding CLI or the fleet

Write the brief to a file, run it in the background, read only the seat's result file for the
verdict, and rework with a delta brief — never re-paste the whole task. The full loop, per seat, is
`skills/msn/references/dispatch-and-verify.md`.

## 7. Do it now

Pick the rung, name the seat or role, and dispatch — in this reply, not the next one. Then say in
one line what you kept for yourself and why.

## 8. Register check

Drift in routing and drift in register share a trigger — a long tool-heavy stretch. If your own
style rules run shorter under pressure (a caveman/terse mode, a length cap, a tone rule), re-check
them here: headers, bold runs and multi-point lists creeping back in are the usual drift signature.
Compress the reply, never the substance.
