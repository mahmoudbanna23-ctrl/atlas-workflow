# Dispatch, verify, land

The loop is the same for every seat: **brief → dispatch → review from disk → land**. Steps 1, 3, 4 are
the manager's judgment; step 2 is mechanical. The commit boundary never moves: **the party that
verified the work commits — and that is you.**

⚠️ **Not shipped in this repo:** the sender's setup had a separate `opencode-delegate` skill
holding the long form of coding dispatch — writing the brief, dispatching and polling, reviewing and
landing the diff. It is not included here because it is specific to one CLI and one machine. What
follows is the general loop; if you use a coding CLI heavily, write the equivalent detail for yours
and link it from here.

---

## 1. Write the brief

A seat sees **only** the brief text plus what it can read from the working tree — no chat history, no
shared context. Everything the task needs goes in:

**Prepend [seat-briefing.md](seat-briefing.md) verbatim** for every non-local seat — it catches the
seat up on how the board works and what binds it, so it answers as a member and not as a stranger.
If, and only if, the item is about how the example project is *organised*, append
[context-herophilus.md](context-herophilus.md) too; it is process and economics only, and no medical
content may be added to it. Then the brief itself:

- **Goal** — one task per brief.
- **Current state** — where the files are, what already exists.
- **Change / produce** — exactly what to do, and **what to leave untouched**.
- **The real gate commands** — discover them from the repo's `AGENTS.md` / `CLAUDE.md` / scripts; do
  not assume. For the example project content that means the validator and boot-check, not a test runner.
- **Report contract** — what to write to disk and where.
- **Tell the seat it will NOT commit** — you will.

**Data gate before you send:** no secrets, no personal data, and **no scanned/medical/copyrighted page
to any off-machine seat**. Vision → Codex only. Prose on private text → not vibe (Mistral trains).

## 2. Dispatch

Per seat — exact commands and auth in [roster.md](roster.md):

- **opencode** → the relay (`relay.mjs --brief … --model … --cd …`), backgrounded; it writes
  `result.json` and never commits.
- **Codex** → `codex exec -s read-only -C <dir> --skip-git-repo-check -i <png>… --json -o answer.txt
  "$(cat promptfile)" </dev/null` — prompt is a **positional arg**, `</dev/null` only closes stdin
  (the `< promptfile </dev/null` form is wrong: empty stdin, exits 0 doing nothing). Read-only unless
  the brief authorises a write. See [roster.md](roster.md) for the image-load and pdftoppm-padding gotchas.
- **Astra** → the same Codex command with `-m gpt-6-astra` added. Same channel, same data rule, so it
  is **not** a second independent opinion alongside Codex. Confirm the run header names the model you
  asked for — an unknown id falls back silently and answers from something else.
- **Fable 5.1** → no CLI: dispatch as a bounded subagent with `model: fable` on the Agent tool. One
  question, one return. ~83k tokens a job — convene it for vendor independence, never to save money.
- **agy / grok / vibe** → direct CLI; **verify the run flag with `<bin> --help` first** (unverified in
  this workspace) and record the working command in roster.md.
- **Gemini / Groq / OpenRouter** → API seats, no CLI. Write a small `.mjs` with the Write tool that
  reads its own key from the env var and run it as `node <script>.mjs` — an inline shell command
  naming the key variable is refused by the credential guard. Read `reasoning` as well as `content`,
  and send `max_tokens` on OpenRouter. Full wire format and the live model ids: [roster.md](roster.md).
  Gemini is a **full seat** (drafting, research, debate), not paste-back — the user waived his own
  privacy for it; the scanned/medical/copyrighted ban still binds.
- **ChatGPT** → no API here: hand the self-contained brief to the user to paste, and read the answer back.

Background it and let it return; **a run is done when its output file exists and the process has
exited** — never trust a progress line over the file on disk.

## 3. Review — do not trust the self-report

The seat's own "done / passed" is a claim. Re-verify:

- **Re-run the real gates yourself** (the validator / boot-check / build from step 1). Never on faith.
- **Read the diff or the output against the brief** — did the seat do what was asked, nothing more
  (scope creep), nothing less?
- **Medical / scanned content:** the human reads the key, dose, unit, exponent **against the page
  image**. This is the one check that never compares a reading with itself, and it is never delegated.
- For removals grep for dangling refs; for schema/migration changes round-trip them.

## 4. Land

Only after the gates pass and the review holds:

- **You commit the verified work**, explicit paths only (`git commit -F <msgfile> -- <paths>`), never
  `git add -A` when another chat may hold the tree. The manager does not `git push`.
- Needs changes? Send a **delta brief** (don't restate the whole task) and review again.
- **Surface, don't absorb:** report the seat's design decisions, defensible-but-unasked turns, and
  nitpicks rather than silently keeping them. **Stop for scope changes** — if finishing correctly needs
  going beyond the brief, ask; don't expand the mandate yourself.
