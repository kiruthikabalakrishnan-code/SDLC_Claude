# Agentic SDLC framework

This repository contains reusable Claude Code subagents, slash commands, skills, project instructions (`CLAUDE.md`), hooks, and MCP server definitions. It is framework configuration: do not run a Jira workflow or create business-specific output until a User Story and its associated Jira issue key/ID are supplied.

The original GitHub Copilot setup remains under `.github/` and `.vscode/` and is no longer the source of truth; `CLAUDE.md` is. Remove the Copilot files once the Claude setup is validated.

## Entry point and outputs

Use these slash commands in Claude Code:

- `/run-agentic-sdlc <JIRA-ID> [story]` — run the complete gated workflow for one User Story (skill in `.claude/skills/run-agentic-sdlc/`, manual invocation only).
- `/draft-requirements <JIRA-ID> [story]` — clarify one story and create its requirements artifact.
- `/sdlc-mcp-preflight` — test Atlassian and GitHub MCP connectivity without retrieving an issue.

The main Claude session acts as the Orchestrator because Claude Code subagents cannot spawn other subagents. It delegates each SDLC phase to a specialist subagent, relays blocking questions to the user, maintains per-issue workflow state, and enforces review, verification, final-output, and PR gates.

Every Jira run is isolated under `output/<JIRA-ID>/docs/`. The folder is created when a workflow runs; for example, a run for SCRUM-5 writes to `output/SCRUM-5/docs/`. Normalize Jira keys to uppercase and validate the ID as a safe path segment; numeric issue IDs contain digits only. Require an associated Jira ID before creating artifacts from pasted, Word, or Confluence story sources. A new Jira ID gets a separate output directory. If its directory already exists, confirm it belongs to that same issue and resume without deleting or overwriting another issue's output; ask if ownership is unclear. Keep generic project documentation outside `output/`.

The per-issue directory contains requirements, architecture, reviews, implementation plan/evidence, verification, final output, and `sdlc-state.md`. `final-output.md` is canonical, with `final-output.docx` generated from it.

## MCP and authentication

`.mcp.json` defines two project-scoped servers; Claude Code asks you to approve them on first use. No token or password is stored in this repository; set these environment variables instead:

- `jira` — `mcp-atlassian` via `uvx` (requires `uv`): `JIRA_USERNAME`, `JIRA_API_TOKEN`. The Jira URL is in the file. The Copilot setup also carried a commented-out remote Atlassian server (`https://mcp.atlassian.com/v2/mcp`); it was not migrated.
- `github` — `https://api.githubcopilot.com/mcp/` with `Authorization: Bearer ${GITHUB_PAT}`. Use a token scoped to this repository's pull-request needs.

Atlassian exposes capabilities beyond reads. The workflow instructs agents not to write to Jira or Confluence; a hook denies recognized Atlassian write tools, but hooks are not an authorization boundary. Use least-privilege Atlassian permissions. A Jira ID authorizes the scoped branch, commit, push, and PR only after workflow gates pass; do not merge (`settings.json` also denies the GitHub merge tool and `gh pr merge`).

## Subagents, skills, and runtime

Subagents are in `.claude/agents/` (`requirements-agent`, `architecture-agent`, `design-review-agent`, `implementation-planner-agent`, `implementation-agent`, `code-review-agent`, `verification-agent`, `documentation-agent`, `pr-agent`), each with least-privilege `tools` and preloaded `skills`. Skills are under `.claude/skills/<skill-name>/SKILL.md`: `story-ingestion`, `requirements-traceability`, `verification`, `documentation`, and `run-agentic-sdlc`.

If the runtime does not expose a required capability (delegation, hooks, MCP), report the limitation; do not claim the workflow ran.

## Hooks

`.claude/settings.json` registers two `PreToolUse` hooks (all tools):

- `.claude/hooks/agent-safety-guard.js` denies recognized Atlassian writes (any server whose tool name contains `atlassian`, `jira`, or `confluence`), GitHub merges, and selected destructive shell/Git commands.
- `.claude/hooks/pr-publication-gate.js` derives the Jira ID from the PR head or current `sdlc/<JIRA-ID>` branch, then checks gate attestations and final-output files under `output/<JIRA-ID>/docs/` before permitting recognized push/PR operations. It therefore also blocks `git push` from a non-`sdlc/` branch.

The PR gate expects exact status lines documented in the `run-agentic-sdlc` skill, `verification-agent`, and `pr-agent`. `PASS_WITH_WARNINGS` requires user acceptance in that issue's workflow state. Hooks need Node.js on `PATH`. They are defense-in-depth only: they apply to Claude Code tool calls, not to commands you run yourself.

## First validation

1. Open the repository in Claude Code and trust the project.
2. Set `JIRA_USERNAME`, `JIRA_API_TOKEN`, and `GITHUB_PAT`; approve the `jira` and `github` MCP servers (`/mcp`).
3. Run `/sdlc-mcp-preflight` for a read-only connectivity check.
4. Start an actual workflow only with a User Story and associated Jira ID. Answer blocking clarification questions and let the workflow pause whenever a required gate fails.
