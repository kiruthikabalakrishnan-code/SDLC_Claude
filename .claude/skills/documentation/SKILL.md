---
name: documentation
description: Consolidate approved SDLC artifacts and implementation evidence into the required business output without inventing facts. Use after implementation, review, and verification are complete.
---

# Business output documentation

Use this procedure after implementation, review, and verification are complete. Read the approved requirements, architecture, design review, implementation plan, code review, verification report, and actual implementation/test evidence.

- Read and write Jira-specific business documents only in `output/<JIRA-ID>/docs/` for the validated ID of the active run. Do not write to a shared root-level `docs/` folder or another issue's output folder. Keep generic project documentation outside `output/`.
- Use the output format(s) and required sections specified by the approved requirements. Do not assume a business format before requirements establish it.
- Preserve source references, important requirement traceability, review resolutions, verification evidence, limitations, and final status.
- Clearly distinguish known facts, approved assumptions, unavailable evidence, and out-of-scope items. Never invent implementation details or results.
- Keep the report concise and readable; remove secrets and sensitive credentials.
- If multiple formats are required, generate secondary formats from one finalized canonical source and validate that the core content matches.
