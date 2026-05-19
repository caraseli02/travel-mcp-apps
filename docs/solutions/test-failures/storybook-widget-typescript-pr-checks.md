---
module: Travel MCP Widgets
date: 2026-05-05
problem_type: missing_static_validation
component: storybook_widget_checks
symptoms:
  - "Storybook files were migrated from JavaScript to TypeScript, but no dedicated TypeScript check was exposed in package scripts"
  - "Storybook-related pull requests had no PR workflow gate for tsc --noEmit or a static Storybook build"
  - "Several Empty story variants were dropped during the JS-to-TS story migration"
  - "The widgets package needed to remain TypeScript-only for Storybook source files where possible"
root_cause: validation_gap
resolution_type: ci_and_storybook_fix
severity: medium
last_refreshed: 2026-05-19
tags: [storybook, typescript, ci, widgets, migration, static-checks, component-build, apps-sdk-ui]
---

# Troubleshooting: Storybook TypeScript Migration Static Checks

## Problem

The widgets Storybook package was migrated from JavaScript to TypeScript, but the validation surface did not move with it. `typescript` and `@types/node` were added, yet there was no stable `tsc --noEmit` command or PR workflow to enforce type checks and Storybook static builds for future widget changes.

During review, the migration also lost some `Empty` story exports that existed in the previous JavaScript stories. That reduced coverage for empty-state widget behavior even though the Storybook build still passed.

## Environment

- Module: Travel MCP Widgets
- Storybook project: `app/web`
- Affected files: Storybook config, stories, fixtures, package scripts, GitHub Actions
- Date: 2026-05-05
- Runtime: local Storybook 10.3.6 with HTML/Vite framework

## Symptoms

- `npm run build-storybook` passed locally, but this only proved the current build could compile.
- `app/web/package.json` must expose a dedicated `typecheck` and combined static check command.
- Storybook PRs need workflow coverage for `app/web/**` and server-owned widget assets under `app/server/widgets/**`.
- The old `test` script still exited with `Error: no test specified`.
- Comparing old JS stories to the new TS stories showed missing `Empty` variants in several widget stories.
- A source scan needed to confirm no `.js`, `.mjs`, or `.cjs` Storybook source files remained under `app/web`.

## Root Cause

The migration focused on renaming and typing Storybook files, but it did not add a CI contract for the new TypeScript source. Without a package-level typecheck command and PR workflow, TypeScript regressions could be introduced later without being caught before merge.

The missing story variants came from manual migration drift: the main `Default` and `Error` stories were carried forward, while several edge-state exports were omitted.

## What Didn't Work

**Relying on `npm run build-storybook` alone:** The static build is necessary, but it is not a clear TypeScript gate for reviewers or CI. A dedicated `typecheck` command makes the intended validation explicit.

**Treating a successful migration as story parity:** Renaming `.stories.js` to `.stories.ts` can still lose exported variants. The Storybook manager may look healthy while important empty/loading/error cases quietly disappear from the sidebar.

**Leaving PR checks implicit:** Local verification does not protect future Storybook-related pull requests unless the same checks run in CI.

## Solution

Add package scripts that expose both the TypeScript check and the combined Storybook validation path.

```json
{
  "scripts": {
    "build": "npm run build:widgets && npm run build:component",
    "build:component": "vite build",
    "build:widgets": "node scripts/copy-widgets-to-dist.mjs",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build",
    "typecheck": "tsc --noEmit",
    "check": "npm run typecheck && npm run build && npm run build-storybook"
  }
}
```

Add a workflow scoped to widget and Storybook changes so PRs run the same static checks.

```yaml
name: Widgets Storybook

on:
  pull_request:
    paths:
      - "app/web/**"
      - "app/server/widgets/**"
      - ".github/workflows/widgets-storybook.yml"

jobs:
  check:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: app/web
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v5
        with:
          node-version: 22
          cache: npm
          cache-dependency-path: app/web/package-lock.json
      - run: npm ci
      - run: npm run check
```

Restore migrated `Empty` story exports so Storybook keeps edge-state coverage. For example:

```ts
export const Empty: Story = {
  args: { data: { city: 'London', weather: 'rain', season: 'spring', activities: [] } },
};
```

Apply the same parity check to other migrated stories that previously had empty-state exports, such as destination guide, trip budget, trip inbox, itinerary, weather dashboard, and forecast chart.

Finally, document the new validation commands in the migration summary so future Storybook work has a clear local checklist.

```bash
npm run typecheck
npm run build
npm run build-storybook
npm run check
```

Current implementation note after the 2026-05-14 React Apps SDK UI component migration: the combined check must cover both standalone HTML widget resources and the React component library build. `npm run build` now copies static widgets and runs Vite, producing `dist/component.js`, `dist/chunks/component.js`, and the lazy `dist/chunks/mapbox-gl.js` chunk used by the travel map component.

Story parity is also no longer represented by separate per-widget story files. Storybook now discovers:

- `app/web/stories/TripComponents.stories.tsx`
- `app/web/stories/chat/ChatPreview.stories.ts`

The trip component story uses controls such as `kind` and `state` to exercise default, empty, and error surfaces. When checking parity after future migrations, verify that each component kind still exposes the important state coverage even if it is not exported as a separate `Empty` story.

Current implementation note after the 2026-05-19 GPT Apps runtime-template work: the default widget `build` now regenerates self-contained `app/web/runtime_templates/trip_*.html` files. Do not run that build concurrently with Python resource tests, because the build removes and recreates `runtime_templates`.

Storybook also has a token/env boundary that the static checks must preserve. The Storybook config lives in `app/web/.storybook`, but repo-local `VITE_*` values such as `VITE_MAPBOX_ACCESS_TOKEN` live in the repo-root `.env`. The current config points Vite at the repo root:

```ts
envDir: resolve(storybookDir, "../../..")
```

That setting is required for the `TravelMap` Storybook story to exercise the live Mapbox branch instead of only the fallback local preview. `tsc --noEmit` still matters here: the current Mapbox pattern uses named type imports plus dynamic runtime import, which avoids editor/typecheck drift while keeping Mapbox lazy.

## Verification

Run the combined local check from the widgets package:

```bash
cd app/web
npm run check
```

The verified run should complete `tsc --noEmit`, `build:widgets`, `build:component`, and `storybook build` successfully.

Confirm the source migration stays TypeScript-only:

```bash
rg --files -g '*.js' -g '*.mjs' -g '*.cjs' app/web/src app/web/stories app/web/.storybook
```

This should return no source files after the migration. Generated outputs such as `app/web/dist`, `app/web/storybook-static`, and dependencies under `node_modules` may still contain JavaScript, but those are build or vendor artifacts rather than Storybook source.

Run the production dependency audit after package changes:

```bash
cd app/web
npm audit --omit=dev
```

Browser smoke checks covered representative Storybook behavior:

- `Chat Preview / Trip Planning Workspace` rendered nested widget iframes.
- `Packing Checklist / Long Content` rendered and checklist interaction updated visible state.
- `Travel Activity Cards / Empty` rendered the expected empty-state message.
- `Trip Components / Apps SDK UI` rendered React component kinds for options list, comparison carousel, map, album, cart, board, itinerary, inbox, budget, and clarification, including error and empty states where supported.

## Prevention

- Keep Storybook widget source TypeScript-only: `.ts` for config, fixtures, helpers, and HTML Storybook stories.
- Add a dedicated `typecheck` command whenever TypeScript is introduced to a package.
- Add a combined `check` command for the expected local and CI validation path.
- Preserve Storybook `envDir` when repo-root `VITE_*` values are needed for local preview paths such as Mapbox.
- Scope CI workflows to the paths they protect so Storybook checks run on relevant PRs without slowing unrelated changes.
- Before a JS-to-TS story migration, list old story exports and compare them after migration.
- Preserve `Empty`, `Loading`, `Error`, `Long Content`, and interactive variants because they catch edge-state regressions that builds often miss.
- For consolidated control-driven stories, preserve state coverage through typed controls and fixtures even when there is not a one-export-per-state story file.
- Keep component build validation in the default `check` path so React Apps SDK UI resources are validated before Storybook is published or reviewed.
- Browser-smoke at least one nested chat preview, one long-content widget, one empty-state widget, and one interactive widget after Storybook migration work.
- Avoid committing generated Storybook output, transpiled JS, cache folders, or coverage output as source review artifacts.

## Related Documentation

- `docs/solutions/ui-bugs/storybook-widget-preview-v3-ui-drift-20260505.md` documents the earlier Storybook preview and v3 widget drift fix that this TypeScript/CI guard builds on.
- `docs/solutions/ui-bugs/chatgpt-native-widget-overflow-travel-mcp-widgets-20260504.md` documents the v3 prototype UI work that later became part of the Storybook widget review surface.
- `docs/solutions/ui-bugs/travel-storybook-app-sdk-component-review-fixes.md` documents the 2026-05-14 React Apps SDK UI component review fixes that made the component build, lazy Mapbox chunk, widget state persistence, and production audit part of the expected validation surface.
- `docs/solutions/integration-issues/storybook-mapbox-envdir-and-travelmap-type-imports-20260519.md` documents the Storybook repo-root env loading requirement for live Mapbox preview and the `TravelMap` type-import cleanup.
- `docs/testing_chatgpt_apps.md` is related for broader Apps SDK and widget verification.
- `docs/chatgpt_apps_readiness_review.md` is related for pre-review quality gates.
