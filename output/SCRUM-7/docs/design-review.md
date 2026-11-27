# Design Review: SCRUM-7 - Improve Product Search Placeholder

Reviewed: `output/SCRUM-7/docs/architecture.md` against `output/SCRUM-7/docs/requirements.md` (FR-001..006, NFR-001..005, AC-001..005; assumptions A-1..A-5 unconfirmed by the user).
Repository evidence checked: `product-search/src/ProductSearchApp.jsx`, `product-search/src/styles.css`, `product-search/tests/product-search.spec.js`, `product-search/playwright.config.js`, `product-search/package.json`, and a repo-wide grep for `placeholder` and `Try “`.

## Verdict

**No unresolved BLOCKER or HIGH findings. The design may proceed to implementation planning.**

Counts: BLOCKER 0, HIGH 0, MEDIUM 2, LOW 4. All findings are open. The MEDIUM and LOW items are recommendations for the planner and implementer to accept or reject. None need an architecture rework.

## Review summary

- **Scope:** The proposed change is one attribute value on the existing input (`ProductSearchApp.jsx:70`) plus tests in the existing spec. This matches FR-004 and AC-005. I found no scope creep: no new component, dependency, CSS, constant, or i18n layer.
- **Repo evidence:** All the architecture's claims about the code were checked and are accurate:
  - Five existing test blocks plus a two-viewport loop.
  - `toHaveAttribute` already used at lines 9, 12-13 and 98.
  - One-shot `evaluate` calls at lines 52, 57, 61, 66, 72 and 80.
  - Test line ranges 19-43, 84-90 and 101-130.
  - `query` starts as `""`, and `clearFilters()` resets it to `""`.
  - The old placeholder appears only at `ProductSearchApp.jsx:70`.
  - There is no `::placeholder` CSS.
  - Chromium-only config.
  - No lint script.
- **`:placeholder-shown` approach is valid.** The pseudo-class matches an `<input>` (including `type="search"`) that has a non-empty `placeholder` and an empty value, in Chromium. Using `expect.poll(() => search.evaluate(el => el.matches(":placeholder-shown")))` is a correct and retryable way to prove "disappears" (AC-002). The attribute stays in the DOM, so the architecture is right that `toHaveAttribute` alone cannot prove it. Option B (`#product-search:placeholder-shown` with `toHaveCount`) is an equivalent fallback.
- **`toHaveAttribute("placeholder", "<string>")`** is a full, case-sensitive equality check, so it satisfies "exactly" in AC-001.
- **Locator strategy:** `getByRole("searchbox", { name: "Search by name" })` is identical to the existing tests (lines 21, 86, 109, 123). With a `<label for>` present, the placeholder does not take part in the accessible-name computation, so the locator stays valid.
- **T-2 data check:** `fill("wireless")` gives 2 articles (Wireless Headphones and Wireless Mouse), consistent with line 27. `fill("")` restores 12.
- **Requirement coverage:** Every FR, NFR and AC maps to a decision, a code location and a planned test in section 8. FR-002 has no production code by design, so its coverage rests entirely on T-2. The architecture states this. Items that depend on unconfirmed assumptions are labelled `[ASSUMPTION]`, and recommendations are labelled `[REC]`.

## Findings

### DR-001 - MEDIUM - NFR-002 "readability" claim is overstated and its length arithmetic is wrong
- **Location:** `architecture.md` D-3 and traceability row NFR-002.
- **Evidence:**
  - D-3 says the new string is "27 characters, shorter than or comparable to the old one (16 characters plus quotes)".
  - `Search products by name...` is 26 characters. `Try “wireless”` is 14 characters including the curly quotes.
  - The new placeholder is about 1.9x longer than the old one, not "shorter".
  - D-3 also says the existing reflow test "already asserts NFR-002". That test (spec lines 101-130) asserts only no page-level horizontal overflow, visibility, enabled state, bounds within the viewport and height >= 40px.
  - Nothing in it asserts that the placeholder text is readable or unclipped.
- **Impact:**
  - The conclusion (low risk) is probably still right. At 375px the input content box is about 270px wide (`.page-shell` is 100% - 48px, the panel has 16px padding on each side, and the input has 12px padding on each side). About 26 characters at 16px inherited font should fit in roughly 190-210px.
  - The stated reasoning is wrong, and the requirement is not actually evidenced by a test.
- **Affected requirements:** NFR-002, AC-001 (via the NFR-002 link).
- **Recommendation:**
  - Correct the character counts and the "shorter" claim.
  - State that NFR-002 "readable" is accepted on the basis of the geometry estimate or a manual check at 375px.
  - Optionally add a cheap assertion in the implementation plan, for example `search.evaluate(el => el.scrollWidth <= el.clientWidth)` at 375x667. Otherwise explicitly downgrade the "readable" part of NFR-002 to "not automatically verified".
- **Status:** Open.

### DR-002 - MEDIUM - FR-001's "after Clear Filters" clause has no mandatory test, and T-1 step 5 is vague
- **Location:** `architecture.md` 5.3 (T-1 step 5; T-2 step 3 "optional") and section 8 (FR-001 row).
- **Evidence:**
  - FR-001 notes and requirements flow A2 say the placeholder must show after Clear Filters.
  - The architecture makes the Clear Filters check optional ("may live in T-2 or be skipped").
  - Existing tests assert only `toHaveValue("")` after Clear Filters (line 38), not the placeholder state.
  - T-1 step 5 says "assert the placeholder is currently shown (see 5.4)" without stating the exact check. 5.4 offers options A and B.
- **Impact:**
  - Coverage of an explicitly stated FR-001 behavior depends on a decision deferred to planning.
  - It is low-risk, because the placeholder is native, but the traceability matrix implies full FR-001 coverage.
- **Affected requirements:** FR-001, FR-002, AC-001, AC-002, AC-004.
- **Recommendation:**
  - Make the choice now: include the type text, click Clear Filters, assert `:placeholder-shown` is true sequence as the last step of T-2. It costs about 3 lines.
  - Alternatively, record in the traceability matrix that the Clear Filters path is covered only by existing `toHaveValue("")` plus native behavior.
  - In T-1 step 5, name the concrete assertion (option A).
- **Status:** Open.

### DR-003 - LOW - Rationale in 5.2 for not using `getByPlaceholder` is self-contradictory
- **Location:** `architecture.md` 5.2, second bullet.
- **Evidence:** The text says the locator "would disappear from the match once text is typed (placeholder is still an attribute, so it would still match...)".
- **Impact:** `getByPlaceholder` matches the attribute, so it would still match. The stated reason is incorrect, although the conclusion is sound. The better reasons are that it matches the value under test, and that the role/name locator is the repo convention. This could confuse the implementer.
- **Affected requirements:** FR-005, FR-006 (clarity only).
- **Recommendation:** Reword to "coupling the locator to the value under test, and the repo convention is role/name".
- **Status:** Open.

### DR-004 - LOW - Accessible-name preservation (NFR-003) is only weakly verified by the proposed locator
- **Location:** `architecture.md` D-4 and 5.2 ("also proves that the accessible name is unchanged").
- **Evidence:**
  - Playwright's `getByRole(..., { name })` with a string is a case-insensitive substring match unless `exact: true`.
  - The locator would still match if the name changed to, say, "Search by name (optional)".
  - It would also match the new placeholder text if it ever became part of the name. The placeholder `Search products by name...` does not contain the substring `Search by name`, so there is no accidental match today.
- **Impact:** NFR-003 is only indirectly checked.
- **Affected requirements:** NFR-003, AC-001.
- **Recommendation:** Optionally add `await expect(search).toHaveAccessibleName("Search by name")` to T-1 (supported by Playwright 1.65). Alternatively, soften "proves" to "is consistent with".
- **Status:** Open.

### DR-005 - LOW - `expect.poll` justification and the limits of `:placeholder-shown`
- **Location:** `architecture.md` 5.4 option A and R-2/R-4.
- **Evidence:**
  - The text says `expect.poll` is "consistent with existing `evaluate` usage". The existing usages (lines 52-80) are one-shot `expect(await ...evaluate())` with no polling.
  - `:placeholder-shown` reflects DOM state (placeholder present and value empty). It does not detect CSS that hides the text, for example a transparent color.
- **Impact:**
  - Cosmetic, plus a small overclaim. "Real browser rendering check" is somewhat stronger than what is proven.
  - No such CSS exists today (grep found no `::placeholder` rule).
- **Affected requirements:** FR-002, AC-002.
- **Recommendation:**
  - Reword so the claim reads as "native placeholder state".
  - `expect.poll` or option B are both fine. Option B gives web-first retry without `evaluate`.
- **Status:** Open.

### DR-006 - LOW - Implementation planning proceeds on unconfirmed assumptions A-1..A-5
- **Location:** `architecture.md` section 11; `requirements.md` Q-1.
- **Evidence:** The assumptions are carried forward unchanged and unconfirmed by the user. The architecture labels them correctly.
- **Impact:**
  - Most important is A-2 (the ASCII `...`). If the user wanted a Unicode ellipsis, D-1 and T-1 would change by one string.
  - The effect is contained to one string constant and one assertion.
- **Affected requirements:** FR-001, AC-001, NFR-003 (A-1), A-5/FR-005.
- **Recommendation:** The Orchestrator should confirm A-1..A-5 at the approval gate. No design change is needed unless an answer differs.
- **Status:** Open (informational).

## Areas not assessed

- No tests were run. Playwright and Chromium behavior was assessed from documented platform behavior and the repo's code, not executed.
- The visual rendering and clipping of the new placeholder at 375px were estimated from the CSS, not observed in a browser.
- The full contents of `styles.css` beyond the filter and input rules, and the Vitest unit tests, were not reviewed in detail. The architecture's grep found no placeholder references in them, and my repo grep confirms that.
