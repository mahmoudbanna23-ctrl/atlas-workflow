# Localising atlas to your own fleet

The workflow in `skills/atlas/SKILL.md` is general — leave it alone at first.

Everything under `skills/msn/references/` is **one person's fleet, measured on one machine, on one
date.** It is included so you can see what a finished capability survey looks like, not so you can
inherit its conclusions. Until you have replaced it, Claude will route your work to seats you do not
own, and it will do so confidently.

Work through the six items below. Item A is mandatory; the rest are quick.

---

## A. The seats — mandatory

Files: `skills/msn/references/roster.md`, `skills/msn/references/candidate-bench.md`, and the squad
table in `skills/msn/SKILL.md`.

Fastest route — a fresh Claude Code session, then:

> Read `LOCALISE.md`. Inventory the AI CLIs and API keys actually present on this machine. Rewrite
> `skills/msn/references/roster.md`, `skills/msn/references/candidate-bench.md`, and the squad table
> in `skills/msn/SKILL.md` so they describe MY fleet. Keep every structural rule; replace only the
> seats, the commands and the numbers. Delete any seat I do not have rather than leaving it in as an
> aspiration. Show me the diff before you save.

Then check by hand:

- **Every run command.** For each local CLI, run `<binary> --help` on *your* machine and record the
  real one-shot form. Some entries in the shipped roster are marked UNVERIFIED precisely because a
  flag has to be confirmed per machine and version.
- **Every path.** `AppData\Roaming\npm\...`, `~/.local/bin`, and similar are the sender's. Correct
  them or delete them.
- **Every key name.** Keep only providers you hold a key for. Each seat reads its key from an
  environment variable — never from a file, never from a skill.
- **Every measurement.** Scores, latencies, hit rates and token counts in these files describe
  someone else's machine on a past date. Either reproduce them or delete them. A stale number that
  looks authoritative is worse than no number.

## B. Your vision seat

Decide which of your seats is allowed to read an image, and write its limit next to it.

The sender's arrangement was a **local** vision seat, so private pages never left the machine. If
you have no local vision model, say so explicitly in the roster — then the honest rule is that no
private image goes to a vision seat at all, and you handle those pages yourself.

⚠️ Keep the standing warning whatever you decide: a vision model that returns fluent, confident
text has not thereby returned *correct* text. Check the output against the image.

## C. The data rule — write your own line

The shipped rule is the sender's: his own study material may go to any seat, because it is his and
he accepts the risk; a third party's uncleared material, secrets and personal identifiers never
leave, ever; and browser-session seats are never used because losing an account is the one
unacceptable outcome.

**Yours will be different. Write it down anyway, in one paragraph, before you route anything.**
The floor that should survive any version of it:

- No credentials, keys or tokens in any brief to any seat.
- No other people's private data without their say-so.
- Know, per provider, whether your inputs may be trained on — and decide with that in front of you
  rather than after.

## D. Delete the sender's leftovers

Grep for these and remove or rewrite what you find:

- References to a specific project name, its folders, or its deadlines.
- Workspace-rule pointers like "your workspace rules" that assume a `CLAUDE.md` you do not have —
  either point them at your own or drop the sentence.
- Any dated ruling that was a decision about someone else's work rather than a general rule.

## E. The department survey — copy the method, not the answers

`examples/departments.md` is a survey of what one machine turned out to be able to do. The three
rules it was built on are the transferable part:

1. **A capability gets listed only if it was observed working** — a tool answered, a run finished.
   Not a README claim, not an inference from a name.
2. **It needs either a staffed seat or a named, specific blocker.** "Nobody has tried" is not a
   blocker. "The route returns 404 on this build" is.
3. **The evidence is written down, with the date and what was actually seen.**

Nothing is admitted for being useful; nothing is refused for being useless today. The list is
expected to grow, and things are expected to fall off it when a build changes underneath you — in
the shipped example three departments lost their endpoint between one survey and the next.

Do your own survey. Keep the file. Re-run it after any gateway upgrade.

## F. Your own guards, if you want them

The sender's setup ran a few hooks that are not in this repo because they are workspace-specific,
but the shapes are worth stealing:

- **A size ratchet on instruction files.** Anything auto-loaded every session is a per-request tax.
  Cap it — a few hundred lines — and refuse writes that push it further over.
- **A credential guard.** A hook that refuses any shell command naming a credential store, so a
  key cannot be echoed into a log by accident.
- **A drift reminder.** A periodic nudge that re-states the routing ladder, because the main chat
  quietly starts doing the work itself after a run of tool calls. This one earns its keep.
