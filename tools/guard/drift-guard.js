#!/usr/bin/env node
/**
 * drift-guard.js — PostToolUse hook.
 *
 * Register and routing drift both start in the same place: a long tool-heavy stretch. Your own
 * style rules (if you keep a terse/compressed register) predict it, and the routing ladder in
 * `README.md` / `skills/atlas/SKILL.md` says to name the rung before starting. Neither rule is
 * self-enforcing, so this counts tool calls per session and injects a reminder once every
 * THRESHOLD calls.
 *
 * Reads the hook payload on stdin, writes nothing the user sees unless it fires, and
 * always exits 0 — a guard that can break a turn is worse than no guard.
 *
 * Wire it up in settings.json as a PostToolUse hook, e.g.:
 *   "hooks": { "PostToolUse": [{ "matcher": "*", "hooks": [{ "type": "command",
 *     "command": "node /absolute/path/to/tools/guard/drift-guard.js" }] }] }
 */

const fs = require('fs');
const os = require('os');
const path = require('path');

const THRESHOLD = 10;

// Step budget — cost here is step count, not starting context (see README.md, "Cost is step
// count"): a main chat re-sends its whole context every step, so a long session is priced in
// steps, not size. Fires at STEP_THRESHOLD and every STEP_INTERVAL after. Subagent tool calls do
// not count: a captured real payload for a subagent run carries `agent_id`; only its presence
// marks a call as a subagent's — `agent_type` alone is not reliable, since it can also appear on
// a main-chat call in a session started with a fixed agent.
const STEP_THRESHOLD = 80;
const STEP_INTERVAL = 20;

const STEP_REMINDER =
  'Step budget: ~80 main-chat steps reached (each step re-sends the whole context). ' +
  'Finish the current item, write a handoff, and start a fresh session from your resume notes.';

const REMINDER = [
  'DRIFT CHECK (fired after ' + THRESHOLD + ' tool calls, not because anything is wrong yet).',
  '',
  '1. Register — if you keep a compressed/terse reply style, re-check it now. Headers, bold runs',
  '   and multi-point condition lists creeping back in are the usual drift signature. Compress',
  '   the style, never the substance.',
  '2. Rung — name the routing rung before starting the next piece of work (see the ladder in',
  '   README.md / skills/atlas/SKILL.md). Reading, searching, drafting, transcribing, formatting,',
  '   first-draft code belong on a cheaper seat, not in the main chat. If it stays here, say why',
  '   in one line.',
  '3. Data rule — follow whatever policy you set for what may go to an outside seat. Never send a',
  '   third party\'s uncleared data, keys, or personal identifiers, and never drive a consumer web',
  '   UI through your own logged-in session. Verification may leave the main model, but only to a',
  '   seat measured reliable on that check, never the one that produced the item.',
].join('\n');

function main() {
  let raw = '';
  try {
    raw = fs.readFileSync(0, 'utf8');
  } catch {
    return null;
  }

  let session = 'unknown';
  let isSubagent = false;
  try {
    const payload = JSON.parse(raw);
    if (payload && typeof payload.session_id === 'string') session = payload.session_id;
    // A subagent call carries agent_id; a top-level main-chat call does not.
    if (payload && payload.agent_id) isSubagent = true;
  } catch {
    // A malformed payload still counts as a tool call; fall through with the default id.
  }

  const safe = session.replace(/[^A-Za-z0-9_-]/g, '');
  const store = path.join(os.tmpdir(), `drift-guard-${safe}.txt`);

  let count = 0;
  try {
    count = parseInt(fs.readFileSync(store, 'utf8'), 10);
    if (!Number.isFinite(count) || count < 0) count = 0;
  } catch {
    count = 0;
  }

  count += 1;

  let driftFired = false;
  if (count < THRESHOLD) {
    try {
      fs.writeFileSync(store, String(count));
    } catch {
      // Counting is best-effort; a failed write only delays the next reminder.
    }
  } else {
    try {
      fs.writeFileSync(store, '0');
    } catch {
      // If the reset fails the reminder repeats, which is the safe direction.
    }
    driftFired = true;
  }

  // Step budget — main-chat calls only (see the note above STEP_THRESHOLD).
  let stepFired = false;
  if (!isSubagent) {
    const stepStore = path.join(os.tmpdir(), `step-budget-${safe}.txt`);
    let steps = 0;
    try {
      steps = parseInt(fs.readFileSync(stepStore, 'utf8'), 10);
      if (!Number.isFinite(steps) || steps < 0) steps = 0;
    } catch {
      steps = 0;
    }

    steps += 1;

    try {
      fs.writeFileSync(stepStore, String(steps));
    } catch {
      // Counting is best-effort; a failed write only delays the next reminder.
    }

    if (steps >= STEP_THRESHOLD && (steps - STEP_THRESHOLD) % STEP_INTERVAL === 0) {
      stepFired = true;
    }
  }

  const parts = [];
  if (driftFired) parts.push(REMINDER);
  if (stepFired) parts.push(STEP_REMINDER);

  return parts.length ? parts.join('\n\n') : null;
}

let reminder = null;
try {
  reminder = main();
} catch {
  reminder = null;
}

if (reminder) {
  process.stdout.write(
    JSON.stringify({
      suppressOutput: true,
      hookSpecificOutput: {
        hookEventName: 'PostToolUse',
        additionalContext: reminder,
      },
    })
  );
}

process.exit(0);
