# Implementation Evidence: SCRUM-7 - Improve Product Search Placeholder

Source: Jira SCRUM-7. Inputs: `impl-plan.md` (primary), `requirements.md`, `architecture.md`, `design-review.md`. Assumptions A-1..A-5 remain UNCONFIRMED and were handled as the plan specifies.

## 1. Per-task completion

| Task | Status | Evidence |
|---|---|---|
| IMP-001 | DONE | `product-search/src/ProductSearchApp.jsx` line 70: `placeholder="Try “wireless”"` replaced by `placeholder="Search products by name..."` (ASCII, 26 characters). Diff is 1 insertion, 1 deletion. `id`, `type`, `value`, `onChange`, label untouched. |
| IMP-002 | DONE | Added `const SEARCH_PLACEHOLDER` (after the import) and test "shows the search placeholder on an empty search box" (T-1). Asserts empty value, exact placeholder attribute, accessible name "Search by name" (DR-004), and `:placeholder-shown` true via `expect.poll` (DR-005). Passed. |
| IMP-003 | DONE | Added test "hides the native placeholder while text is entered and restores it when cleared" (T-2). Asserts `:placeholder-shown` false after typing, true after clearing, and true with `toHaveValue("")` after Clear Filters (DR-002); result counts 2 / 12 / 12 (FR-003 spot check). Passed. |
| IMP-004 | DONE | Full regression and scope gate below. No files changed by this task. |

## 2. Commands run (from `product-search/` unless noted) and actual outcomes

| Command | Result |
|---|---|
| `npm run test:unit` (after IMP-001) | exit 0; Test Files 2 passed (2); Tests 9 passed (9) |
| `npm run build` (after IMP-001) | exit 0; vite built, 32 modules transformed |
| `npm run test:e2e` (after IMP-002 and IMP-003) | exit 0; 9 passed, 0 failed, 0 skipped (7 existing + 2 new, Chromium) |
| `git diff --stat` (repo root) | Only `ProductSearchApp.jsx` (1 ins, 1 del) and `product-search/tests/product-search.spec.js` (36 insertions, 0 deletions); untracked `output/` expected |
| `git diff -- product-search/src/ProductSearchApp.jsx` | Single-line change as described |
| `git diff --numstat -- product-search/tests/product-search.spec.js` | `36 0` (additions only; existing tests unmodified) |
| Search for `Try “wireless”` excluding `node_modules`, `output`, `dist`, `.git` | No hits (A-4) |

`npm run test:unit` and `npm run build` ran once, after IMP-001. They were not re-run after the Playwright spec edits because no production or unit-test file changed after they ran.

Not run: the optional red check against the old placeholder (plan marks it optional).

## 3. Files changed

- `product-search/src/ProductSearchApp.jsx` (one line).
- `product-search/tests/product-search.spec.js` (additions only: constant plus two tests).
- `output/SCRUM-7/docs/implementation.md` (this file).

## 4. Requirement / AC traceability

| Requirement | AC | IMP | Code / test | Result |
|---|---|---|---|---|
| FR-001 | AC-001 | IMP-001, 002, 003 | `ProductSearchApp.jsx:70`; T-1; T-2 (clear and Clear Filters) | T-1 and T-2 passed |
| FR-002 | AC-002 | IMP-003 | T-2 (`:placeholder-shown` false while typing, true when cleared) | passed |
| FR-003 | AC-003 | IMP-003, 004 | T-2 counts 2/12/12; existing unit and E2E unchanged | 9 unit, 9 e2e passed |
| FR-004 | AC-005 | IMP-001, 004 | one-line production diff | confirmed by diff |
| FR-005 | AC-004 | IMP-002 | T-1 | passed |
| FR-006 | AC-002, AC-003 | IMP-003 | T-2 | passed |
| NFR-001 | AC-003 | IMP-004 | unit + e2e suites | passed |
| NFR-002 | AC-001 | IMP-004 | existing 375x667 and 1366x768 tests | passed (automated part). "Readable/unclipped placeholder" is NOT automatically verified (DR-001). |
| NFR-003 | AC-001 | IMP-001, 002 | label untouched; `toHaveAccessibleName("Search by name")` | passed |
| NFR-004 | AC-003, AC-005 | IMP-001, 004 | one-line diff | confirmed |
| NFR-005 | AC-005 | none | not applicable | n/a |

## 5. Deviations and blockers

- Deviations: none from the plan. Test code follows the plan's snippets, with one added comment line in T-1 about native placeholder state.
- Blockers: none. `node_modules` and Chromium were already installed; no `npm ci` or browser install was needed.
- Open: A-1..A-5 still UNCONFIRMED (DR-006, Q-1) for the approval gate.
