---
description: Check configured Atlassian and GitHub MCP connectivity without starting an SDLC run.
---

Perform a read-only connection preflight for the configured Atlassian (`jira` server in `.mcp.json`) and GitHub (`github` server) MCP integrations.

- For Atlassian, check accessible resources and authenticated user information using the available MCP tools.
- For GitHub, check the authenticated account using the available MCP tool.
- Report each provider as `PASS`, `FAIL`, or `UNAVAILABLE`, with concise evidence and any authentication/permission action needed (for example a missing `JIRA_USERNAME`, `JIRA_API_TOKEN`, or `GITHUB_PAT` environment variable).
- Do not retrieve a Jira issue, create or modify any resource, start an SDLC workflow, or create repository artifacts.
- If an integration tool is unavailable, state that it could not be tested; do not infer connectivity.
