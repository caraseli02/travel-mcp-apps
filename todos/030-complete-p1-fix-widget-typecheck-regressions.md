---
status: complete
priority: p1
issue_id: "030"
tags: [code-review, typescript, storybook, widgets, ci]
dependencies: []
---

# Fix Widget Typecheck Regressions

## Problem Statement

The widget package no longer passes `npm run typecheck`. This breaks the documented Storybook/widget validation contract and should block merging the migration.

## Findings

- `npm run typecheck` in `app/web` fails with `Cannot find module '@storybook/react'` from `.storybook/preview.ts:1`.
- `app/web/package.json` still depends on `@storybook/html-vite`, but `.storybook/preview.ts:1` now imports `Preview` from `@storybook/react`.
- `TripClarification.tsx:100` passes `onValueChange` to `@openai/apps-sdk-ui` `RadioGroup`, but the installed component type does not expose that prop.
- The same line leaves the callback parameter implicitly `any` under `strict` TypeScript.

Known Pattern: `docs/solutions/test-failures/storybook-widget-typescript-pr-checks.md` documents that widget changes must keep a dedicated TypeScript/static build gate green.

## Proposed Solutions

### Option 1: Use the Installed Storybook Framework Types and Correct Apps SDK UI Props

**Approach:** Revert the preview type import to the installed Storybook package or install the matching React framework deliberately. Update `RadioGroup` usage to the actual `@openai/apps-sdk-ui` API and type the event/value callback.

**Pros:**
- Minimal change.
- Keeps current Storybook framework choice clear.
- Restores the existing validation contract.

**Cons:**
- Requires checking the Apps SDK UI component API before choosing the replacement prop.

**Effort:** Small

**Risk:** Low

---

### Option 2: Fully Migrate Storybook to React Framework

**Approach:** Replace the HTML Storybook framework dependency/configuration with React Storybook packages and update all story configuration consistently.

**Pros:**
- Could match the React component direction.
- Removes mixed HTML/React Storybook semantics.

**Cons:**
- Larger migration than this widget build change.
- More risk to existing stories.

**Effort:** Medium

**Risk:** Medium

---

### Option 3: Add a Local Adapter Around Apps SDK UI Form Controls

**Approach:** Wrap `RadioGroup`, `Checkbox`, and text inputs in local typed components that normalize value/change handling.

**Pros:**
- Centralizes bridge/widget form behavior.
- Makes future Apps SDK UI type drift easier to handle.

**Cons:**
- More abstraction for a small form.
- Still requires fixing the immediate Storybook type import.

**Effort:** Medium

**Risk:** Low to Medium

## Recommended Action

To be filled during triage.

## Technical Details

**Affected files:**
- `app/web/.storybook/preview.ts:1` - imports a package not installed by the current Storybook setup
- `app/web/src/trip-components/TripClarification.tsx:96` - incompatible `RadioGroup` props
- `app/web/package.json` - framework dependencies must match imports/config

**Related components:**
- Storybook validation
- Apps SDK UI form components
- React widget migration

**Database changes:** No

## Resources

- `docs/solutions/test-failures/storybook-widget-typescript-pr-checks.md`

## Acceptance Criteria

- [ ] `npm run typecheck` passes in `app/web`.
- [ ] `npm run check` reaches build and Storybook phases.
- [ ] Storybook framework imports match installed dependencies.
- [ ] Trip clarification form controls compile under `strict` TypeScript.
- [ ] A regression test or CI path continues to run the widget typecheck.

## Work Log

### 2026-05-15 - Code Review Discovery

**By:** Claude Code

**Actions:**
- Ran `npm run typecheck` in `app/web`.
- Captured failures in Storybook preview typing and TripClarification form control props.
- Cross-checked the issue against prior widget TypeScript validation documentation.

**Learnings:**
- `npm run build` can succeed even when `tsc --noEmit` fails, so the dedicated typecheck remains necessary.

### 2026-05-15 - Fix Implemented

**By:** Claude Code

**Actions:**
- Restored Storybook preview typing to `@storybook/html-vite`, matching the configured framework.
- Switched `RadioGroup` usage from unsupported `onValueChange` to the installed Apps SDK UI `onChange` prop.
- Tightened clarification answer typing so `npm run typecheck` passes under `strict`.

**Learnings:**
- The Apps SDK UI package wraps Radix primitives but exposes its own prop names; using raw Radix prop names can compile in examples but fail against installed package types.

## Notes

This blocks merge because the repo's explicit widget validation command fails.
