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
# Model: CODEX_GW_MODEL, default auto/coding. An auto combo only helps while its candidate pool has
# live, credited seats — if every request comes back 429/402, pin one named model that answers a
# tool-call probe instead (e.g. CODEX_GW_MODEL=<provider>/<model>).
#
# Usage: codex-gw.sh [extra codex exec args...] "<prompt>"
#   e.g. codex-gw.sh -s workspace-write "Follow the brief in brief.md"
# Needs: the gateway running on its default port, OMNIROUTE_API_KEY in the environment.

exec codex exec --skip-git-repo-check \
  --disable apps --disable multi_agent --disable goals --disable plugins --disable image_generation \
  -c web_search="disabled" \
  -c model_provider="omniroute" \
  -c model_providers.omniroute.name="OmniRoute" \
  -c model_providers.omniroute.base_url="http://localhost:20128/v1" \
  -c model_providers.omniroute.env_key="OMNIROUTE_API_KEY" \
  -c model_providers.omniroute.wire_api="responses" \
  -c model_providers.omniroute.request_max_retries=6 \
  -m "${CODEX_GW_MODEL:-auto/coding}" \
  "$@" < /dev/null
