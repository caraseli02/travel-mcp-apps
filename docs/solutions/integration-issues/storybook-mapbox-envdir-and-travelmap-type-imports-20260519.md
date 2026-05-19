---
title: "Fix Storybook Mapbox Env Loading and TravelMap Type Imports"
module: "Travel MCP ChatGPT Apps"
date: 2026-05-19
problem_type: integration_issue
component: storybook_travel_map_preview
severity: medium
status: resolved
root_cause: storybook_vite_loaded_app_web_env_not_repo_root_mapbox_env
resolution_type: storybook_envdir_and_type_import_cleanup
tags:
  - storybook
  - vite
  - mapbox
  - react
  - typescript
  - chatgpt-apps
  - widgets
  - env
related_files:
  - app/web/.storybook/main.ts
  - app/web/src/trip-components/TravelMap.tsx
related_docs:
  - docs/solutions/integration-issues/apps-sdk-map-widget-runtime-and-payload-contracts-20260519.md
  - docs/solutions/integration-issues/apps-sdk-vite-widget-asset-delivery-and-bridge-contract-20260515.md
  - docs/solutions/ui-bugs/travel-storybook-app-sdk-component-review-fixes.md
  - docs/solutions/ui-bugs/storybook-widget-preview-v3-ui-drift-20260505.md
  - docs/solutions/test-failures/storybook-widget-typescript-pr-checks.md
  - docs/plans/2026-05-14-001-feat-travel-pizzaz-component-transformation-plan.md
related_todos:
  - todos/033-complete-p1-fix-map-widget-runtime-contract.md
  - todos/034-complete-p1-fix-trip-map-pin-data-and-title.md
  - todos/028-complete-p1-restore-widget-asset-delivery.md
---

# Fix Storybook Mapbox Env Loading and TravelMap Type Imports

## Problem

The `TravelMap` Storybook story showed the local fallback map instead of live Mapbox, even though the repo had a Mapbox token configured. The component also showed an editor warning:

```text
'mapboxgl' is declared but its value is never read.
```

This blocked confidence that the current ChatGPT Apps widgets were ready for hosted testing. The map fallback was visible, but Storybook was not exercising the production-relevant live Mapbox branch.

## Root Cause

Storybook runs Vite from `app/web`, so Vite searched the web package env context. The actual `.env` file with `VITE_MAPBOX_ACCESS_TOKEN` lived at the repo root. As a result:

- `import.meta.env.VITE_MAPBOX_ACCESS_TOKEN` was empty in Storybook.
- `TravelMap` had valid marker coordinates but no token.
- The component correctly rendered the local fallback preview.

The component was not missing Mapbox logic. It intentionally initializes Mapbox only when both a token and `lat` / `lon` markers exist:

```ts
const mapboxAccessToken = error ? "" : data.mapbox_access_token || BUILD_MAPBOX_ACCESS_TOKEN;
const showFallbackMap = mapError || !mapboxAccessToken || markerOptions.length === 0;
```

The `mapboxgl` warning was separate. `TravelMap` dynamically imports `mapbox-gl` at runtime and only needs Mapbox map/marker types at compile time, so the default type namespace import was the wrong shape for the editor.

## What Did Not Work

Debugging the Mapbox initialization branch inside `TravelMap` did not address the failure. The live branch was already gated correctly.

The incorrect assumption was that Storybook would see the same env as repo-root server/build tooling. It did not because the Storybook config is under `app/web/.storybook`.

## Solution

### Load Repo-Root Env In Storybook

In `app/web/.storybook/main.ts`, compute the Storybook config directory in ESM and point Vite env loading back to the repo root:

```ts
import type { StorybookConfig } from '@storybook/html-vite';
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";

const storybookDir = dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  stories: [
    "../stories/TripComponents.stories.tsx",
    "../stories/chat/ChatPreview.stories.ts"
  ],
  addons: [
    "@chromatic-com/storybook",
    "@storybook/addon-docs",
    "@storybook/addon-a11y"
  ],
  framework: "@storybook/html-vite",
  async viteFinal(viteConfig) {
    return {
      ...viteConfig,
      envDir: resolve(storybookDir, "../../.."),
      plugins: [tailwindcss(), ...(viteConfig.plugins ?? [])],
    };
  },
};

export default config;
```

Use `import.meta.url` and `fileURLToPath` because the Storybook config is ESM; `__dirname` is not available there.

### Use Named Mapbox Type Imports

In `app/web/src/trip-components/TravelMap.tsx`, keep runtime Mapbox loading lazy and import only the needed compile-time types:

```ts
import type { Map as MapboxMap, Marker as MapboxMarker } from "mapbox-gl";

type MapboxModule = typeof import("mapbox-gl");

const mapboxRef = React.useRef<MapboxModule | null>(null);
const mapRef = React.useRef<MapboxMap | null>(null);
const markerRefs = React.useRef<MapboxMarker[]>([]);
```

This removes the editor warning while preserving the dynamic runtime import:

```ts
const mapboxModule = await import("mapbox-gl");
```

## Verification

Validated with the normal local readiness checks:

```bash
cd app/web && npm run typecheck
cd app/web && npm run build
cd ../.. && .venv/bin/python -m pytest tests/test_apps_ui_resources.py tests/test_travel_agent_server.py
cd app/web && npm run build-storybook
git diff --check
```

Results:

- `36 passed` for the Python widget/server tests.
- `npm run typecheck` passed.
- `npm run build` passed.
- `npm run build-storybook` passed with the expected large Mapbox chunk warning.
- `git diff --check` passed.

A Playwright Storybook smoke test confirmed the live path:

- `Live Mapbox preview` label rendered.
- A Mapbox `canvas` existed.
- Seven `.mapboxgl-marker` elements rendered.

A generated-runtime smoke test loaded all ten `app/web/runtime_templates/trip_*.html` widgets with representative `window.openai.toolOutput` and confirmed expected content with no page errors.

## Why This Matters

Storybook is the fastest local harness for ChatGPT Apps widgets, but it must mirror the runtime contract closely enough to test real branches. If Storybook silently misses repo-root env, it only exercises fallback UI while giving false confidence about the hosted widget path.

For Mapbox specifically, local testing needs both modes:

- Storybook live mode with `VITE_MAPBOX_ACCESS_TOKEN` for component behavior.
- Generated Apps runtime mode with tool `structuredContent` and server-side public-token handling.

The repo-root Storybook `envDir` fix restores the component preview path without changing the production Apps runtime token contract.

## Prevention

Treat the map as two separate contracts:

- Storybook proves the component preview path.
- Generated `runtime_templates` plus Python resource tests prove the Apps SDK hosted widget path.

Recommended guardrails:

- Keep Storybook Vite configured with `envDir: resolve(storybookDir, "../../..")`.
- Do not depend on `VITE_MAPBOX_ACCESS_TOKEN` for deployed Apps runtime behavior; it is only for local browser build-time behavior.
- Never inline real Mapbox tokens into committed or generated runtime templates.
- Keep server payload tests that expose only browser-safe `pk.*` Mapbox tokens and reject `sk.*` tokens.
- Test both live and fallback map paths:
  - live: public token plus finite `lat` / `lon`
  - fallback: no token or missing `lat` / `lon`
- Keep a browser smoke test for `trip_map_v1.html`, not only Storybook.
- Avoid running `npm run build` and Python resource tests concurrently, because the widget build removes and recreates `app/web/runtime_templates`.

Recommended validation order:

```bash
cd app/web && npm run typecheck
cd app/web && npm run build
cd ../.. && .venv/bin/python -m pytest tests/test_apps_ui_resources.py tests/test_travel_agent_server.py
cd app/web && npm run build-storybook
git diff --check
```

Potential follow-up test names:

- `test_storybook_vite_loads_repo_root_env`
- `test_runtime_templates_do_not_inline_mapbox_tokens`
- `test_trip_map_live_path_renders_with_public_token_and_lat_lon`
- `test_trip_map_fallback_path_renders_without_token`
- `test_trip_map_generated_widget_smoke_live_and_fallback`
- `test_widget_resource_tests_require_built_runtime_templates`

## Refresh Candidates

The strongest refresh candidate is `docs/solutions/ui-bugs/travel-storybook-app-sdk-component-review-fixes.md`. Its lazy Mapbox guidance remains correct for component builds, but it should clarify the later exception: `trip_map_v1.html` may intentionally inline Mapbox for GPT Apps runtime testing.

Suggested targeted refresh:

```bash
/prompts:ce-compound-refresh Apps SDK Mapbox Storybook env handling after repo-root VITE_MAPBOX_ACCESS_TOKEN and runtime token split
```
