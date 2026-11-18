---
name: Run Agentic SDLC
description: Start the complete gated SDLC workflow for one supplied User Story.
argument-hint: Jira issue key/ID and story source (if not directly from Jira)
agent: Agentic SDLC Orchestrator
---

Run the Agentic SDLC workflow for the single User Story provided with this prompt.

- Require a Jira issue key/ID for every workflow run. Accept the story from Jira, a linked Confluence page, a Word document, or pasted text and preserve the original source/reference.
- Follow the Agentic SDLC Orchestrator workflow, specialist delegation, and `output/<JIRA-ID>/docs/` output convention, including traceability, clarification pauses, and all review, verification, final-output, and PR gates.
- Use a validated canonical Jira ID as the folder name. Create a separate `output/<JIRA-ID>/docs/` directory for a new ID. If the directory already exists, confirm it belongs to that same issue and resume without deleting or overwriting another issue's outputs; ask if ownership is unclear.
- For Jira, use the `story-ingestion` skill. Use the `requirements-traceability` skill throughout the lifecycle and the phase-specific skills required by specialists.
- Do not invent missing requirements or bypass human clarification.
- An associated Jira issue key/ID is required before preparing the Jira-named branch or performing commit, push, or PR operations. Never merge or write to Jira/Confluence.
- If no usable story/source was supplied, ask the user for it. If required tools, authentication, permissions, or delegation are unavailable, report the exact blocker.
