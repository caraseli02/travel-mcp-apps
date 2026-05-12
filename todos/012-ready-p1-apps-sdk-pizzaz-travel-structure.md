---
status: ready
priority: p1
issue_id: "012"
tags: [apps-sdk, mcp, widgets, storybook, refactor]
dependencies: []
---

# Align Travel App With Apps SDK Pizzaz Structure

## Problem Statement

The travel-agent app should move toward the official Apps SDK example structure while preserving the current Python/FastMCP trip workspace. Runtime code now belongs under `app/server`, while widget source and Storybook belong under `app/web`.

Source plan: `docs/plans/2026-05-12-001-refactor-apps-sdk-pizzaz-travel-structure-plan.md`

## Findings

- Trip Board already has a data/render split through `get_trip_board` and `render_trip_board`.
- Tool metadata and explicit output schema registration are already tested and must survive module moves.
- Storybook already simulates the Apps SDK bridge and should be retained under the new web package.
- Prior solution notes warn against broad Storybook static serving and resource URI/build output drift.

## Proposed Solutions

1. **App-only runtime package split**
   - Move server code, MCP clients, domain services, sample data, and active widget resources under `app/server`.
   - Remove old root runtime packages after imports and tests move.

2. **Hard cutover**
   - Move files and update every import immediately.
   - Faster but higher risk because tests, resource readers, and Storybook paths change at once.

3. **Web-only first**
   - Move widgets before server modules.
   - Defers the server/package boundary problem and keeps current source-of-truth drift longer.

## Recommended Action

Use option 1. Establish `app/server` as the only runtime root, move the widget project into `app/web`, update tests/docs, and remove old compatibility directories.

## Acceptance Criteria

- [x] `app/server/travel_agent` is the canonical travel-agent MCP/server package.
- [x] `mcp_servers/travel_agent_server.py` remains a compatibility import path or is fully retired with tests updated.
- [x] `/mcp/travel-agent/` exposes the current MVP tool set and metadata.
- [x] `app/web` contains the widget package, Storybook configuration, bridge harness, fixtures, and active MVP widget assets/source.
- [x] Python resource readers load travel-agent widget resources from the new web location or documented build output path.
- [x] Storybook and widget tests run from the new structure.
- [x] README and ChatGPT Apps testing docs describe the new structure and commands.
- [x] Python and widget quality checks pass.
- [x] Old root runtime packages `mcp_servers`, `mcp_clients`, `services`, and `sample_data` are removed.

## Work Log

### 2026-05-12 - Started Execution

**By:** Codex

**Actions:**
- Created branch `codex/apps-sdk-pizzaz-travel-structure` from `origin/main`.
- Created this ready todo from the plan.

**Learnings:**
- The first pass preserved compatibility shims, but the desired final direction is a clean `app/` runtime tree.

### 2026-05-12 - Implemented Package Split and Web Build

**By:** Codex

**Actions:**
- Added canonical server package under `app/server/travel_agent` and made `mcp_servers/travel_agent_server.py` a compatibility module alias.
- Moved the travel-agent widget review surface into `app/web`, including Storybook, fixtures, bridge harness, active trip HTML shells, and package scripts.
- Added `app/web/src/component.tsx`, `src/trip-board/TripBoard.tsx`, and `vite.config.ts` so `npm run build` emits `dist/component.js` alongside copied widget HTML shells.
- Updated resource readers to prefer `app/web/dist` and fall back to `app/web` during local development.
- Updated README, ChatGPT Apps testing docs, and tests for the new structure.
- Verified `python -m pytest tests`, `npm --prefix app/web run check`, and a Playwright smoke check against the nested Trip Board Storybook iframe.

**Learnings:**
- `app/web` needs its own dependency install; relying on the legacy `mcp_servers/widgets/node_modules` breaks type resolution.
- Storybook still emits large documentation chunks, but the app-specific trip stories render successfully and the warning is not a functional failure.

### 2026-05-12 - Removed Legacy Runtime Roots

**By:** Codex

**Actions:**
- Moved MCP clients, service modules, sample data, weather MCP server, travel tips MCP server, packing MCP server, and shared non-MVP widget assets under `app/server`.
- Removed root runtime directories: `mcp_servers`, `mcp_clients`, `services`, and `sample_data`.
- Updated app imports, tests, package discovery, README, and ChatGPT Apps testing docs to use `app.server.*`.

**Learnings:**
- Historical docs still mention old paths as archival context, but active code and current docs no longer depend on them.
