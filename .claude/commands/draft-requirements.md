---
description: Clarify one User Story and produce traceable, testable requirements in its Jira-scoped output folder.
argument-hint: "<JIRA-ID> [story source if not directly from Jira]"
---

Process one supplied User Story by delegating to the `requirements-agent` subagent: $ARGUMENTS

- The subagent uses the `story-ingestion` skill for Jira sources and the `requirements-traceability` skill for stable requirement IDs and source mapping.
- The subagent cannot question the user directly. Relay its concise, grouped clarification questions to the user, then re-delegate with the answers. Do not invent answers; pause with `AWAITING_CLARIFICATION` when blockers remain.
- Preserve the source and canonical reference. Report inaccessible content and retrieval failures explicitly.
- Require and validate the associated Jira issue key/ID, then create `output/<JIRA-ID>/docs/requirements.md` using the required template and readiness status. If the story source is Confluence, Word, or pasted text, ask for its Jira ID before writing output.
- Do not write to another issue's folder; preserve an existing same-ID folder and ask before replacing or restarting existing artifacts.
- Do not modify application code, write to Jira/Confluence, or create commits, branches, or PRs.
- If no story/source was supplied, ask the user for it.
