# OmniRoute compression — measured, 2026-09-08 (factory chunk 1)

What the README claims, and what the gateway on this machine actually did. Every number below came
from a run against `http://localhost:20128` on 2026-09-08. Nothing here is estimated.

Harness: `scripts/compression-test.mjs` (end-to-end, provider `usage.prompt_tokens`) and the
gateway's own `POST /api/compression/preview` (engine-side, no provider call, non-mutating).
Seat for the end-to-end runs: `groq/groq/compound-mini`.

## Headline

**The claim is not reproduced. The stacked 89.2% average (78.4–94.6%) did not occur in any run.**

Three separate results, in the order they were found:

1. **End-to-end saving today is 0%.** Compression is disabled at the gateway
   (`GET /api/settings/compression` → `"enabled": false`, `defaultMode: "off"`, every engine
   `enabled:false` except `caveman` at level `lite`). All seven modes returned an identical 1651
   prompt tokens on the same payload. A per-request `x-omniroute-compression` header does **not**
   override the master switch: the live responses echoed `off; source=off` whatever was asked for.
2. **RTK's share of the claim holds, on the input it is actually for.** 82% on a 180-line build log
   delivered as a `tool` message; 99% on a highly repetitive one. That is inside the README's
   60–90% band for RTK.
3. **Caveman's share of the claim does not hold.** The README's arithmetic uses 46% for Caveman on
   input. Measured on mixed prose: **6%**, and identical at all three intensities (`lite`, `full`,
   `ultra` all returned 573 tokens from 610). Substituting the measured value into the README's own
   formula gives `1 − (1 − 0.82) × (1 − 0.06) = 83%` for a tool-output-heavy turn, and **6% for a
   turn with no tool output at all** — because RTK contributes nothing there (see the trap below).

## The measurements

Engine-side, via `/api/compression/preview`. "facts" counts planted strings that were present in
the input and survived into the output: version `4.19.2`, error token `ERR_BACKOFF_FLOOR`, URL
`https://status.example-internal.test/v2/health`, integer `1048576`, cap `60000`.

| Engine | Input | Tokens | Saving | Facts kept |
|---|---|---|---|---|
| rtk (minimal / standard / aggressive — identical) | 180-line build log, `tool` role | 3315 → 601 | **82%** | **0/3** |
| rtk (aggressive) | same log, `user` role | 3315 → 3315 | 0% | 3/3 |
| rtk (aggressive) | repetitive noise + 2 error lines, `tool` | — | **99%** | keeps `FAIL`, drops `ERR_BACKOFF_FLOOR` |
| lite | 180-line build log, `tool` role | 3315 → 889 | 73% | **0/3** |
| caveman (lite / full / ultra — identical) | mixed prose payload, `user` | 610 → 573 | 6% | 5/5 |
| ultra | mixed prose payload, `user` | 610 → 457 | 25% | 5/5 |
| ultra | 180-line build log, `tool` | 3315 → 3137 | 5% | 3/3 |
| session-dedup, ccr, codex-responses, headroom, llmlingua, aggressive | mixed prose payload | no change | 0% | 5/5 |
| relevance | mixed prose payload | 610 → 551 | 10% | 5/5 |
| omniglyph | mixed prose payload | no change | 0% (`skip:no_vision`) | 5/5 |

End-to-end, via the harness, all seven modes, two runs each: 1651 prompt tokens every time, 5/5
facts every time, echo `off; source=off`, cache bypassed. Nothing was compressed, so nothing was
lost — that is the only reason fidelity was perfect end-to-end.

## The two traps that make a naive run report the wrong number

**The semantic cache reports the claim as true.** With no bypass, the second and later modes are
served from cache: identical prompt tokens in 13–25 ms, and — worse — the response header echoes
back the *requested* mode as `source=request-header`, because `shared/utils/compressionHeaderEcho.ts`
synthesises that echo from the request when the pipeline did not set one. A run without the bypass
looks like every mode applied and saved nothing. The bypass is `X-OmniRoute-No-Cache: true`, and the
value must be the literal string `true` — `src/lib/semanticCache.ts` lowercases and compares against
`"true"`, so `1` is silently treated as cacheable. This is now sent by the harness.

**RTK only sees tool results.** Its shipped config is `applyToToolResults: true`,
`applyToAssistantMessages: false`, `applyToCodeBlocks: false`. The same build log saved 82% as a
`tool` message and 0% as a `user` message. So RTK contributes to a turn in proportion to how much
of it is tool output, and contributes nothing to a turn that is pure prose. The README's flat 80%
is only reachable on tool-heavy traffic.

## The fidelity finding — this outranks the percentages

On the realistic build log, RTK saved 82% and **kept the 30 least useful lines while dropping every
line worth reading**: it returned the thirty repeated `unused variable` warnings, and discarded the
`FAIL tests/retry_spec.js:112` line, the `ERR_BACKOFF_FLOOR` exit status, the version string and the
counter. `lite` behaves the same way at 73% (0/3). On a purely repetitive log RTK does keep the
`FAIL` line — so the selection is not always wrong — but it dropped a standalone `ERR_BACKOFF_FLOOR`
line even there.

The README says code, URLs and JSON are preserved byte-perfect. In these runs that held for the
message bodies it left alone; it did not hold for the shell/test output RTK rewrote, which is
exactly the content RTK is for. **A mode that saves 82% and drops the failing test line has not
saved anything — it has moved the cost to the next turn, where the failure has to be found again.**

Caveman and ultra, on prose, kept 5/5 at every setting tested. Their problem is the opposite one:
they are honest and small.

## Reproduced later the same day — plus one new finding

The harness was re-run on 2026-09-08 with `--repeat 2` after a fresh gateway start. **Identical
result: 1651 prompt tokens on all seven modes, 5/5 facts every time, echo `off; source=off`.** The
0% end-to-end finding is not a one-off and does not depend on gateway uptime.

**New: the dead modes are not free.** With nothing being compressed, `off`, `lite`, `standard` and
`aggressive` all answered in **1.56–1.87 s**, while `ultra`, `rtk` and `stacked` took **5.9–10.1 s** —
consistently, across both repeats. Something runs for those three and its output is then discarded,
because the echo says `off`. Treat it as a lead rather than a law (one seat, one payload, Groq
latency varies), but it sets up the question to ask before switching anything on: **a mode has to
beat its own latency, not just its token count.** An 8-second tax per call is real money in wall
clock on a batch of hundreds.

## What this means for the workspace

- **Do not turn compression on for prose expecting the README's numbers.** 6% from Caveman, 25% from
  Ultra. Real, but not workspace-changing.
- **RTK on tool output is the only large number here, and it is not yet safe to trust unattended.**
  Before enabling it anywhere, its line selection has to be configured or verified — the default
  kept noise and dropped the failure.
- Nothing is currently enabled, so nothing has silently degraded any seat. The gateway is in the
  same state it was before this measurement.
