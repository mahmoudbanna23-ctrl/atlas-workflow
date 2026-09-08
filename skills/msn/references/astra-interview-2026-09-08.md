# Astra (`gpt-6-astra`) interview — 2026-09-08

Five `codex exec` runs, all from scratch dir `scratchpad\astra\` (probe files, outputs and
`timing.txt` are there). Codex CLI 0.153.2. Every run exited 0. Wall-clock measured with
`date +%s` around the command; "tokens used" is Codex's own stderr figure per run.

| Run | Job | Sandbox | Wall clock | Tokens used |
|---|---|---|---|---|
| 1 | self-report interview + 4 test items | read-only | 139 s | 34,644 |
| 2 | two PNG "scans", transcribe + check | read-only | 56 s | 18,394 |
| 3 | queue of 10 items + write `queue-out.md` | workspace-write | 59 s | 29,199 |
| 4 | escalation handoff, 3 flagged items | read-only | 72 s | 39,691 |
| 5 | audit run 3's answers, mark PASS/FAIL | read-only | 60 s | 16,574 |

Runs 1+2 ran concurrently, then 3+4, then 5. No visible contention.

## MEASURED

**Reads images.** Run 2: opened both PNGs with its `view_image` tool (stated unprompted, and
transcribed content that only the image contained). Transcription of a synthetic scanned page
(rotated 1.3°, noise, blur, 13 lines incl. `x10^9/L`, `80-100 mg/kg/day`, answer key) was
character-exact against the generator source. Noise-only page 2: "This page has no readable
text" — no invention.

**Writes files when sandbox permits.** Run 3 with `-s workspace-write`: created `queue-out.md`
(1,102 bytes) via PowerShell `Set-Content`, read it back, reported the tool used. File carries a
UTF-8 BOM — strip it downstream or tell it to use `-Encoding utf8NoBOM`/`Out-File`. Under
`-s read-only` (run 1) it read the sandbox config, reported "no permitted filesystem writes",
and did not attempt one.

**Runs shell commands** (PowerShell `Get-Content`, `Set-Content`) in both sandbox modes.

**Has web search and uses it unprompted.** Stderr of runs 1, 2, 4 show web-search tool calls;
answers carry live citations (AAP, KDIGO 2025, RCH, CDC). This is why the "hard item" run took
139 s while the 10-item arithmetic queue took 59 s: latency scales with how much it chooses to
look up, not with item count. Not tested: whether `--disable web_search` (or similar) exists and
speeds it up.

**Beats a small model where tested — every trap caught:**
- T2: printed key said membranous nephropathy for a 4-year-old's nephrotic syndrome; it called
  the key wrong, answered minimal change disease.
- T3 + queue item 7: invented drug "Cefadrotol" — declined a dose both times, said the exact-name
  search returned nothing, refused to assume cefadroxil/cefuroxime.
- Run 2: invented "Vorquist-Lehane index" — arithmetic checked as correct (47/3.7 = 12.7) AND
  flagged as an unverifiable term; explicitly separated "arithmetic right" from "term real".
- T1 hypernatraemic dehydration (rules fixed in the item): deficit 2,000 mL, maintenance
  1,500 mL/24 h, rate 104.2 mL/h — correct.
- T4 80-word limit: 65 words, its self-count verified exact.
- Run 4 E2 dopamine infusion: 5 mcg/kg/min × 25 kg, 75 mg/50 mL → 5 mL/h, with reverse check;
  correctly identified the 0.5 mL/h dissenter as tenfold low.

**Makes plain arithmetic slips.** Queue item 5: wrote `(10 x 4) + (2 x 2) = 48` for a 12 kg
child's 4-2-1 rate; correct is 44. 9/10 on a trivial queue. Its own self-report (run 1) predicted
exactly this class of error and said formula arithmetic belongs in a script — the measurement
agrees.

**Catches that slip when asked to audit.** Run 5, handed the same file as "a small model's
answers": recomputed every item, FAIL on item 5 with the corrected 44, PASS on all others, no
false positives, verified item 10's 40-word limit (35, checked exact). 60 s.

**Sound escalation catcher.** Run 4, no page images supplied:
- E1 (option (c) unreadable): gave provisional (a) prednisolone 60 mg/m²/day with high clinical
  confidence but medium for the graded letter, refused to reconstruct "Cyclo…", and said it would
  refuse to certify the letter without the scan.
- E3 (sources disagree on minimal-change immunofluorescence): reconciled to "usually negative;
  weak IgM/C3 can occur", refused to call either unseen source wrong, cited KDIGO.
- Required handoff fields it listed match what a checker would want: item ID + exact deliverable,
  source/page/question, page image or verbatim complete stem and options, uncertainty spans kept
  separate from transcription, printed key + explanation or "unavailable", each prior attempt with
  confidence and working, exact disagreement and assumptions. Missing critical info → returns an
  explicitly unresolved item with what is missing, does not invent.

**Follows a compound instruction partially.** Run 3 was told to write the file AND print the
answers to stdout; stdout got only the one-line status. Route output via files, not stdout, and
verify the file exists.

**Throughput.** One multi-part hard item with lookups: ~2.3 min. Ten short items in one file:
~1 min total, ~6 s/item. Handoff of 3 flagged items with lookups: 72 s. Queue of 10 held item
separation and numbering; not tested beyond 10 or with long shared reference material.

## CLAIMED (self-report, run 1 — untested unless noted above)

- Where it is worth its latency: interacting-constraint clinical items; adjudicating
  question-vs-key-vs-reference disagreements (tested: T2, run 2, E2 — holds); reconciling
  sources with their qualifications (tested: E3 — holds); cross-file debugging (untested);
  whole-argument review for inconsistency (partly tested: run 5 audit — holds for arithmetic).
- Should NOT come to it: renames/sorts/dedupe/regex/schema checks (script); formula arithmetic
  (script — and it did slip, see item 5); recall flashcards, paraphrases, classification (small
  model); bulk boilerplate; re-checking unchanged material.
- Its own latency for one substantial item: said "unknown". Measured 139 s above.
- Batching: recommended one hard item per run with a script managing the queue; said 10–20 in
  one file is of unknown benefit and that the first failure as batches grow is dropped
  sub-questions and assumptions leaking between cases. Untested past 10 items.
- Failure modes to watch: anchoring on a plausible diagnosis, missed negations, confident
  justification of a wrong conclusion; misreading small text/decimals/orientation in images;
  extraction dropping tables/footnotes/pages; losing early constraints in long inputs; unit and
  decimal slips (confirmed once); misattributed citations; explaining an invented term as a real
  one (tested twice — it did NOT do this); confidence not calibrated.
- On a missing critical field it "asks"; in unattended `exec` mode it returns the item marked
  unresolved (observed once, E1).

## Not established

- Behaviour on real question-bank scans (only a synthetic clean-ish page was used); dense
  handwriting, tables, two-column layouts untested.
- Batch sizes above 10; long shared reference files; timeout thresholds.
- Whether web search can be switched off and what that does to latency and accuracy.
- Concurrency limits on the account; two parallel runs worked.
- Daily allowance consumed per run — only Codex's "tokens used" figure is known (16.6k–39.7k
  per run here).
