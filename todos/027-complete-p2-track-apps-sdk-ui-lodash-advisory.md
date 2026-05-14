---
status: complete
priority: p2
issue_id: "027"
tags: [code-review, security, dependencies, apps-sdk]
dependencies: []
---

# Track Apps SDK UI Lodash Advisory

`npm audit --omit=dev` reports lodash advisories through `@openai/apps-sdk-ui`, and npm currently reports no available fix.

## Problem Statement

The branch depends on `@openai/apps-sdk-ui` for the new trip components. That dependency currently pulls a vulnerable lodash version according to npm audit. Even if there is no direct fix available, the project needs an explicit triage decision: accept temporarily, pin/override if safe, or monitor upstream.

## Findings

- `npm audit --omit=dev` reports 2 vulnerabilities, including 1 high severity issue.
- The vulnerable path is `@openai/apps-sdk-ui -> lodash`.
- npm reports "No fix available" for the dependency chain.
- This affects the web package dependency graph used by the Storybook/App SDK UI components.

## Proposed Solutions

### Option 1: Track Upstream and Document Temporary Acceptance

**Approach:** Keep the dependency, document why it is accepted for now, and re-run audit during dependency updates.

**Pros:**
- Matches the current requirement to use Apps SDK UI.
- Avoids risky local overrides.

**Cons:**
- Leaves audit failing until upstream changes.
- Requires explicit security acceptance.

**Effort:** 30-60 minutes

**Risk:** Medium

---

### Option 2: Test an Override

**Approach:** Try an npm override to a patched lodash version and run Storybook/build/browser checks to verify Apps SDK UI still works.

**Pros:**
- Could clear the audit without waiting upstream.

**Cons:**
- May break transitive package assumptions.
- Needs careful regression testing.

**Effort:** 2-3 hours

**Risk:** Medium

## Recommended Action

To be filled during triage.

## Technical Details

Affected files:
- [package.json](/Users/vladislavcaraseli/Documents/travel-mcp-app/app/web/package.json:38)
- [package-lock.json](/Users/vladislavcaraseli/Documents/travel-mcp-app/app/web/package-lock.json:1)

Related components:
- Apps SDK UI trip components
- Storybook build

Database changes: No

## Resources

- Review target: current branch `codex/feat-pizzaz-storybook-gallery`
- Audit command: `npm audit --omit=dev`
- Reported path: `node_modules/@openai/apps-sdk-ui -> node_modules/lodash`

## Acceptance Criteria

- [x] Security triage records whether this is accepted, overridden, or blocked on upstream.
- [x] If an override is attempted, `npm run check` and browser smoke pass.
- [x] Audit result is clean after the override.

## Work Log

### 2026-05-14 - Code Review Discovery

**By:** Codex

**Actions:**
- Ran `npm audit --omit=dev`.
- Confirmed the remaining vulnerability path is through `@openai/apps-sdk-ui`.

**Learnings:**
- The current dependency choice is product-aligned, but the security exception should be explicit rather than implicit.

### 2026-05-14 - Completed

**By:** Codex

**Actions:**
- Checked current package versions with `npm view` and `npm outdated`.
- Added an npm override to resolve lodash to `4.18.1`.
- Ran `npm install`, `npm audit --omit=dev`, `npm run check`, and browser smoke.

**Learnings:**
- `@openai/apps-sdk-ui` remains current, and the advisory can be cleared by overriding its transitive lodash dependency.
