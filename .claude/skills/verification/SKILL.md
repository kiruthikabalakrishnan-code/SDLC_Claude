---
name: verification
description: Select and run repository-appropriate build, test, acceptance, and output checks with auditable evidence. Use when verifying an implementation, validating final-output documents, or checking PR publication gates.
---

# Verification

Before writing workflow verification evidence, derive the validated Jira issue ID from the active run and use only `output/<JIRA-ID>/docs/`. Never write verification results to a shared root-level `docs/` folder or another issue's output directory. Final-output checks must inspect that same issue folder.

1. Inspect project manifests and repository instructions to identify supported build/test commands; do not assume a toolchain.
2. Run relevant build, unit, integration, regression, error-case, and acceptance-criteria checks. Record exact commands, exit results, and available counts.
3. Map each requirement and acceptance criterion to implementation evidence, a test/check, and a result. Mark checks that cannot be run and explain why.
4. Verify testable non-functional requirements and edge/error behavior. Do not treat code inspection alone as a passing executable check.
5. For final outputs, read/parse both Markdown and Word files and compare required sections and core facts against approved artifacts and test evidence. Check limitations and scan for unsupported claims and secrets.
6. Report failures and evidence. Use `FAIL` for any blocking check; use `PASS_WITH_WARNINGS` only for documented non-blocking warnings; use `PASS` only when required checks pass.
7. Never invent test counts, results, or evidence.
