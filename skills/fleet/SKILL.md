---
name: fleet
description: Stop doing the work in the main chat and re-route it down the ladder — coding CLI through a gateway first, then the fleet, then Claude roles when all are out. Use when the user invokes /fleet, or says the chat has forgotten the rules, is burning tokens, is doing the work itself, should delegate, or should use the fleet/squad/seats. With an argument (e.g. "/fleet the transcription"), re-route only that piece.
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

Probe liveness with one tiny request per rung before a batch. On a limit or connection error, drop
one rung; do not retry in a loop, and never trust a quota tool.

1. **Inline in main chat:** only a one-liner fix or a single grep.

2. **Default worker — a coding CLI through the local gateway:** `auto/coding`, or
   `auto/coding:reliable` for must-be-right work; brief file, background run, short report back.

3. **CLI out, gateway alive:** a second coding CLI through the gateway, using the same combo and
   the dispatch loop in §6.

4. **Gateway down, CLI alive:** the coding CLI on its own login — a routine model for routine work,
   a stronger model for must-be-right work.

5. **Both out:** the rest of the fleet direct, no gateway — dispatch through `/msn`
   (`skills/msn/SKILL.md`). Pick a seat by roster entry, never by matching text in a model id. Every
   output is checked.

6. **Fleet all out:** re-route to Claude roles, never to main chat itself:

- **scout** = Haiku — finds files/symbols/locations, reports locations, not file dumps.
- **researcher** = Sonnet — reads docs/sources, reports facts, marks anything unverifiable as unverified.
- **builder** = lean-drafter on Sonnet — builds from a clear spec, runs the checks.
- **refuter** = Opus — reviews the builder's work, re-runs the checks itself, never trusts a "done" claim.
- **debugger** = Opus, rare — hard root-cause work only.

Definitions for all five: `agents/scout.md`, `agents/researcher.md`, `agents/refuter.md`,
`agents/lean-drafter.md`, `agents/debugger.md`.
Any role hitting an ambiguous source **escalates, never decides.**

7. **Claude window low:** stop, write a handoff, and resume after the reset.

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
