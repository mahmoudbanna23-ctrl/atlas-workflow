# atlas

**A workflow for Claude Code that stops Claude doing the work itself.**

Claude is expensive per step, and the cost of a session is the number of steps it takes, not the
size of the context it started with. atlas is the operating model that came out of measuring that:
Claude frames the job, routes it to the cheapest machinery that can actually do it, runs it, gates
the result, and delivers — and it is the *routing* that saves the money, not any single clever prompt.

This repository holds the whole thing, so you can run it on your own fleet:

| | What it is |
|---|---|
| `skills/atlas/` | **The workflow.** Five stages: Frame → Route → Do → Gate → Deliver. Install as a Claude Code skill, invoke with `/atlas`. |
| `skills/msn/` | **The squad.** How a task gets handed to a specific model seat, briefed, and checked when it comes back. `/msn`. |
| `skills/fleet/` | **The drift alarm.** Fires when the main chat starts doing the work itself; re-routes down the ladder — coding CLI through a gateway first, then the fleet, then the Claude roles below when all are out. `/fleet`. |
| `agents/` | **The Claude-side roles.** Five narrow subagent definitions — scout, researcher, builder (`lean-drafter`), refuter, debugger — for when work has to stay inside Claude. |
| `tools/omniroute/` | **The gateway probes.** Small node scripts that ask a local OmniRoute install what it can actually do, instead of trusting its dashboard. Plus `codex-gw.sh`, which runs `codex exec` through the gateway with tool calls working. |
| `tools/guard/drift-guard.js` | **The step-budget hook.** A PostToolUse hook that reminds you every 10 tool calls to re-check register and routing, and flags a ~80-step main-chat session for a fresh start. |
| `tools/token-audit.js` | **The real cost report.** Reads the `usage` fields Claude Code actually wrote to your transcripts — measurement, not estimate — main chat vs subagents, biggest sessions, per-agent growth. |
| `examples/departments.md` | **A worked example** — a real capability survey of one machine, written to the rules in `SETUP.md`. Read it to see what the output looks like before you make your own. |
| `SETUP.md` | **Start here.** Install, API keys, OmniRoute, and how to verify each piece actually works. |
| `LOCALISE.md` | Swapping the sender's seats for yours. Do this before you trust anything in `skills/msn/references/`. |

---

## The idea in one page

**1. The default worker is not the main chat — it is an orchestrator, not labour.** There is a
ladder, and you take the lowest rung that can do the job:

1. **Inline in main chat** — only a one-liner fix or a single grep. Anything with steps goes down.
2. **Default worker — a coding CLI through the local gateway** (`skills/fleet/`, `skills/msn/`): use
   `auto/coding`, or `auto/coding:reliable` for must-be-right work; brief file, background run,
   short report back. Codex goes through `tools/omniroute/codex-gw.sh`, which makes tool calls work.
3. **That CLI out, gateway alive** — a second coding CLI through the gateway, using the same combo.
4. **Gateway down, a CLI still alive** — the coding CLI on its own login: a routine model for
   routine work, a stronger model for must-be-right work.
5. **Both out** — the rest of the fleet direct, with no gateway. Every output is checked.
6. **Fleet all out — Claude roles** (`agents/`) — scout (Haiku), researcher (Sonnet), builder
   (Sonnet), refuter (Opus), debugger (Opus, rare). A role hitting an ambiguous source escalates,
   never decides.
7. **Claude window low** — stop, write a handoff, and resume after the reset.

**Main chat orchestrates throughout** — plans, writes briefs, spins up agents, reads short reports,
judges, integrates. It never bulk-reads and never opens a worker's raw output directly.

Probe liveness once with one tiny request per rung before a batch. On a limit or connection error,
drop one rung; do not retry in a loop, and never trust a quota tool.

Run a script check, then one independent checker. An outside provider never checks its own work; a
Claude builder's work goes to a separate refuter run.

Say which rung you are on before you start. That one habit is most of the saving. Every brief down
the ladder carries marching orders: goal, files/URLs in scope, what it may change, what it must
verify, what not to do, output format and length cap, facts already known. `/fleet` is the alarm for
when a chat has drifted into doing the labour itself.

**2. Cost is step count.** Every step re-sends the whole conversation, and the conversation grows as
the work proceeds. A long-running agent costs its full context on *every remaining step*, so a lean
agent left running is worse than a fat agent that returns quickly. Keep both short: one bounded job,
then return.

**3. Never trust a capability you have not seen work.** Not a README claim, not a plausible
inference from a name, not a dashboard's own status light. This repo ships probes rather than
promises for exactly that reason — see `examples/departments.md`, where three features that were
written down as "one setting away" turned out to have no route at all.

**4. Verification is a separate job from production.** Whatever produced a thing does not get to
mark its own work. That holds for Claude too.

---

## Install, short version

```bash
git clone <this-repo> atlas
```

Copy the three skill folders into your Claude Code skills directory, and `agents/` into your
Claude Code agents directory:

- **Windows:** `C:\Users\<you>\.claude\skills\` and `C:\Users\<you>\.claude\agents\`
- **Mac / Linux:** `~/.claude/skills/` and `~/.claude/agents/`

so that you end up with `.../skills/atlas/SKILL.md`, `.../skills/msn/SKILL.md`,
`.../skills/fleet/SKILL.md`, and `.../agents/scout.md` (plus the other four role files) alongside it.

Start a **fresh** Claude Code session — both registries load at session start, so a running
session will not see them. Then `/atlas`, `/msn` and `/fleet` should resolve.

**Then read `SETUP.md`.** The skills as shipped describe the sender's fleet; until you localise
them they will confidently route work to seats you do not have.

---

## What this is not

- Not a framework, not a dependency. It is a set of Markdown instructions plus a handful of
  single-file node scripts. Nothing is installed into your project.
- Not model-specific. The seats named in `skills/msn/references/` are one person's fleet, measured
  on one machine, on one date. **They are examples of the method, not a recommendation.** Your
  numbers will differ, and the point is that you measure your own.
- Not a way to avoid paying for anything. It is a way to stop paying the top rate for work that a
  cheaper seat does just as well.

## Licence

MIT — see `LICENSE`. Do what you like with it, including selling it, with no warranty from me.
