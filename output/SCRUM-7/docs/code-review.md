# Code Review: SCRUM-7 - Improve Product Search Placeholder

Reviewer: code-review-agent (Phase 6). Branch: `sdlc/SCRUM-7`. Source: Jira SCRUM-7 (https://epam-team-d41wx5ya.atlassian.net/browse/SCRUM-7).
Scope reviewed: uncommitted `git diff` of `product-search/src/ProductSearchApp.jsx` and `product-search/tests/product-search.spec.js`, against `requirements.md`, `architecture.md`, `design-review.md`, `impl-plan.md` (IMP-001..004) and `implementation.md`.

## 1. Verdict

**No unresolved BLOCKER or HIGH findings. The implementation may proceed to Phase 7 (verification).**

Severity counts: BLOCKER 0, HIGH 0, MEDIUM 0, LOW 2 (both optional, no action required).

## 2. Independent evidence (observed in this review, from `product-search/`)

| Check | Observed result |
|---|---|
| `npm run test:unit` | exit OK; Test Files 2 passed (2); Tests 9 passed (9) |
| `npm run test:e2e` | 9 passed, 0 failed, 0 skipped (Chromium, 4 workers, 11.1s). Includes the 2 new tests (lines 103 and 114) and 7 existing tests, including both viewport cases |
| `npm run build` | succeeded, 32 modules transformed. `dist/` is not reported by `git status` (ignored) |
| `git diff --numstat` | `ProductSearchApp.jsx` 1 added / 1 deleted; `product-search.spec.js` 36 added / 0 deleted |
| `git status --short` | Only the two modified files plus untracked `output/` |
| Non-ASCII scan of the diff | The only non-ASCII character is in the removed line (`Try “wireless”`). The added lines are pure ASCII |
| Search for `Try “wireless”` in `product-search/` (excluding `node_modules`, `dist`) | No hits |

Not run: a red check (new tests against the old placeholder). The implementer also skipped it (optional in the plan). The tests' discrimination is therefore established by reading the code only. `toHaveAttribute` with a string is full case-sensitive equality, so the old placeholder would fail it.

## 3. Review of the production diff (IMP-001)

- `ProductSearchApp.jsx` line 70: `placeholder="Try “wireless”"` becomes `placeholder="Search products by name..."`.
- The string is exactly `Search products by name...`: ASCII, three full stops, no quotes or backticks, 26 characters (A-2).
- Nothing else changed: `id`, `type`, `value`, `onChange`, the `<label>`, `styles.css`, data and config are untouched. FR-004, NFR-004, AC-005 and the plan's scope guard are met.

## 4. Review of the tests (IMP-002, IMP-003)

- Both tests match the plan snippets. The constant `SEARCH_PLACEHOLDER` follows the import.
- The existing tests are unchanged (additions only, numstat `36 0`, NFR-001).
- Locator: `getByRole("searchbox", { name: "Search by name" })`, the repo convention. It is not coupled to the value under test (DR-003).
- Flakiness: DOM-state reads go through `expect.poll` (retrying). The value and count assertions use web-first `expect`. There are no fixed sleeps. Counts of 2 ("wireless") and 12 (empty) match the existing data and the existing spec, and the tests passed in this review's run.
- DR-002 is covered: after typing and clicking Clear Filters the test asserts `toHaveValue("")`, `:placeholder-shown` true, and 12 cards.
- DR-004 is covered: `toHaveAccessibleName("Search by name")`.
- DR-005 is covered: titles and the comment say "native placeholder state" and make no claim about CSS visibility.
- Conventions: double quotes, semicolons, 2-space indent, `async ({ page })`. This matches the existing file.

## 5. Findings

| ID | Severity | Location | Issue | Recommendation | Req / Task | Status |
|---|---|---|---|---|---|---|
| CR-001 | LOW | `tests/product-search.spec.js` line 109 (T-1) | `toHaveAccessibleName("Search by name")` is partly redundant, because the locator already resolves by that accessible name (substring match). It still adds an exact, full-string check as DR-004 intended, so it is useful, not wrong. | None required. Informational. | NFR-003 / IMP-002 | Open, no action |
| CR-002 | LOW | `tests/product-search.spec.js`, T-2 (lines 114-135) | The second test combines three behaviors (typing, clearing, Clear Filters) in one test. A failure at an early step hides the later steps. This is the plan's chosen shape and it keeps the suite small. | None required. Split only if future maintenance makes failures hard to diagnose. | FR-002, FR-006 / IMP-003 | Open, no action |

## 6. Claims in `implementation.md` vs code and evidence

All claims were verified:
- IMP-001..004 contents match the diff.
- The command results match the independent runs: unit 9 passed, e2e 9 passed (7 existing + 2 new), and a successful build.
- The scope-diff claims match: `1/1` and `36/0`.
- The grep claim matches.
- The statement that unit and build were not re-run after the spec edits is accurate and reasonable, since no production or unit-test file changed afterwards. This review re-ran them, and they pass.

## 7. Requirement / AC traceability (review view)

| Requirement | AC | Task | Code / test | Review result |
|---|---|---|---|---|
| FR-001 | AC-001 | IMP-001, 002, 003 | `ProductSearchApp.jsx:70`; T-1; T-2 (clear, Clear Filters) | Covered, test passed |
| FR-002 | AC-002 | IMP-003 | T-2 (`:placeholder-shown` false then true) | Covered, test passed |
| FR-003 | AC-003 | IMP-003, 004 | Existing suites unchanged; T-2 counts 2/12/12 | Covered, 9 unit and 9 e2e passed |
| FR-004 | AC-005 | IMP-001, 004 | One-line production diff | Confirmed |
| FR-005 | AC-004 | IMP-002 | T-1 | Covered, test passed |
| FR-006 | AC-002, AC-003 | IMP-003 | T-2 | Covered, test passed |
| NFR-001 | AC-003 | IMP-004 | Unit and e2e suites | Passed |
| NFR-002 | AC-001 | IMP-004 | Existing viewport tests | Automated part passed; "readable/unclipped" is NOT automatically verified (by design, DR-001). Verification must state this honestly |
| NFR-003 | AC-001 | IMP-001, 002 | Label untouched; `toHaveAccessibleName` | Covered |
| NFR-004 | AC-003, AC-005 | IMP-001, 004 | Minimal diff | Confirmed |
| NFR-005 | AC-005 | none | n/a | n/a |

## 8. Limits of this review

- Chromium only. `:placeholder-shown` was not checked in other browsers (R-4, accepted by the plan).
- Not automatically verified: NFR-002 "readable/unclipped" at 375px. No visual or screenshot check was done in this review.
- Assumptions A-1..A-5 remain UNCONFIRMED by the user (DR-006, Q-1). They are not a code defect, but the Orchestrator should obtain confirmation at the approval gate.
- Only this file was written by the review. No code, tests or other artifacts were modified.

## 9. Gate status

Unresolved BLOCKER/HIGH findings: **none**. Gate: **PASS, may proceed to verification (Phase 7).**
