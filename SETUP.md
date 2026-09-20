# Setting atlas up

Read this once through before doing any of it. Roughly 30–45 minutes if OmniRoute behaves, and you
can stop after Part 2 and still have a working setup — Parts 3 onward are the gateway, which is
optional and which is where most of the sharp edges are.

Every step ends with **a check that proves it worked.** Do not skip those. The whole method rests on
not trusting a capability you have not personally seen answer.

---

## Part 0 — the one rule about keys

**A key lives in an environment variable. It never lives in a file in this repository, in a project
folder, in a skill, or in a message to a model.**

Windows (permanent, needs a **new** terminal afterwards to be visible):

```bash
setx GEMINI_API_KEY "your-key-here"
```

Mac / Linux (add to `~/.zshrc` or `~/.bashrc`, then open a new shell):

```bash
export GEMINI_API_KEY="your-key-here"
```

⚠️ **`setx` does not affect the shell you type it in.** It writes to the registry for future
processes. If you set a variable and something still cannot see it, the process is older than the
variable — restart it. This costs people an hour, reliably.

⚠️ **A process only inherits the environment of whatever launched it.** If Claude Code was started
from a terminal opened before you set the key, Claude does not have the key either. Close it and
start it again.

Check, without printing the value:

```bash
node -e "console.log(process.env.GEMINI_API_KEY ? 'set, ' + process.env.GEMINI_API_KEY.length + ' chars' : 'MISSING')"
```

**Before you set any paid key, put a hard spend cap on it in that provider's dashboard.** Do that
first, not later. A misrouted loop against a metered model is the single most expensive mistake
available here.

---

## Part 1 — the skills

Copy `skills/atlas`, `skills/msn` and `skills/fleet` into your Claude Code skills directory:

- **Windows:** `C:\Users\<you>\.claude\skills\`
- **Mac / Linux:** `~/.claude/skills/`

**Check:** start a *fresh* Claude Code session and type `/atlas`. If nothing resolves, the skill
registry did not see the folder — confirm the path has `skills/atlas/SKILL.md` in it, with the
frontmatter block at the very top of the file, and that you really did start a new session.

---

## Part 1a — the agents, the fleet skill, and the drift hook

Three pieces that make the "main chat is an orchestrator, not labour" model actually hold under a
long session, none of them required to use `/atlas` at all.

**The agents.** Copy `agents/` into your Claude Code agents directory:

- **Windows:** `C:\Users\<you>\.claude\agents\`
- **Mac / Linux:** `~/.claude/agents/`

so you end up with `.../agents/scout.md`, `researcher.md`, `refuter.md`, `lean-drafter.md`, `debugger.md`. These
are the Claude-side roles used only when every outside rung (gateway, both CLIs, fleet) is out
(see `skills/fleet/SKILL.md`). Each file's frontmatter pins its own model — cheapest that clears the
job, not the model the main chat happens to be running.

**Check:** start a fresh session, and ask the main chat to dispatch a trivial read-only search to
the `scout` subagent. If it cannot find the agent, confirm the folder path and that model names in
each file's frontmatter (`haiku` / `sonnet` / `opus`) match what your Claude Code build accepts.

**The fleet skill.** `skills/fleet/SKILL.md` was copied in Part 1 along with the other two. It is
the drift alarm: invoke `/fleet` when a chat has started doing the labour itself, and it re-routes
in the same reply rather than writing a plan about re-routing.

**The drift-guard hook.** `tools/guard/drift-guard.js` is a PostToolUse hook: it counts tool calls
per session and injects a short reminder every 10 calls, plus a step-budget warning once a
main-chat session passes roughly 80 steps (see README, "Cost is step count"). Wire it into your
Claude Code `settings.json`:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "*",
        "hooks": [
          { "type": "command", "command": "node /absolute/path/to/atlas/tools/guard/drift-guard.js" }
        ]
      }
    ]
  }
}
```

Use an absolute path — hooks do not resolve relative to the repo. **Check:** run any tool ten times
in a session (ten file reads is enough) and confirm a drift-check reminder appears; only sessions
started *after* the settings edit will see it.

**The cost report.** `tools/token-audit.js` reads the real `usage` fields Claude Code already wrote
to your own transcripts — no setup beyond having used Claude Code at all. Run
`node tools/token-audit.js --help` for usage, or `node tools/token-audit.js --agents` for a
per-subagent growth table after a real session.

---

## Part 2 — your fleet of seats

A "seat" is any model you can send a job to. Three kinds, and you do not need all three:

**a. Local CLIs.** Model vendors' own command-line tools. Each one is a seat that runs on your
machine and bills against whatever account it is signed into. For every CLI you have, find its
one-shot run flag — the form that takes a prompt, does the work, and exits without an interactive
session:

```bash
<binary> --help
```

Write the exact command down. **They differ per tool and per version**, and a wrong flag looks like a
hang rather than an error.

**b. API seats.** Anywhere you hold a key. Set each key as an environment variable per Part 0.

**c. Paste-back seats.** A model you have in a browser but not on an API. These are legitimate, and
they are also where people get their accounts banned: **never drive a consumer web UI with browser
automation through your own logged-in session.** Paste in, paste out, by hand, or not at all.

Now write down what you have. Open a fresh Claude Code session and say:

> Read `LOCALISE.md` in this repo, then inventory the AI CLIs and API keys actually present on this
> machine, and rewrite `skills/msn/references/roster.md` and the squad table in `skills/msn/SKILL.md`
> to match my fleet. Keep the structure and the rules; replace the seats. Show me the diff first.

**Check:** send one trivial job to each seat and confirm a sane answer comes back. A seat that has
never answered is not a seat.

---

## Part 3 — OmniRoute, if you want a gateway

OmniRoute is an MIT-licensed **local** server that puts one API in front of many providers. You do
not have to use it; atlas works without it. What it buys you is *retry inside the gateway* — when a
seat fails, the gateway tries the next one instead of handing the failure back to Claude, and a step
that never reaches Claude is a step you do not pay for.

```bash
npm install -g omniroute
```

It serves on **`http://localhost:20128`**. On Windows the binary lands at
`C:\Users\<you>\AppData\Roaming\npm\omniroute.cmd`.

Open the dashboard in a browser, create an admin API key there, and set it:

```bash
setx OMNIROUTE_API_KEY "the-key-the-dashboard-gave-you"
```

Then add your providers in the dashboard's connections page — one connection per provider, each
holding that provider's own key.

**Check** (from a *new* terminal, so it has the variable):

```bash
node tools/omniroute/probes/dept-scan.mjs
```

That calls about thirty endpoints and prints a status and a shape for each. You want `200`s. If
every line says `ERR fetch failed`, the server is not running or is on a different port; if every
line says `401`, the key is wrong or the terminal is older than the variable.

### What the scan is actually for

**Read a 404 carefully.** In this API a `405` means the route exists and wants a different HTTP
method. A `404` means no route at that path — which very often means *your notes have the wrong
path*, not that the feature is missing. Two real examples from the survey in
`examples/departments.md`: the batch endpoint is `/api/batches`, not `/api/batch`, and the combo
list is `/api/combos/auto` — `/api/combos` holds only custom combos and looks empty on a fresh
install.

Run `dept-detail.mjs` next for the contents of whatever came back with something in it.

---

## Part 4 — combos, which is the part worth your attention

The gateway exposes **combo ids you use exactly like model names.** They are pools with a fallback
strategy, so a bad seat is retried inside the gateway. On the machine surveyed here there were
**forty** of them — `auto`, `auto/coding`, `auto/reasoning`, `auto/vision`, `auto/fast`,
`auto/cheap`, `auto/smart`, families of `auto/best-*` and `auto/pro-*`, and single-vendor pools.

List yours:

```bash
node tools/omniroute/probes/dept-detail.mjs
```

Three things learned the hard way:

- ⚠️ **Leave a big `max_tokens`.** These ids spend the budget on hidden reasoning and will return a
  `200` with an empty string if you are stingy. An empty answer here is almost always this.
- ⛔ **Be suspicious of `:free` variants.** In testing, `auto/coding:free` answered a
  question about words with a bare floating-point number.
- ⚠️ **A combo's name is not a measurement.** `auto/best-coding` is a claim by the gateway, not a
  result. Measure before you rely on one — see Part 5.
- ⛔ **Never route to an `auto/*` combo.** It fans one request across its whole candidate pool, and
  free-tier caps hold a single call, not that — measured 0 of 221 successful requests over a week.
  The ladder here never lands on one; build a named, priority-failover combo from seats you measured
  instead (Part 5).

For comparison, on the surveyed machine the *routed combos* answered 12 of 12 test items correctly
while individually named seats scored between 22% and 64%. That gap is the argument for the gateway.
**It is also one machine on one day. Reproduce it before believing it.**

---

## Part 5 — measure your seats, do not rank them by vibe

The gateway carries an evals feature: suites of cases with known answers, run against named targets.
On the surveyed machine it held **7 suites and 44 cases and had never once been run** — which is the
normal state of this feature everywhere, and it is a waste.

Before you trust a seat with anything that matters:

1. Write ten items with answers you already know, of the kind you actually send.
2. Run every candidate seat against them.
3. Write the score down, with the date, next to the seat's entry in your roster.
4. Re-check after any provider change. Model ids get silently re-pointed.

**Two rules that survive every fleet:**

- **The seat that produced a thing never verifies it.** Discount a second opinion from the same
  vendor, too — same house, same blind spots.
- ⚠️ **Never judge a transcription by how well it reads.** A vision model once returned a fluent,
  confident, entirely correct-looking transcription of *a different page*. Check the output against
  the input, every time.

---

## Part 6 — MCP, optional

The gateway can expose itself to Claude Code over MCP. Point a `.mcp.json` at it with transport
`streamable-http`.

⚠️ **Every MCP tool description is re-sent on every request for the whole session.** A server
offering a hundred tools is a permanent tax on a conversation that uses two of them. Filter the tool
list down to what you actually call — `tools/omniroute/mcp-allowlist.json` is a worked example of
that filtering, with a written reason for each cut, and `measure-allowlist.mjs` re-measures the
byte cost so the decision is a number rather than a feeling.

---

## Part 7 — the checks you should keep running

- **Health and cost.** The gateway reports its own cache performance at `/api/cache`. On the
  surveyed machine the semantic cache had saved 43,600 tokens at a 13.6% hit rate, and nobody had
  configured it — it just ran. Worth knowing what yours does.
- **Backups.** `/api/db-backups` showed automatic snapshots every six hours plus one before a schema
  migration. That migration date turned out to explain three endpoints that had gone missing.
- ⚠️ **Some settings accept a write and never persist.** On the surveyed build two of them did
  exactly that: they returned success and read back unchanged. If a switch does not stick after two
  attempts, stop; it is inert, and it is not you.

---

## What to do when it all breaks

In order:

1. **Is the process older than the environment variable?** Restart it. This is the answer far more
   often than it should be.
2. **Is the path wrong rather than the feature missing?** `404` vs `405` — see Part 3.
3. **Is a status endpoint lying?** On the surveyed gateway the quota endpoint reported 100% healthy
   for every provider including two that were dead. **Never route based on a self-reported health
   number.** Send a real request and see what comes back.
4. **Did the model id change under you?** A `400` on a request that used to work is almost always
   the id, not the key.
