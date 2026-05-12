---
status: complete
priority: p2
issue_id: "018"
tags: [code-review, simplicity, widgets, build]
dependencies: []
---

# Remove Unused Or Duplicated Widget Build Artifacts

## Problem Statement

The new web package produces a React `component.js` bundle and duplicate HTML copies in `app/web/dist`, but runtime resources still serve standalone HTML. This creates extra build complexity and multiple sources of truth.

## Findings

- `app/web/package.json` runs `build:component`.
- `app/web/vite.config.ts` emits `dist/component.js`.
- No runtime HTML references `component.js`.
- `app/web/scripts/copy-widgets-to-dist.mjs` copies HTML from `app/web/*.html` to `app/web/dist/*.html`.
- `app/server/travel_agent/mcp.py` prefers `dist` and falls back to source HTML, so stale `dist` files can shadow source changes.
- `app/web/src/fixtures/travelFixtures.ts` duplicates `app/web/stories/fixtures/travelFixtures.ts`.

## Proposed Solutions

### Option 1: Make React Bundle The Real Runtime Surface

**Approach:** Update widget HTML shells to load `component.js`, and keep `dist` as the deployable output.

**Pros:**
- Aligns with the Apps SDK example direction.
- Makes Vite output meaningful.

**Cons:**
- Requires converting more widget behavior into bundled source.
- Needs browser verification.

**Effort:** Large

**Risk:** Medium

---

### Option 2: Remove The Unused Bundle For Now

**Approach:** Keep standalone HTML widgets, remove `src/component.tsx`, `TripBoard.tsx`, and `build:component` until the migration is real.

**Pros:**
- Simpler current app.
- Avoids dead artifacts.

**Cons:**
- Moves away from the official example structure temporarily.

**Effort:** Medium

**Risk:** Low

---

### Option 3: Keep Both But Add Drift Checks

**Approach:** Add a test or script that verifies `dist` files match source HTML and documents that `component.js` is experimental.

**Pros:**
- Low disruption.
- Reduces stale artifact risk.

**Cons:**
- Leaves complexity in place.

**Effort:** Small

**Risk:** Low

## Recommended Action

To be filled during triage.

## Technical Details

**Affected files:**
- `app/web/package.json`
- `app/web/vite.config.ts`
- `app/web/src/**`
- `app/web/scripts/copy-widgets-to-dist.mjs`
- `app/web/dist/**`
- `app/server/travel_agent/mcp.py`

## Resources

- Code-simplicity and performance review findings.

## Acceptance Criteria

- [ ] There is one documented runtime source of truth for trip widget HTML/assets.
- [ ] `component.js` is either used by widget HTML or removed from the build.
- [ ] Duplicate fixture files are removed or intentionally shared.
- [ ] `npm --prefix app/web run check` passes.

## Work Log

### 2026-05-12 - Review Discovery

**By:** Codex

**Actions:**
- Searched for runtime references to `component.js`.
- Compared source and dist widget ownership.

**Learnings:**
- The refactor has the official example shape, but not yet the official example runtime model.

