#!/usr/bin/env bash
# codex-gw.sh — run `codex exec` through a local OmniRoute gateway with tool calls working.
#
# Why the extra flags: Codex's default tool list carries namespace-type and extra tools (apps,
# multi_agent, goals, plugins, image_generation) and a web_search tool. With those present the gateway's reply never contains a function
# call — the model loops "I'll try running a command" and edits nothing. Plain function tools pass
# through fine, so those features are switched off here. Codex also refuses `wire_api="chat"`; the
# gateway's Responses endpoint works.
#
# MCP servers configured in your Codex config add more namespace tools. Switch each one off with
#   -c mcp_servers.<name>.enabled=false
#
# Model: CODEX_GW_MODEL is required, no default. Never an auto/* combo — measured 0 of 221
# successful requests over a week; it fans one request across every candidate seat and free-tier
# caps hold a single call, not that. Pin one named model you measured yourself (e.g.
# CODEX_GW_MODEL=<provider>/<model>), or a named priority-failover combo you built from seats you
# measured.
#
# Usage: codex-gw.sh [extra codex exec args...] "<prompt>"
#   e.g. codex-gw.sh -s workspace-write "Follow the brief in brief.md"
# Needs: the gateway running on its default port, OMNIROUTE_API_KEY in the environment.

if [ -z "$CODEX_GW_MODEL" ]; then
  echo "codex-gw.sh: set CODEX_GW_MODEL to a named model or combo you measured — no default." >&2
  exit 1
fi
case "$CODEX_GW_MODEL" in
  auto/*)
    echo "codex-gw.sh: CODEX_GW_MODEL=$CODEX_GW_MODEL refused — auto/* combos measured 0 of 221 successful requests over a week." >&2
    exit 1
    ;;
esac

# Wall clock: CODEX_GW_TIMEOUT seconds, default 900. Exit 124 = timed out. A cooling seat can hold
# a request for minutes and retries stack on top — without a clock a dead model never returns.
exec timeout -k 10 "${CODEX_GW_TIMEOUT:-900}" codex exec --skip-git-repo-check \
  --disable apps --disable multi_agent --disable goals --disable plugins --disable image_generation \
  -c web_search="disabled" \
  -c model_provider="omniroute" \
  -c model_providers.omniroute.name="OmniRoute" \
  -c model_providers.omniroute.base_url="http://localhost:20128/v1" \
  -c model_providers.omniroute.env_key="OMNIROUTE_API_KEY" \
  -c model_providers.omniroute.wire_api="responses" \
  -c model_providers.omniroute.request_max_retries=2 \
  -m "$CODEX_GW_MODEL" \
  "$@" < /dev/null
