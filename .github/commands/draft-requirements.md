---
name: Draft Requirements
description: Clarify one User Story and produce traceable, testable requirements in its Jira-scoped output folder.
argument-hint: Jira issue key/ID and story source (if not directly from Jira)
agent: Requirements Agent
---

Process one supplied User Story using the Requirements Agent instructions.

- Use the `story-ingestion` skill for Jira sources and the `requirements-traceability` skill for stable requirement IDs and source mapping.
- Ask concise, grouped questions before finalizing whenever critical information is missing. Do not invent answers; pause with `AWAITING_CLARIFICATION` when blockers remain.
- Preserve the source and canonical reference. Report inaccessible content and retrieval failures explicitly.
- Require and validate the associated Jira issue key/ID, then create `output/<JIRA-ID>/docs/requirements.md` using the required template and readiness status. If the story source is Confluence, Word, or pasted text, ask for its Jira ID before writing output.
- Do not write to another issue's folder; preserve an existing same-ID folder and ask before replacing or restarting existing artifacts.
- Do not modify application code, write to Jira/Confluence, or create commits, branches, or PRs.
- If no story/source was supplied, ask the user for it.
