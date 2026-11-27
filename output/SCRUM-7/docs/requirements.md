# Requirements: SCRUM-7 - Improve Product Search Placeholder

## 1. Overview

**Problem statement.** The product search box in `product-search/` currently shows the placeholder `Try “wireless”` (`src/ProductSearchApp.jsx`, input `#product-search`). The story asks for a clearer placeholder so customers understand that the box searches products by name.

**Goals**
- Show the exact placeholder `Search products by name...` in the search input.
- Keep the placeholder behavior standard: it disappears when the user types.
- Leave all existing search/filter behavior unchanged.
- Verify the placeholder with a Playwright UI test.

**Non-goals / out of scope** (stated explicitly in the source or scoped by this document)
- Backend or database changes (source: Technical Requirements). The app has no backend.
- Any change to search matching logic (`filterProducts`), category filter, maximum-price filter, product count, empty state, or Clear Filters behavior.
- Changing the visible `<label>` text ("Search by name") or the search input's accessible name. (Assumption A-1.)
- Localization, theming, or restyling of the placeholder. (Assumption A-3.)

## 2. Stakeholders & Personas

| Persona | Role / permissions |
|---|---|
| Customer (end user) | Anonymous visitor of the SPA; no authentication or roles. Uses the search box to find products. |
| Reporter / Product owner | Kiruthika Balakrishnan (Jira reporter); approves requirements. |
| QA / Developer | Implements the change and the Playwright test. |

## 3. Assumptions & Dependencies

Assumptions are NOT approved requirements until the user confirms them at the approval gate. None block implementation.

| ID | Assumption |
|---|---|
| A-1 | The existing visible label "Search by name" and the input's `id="product-search"` remain unchanged. The accessible name continues to come from the label, so existing role-based locators (`getByRole("searchbox", { name: "Search by name" })`) keep working. |
| A-2 | The placeholder text is the literal ASCII string `Search products by name...` (three full stops, not the Unicode ellipsis character), exactly as written in the Jira story, with no surrounding backticks or quotes. |
| A-3 | No styling change is needed; existing `styles.css` placeholder rendering is acceptable. |
| A-4 | The previous placeholder `Try “wireless”` is replaced, not shown alongside the new one, and is not referenced by any existing test (verified: no match in `tests/product-search.spec.js`). |
| A-5 | The Playwright test is added to the existing `product-search/tests/product-search.spec.js` suite and runs in Chromium via `npm run test:e2e`. |

**Dependencies**
- Existing React component `ProductSearchApp.jsx` (search input `#product-search`, `type="search"`, controlled by `query` state).
- Playwright (Chromium) test setup in `product-search/` (`npm run test:e2e`, dev server on `127.0.0.1:4173`).
- No external systems, APIs, or teams.

## 4. Functional Requirements

| ID | Requirement | Priority | Notes / edge cases |
|---|---|---|---|
| FR-001 | The product search input shall display the placeholder text `Search products by name...` when its value is empty. | Must | Exact, case-sensitive match on the input's `placeholder` attribute (A-2). Applies on initial page load and after Clear Filters resets the query to empty. |
| FR-002 | The placeholder shall not be visible when the search input contains any text. | Must | Relies on standard native placeholder behavior; no custom code expected. Holds for `type="search"` input. If the user clears the text, the placeholder shall reappear (follows from FR-001). |
| FR-003 | Existing search functionality shall remain unchanged: name search remains case-insensitive, trimmed substring matching, combined with category and maximum-price filters using AND semantics; result count, "No products found" empty state, and Clear Filters behave as before. | Must | Regression guard. Only the `placeholder` attribute value of the existing input may change. |
| FR-004 | The change shall be made to the existing React search input in `ProductSearchApp.jsx`, with no backend or database changes. | Must | Source Technical Requirements. No new components, dependencies, or data changes. |
| FR-005 | A Playwright UI test shall verify the placeholder (FR-001) in the existing E2E suite. | Must | The test shall locate the input by its accessible role/name and assert its `placeholder` attribute equals `Search products by name...`. |
| FR-006 | A Playwright UI test should verify the placeholder-disappears behavior (FR-002) and that search still filters after typing (FR-003). | Should | Source AC 2 and 3 are verifiable by UI. The Jira Technical Requirement only mandates a Playwright test for the placeholder; additional coverage of AC 2/3 is recommended. Existing tests already cover filtering regression (filter and clear tests). |

## 5. Non-Functional Requirements

| ID | Category | Requirement |
|---|---|---|
| NFR-001 | Compatibility / regression | All existing unit tests (`npm run test:unit`) and existing Playwright tests shall continue to pass unchanged after the change. |
| NFR-002 | Usability | The placeholder shall be readable in the existing UI at the tested viewports (375x667 and 1366x768) without causing horizontal overflow; the search input shall remain visible, enabled, and at least 40px high, as asserted by the existing reflow test. |
| NFR-003 | Accessibility | The placeholder shall not replace the visible label; the input shall keep its associated `<label>` so its accessible name stays "Search by name". |
| NFR-004 | Maintainability | The change shall be minimal and follow existing code conventions (no new tooling, no lint script exists). |
| NFR-005 | Performance / security / privacy | No new performance, security, privacy, data-retention, logging, or monitoring requirements. The change is a static text attribute with no data handling. (Stated explicitly as not applicable.) |

## 6. User Flows

**Main flow**
1. Customer opens the product search page.
2. The search input is empty and shows the placeholder `Search products by name...` (FR-001).
3. Customer types text; the placeholder disappears (FR-002) and the product list filters as before (FR-003).

**Alternate flows**
- A1: Customer deletes all text; the placeholder reappears (FR-001).
- A2: Customer clicks Clear Filters; the query resets to empty and the placeholder is shown again (FR-001, FR-003).
- A3: Customer applies category or maximum-price filters with an empty search box; the placeholder remains shown and filtering is unchanged (FR-001, FR-003).

**Error flows**
- None introduced. A nonmatching search continues to show "No products found" as before (FR-003).

## 7. Acceptance Criteria

| ID | Criterion |
|---|---|
| AC-001 | **Given** the product search page is loaded, **when** the search input is empty, **then** its placeholder is exactly `Search products by name...`. |
| AC-002 | **Given** the search input is empty and showing the placeholder, **when** the user enters text, **then** the placeholder is no longer displayed; **and when** the text is removed, **then** the placeholder is displayed again. |
| AC-003 | **Given** the change is applied, **when** the user searches by name, filters by category and/or maximum price, or clicks Clear Filters, **then** results, product count, empty state, and reset behavior are identical to current behavior (existing unit and E2E tests pass unchanged). |
| AC-004 | **Given** the change is complete, **when** the Playwright suite runs (`npm run test:e2e`), **then** a UI test asserts the placeholder `Search products by name...` on the search input and passes. |
| AC-005 | **Given** the change is complete, **when** the codebase is reviewed, **then** the only production change is the search input's placeholder in the existing React component, with no backend, database, or data-file changes. |

## 8. Source & Traceability

**Source:** Jira SCRUM-7 "Improve Product Search Placeholder"
- Canonical URL: https://epam-team-d41wx5ya.atlassian.net/browse/SCRUM-7 (issue id 10006)
- Type: Task; Priority: Medium; Status: To Do; Sprint: SCRUM Sprint 0 (active); Reporter: Kiruthika Balakrishnan; Assignee: Unassigned; Created/Updated: 2026-11-19.
- Comments: none. Remote links / linked Confluence pages: none. Retrieval succeeded with no access errors.

**Source text (verbatim from Jira description)**
> As a customer, I want a clear placeholder in the search box so that I understand how to search for products.
>
> Acceptance Criteria:
> 1. Display `Search products by name...` as the search box placeholder.
> 2. The placeholder disappears when the user enters text.
> 3. Existing search functionality remains unchanged.
>
> Technical Requirements:
> - Update the existing React search input.
> - No backend or database changes.
> - Verify the placeholder using a Playwright UI test.

**Traceability matrix**

| Source statement | Requirement IDs | Acceptance criteria IDs |
|---|---|---|
| User story (clear placeholder so customer understands how to search) | FR-001, NFR-002, NFR-003 | AC-001 |
| Source AC 1: Display `Search products by name...` | FR-001 | AC-001 |
| Source AC 2: Placeholder disappears when user enters text | FR-002, FR-006 | AC-002 |
| Source AC 3: Existing search functionality unchanged | FR-003, FR-006, NFR-001, NFR-004 | AC-003 |
| Tech: Update the existing React search input | FR-004, NFR-004 | AC-005 |
| Tech: No backend or database changes | FR-004, NFR-005 | AC-005 |
| Tech: Verify placeholder using a Playwright UI test | FR-005, FR-006 | AC-004 |

Downstream links (architecture decision, IMP task, code, test, verification result) are not yet established; to be added by later phases.

**Current-behavior grounding (analysis, not source)**
- `product-search/src/ProductSearchApp.jsx` line 70: `placeholder="Try “wireless”"` on `<input id="product-search" type="search">`, label "Search by name".
- `product-search/tests/product-search.spec.js` locates the input via `getByRole("searchbox", { name: "Search by name" })`; no test asserts the current placeholder.

## 9. Open Questions

| # | Question | Blocks implementation? |
|---|---|---|
| Q-1 | Confirm assumptions A-1 through A-5 (especially A-2: ASCII `...` and unchanged visible label "Search by name"). | No. Default assumptions are reasonable and the source text is explicit; confirm at the approval gate. |

No blocking questions remain.

## 10. Status

**READY_FOR_ARCHITECTURE**

Source is complete, specific, and testable; no blocking ambiguity. Requirements counts: 6 FR, 5 NFR, 5 AC; 5 non-blocking assumptions pending confirmation at approval.
