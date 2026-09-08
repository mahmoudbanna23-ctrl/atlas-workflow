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
| `tools/omniroute/` | **The gateway probes.** Small node scripts that ask a local OmniRoute install what it can actually do, instead of trusting its dashboard. |
| `examples/departments.md` | **A worked example** — a real capability survey of one machine, written to the rules in `SETUP.md`. Read it to see what the output looks like before you make your own. |
| `SETUP.md` | **Start here.** Install, API keys, OmniRoute, and how to verify each piece actually works. |
| `LOCALISE.md` | Swapping the sender's seats for yours. Do this before you trust anything in `skills/msn/references/`. |

---

## The idea in one page

**1. The default worker is not the main chat.** There is a ladder, and you take the lowest rung that
can do the job:

1. **A script**, if the work is per-item and repetitive. A hundred items is a loop, not a hundred
   conversations.
2. **A cheap outside seat** — whatever model CLIs and API keys you have. Reading, searching,
   drafting, transcribing, formatting, first-draft code all leave.
3. **A Claude subagent**, only when no outside seat can do it.
4. **The main chat**, for reviewing, judging and routing — not for labour.

Say which rung you are on before you start. That one habit is most of the saving.

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

Copy the two skill folders into your Claude Code skills directory:

- **Windows:** `C:\Users\<you>\.claude\skills\`
- **Mac / Linux:** `~/.claude/skills/`

so that you end up with `.../skills/atlas/SKILL.md` and `.../skills/msn/SKILL.md`.

Start a **fresh** Claude Code session — the skill registry loads at session start, so a running
session will not see them. Then `/atlas` and `/msn` should resolve.

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
