# Implementation Plan: SCRUM-7 - Improve Product Search Placeholder

Inputs (all read):
- `output/SCRUM-7/docs/requirements.md` (status `READY_FOR_ARCHITECTURE`; FR-001..006, NFR-001..005, AC-001..005).
- `output/SCRUM-7/docs/architecture.md` (decisions D-1..D-5, tests T-1/T-2, risks R-1..R-5).
- `output/SCRUM-7/docs/design-review.md` (0 BLOCKER, 0 HIGH; MEDIUM DR-001, DR-002; LOW DR-003..006).
- Repo files read: `product-search/src/ProductSearchApp.jsx`, `product-search/tests/product-search.spec.js`.

Source: Jira SCRUM-7, https://epam-team-d41wx5ya.atlassian.net/browse/SCRUM-7.

Planning gate: no unresolved BLOCKER/HIGH design finding exists, so planning may proceed. No requirement or architecture document is changed by this plan.

## 1. Assumptions (UNCONFIRMED by the user, non-blocking)

These are carried forward unchanged from `requirements.md` section 3. They are not approved requirements. Confirmation is still pending at the approval gate (Q-1, DR-006).

| ID | Assumption | Status | Where it affects this plan |
|---|---|---|---|
| A-1 | Label "Search by name" and `id="product-search"` stay unchanged; the accessible name stays "Search by name". | UNCONFIRMED | Locator and `toHaveAccessibleName` in IMP-002 and IMP-003. |
| A-2 | Placeholder is the ASCII string `Search products by name...` (three full stops, no quotes or backticks). | UNCONFIRMED | The single string literal in IMP-001 and the single test constant in IMP-002. |
| A-3 | No styling change is needed. | UNCONFIRMED | No CSS task exists. |
| A-4 | The old placeholder `Try “wireless”` is replaced and is not referenced by any test. | UNCONFIRMED (repo grep in architecture section 2 supports it) | IMP-004 re-runs the grep. |
| A-5 | Tests go in the existing `tests/product-search.spec.js` and run in Chromium via `npm run test:e2e`. | UNCONFIRMED | IMP-002 and IMP-003 target that file only. |

Change containment: if an answer differs from an assumption, only these change:
- A-2: one literal in `ProductSearchApp.jsx` and one constant in the spec.
- A-1: the locators and the accessible-name assertion.
- A-5: only the target spec file.

## 2. Design-review finding disposition

Every finding is decided explicitly. "Adopt" means a task carries a concrete change. "Reject" or "No action" means no task is needed, with the reason given. This plan does not edit `architecture.md` or `design-review.md`. Wording errors in the architecture are corrected here by reference, and the Orchestrator may choose to have the architecture amended separately.

| Finding | Sev | Decision | Handling and reason |
|---|---|---|---|
| DR-001 | MEDIUM | **Adopt (documentation only; reject new automated assertion)** | Noted here as a correction: `Search products by name...` is 26 characters and `Try “wireless”` is 14, so the new placeholder is about 1.9x longer, not "shorter". The conclusion (low overflow risk) is unchanged. NFR-002 coverage is split honestly:<br>(a) Automated, by the existing viewport tests (no page overflow, control visible/enabled, bounds within viewport, height >= 40px). These must pass unchanged (IMP-004).<br>(b) The "readable/unclipped placeholder" part is **not automatically verified**. No requirement defines a pass threshold for clipping, and `scrollWidth <= clientWidth` on an input is an unproven, possibly unreliable signal. Adding such an assertion would invent a requirement and risk flakiness. The verification phase should record NFR-002 "readable" as "estimated from CSS geometry (about 190-210px needed against about 270px available at 375px); not automatically verified". An optional manual or screenshot observation at 375x667 may be noted as evidence if available. No new task and no new test. |
| DR-002 | MEDIUM | **Adopt** | Made a mandatory, concrete assertion in IMP-003. After typing text and clicking Clear Filters, the test asserts `toHaveValue("")` and that `:placeholder-shown` is true. T-1 step 5 is also made concrete in IMP-002: `expect.poll(() => search.evaluate((el) => el.matches(":placeholder-shown"))).toBe(true)`. FR-001's "after Clear Filters" clause is therefore covered by a test, not just by native behavior. |
| DR-003 | LOW | **No action (reject as a task)** | The finding is about wording in `architecture.md` 5.2. The conclusion is already adopted: use the role/name locator, the repo convention, and do not couple the locator to the value under test. The plan uses `getByRole("searchbox", { name: "Search by name" })` and never `getByPlaceholder`. The architecture text is not edited. |
| DR-004 | LOW | **Adopt** | `await expect(search).toHaveAccessibleName("Search by name")` is added to IMP-002 (T-1). It exactly checks the accessible name and covers NFR-003 and A-1. The string form of `toHaveAccessibleName` matches the accessible name fully, case-sensitively, unlike the substring match of `getByRole({ name })`. This is one line. |
| DR-005 | LOW | **Adopt (option A) with wording** | Use `expect.poll(() => search.evaluate(...:placeholder-shown...))` (architecture 5.4 option A), keeping the role/name locator. Test titles and comments say "native placeholder state" and make no stronger claim, because `:placeholder-shown` reflects DOM state (placeholder present and value empty), not CSS visibility. No `::placeholder` CSS exists today. The "consistent with existing evaluate usage" claim is not relied on; the poll is chosen only for its retry semantics. Option B is the fallback if `expect.poll` proves flaky. |
| DR-006 | LOW | **No task; flagged for Orchestrator** | Informational. A-1..A-5 stay labeled UNCONFIRMED (section 1). The Orchestrator should obtain confirmation at the approval gate. No task is BLOCKED by it, and the impact is contained as noted in section 1. |

## 3. Scope guard (applies to every task)

- Production diff: exactly one line, `product-search/src/ProductSearchApp.jsx` (the `placeholder` attribute value of `input#product-search`).
- Test diff: only `product-search/tests/product-search.spec.js`. Existing tests are not modified; new tests and one constant are added.
- No task touches the backend, `src/data/products.json`, `src/filterProducts.js`, `src/priceInput.js`, `src/styles.css`, `package.json`, `playwright.config.js`, the label markup, or any Vitest file. There is no backend in this app.
- No new dependencies, helpers, fixtures, or config.
- No lint script exists; follow the existing style (double quotes, semicolons, 2-space indent, `async ({ page })` tests, `expect` from `@playwright/test`).

## 4. Dependency order

```
IMP-001 (production line)
   -> IMP-002 (T-1 test, adds the shared constant)
         -> IMP-003 (T-2 test, reuses the constant, same file)
               -> IMP-004 (full regression and scope gate)
```

- Every edge is a real prerequisite. The new tests assert the new placeholder, so they cannot pass before IMP-001. IMP-002 and IMP-003 edit the same file and share the constant, so they are serialized to avoid conflicting edits.
- Dependency cycles: none.
- Blocked tasks: none.
- Optional red check: before applying IMP-001, an implementer may run IMP-002's test to see it fail against the old placeholder, as evidence that the test discriminates. This is not required, and the task order stays as above.

## 5. Tasks

### IMP-001 - Change the search input placeholder (one line)

| Field | Value |
|---|---|
| Priority | P1 / Must |
| Status | PENDING |
| Description | Replace the placeholder value on the existing search input. |
| Requirements | FR-001, FR-004, NFR-003 (label untouched), NFR-004 |
| Acceptance criteria | AC-001, AC-005 (and supports AC-003) |
| Architecture | D-1, D-2, D-3, D-4, D-5 |
| Source links | Source AC 1; Technical: update the existing React search input; no backend or database changes |
| Dependencies | None |
| Files | `product-search/src/ProductSearchApp.jsx`, `placeholder="Try “wireless”"` on `<input id="product-search">`, currently line 70 (confirmed in this repo state; the line number may shift). Only this file. |
| Assumptions | A-2 (exact ASCII string), A-1 (label and id untouched), A-3, A-4 (all UNCONFIRMED) |

Implementation objective:
- Change `placeholder="Try “wireless”"` to `placeholder="Search products by name..."`.
- Use a plain JSX string attribute with literal ASCII `...`, no constant, helper or i18n.
- Do not change `id`, `type`, `value`, `onChange`, the `<label>`, or any other line.

Required tests and checks (run from `product-search/`):
- `npm run test:unit` (unchanged unit tests still pass).
- `npm run build` (compiles).
- Diff check: `git diff -- product-search/src/ProductSearchApp.jsx` shows exactly one removed and one added line.
- Repo search for `Try “wireless”` (excluding `node_modules` and `output/`) returns no hits. This is also re-run in IMP-004.

Measurable completion criteria:
1. The diff of `ProductSearchApp.jsx` is one line changed (1 deletion, 1 addition), and no other production file is modified.
2. The new line contains exactly `placeholder="Search products by name..."` with three ASCII full stops (character count of the value is 26).
3. `npm run test:unit` exits 0.
4. `npm run build` exits 0.
5. No backend, data, CSS, or config file appears in `git status` for tracked paths.

### IMP-002 - Playwright T-1: placeholder is shown on an empty search box

| Field | Value |
|---|---|
| Priority | P1 / Must |
| Status | PENDING |
| Description | Add one test that asserts the exact placeholder, the accessible name, and the native shown-state on the empty input. |
| Requirements | FR-001, FR-005, NFR-003, (supports NFR-002 via unchanged existing tests) |
| Acceptance criteria | AC-001, AC-004 |
| Architecture | Sections 5.1, 5.2, 5.3 (T-1), 5.4 option A |
| Design-review items | DR-004 (adopted), DR-005 (adopted), DR-003 (locator convention) |
| Source links | Source AC 1; Technical: verify the placeholder using a Playwright UI test |
| Dependencies | IMP-001 |
| Files | `product-search/tests/product-search.spec.js` (existing file, add only; existing test blocks are not edited). The insertion point is provisional: after the existing tests and before the viewport `for` loop, or at the end of the file. Either is acceptable. |
| Assumptions | A-1, A-2, A-5 (UNCONFIRMED) |

Implementation objective:
Add a module-level constant near the top of the spec (after the import) and one new `test(...)`:

```js
const SEARCH_PLACEHOLDER = "Search products by name...";

test("shows the search placeholder on an empty search box", async ({ page }) => {
  await page.goto("/");
  const search = page.getByRole("searchbox", { name: "Search by name" });

  await expect(search).toHaveValue("");
  await expect(search).toHaveAttribute("placeholder", SEARCH_PLACEHOLDER);
  await expect(search).toHaveAccessibleName("Search by name");
  await expect.poll(() => search.evaluate((element) => element.matches(":placeholder-shown"))).toBe(true);
});
```

Notes:
- The test title and any comment use "native placeholder state". They make no claim about CSS visibility (DR-005).
- `toHaveAttribute` with a string argument is a full, case-sensitive equality check, which satisfies "exactly" in AC-001.
- Use the role/name locator, as in existing tests. Do not use `getByPlaceholder` (DR-003).
- This snippet shows the intended shape and is not committed code. The implementer may adapt formatting to the file's style.

Required tests and checks (from `product-search/`):
- `npm run test:e2e` (the new test passes, and all existing tests pass).
- Optionally `npx playwright test -g "shows the search placeholder"` for a focused run. This is a convenience, and the full `npm run test:e2e` is the required command.

Measurable completion criteria:
1. One new test exists in `tests/product-search.spec.js` and `npm run test:e2e` reports it passed.
2. It asserts all four items: empty value, exact placeholder equality, accessible name "Search by name", and `:placeholder-shown` true.
3. No existing test body is modified (diff shows only additions: the constant and the new test).
4. The only file changed by this task is `tests/product-search.spec.js`.

### IMP-003 - Playwright T-2: placeholder hides while typing, returns when cleared and after Clear Filters

| Field | Value |
|---|---|
| Priority | P1 / Must for the placeholder-hides check and the Clear Filters step (DR-002); the filtering spot check is Should (FR-006) |
| Status | PENDING |
| Description | Add one test that proves the native placeholder state toggles with the input value, including after Clear Filters, with a light search-regression spot check. |
| Requirements | FR-002, FR-006, FR-001 (Clear Filters clause), FR-003 (spot check) |
| Acceptance criteria | AC-002, AC-003, AC-004 |
| Architecture | Sections 5.3 (T-2, including step 3), 5.4 option A |
| Design-review items | DR-002 (adopted, concrete), DR-005 (adopted) |
| Source links | Source AC 2 (placeholder disappears on text entry), Source AC 3 (existing search unchanged) |
| Dependencies | IMP-002 (same file, reuses `SEARCH_PLACEHOLDER`), and therefore IMP-001 |
| Files | `product-search/tests/product-search.spec.js` (add only) |
| Assumptions | A-1, A-5 (UNCONFIRMED) |

Implementation objective:
Add one new `test(...)` shaped as follows. The snippet is intended shape only:

```js
test("hides the native placeholder while text is entered and restores it when cleared", async ({ page }) => {
  await page.goto("/");
  const search = page.getByRole("searchbox", { name: "Search by name" });
  const cards = page.getByRole("article");
  const placeholderShown = () => search.evaluate((element) => element.matches(":placeholder-shown"));

  await search.fill("wireless");
  await expect.poll(placeholderShown).toBe(false);
  await expect(cards).toHaveCount(2);

  await search.fill("");
  await expect.poll(placeholderShown).toBe(true);
  await expect(search).toHaveAttribute("placeholder", SEARCH_PLACEHOLDER);
  await expect(cards).toHaveCount(12);

  await search.fill("wireless");
  await expect.poll(placeholderShown).toBe(false);
  await page.getByRole("button", { name: "Clear Filters" }).click();
  await expect(search).toHaveValue("");
  await expect.poll(placeholderShown).toBe(true);
  await expect(cards).toHaveCount(12);
});
```

Concrete DR-002 assertion (mandatory): after `search.fill("wireless")` followed by the `Clear Filters` click, `await expect(search).toHaveValue("")` and `await expect.poll(placeholderShown).toBe(true)` both hold.

Data facts (checked against the existing spec at line 27): searching "wireless" yields 2 articles, and an empty query yields 12. If `fill("")` proves flaky (R-3), use `search.clear()`, or fall back to a `Backspace` sequence.

Required tests and checks (from `product-search/`):
- `npm run test:e2e` (new test and all existing tests pass).

Measurable completion criteria:
1. One new test exists and `npm run test:e2e` reports it passed.
2. The test contains these assertions: `:placeholder-shown` is false after typing, true after clearing the text, and true after Clear Filters (with `toHaveValue("")`).
3. The test also asserts 2 results after typing "wireless" and 12 results after clearing and after Clear Filters (FR-003 spot check).
4. No existing test body is modified (additions only).
5. The only file changed by this task is `tests/product-search.spec.js`.

### IMP-004 - Full regression run and scope gate

| Field | Value |
|---|---|
| Priority | P1 / Must |
| Status | PENDING |
| Description | Run every project check and confirm the diff matches the allowed scope. This task changes no files. Its output feeds Phase 5 hand-off and Phase 7 verification. |
| Requirements | FR-003, FR-004, NFR-001, NFR-002 (automated part), NFR-003, NFR-004, NFR-005 (n/a), FR-005, FR-006 |
| Acceptance criteria | AC-003, AC-004, AC-005 (and confirms AC-001, AC-002) |
| Architecture | Section 6 (regression strategy), D-3, D-5 |
| Design-review items | DR-001 (record the NFR-002 coverage split; no new test) |
| Dependencies | IMP-001, IMP-002, IMP-003 |
| Files | None modified. Read-only checks. |

Required checks (run from `product-search/` unless stated):
1. `npm run test:unit`
2. `npm run test:e2e`
3. `npm run build`
4. Scope diff from the repo root:
   - `git diff --stat` lists only `product-search/src/ProductSearchApp.jsx` and `product-search/tests/product-search.spec.js` (plus untracked `output/` artifacts, which are expected).
   - `git diff -- product-search/src/ProductSearchApp.jsx` is a single-line change.
   - `git diff -- product-search/tests/product-search.spec.js` contains additions only (no removed or modified lines).
5. Repo search for `Try “wireless”` (excluding `node_modules` and `output/`) returns no hits (A-4).

Measurable completion criteria:
1. `npm run test:unit` exits 0 with all pre-existing unit tests passing. Record the reported pass count.
2. `npm run test:e2e` exits 0. Expected tally with the Chromium-only config: 9 passed, 0 failed, 0 skipped, which is the 7 existing tests (5 blocks plus 2 viewport cases) plus the 2 new tests. If the pre-change baseline differs from 7, the count is adjusted by +2 and is not itself the criterion. The criterion is that all existing tests pass unmodified and both new tests pass.
3. `npm run build` exits 0.
4. The scope diff matches items 4 and 5 above. This evidences AC-005 and FR-004.
5. The NFR-002 coverage split recorded under DR-001 is carried into the verification evidence: existing viewport tests pass (automated), and "readable/unclipped" is stated as not automatically verified.

## 6. Traceability (Requirement -> Task -> Code -> Test)

Verification results are pending. No coverage is implied by this plan until evidence exists.

| Requirement | AC | Architecture | IMP task(s) | Code / test location (provisional until implemented) | Planned test / check |
|---|---|---|---|---|---|
| FR-001 | AC-001 | D-1, D-2 | IMP-001, IMP-002, IMP-003 | `ProductSearchApp.jsx` placeholder attribute; spec T-1 and T-2 | T-1 (exact attribute, `:placeholder-shown` true); T-2 (true after clear and after Clear Filters) |
| FR-002 | AC-002 | D-2 | IMP-003 (no production code by design) | spec T-2 | T-2 (`:placeholder-shown` false while typing, true when cleared) |
| FR-003 | AC-003 | D-1 scope limit | IMP-003 (spot check), IMP-004 | spec T-2; existing tests unchanged | Existing unit + E2E suites pass unchanged; T-2 count 2 and 12 |
| FR-004 | AC-005 | D-1, D-5 | IMP-001, IMP-004 | one-line diff | Diff review (IMP-004 step 4) |
| FR-005 | AC-004 | 5.1-5.3 | IMP-002 | spec T-1 | `npm run test:e2e` passes T-1 |
| FR-006 | AC-002, AC-003 | 5.3-5.4 | IMP-003 | spec T-2 | `npm run test:e2e` passes T-2 |
| NFR-001 | AC-003 | Section 6 | IMP-004 | none | `npm run test:unit`, `npm run test:e2e` |
| NFR-002 | AC-001 | D-3 | IMP-004 | none (existing viewport tests) | Existing 375x667 and 1366x768 tests pass; "readable" part not automatically verified (DR-001) |
| NFR-003 | AC-001 | D-4 | IMP-001 (label untouched), IMP-002 | `ProductSearchApp.jsx` label untouched; spec T-1 | `toHaveAccessibleName("Search by name")` plus role/name locators (DR-004) |
| NFR-004 | AC-003, AC-005 | D-1 | IMP-001, IMP-004 | one-line diff | Diff review |
| NFR-005 | AC-005 | D-5 | none | none | Not applicable (stated in requirements) |

Missing links: none for FR/AC. NFR-002 "readable/unclipped" has no automated test by decision (DR-001) and is marked as such. NFR-005 is explicitly not applicable.

## 7. Prerequisites and risks

- Prerequisites: `npm ci` and `npx playwright install chromium` completed in `product-search/` (per `CLAUDE.md`); Node >= 20.19.0 and npm >= 10.8.0; port 4173 free, or an existing dev server reused (`playwright.config.js` `webServer` handles it). The implementer must report if setup is unavailable. No unrun check may be reported as passing.
- File paths: all three paths above were read in this repo state and exist. Line numbers (for example `ProductSearchApp.jsx:70`) are as observed now and may shift. The spec insertion point is provisional.
- Risks, carried forward and unchanged: R-1 typo or Unicode ellipsis (mitigated by exact equality in IMP-002); R-2 attribute-only assertions (mitigated by `:placeholder-shown` in IMP-002/003); R-3 `fill("")` edge case (fallback in IMP-003); R-4 browser-specific pseudo-class (Chromium only); R-5 merge conflicts (isolated branch `sdlc/SCRUM-7`).

## 8. Summary

| Task | Priority | Status | Depends on |
|---|---|---|---|
| IMP-001 | P1 | PENDING | none |
| IMP-002 | P1 | PENDING | IMP-001 |
| IMP-003 | P1 | PENDING | IMP-002 |
| IMP-004 | P1 | PENDING | IMP-001, IMP-002, IMP-003 |

- Blocked tasks: none. Dependency cycles: none.
- Unresolved BLOCKER/HIGH findings: none.
- Open items for the Orchestrator: confirm A-1..A-5 (UNCONFIRMED) at the approval gate (DR-006, Q-1). Optionally have `architecture.md` corrected for the DR-001 character counts and the DR-003 wording; the plan does not depend on it.
