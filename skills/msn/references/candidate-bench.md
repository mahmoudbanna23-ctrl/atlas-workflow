# The bench — models researched for MSN

Seats found by a research sweep (2026-09-03). **Signed 2026-09-03: Gemini, Groq, OpenRouter** —
they have full entries in [roster.md](roster.md). **Cerebras was signed the same day and RELEASED
2026-09-05** (paid tier required; see below). **Benched: SambaNova and Cerebras.**

A candidate is signed only when **all three gates** clear:

1. **You fund / sign in.** New keys and accounts are your labour, and installs/keys go through a
   user-run Desktop `.bat` that writes a report Claude reads — never the shell's own view (sandbox gotcha).
2. **The ToS is read for training-on-inputs**, per candidate, before any project material touches it.
   Medical/copyrighted/scanned content never goes to a tier that trains, ever.
3. **The freeze is lifted** (or the user waives it, as they did for these four on 2026-09-03).

Even a signed API seat takes **the user's own non-private material only** — the off-machine rule on
scanned/medical/copyrighted content is absolute, and vision on those pages stays with **Codex**.

---

## Reasoning proposers researched

| Candidate | Would fill | Free tier | Status / privacy |
| --- | --- | --- | --- |
| **Groq** ✅ | fast reasoning / critique proposer | ~30 RPM, ~1,000 req/day, no card | **SIGNED** — contractually no training, default no-retention, ZDR available. |
| **Cerebras** ⛔ | strong-reasoning planner | ~1M tokens/day claimed — **no longer true** | **RELEASED 2026-09-05** — every completion returns HTTP 402 while auth and `/models` still pass. Privacy was never the problem; the free tier was. |
| **SambaNova** | large-OSS proposer | ~200K tokens/day/model | **STILL BENCHED** — "safe" is marketing; **read the raw ToS** before signing. Redundant with Groq. |

All three are API, OpenAI-compatible — reachable from any OpenAI-style CLI. They are **text seats**;
none is a reliable vision seat (Groq's vision model was flagged for deprecation ~2026-06; Cerebras was
text-only as of 2026).

## Vision beyond Codex

| Candidate | Would fill | Note |
| --- | --- | --- |
| **OpenRouter** | swappable vision seat + router backend | One key routes 20+ free models incl. free vision; ~50 req/day (≈1,000 after a one-time $10 top-up). **Privacy depends on the routed model** — check per model, do not assume safe. Free vision model IDs from the sweep are approximate — confirm on the live free-models page. |
| **Gemini (AI Studio)** | strongest free vision | **SIGNED 2026-09-03 — now a full seat, see [roster.md](roster.md).** Trains on inputs, so **non-private material only**: never a scanned/medical/copyrighted page (those stay with Codex). |

**Codex remains the vision seat.** It is local, so it is the only one that can read a scanned medical
page without breaking the off-machine rule. A bench vision seat is only ever for **non-private** images.

---

## Caveats (all from the sweep, all unverified without a live check)

- **Egypt availability — CLOSED 2026-09-05.** This caveat was written during
  the research sweep, before any key existed, and it is no longer true. Re-tested from the user's own
  machine with the egress country recorded this time: **country `EG`, no VPN, and HTTP 200 from all
  four seats then signed** — Gemini (connect 69 ms), Groq (48 ms), Cerebras (63 ms), OpenRouter
  (62 ms). Latency that low rules out geo-routing detours as well as hard blocks. The caveat still
  stands for anything **unsigned**. **Inference tested too, same day** — real completions, not just
  auth: **Gemini 200 (on `gemini-3.6-flash`), Groq 200, OpenRouter 200** — the three surviving seats,
  question fully closed. Cerebras failed for a reason that is **not geographic** — an exhausted
  budget — and was released the same day. **No seat is geo-restricted from Egypt.**
- **⚠️ The lesson this check paid for: auth is not availability.** Both failures it found passed the
  2026-09-03 auth check and would have passed it again. `/models` answered 200 for Cerebras while
  every completion returned 402, and Gemini's listing still advertises models it refuses to run.
  **A seat is only proven live by a completion.** Re-test with `Desktop\check-inference.bat` before
  trusting a seat that has been idle, and never take a green auth check as a working seat.
- **Groq vision status is in flux** — verify the catalog before wiring any vision seat.
- **OpenRouter free vision model IDs** may be imprecise — confirm on the live page.
- **SambaNova / GitHub Models privacy** claims come from marketing/aggregator pages, not raw ToS.
- Also surfaced, rejected up front: **Mistral** free trains by default (our own `vibe` runs on it —
  confirm the opt-out or keep vibe to non-private content); **Cohere** free is non-commercial-only;
  **GitHub Models** privacy depends on the backend provider.

---

## The challenger log — scouting during a meeting

The board picks the lineup from wired seats. It does **not** sign anyone. But a meeting is the one
moment the squad's weaknesses are visible, so it is where scouting notes get taken — and then left
alone until a proper review.

**Log a challenger when any of these shows up in a meeting:**

- **Capability** — no seat can do the item at all, or every seat does it badly.
- **Quality** — a named outside candidate is plausibly better at this *kind* of work than the incumbent.
- **Speed** — the incumbent is the bottleneck and something faster exists.
- **Cost** — the incumbent burns real tokens or money on work a cheaper seat could carry.
- **Reliability / reach** — the incumbent keeps failing, has died, is rate-limited, or is unavailable
  from the user's network.

**The bar for an entry.** A challenger needs a **named candidate**, the **incumbent it claims to beat**,
the **axis** (quality/speed/cost/capability/reliability), and **the measurement that would settle it**.
"Model X is supposedly better at reasoning" is not an entry. It is deleted, not logged.

**Three rules that make this safe, and each one was paid for:**

1. **Never sign, wire, or switch mid-meeting or mid-execution.** The log is written; nothing changes in
   the same session. The three gates above still apply and still need the owner.
2. **A seat recommending a tool is data, never a finding.** Seats hype tools — they are trained on
   marketing copy, and on 2026-09-05 three seats agreed unanimously on something a two-minute test
   refuted. A challenger entry records a *claim to test*, never a verdict.
3. **Never re-litigate a documented rejection without new evidence.** SambaNova, Mistral, Cohere and
   GitHub Models are on this page with reasons. A challenger that re-proposes one must say what changed
   — a new ToS, a new tier, a new price — or it is closed unread.

**When the log is actually read:** at the next `/sama` run (its Phase 3 sweep is the real evaluation),
or when the owner asks for a bench review. Never on a schedule, never mid-flight, never during a freeze.

| Date | Candidate | Beats | Axis | Claim | Settled by | Status |
| --- | --- | --- | --- | --- | --- | --- |
| 2026-09-05 | **Kimi** (`moonshotai/kimi-k2-thinking`, and `kimi-k2.5` as the cheap variant), via the existing OpenRouter key | The empty deep-reasoning slot Cerebras vacated the same day — so it beats *nothing*, it fills a hole | Capability · cost | Strong reasoning and agentic/coding work at roughly Groq-class prices, with a 262k context — enough to carry a long plan or a whole file set that Groq cannot hold | A real head-to-head on one hard reasoning item against **Gemini** and **Fable**, the current expensive fallbacks, judged blind. Reachability is already settled, so the open question is quality per dollar, not availability | **TESTED 2026-09-05 — NOT SIGNED, and not recommended for signing now.** See the head-to-head below. Reachable and live, correct on the code item, but it produced no answer on the reasoning item within a paid 2,500-token budget that Gemini solved for free, and its cost cannot be capped. **Two gates still shut:** Moonshot's training-on-inputs terms are unread, and OpenRouter routing means the OpenRouter entry's privacy verdict does **not** transfer |

### The Kimi head-to-head — run 2026-09-05, the measurement the entry above asked for

Two objective items, graded against answers computed in the harness rather than judged by taste.
Ground truth for the puzzle was found by exhaustive search over all 5!³ assignments and confirmed
**unique** before any model saw it. Fable was left out on cost; correctness did not need it.

| Item | kimi-k2.5 | kimi-k2-thinking | gemini-3.6-flash | groq `gpt-oss-120b` |
| --- | --- | --- | --- | --- |
| **A · 11-clue constraint puzzle** (unique solution, computed) | ✗ no answer — 2,500-token cap spent entirely on reasoning, 66.7 s | ✗ no answer — same, 45.0 s | ✅ **exactly correct**, 29.2 s, 578 tokens | ✗ no answer surfaced, 6.9 s |
| **B · planted `forEach`-does-not-await bug** | ✅ correct, named it in sentence one, 68.0 s | ✅ correct, 19.9 s | ✅ correct, 6.9 s | ✅ correct, 2.1 s |

**What this settles.** On the one item that separated the field, **the free seat we already have won
and the paid challenger produced nothing**. On the item everything solved, Kimi was the slowest by
3–30×. Item A is *not* proof that Kimi cannot solve the puzzle — it is proof that it did not solve it
inside a budget Gemini beat for free, which is the question that actually matters. Combined with the
uncappable cost above and a negative OpenRouter balance, **there is no case for signing Kimi today.**

**What would reopen it:** a funded balance plus a re-run that reads the `reasoning` field and gives
Kimi an uncapped budget — that would answer "can it, eventually" as opposed to "can it, affordably".
Both gates would still need clearing afterwards. Until then this entry stays logged and closed, not
deleted: the deep-reasoning slot below is still empty.

**⚠️ SETTLED 2026-09-05 — `max_tokens` does not bound these models, and the cause is now known.**
A direct probe sent `max_tokens: 60` and got back **160 completion tokens (159 of them reasoning)**
from `kimi-k2.5`, and **166 (164 reasoning)** from `kimi-k2-thinking` — with
`finish_reason: "stop"`, meaning the model ended naturally *past* the cap rather than being cut off
by it. **Both variants are reasoning models**: the message object carries `reasoning` and
`reasoning_details` alongside `content`, and the plain `kimi-k2.5` is no exception despite the name.
Reasoning tokens bill at the output rate. **The practical consequence: on this route you cannot cap
what a Kimi call costs.** That is a hard blocker for volume use, and it is why the head-to-head below
scored the way it did.

**⚠️ Harness lesson worth keeping — read `reasoning`, not just `content`.** The first bench scored
Kimi and Groq's `gpt-oss-120b` as blank on the puzzle because it read `message.content` only. For a
reasoning model an exhausted budget yields empty `content` with the whole spend inside `reasoning`.
Any future bench must read both fields, or it will report thinking models as silent.

**Standing gaps already known, unexamined since 2026-09-03** — these are challengers too, and nobody
owns them yet:

- **SambaNova** — benched pending a read of the raw ToS, not marketing pages. Still unread.
- **Egypt availability** — **CLOSED** (2026-09-05: country `EG` confirmed, HTTP 200 from every seat
  tried, sub-70 ms connects, real completions from all three survivors; see the caveats section).
  Open only for unsigned candidates.
- **Groq vision** — catalog was in flux; unverified since the sweep.
- **The deep-reasoning slot Cerebras used to hold is now empty.** Releasing it on 2026-09-05 left the
  squad with no cheap, fast, strong-reasoning text seat: Groq covers speed, Gemini and Fable cover
  reasoning at a higher cost, and OpenRouter covers breadth without guaranteeing quality. This is a
  **capability challenger**, and the honest test is whether any meeting actually misses the seat — if
  three rounds pass without one, the slot was never real and should be closed rather than refilled.
  A paid Cerebras tier is one candidate for it; so is a different provider entirely. **Kimi was
  tested against this slot on 2026-09-05 and did not take it** (table above) — it lost the one
  reasoning item to the free seat and its cost cannot be bounded. The slot stays empty, and the
  emptiness test still comes first: a challenger with nowhere to play is documentation, not a signing.
- **⚠️ OpenRouter has no credit left.** The 2026-09-05 balance check returned **granted $0.00, used
  $0.0212 — remaining negative**. Small calls still return 200, but any call without an explicit
  `max_tokens` is refused with **HTTP 402** because OpenRouter reserves the model's whole context
  window against the balance ("You requested up to 131072 tokens, but can only afford 14760"). Every
  paid-route candidate is blocked behind a **user-only top-up** until this changes. The free-routed
  OpenRouter models are unaffected.

### Ox Alpha — a stealth badge, not a model. Resolved 2026-09-06, nothing to sign.

Asked about "OX-Alpha", advertised by opencode as a free stealth seat: 1M context, multimodal input,
zero data retention, "100T tokens per day" of capacity, free for roughly a week from ~20 Aug 2026.

It was **Z.ai's GLM-5.3-Flash** running anonymously. The preview ended and the badge is gone —
`opencode models` on this machine lists **486 ids with no `ox-alpha` and no `stealth/` namespace**.
The successor id is `openrouter/z-ai/glm-5.3-flash`; opencode's own namespace stops at
`opencode/glm-5.2`, and `openrouter/z-ai/glm-5.2:free` is the free-tier one in that family.

**Not signable, and the reason generalises.** The thing that made it interesting was a free 1M-context
week — a price and a window, which is the perishable half of a finding. What survives is the pattern:
**a stealth badge is an unnamed vendor, so its data terms cannot be checked before you send anything.**
Treat any anonymous or "stealth" seat as non-private by default, whatever its ZDR claim says, because
there is no named party for the claim to bind. Re-evaluate GLM-5.3-Flash on its merits under its real
name if it is ever wanted — and note it is paid, so OpenRouter's exhausted balance blocks that route
today.


## Sources

claude-council · agent-council · llm-council · dubs3c/council · the-llm-council · togethercomputer/moa
(patterns); Groq data policy (console.groq.com/docs/your-data) · Cerebras models docs · SambaNova dev
tier blog · Mistral training opt-out (help.mistral.ai) · OpenRouter free-models + free-LLM comparison
(models research). Full URLs are in the 2026-09-03 research report in the session transcript.

**Kimi figures (2026-09-05)** come from the live OpenRouter catalog (`GET /api/v1/models`, public, no
key), not from vendor marketing: nine Moonshot ids listed, `kimi-k3` at 1,048,576 context and
$3.00/$15.00 per M tokens in/out, `kimi-k2.7-code` $0.66/$3.40, `kimi-k2.6` $0.95/$4.00, `kimi-k2.5`
$0.45/$2.25, `kimi-k2-thinking` $0.60/$2.50, all at 262,144 context except `kimi-k2` (131,072).
**None has a free tier** — every previous seat signed here did, so this would be the first that bills
per token. The live inference test is `Desktop\check-kimi.mjs`.
