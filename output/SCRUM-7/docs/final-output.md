# Final Output: SCRUM-7 - Improve Product Search Placeholder

**Final status: PASS_WITH_WARNINGS**

All executed checks passed and all acceptance criteria (AC-001..AC-005) are evidenced. Two non-blocking warnings remain (W-1, W-2; see section 10). The pull request has not yet been created.

## 1. Source reference

| Item | Value |
|---|---|
| Jira issue | SCRUM-7 "Improve Product Search Placeholder" (issue id 10006) |
| URL | https://epam-team-d41wx5ya.atlassian.net/browse/SCRUM-7 |
| Type / priority / status | Task / Medium / To Do (at retrieval) |
| Reporter | Kiruthika Balakrishnan |
| Branch | `sdlc/SCRUM-7` (local, uncommitted changes) |
| Application | `product-search/` (React 19 + Vite 7 SPA, local product data, no backend) |

Source documents (all in `output/SCRUM-7/docs/`): `requirements.md`, `architecture.md`, `design-review.md`, `impl-plan.md`, `implementation.md`, `code-review.md`, `verification.md`.

## 2. Business objective

As a customer, I want a clear placeholder in the search box so that I understand how to search for products. The search box previously showed `Try “wireless”`. It now shows `Search products by name...`, which states that the box searches products by name.

## 3. Requirements and acceptance criteria

Scope: change the existing React search input only; no backend or database changes; verify with a Playwright UI test.

### 3.1 Functional requirements

| ID | Requirement | Priority | Result |
|---|---|---|---|
| FR-001 | The search input displays `Search products by name...` when its value is empty (initial load and after Clear Filters). | Must | PASS |
| FR-002 | The placeholder is not displayed while the input contains text, and reappears when the text is removed. | Must | PASS (native placeholder state only, see section 10) |
| FR-003 | Existing search behavior is unchanged (case-insensitive trimmed substring search, AND with category and maximum-price filters, count, empty state, Clear Filters). | Must | PASS |
| FR-004 | The change is made to the existing React search input with no backend or database change. | Must | PASS |
| FR-005 | A Playwright UI test verifies the placeholder. | Must | PASS |
| FR-006 | A Playwright UI test verifies the placeholder disappears and that search still filters after typing. | Should | PASS |

### 3.2 Non-functional requirements

| ID | Requirement | Result |
|---|---|---|
| NFR-001 | Existing unit and Playwright tests continue to pass unchanged. | PASS |
| NFR-002 | Placeholder is readable at 375x667 and 1366x768 without horizontal overflow; input stays visible, enabled and at least 40px high. | PARTIAL: automated overflow, visibility and height checks pass; "readable/unclipped placeholder" is NOT automatically verified (W-1) |
| NFR-003 | The visible label is kept; accessible name stays "Search by name". | PASS |
| NFR-004 | Minimal change following existing conventions. | PASS (by diff review; no lint script exists) |
| NFR-005 | No new performance, security, privacy, data or logging requirements. | N/A (stated not applicable in requirements) |

### 3.3 Acceptance criteria

| ID | Criterion (summary) | Result |
|---|---|---|
| AC-001 | With the page loaded and the input empty, the placeholder is exactly `Search products by name...`. | PASS |
| AC-002 | The placeholder is not displayed once text is entered, and is displayed again when the text is removed. | PASS (native `:placeholder-shown` state; not rendered pixels or CSS visibility) |
| AC-003 | Search, filters, count, empty state and Clear Filters behave as before (existing unit and E2E tests pass unchanged). | PASS |
| AC-004 | `npm run test:e2e` includes a UI test asserting the placeholder, and it passes. | PASS |
| AC-005 | The only production change is the input placeholder in the existing React component; no backend, database or data-file change. | PASS |

## 4. Architecture and key design decisions

Source: `architecture.md`, reviewed in `design-review.md` (0 BLOCKER, 0 HIGH).

| Decision | Summary | Requirements |
|---|---|---|
| D-1 | Change only the `placeholder` attribute value in `ProductSearchApp.jsx` to the literal ASCII string `Search products by name...` (plain JSX string; no constant, helper or i18n layer). `id`, `type`, `value`, `onChange` and the label are untouched. | FR-001, FR-004, AC-001, AC-005 |
| D-2 | Rely on native placeholder behavior (hidden when the value is non-empty, shown when empty). No JavaScript, state or CSS added. | FR-002, AC-002 |
| D-3 | No styling change (no `::placeholder` CSS exists). | NFR-002 |
| D-4 | Keep the `<label>` so the accessible name stays "Search by name"; tests use the role/name locator `getByRole("searchbox", { name: "Search by name" })`. | NFR-003 |
| D-5 | No backend, data, logging or configuration change. | FR-004, NFR-005 |

Test design: two Playwright tests added to the existing `product-search/tests/product-search.spec.js` (T-1 and T-2). "Placeholder displayed / not displayed" is checked through the browser state `element.matches(":placeholder-shown")` read with `expect.poll`, because the `placeholder` attribute stays in the DOM while text is typed. Screenshot comparison, a custom (non-native) placeholder, and a Vitest/jsdom component test were considered and rejected in `architecture.md`.

## 5. Implementation summary

Changed files (from `git diff`; `git diff --numstat`: production 1 added / 1 deleted, spec 36 added / 0 deleted):

| File | Change |
|---|---|
| `product-search/src/ProductSearchApp.jsx` (line 70) | One line: `placeholder="Try “wireless”"` replaced by `placeholder="Search products by name..."`. |
| `product-search/tests/product-search.spec.js` | Additions only: constant `SEARCH_PLACEHOLDER` and 2 new Playwright tests. Existing tests unmodified. |

New tests:
- T-1 `shows the search placeholder on an empty search box`: asserts the value is empty, the `placeholder` attribute equals `Search products by name...` exactly, the accessible name is "Search by name", and `:placeholder-shown` is true.
- T-2 `hides the native placeholder while text is entered and restores it when cleared`: types `wireless` (`:placeholder-shown` false, 2 products), clears the input (`:placeholder-shown` true, placeholder attribute intact, 12 products), types again and clicks Clear Filters (value empty, `:placeholder-shown` true, 12 products).

Implementation tasks (`implementation.md`): IMP-001 production change (DONE), IMP-002 test T-1 (DONE), IMP-003 test T-2 (DONE), IMP-004 regression and scope gate (DONE). Deviations from the plan: none. Not changed: `filterProducts`, `priceInput`, product data, `styles.css`, label markup, unit tests, configuration.

## 6. Review findings and resolution

| Review | Result | Findings |
|---|---|---|
| Design review (`design-review.md`) | No BLOCKER/HIGH; proceed | DR-001 MEDIUM (NFR-002 readability claim overstated, character arithmetic incorrect); DR-002 MEDIUM (Clear Filters path and T-1 step 5 not concrete); DR-003 LOW; DR-004 LOW; DR-005 LOW; DR-006 LOW (assumptions unconfirmed) |
| Code review (`code-review.md`) | PASS; 0 BLOCKER, 0 HIGH, 0 MEDIUM, 2 LOW | CR-001 LOW (`toHaveAccessibleName` partly redundant; no action); CR-002 LOW (T-2 combines three behaviors; no action) |

Resolution as recorded in the artifacts:
- DR-002: addressed in the implementation. T-2 includes the type-then-Clear-Filters sequence and T-1 names the concrete `:placeholder-shown` assertion (code-review section 4).
- DR-004: addressed. T-1 includes `toHaveAccessibleName("Search by name")`.
- DR-005: addressed. Test titles and comments say "native placeholder state" and make no CSS-visibility claim.
- DR-003: reasoning-only finding in `architecture.md`; no code impact. The tests use the role/name locator.
- DR-001: not automated by design. The readability claim is downgraded to "not automatically verified" (W-1).
- DR-006 / assumptions: remain open (W-2).
- CR-001, CR-002: informational; no action required.

## 7. Actual build and test results

Evidence is as recorded in `verification.md` (commands run by the verification agent from `product-search/`, final state of the working tree). Phase 5 and Phase 6 runs in `implementation.md` and `code-review.md` report the same numbers.

| Command | Exit | Result |
|---|---|---|
| `npm run test:unit` | 0 | Vitest: 2 test files passed, 9 of 9 tests passed |
| `npm run test:e2e` | 0 | Playwright (Chromium): 9 passed, 0 failed, 0 skipped = 7 existing + 2 new |
| `npm run build` | 0 | Vite: 32 modules transformed, build succeeded |
| `git diff --numstat` | 0 | Production file 1/1; spec file 36/0 |
| Inspection of added line | 0 | Added line has no non-ASCII bytes (three ASCII full stops) |
| Search for old placeholder `Try “wireless”` in `product-search/` (excluding `node_modules`, `dist`, `test-results`) | 1 (no matches) | No remaining references |

No lint script exists, so no lint check was run. Not run: the optional red check (new tests against the old placeholder); existing tests were confirmed unmodified through the diff (0 deletions), not by a separate baseline run.

## 8. Traceability summary

Chain: source statement, requirement, acceptance criterion, architecture decision, implementation task, code/test location, result. Source: `verification.md` section 3. No FR or AC has a missing link.

| Source statement | Requirement | AC | Arch | IMP | Code / test | Result |
|---|---|---|---|---|---|---|
| Show `Search products by name...` | FR-001 | AC-001 | D-1, D-2 | IMP-001, 002, 003 | `ProductSearchApp.jsx:70`; T-1, T-2 | PASS |
| Placeholder disappears on text entry | FR-002 | AC-002 | D-2 | IMP-003 | T-2 | PASS (native state) |
| Existing search unchanged | FR-003 | AC-003 | D-1 | IMP-003, 004 | T-2 counts 2/12/12; 7 existing E2E; 9 unit | PASS |
| Update existing React input; no backend/DB | FR-004 | AC-005 | D-1, D-5 | IMP-001, 004 | one-line diff | PASS |
| Verify placeholder with Playwright | FR-005 | AC-004 | arch. 5.1-5.3 | IMP-002 | T-1 | PASS |
| Cover AC 2 and 3 by UI (Should) | FR-006 | AC-002, AC-003 | arch. 5.3-5.4 | IMP-003 | T-2 | PASS |
| Regression | NFR-001 | AC-003 | arch. 6 | IMP-004 | unit and E2E suites | PASS |
| Customer understands how to search | NFR-002 | AC-001 | D-3 | IMP-004 | existing viewport tests | PARTIAL (W-1) |
| Label retained | NFR-003 | AC-001 | D-4 | IMP-001, 002 | label untouched; T-1 accessible name | PASS |
| Minimal change | NFR-004 | AC-003, AC-005 | D-1 | IMP-001, 004 | one-line diff | PASS (diff review) |
| No backend/DB | NFR-005 | AC-005 | D-5 | none | none | N/A |

## 9. Assumptions

The following assumptions from `requirements.md` were followed by the implementation. They are NOT confirmed by the user and are not approved requirements.

| ID | Assumption |
|---|---|
| A-1 | Label "Search by name" and `id="product-search"` unchanged; accessible name stays "Search by name". |
| A-2 | Placeholder is the literal ASCII `Search products by name...` (three full stops), no quotes or backticks. |
| A-3 | No styling change is needed. |
| A-4 | The old placeholder is replaced and not referenced by tests (checked: no matches). |
| A-5 | Tests live in `tests/product-search.spec.js` and run in Chromium via `npm run test:e2e`. |

Impact if an answer differs (`impl-plan.md` section 1, as cited in `verification.md`): A-2 changes one string literal and one test constant; A-1 changes locators and the accessible-name assertion; A-5 changes the target spec file.

## 10. Known limitations, warnings, out-of-scope items

Warnings (non-blocking):
- **W-1 (NFR-002):** No automated assertion measures whether the new 26-character placeholder is clipped at 375px (it is about 1.9x longer than the old 14-character one). The existing viewport tests pass (no page overflow, input visible, enabled, in viewport, height at least 40px) but do not inspect placeholder clipping. The CSS-geometry estimate in the plan was not re-measured, and no screenshot or manual check was taken. This aspect is not verified.
- **W-2 (assumptions):** A-1..A-5 remain unconfirmed by the user.

Other limitations:
- AC-002 is verified through the DOM `:placeholder-shown` pseudo-class, which reflects native state, not rendered pixels or CSS visibility. No custom `::placeholder` CSS exists.
- Browser coverage is Chromium only, as configured.
- NFR-004 was checked by diff review only; there is no lint or formatter script.
- NFR-005 is not applicable per requirements; nothing was tested for it.
- Unit tests and build ran once after the final code state; the optional red check was not run.
- `output/` documents were not scanned for secrets by the verification phase. The final-output files contain no credentials.
- Final-output validation (Phase 9) has not yet been run on this document.

Out of scope (per requirements): backend or database changes; search matching logic; category and price filters; product count, empty state and Clear Filters behavior changes; label text or accessible-name changes; localization, theming or restyling of the placeholder.

## 11. Delivery status

- Changes are local and uncommitted on branch `sdlc/SCRUM-7`. The pull request has NOT yet been created. It may be created only after final-output validation succeeds.
- Jira was read only; nothing was written to Jira.

**Final status: PASS_WITH_WARNINGS** (warnings W-1 and W-2; no failures; no unresolved BLOCKER or HIGH findings).
