# Agentic SDLC framework

This repository contains reusable Copilot agents, slash commands, skills, repository instructions, workspace hooks, and VS Code MCP server definitions. It is framework configuration: do not run a Jira workflow or create business-specific output until a User Story and its associated Jira issue key/ID are supplied.

## Entry point and outputs

Use the workspace slash commands in Copilot Chat:

- `/run-agentic-sdlc` — run the complete gated workflow for one User Story.
- `/draft-requirements` — clarify one story and create its requirements artifact.
- `/sdlc-mcp-preflight` — test Atlassian and GitHub MCP connectivity without retrieving an issue.

Commands are stored under `.github/commands/`. The Orchestrator delegates each SDLC phase, pauses for blocking questions, maintains per-issue workflow state, and enforces review, verification, final-output, and PR gates.

Every Jira run is isolated under `output/<JIRA-ID>/docs/`. For example, SCRUM-5 artifacts belong in `output/SCRUM-5/docs/`. Normalize Jira keys to uppercase and validate the ID as a safe path segment; numeric issue IDs contain digits only. Require an associated Jira ID before creating artifacts from pasted, Word, or Confluence story sources. A new Jira ID gets a separate output directory. If its directory already exists, confirm it belongs to that same issue and resume without deleting or overwriting another issue's output; ask if ownership is unclear. Keep generic project documentation outside `output/`.

The per-issue directory contains requirements, architecture, reviews, implementation plan/evidence, verification, final output, and `sdlc-state.md`. `final-output.md` is canonical, with `final-output.docx` generated from it. Existing SCRUM-5 artifacts were moved from the repository-level `docs/` folder into `output/SCRUM-5/docs/`.

## MCP and authentication

`.vscode/mcp.json` uses the VS Code workspace MCP format and the configured Atlassian and GitHub endpoints. No token or password is stored in this repository. Enable the servers if prompted, authenticate through the providers' supported OAuth flows, and review/trust requested tools.

Atlassian exposes capabilities beyond reads. The workflow instructs agents not to write to Jira or Confluence; a workspace hook denies recognized Atlassian write tools, but hooks are not an authorization boundary. Use least-privilege Atlassian permissions. GitHub operations require the signed-in user's authorization. A Jira ID authorizes the scoped branch, commit, push, and PR only after workflow gates pass; do not merge.

## Agents, skills, and runtime

Custom agents are under `.github/agents/`, commands are under `.github/commands/`, and skills are under `.github/skills/<skill-name>/SKILL.md`. The Orchestrator delegates to the named specialists and uses `requirements-traceability` throughout; phase agents invoke their relevant skills.

Delegation, hook, prompt/command, and MCP support varies across Copilot clients and runtimes. If the selected runtime does not expose a required capability, report the limitation; do not claim the workflow ran. Use specialist commands manually only with user approval.

## Workspace hooks

`.github/hooks/sdlc-guards.json` registers two `PreToolUse` guards:

- `agent-safety-guard.js` denies recognized Atlassian writes, GitHub merges, and selected destructive shell/Git commands.
- `pr-publication-gate.js` derives the Jira ID from the PR head or current `sdlc/<JIRA-ID>` branch, then checks gate attestations and final-output files under `output/<JIRA-ID>/docs/` before permitting recognized push/PR operations.

The PR gate expects exact status lines documented by the Orchestrator, Verification Agent, and PR Agent. `PASS_WITH_WARNINGS` requires user acceptance in that issue's workflow state. Hooks need Node.js on `PATH`; MCP tool names vary by runtime. These are defense-in-depth only: alternate tools or clients that do not load workspace hooks can bypass them.

## First validation

1. Open the repository as a trusted VS Code workspace with GitHub Copilot Chat enabled.
2. Enable and authenticate the Atlassian and GitHub MCP servers. Do not store credentials in repository files.
3. Use `/sdlc-mcp-preflight` for a read-only connectivity check.
4. Start an actual workflow only with a User Story and associated Jira ID. Answer blocking clarification questions and let the workflow pause whenever a required gate fails.

If authentication, permission, delegation, testing, or document-conversion support is unavailable, report the blocker instead of claiming success.
