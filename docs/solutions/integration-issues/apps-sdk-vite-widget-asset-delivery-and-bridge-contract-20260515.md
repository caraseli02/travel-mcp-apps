---
title: "Fix Apps SDK Vite widget asset delivery and bridge contract regressions"
module: "Travel MCP ChatGPT Apps"
date: 2026-05-15
problem_type: integration_issue
component: apps_sdk_vite_widget_resources
severity: high
status: resolved
root_cause: vite_multipage_asset_graph_not_collapsed_to_mcp_resource_contract
resolution_type: build_pipeline_and_contract_test_hardening
tags:
  - chatgpt-apps
  - apps-sdk
  - mcp
  - fastmcp
  - widgets
  - vite
  - react
  - storybook
  - typescript
  - packaging
  - bridge
related_files:
  - app/web/scripts/inline-widget-assets.mjs
  - app/web/package.json
  - app/web/vite.config.ts
  - app/web/src/bridge/useCallTool.ts
  - app/web/src/trip-components/TripClarification.tsx
  - app/web/.storybook/preview.ts
  - pyproject.toml
  - tests/test_apps_ui_resources.py
  - tests/test_travel_agent_server.py
related_docs:
  - docs/solutions/integration-issues/apps-sdk-fastmcp-structural-refactor-deployment-hardening-20260512.md
  - docs/solutions/integration-issues/apps-sdk-clarification-widget-state-and-schema-contract-20260511.md
  - docs/solutions/integration-issues/chatgpt-apps-trip-clarification-widget-lifecycle-20260508.md
  - docs/solutions/test-failures/storybook-widget-typescript-pr-checks.md
  - docs/solutions/ui-bugs/travel-storybook-app-sdk-component-review-fixes.md
---

# Troubleshooting: Apps SDK Vite Widget Asset Delivery and Bridge Contracts

## Problem

The trip widgets were migrated from copied static HTML files to React/Vite multi-page widgets, but the resulting build output did not match the MCP Apps resource contract. The server returned `dist/templates/*.html` as `text/html;profile=mcp-app`, while those HTML files referenced separate Vite `/assets/*` and `/chunks/*` files.

At the same time, the React clarification widget regressed several previously documented Apps SDK bridge contracts: it submitted `session_id` instead of `session_json`, used local-only answer state, relied only on ChatGPT convenience APIs, and failed TypeScript checking.

## Symptoms

- `npm run build` produced `dist/templates/trip_*.html` with `<script type="module" crossorigin src="/assets/...">`, modulepreload links, stylesheet links, and shared chunk imports.
- FastMCP resource readers returned only the HTML string, so a hosted ChatGPT iframe could render a blank `<div id="root"></div>` if the referenced static assets were not separately hosted and allowlisted.
- `pyproject.toml` still packaged only `web/dist/*`, which did not cover the new nested `web/dist/templates/*.html` output.
- `npm run typecheck` failed because Storybook preview imported `@storybook/react` while the project used `@storybook/html-vite`.
- `TripClarification` used `RadioGroup`'s raw Radix-style `onValueChange` prop instead of the installed Apps SDK UI `onChange` prop.
- The clarification widget called `submit_trip_clarification` with `{ session_id, answers_json }`, but the server tool accepts `session_json` plus `answers_json`, or direct model-caller fields such as `utterance`.
- Python resource tests passed even though they no longer proved the widget asset graph or bridge submit contract would work in ChatGPT.

## Root Cause

The React/Vite migration changed the runtime shape from a self-contained widget resource to a multi-file browser asset graph, but the MCP resource boundary was not updated to either serve that graph or collapse it back into one HTML resource.

OpenAI Apps SDK guidance treats the widget as an MCP resource/template served with `text/html;profile=mcp-app`. External assets are valid only when they are deliberately hosted from a real static origin and covered by `_meta.ui.csp.resourceDomains`. This app had neither static asset serving nor resource-domain metadata for the generated `/assets` and `/chunks` references, so the conservative contract remained: return self-contained HTML from the resource handler.

The clarification regressions came from reimplementing an older static widget as a React component without preserving the documented Apps SDK lessons:

- submit the full `session_json` contract expected by the server,
- persist meaningful interaction state with `window.openai.widgetState`,
- use MCP Apps bridge fallbacks (`tools/call`, `ui/message`) when ChatGPT helpers are unavailable,
- close transient widgets explicitly after successful submit,
- keep TypeScript and Storybook checks in the default validation path.

## What Didn't Work

**Trusting Vite's generated HTML as a ready MCP resource:** Vite's multi-page output is correct for a normal web server, but an MCP `ui://` resource is not automatically a static asset server.

**Inlining only the entry script:** The first post-build inliner embedded the entry files, but those scripts still contained static imports such as `from"../chunks/index-..."`. The resource was still not actually self-contained.

**Relaxing resource tests to module-script presence:** Checking only for `<script type="module">` and `<div id="root"></div>` allowed missing assets and wrong bridge payloads through review.

**Using raw primitive API assumptions:** Apps SDK UI wraps Radix primitives but exposes its own typed props. `RadioGroup` accepts `onChange`, not `onValueChange`, in the installed package.

## Solution

### 1. Keep Vite, but inline the runtime asset graph at the MCP boundary

The build script now runs Vite and then a post-build inliner:

```json
{
  "scripts": {
    "build": "vite build && node scripts/inline-widget-assets.mjs",
    "check": "npm run typecheck && npm run build && npm run build-storybook"
  }
}
```

The inliner reads `dist/templates/*.html`, removes modulepreload tags, embeds stylesheet contents in `<style>`, embeds entry scripts in `<script type="module">`, and recursively collapses Vite static imports from shared chunks.

```js
const inlineImports = async (source, moduleDir) => {
  const importPattern = /import\{([^}]+)\}from"([^"]+)";/g;
  const matches = [...source.matchAll(importPattern)];
  const replacements = await Promise.all(
    matches.map(async (match) => {
      const [, specifiers, importPath] = match;
      const modulePath = path.resolve(moduleDir, importPath);
      const moduleId = `__travel_widget_module_${nextModuleId++}`;
      const module = await buildInlineModule(modulePath);
      const aliases = parseSpecifiers(specifiers)
        .map(({ exported, local }) => `const ${local}=${moduleId}[${JSON.stringify(exported)}];`)
        .join("");

      return `const ${moduleId}=(()=>{\n${module.code}\nreturn {${[...module.exports]
        .map(([local, exported]) => `${JSON.stringify(exported)}:${local}`)
        .join(",")}};\n})();${aliases}`;
    }),
  );

  let index = 0;
  return source.replace(importPattern, () => replacements[index++]);
};
```

This keeps React/Vite for authoring while preserving the MCP resource shape that FastMCP returns to ChatGPT.

### 2. Clean stale build output and package the new template path

`vite.config.ts` now clears `dist` before each build, so old root-level `dist/trip_*.html` files cannot mask the current output layout.

```ts
export default defineConfig({
  plugins: [tailwindcss(), react()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        trip_board_v3: resolve(__dirname, "templates/trip_board_v3.html"),
        trip_budget_v3: resolve(__dirname, "templates/trip_budget_v3.html"),
        trip_clarification_v1: resolve(__dirname, "templates/trip_clarification_v1.html"),
        trip_inbox_v2: resolve(__dirname, "templates/trip_inbox_v2.html"),
        trip_itinerary_v3: resolve(__dirname, "templates/trip_itinerary_v3.html"),
      },
    },
  },
});
```

`pyproject.toml` now includes the new generated template path and source template fallback:

```toml
[tool.setuptools.package-data]
app = [
    "server/widgets/*.html",
    "web/*.html",
    "web/dist/*",
    "web/dist/templates/*.html",
    "web/templates/*.html",
]
```

### 3. Restore the clarification submit and bridge contract

The React widget now sends the server's expected payload:

```ts
const result = (await callTool("submit_trip_clarification", {
  session_json: JSON.stringify(clarification),
  answers_json: JSON.stringify(answers),
})) as ToolResult | undefined;
```

The bridge helper still uses ChatGPT conveniences when available, but falls back to standard MCP Apps bridge messages:

```ts
if (typeof window !== "undefined" && (window as any).openai?.callTool) {
  return await (window as any).openai.callTool(toolName, args);
}
return await postRpc("tools/call", { name: toolName, arguments: args });
```

Follow-up messaging uses `window.openai.sendFollowUpMessage({ prompt })` when available and otherwise posts `ui/message`:

```ts
window.parent?.postMessage(
  {
    jsonrpc: "2.0",
    method: "ui/message",
    params: { role: "user", content: [{ type: "text", text: message }] },
  },
  "*",
);
```

Successful submit also requests host close when the ChatGPT API is available:

```ts
if (typeof window !== "undefined" && (window as any).openai?.requestClose) {
  await (window as any).openai.requestClose();
}
```

### 4. Persist session-scoped clarification state

The React clarification flow now restores and persists current question index, answers, and submit state through `window.openai.widgetState`, scoped by `session_id`.

```ts
const readSavedState = (sessionId?: string): ClarificationWidgetState => {
  const state = getOpenAiBridge()?.widgetState;
  if (!state || state.session_id !== sessionId) return {};
  return state;
};

const persistState = (state: ClarificationWidgetState) => {
  const bridge = getOpenAiBridge();
  if (!bridge?.setWidgetState) return;
  bridge.widgetState = state;
  Promise.resolve(bridge.setWidgetState(state)).catch(() => {});
};
```

This prevents host replay of `toolOutput` from resetting a user's answers in the same clarification session, while avoiding answer leakage across sessions.

### 5. Fix TypeScript and Storybook framework drift

Storybook preview typing now matches the configured framework:

```ts
import type { Preview } from "@storybook/html-vite";
```

The clarification radio control uses the installed Apps SDK UI API:

```tsx
<RadioGroup
  aria-label={current.prompt}
  value={stringValue(answers[current.id]) || current.options?.[0]?.value}
  onChange={(value: string) => updateAnswers((prev) => ({ ...prev, [current.id]: value }))}
  direction="col"
>
```

## Regression Coverage

The resource tests now assert the Apps SDK delivery contract, not just document shape:

```python
assert "<script type=\"module\" crossorigin src=" not in html
assert "<link rel=\"modulepreload\"" not in html
assert "<link rel=\"stylesheet\"" not in html
assert "from\"../chunks/" not in html
assert "from\"/chunks/" not in html
```

They also verify the Vite-backed widgets still receive tool output updates:

```python
assert "toolOutput" in html
assert "openai:set_globals" in html
assert "ui/notifications/tool-result" in html
```

The clarification resource has explicit contract markers:

```python
assert "submit_trip_clarification" in html
assert "session_json" in html
assert "answers_json" in html
assert "requestClose" in html
assert "setWidgetState" in html
assert "ui/message" in html
assert "tools/call" in html
```

## Verification

Verified locally:

```bash
cd app/web
npm run check
```

Result:

- `tsc --noEmit` passed.
- `vite build && node scripts/inline-widget-assets.mjs` passed.
- `storybook build` passed.

Python package tests:

```bash
.venv/bin/pytest tests
```

Result:

- 67 passed, 1 skipped.

Full top-level pytest collection was not used as the success gate because `test_scenario.py` imports `requests`, which is not declared in `pyproject.toml` and is not installed in the local venv.

## Prevention

- Treat `ui://` widget resources as a runtime contract, not just a build artifact. Either return self-contained HTML or explicitly host and allowlist external asset domains with `_meta.ui.csp.resourceDomains`.
- After any bundler migration, inspect generated HTML for external scripts, stylesheets, modulepreload tags, and static imports that point outside the returned resource.
- Keep `npm run check` as the widget validation gate: typecheck, widget build, and Storybook static build.
- Test bridge semantics through built widget resources. Source-level React correctness is not enough for ChatGPT Apps.
- Preserve bridge fallbacks for interactive widgets: `tools/call` for tool calls and `ui/message` for follow-up messages. Use `window.openai` extensions as additive ChatGPT conveniences.
- Persist meaningful interaction state with `window.openai.widgetState` / `setWidgetState`, scoped by a stable session identifier.
- Keep resource tests narrow enough to avoid false positives from bundled runtime strings, but strict about actual emitted tags and unresolved imports.

## Related Documentation

- `docs/solutions/integration-issues/apps-sdk-fastmcp-structural-refactor-deployment-hardening-20260512.md` documented the earlier package-data and source/dist relocation hardening. This solution updates the build contract from copied static widgets to Vite-generated, inlined templates.
- `docs/solutions/integration-issues/apps-sdk-clarification-widget-state-and-schema-contract-20260511.md` remains the core reference for the clarification `session_json` / `answers_json`, widget state, and bridge fallback contract.
- `docs/solutions/integration-issues/chatgpt-apps-trip-clarification-widget-lifecycle-20260508.md` remains the core reference for transient widget close behavior.
- `docs/solutions/test-failures/storybook-widget-typescript-pr-checks.md` remains the validation reference, but its command examples may need refresh because `npm run build` now runs Vite plus the inliner rather than `build:widgets && build:component`.
- `docs/solutions/ui-bugs/travel-storybook-app-sdk-component-review-fixes.md` remains relevant for component structure, lazy dependencies, and widget state persistence.

## Refresh Candidates

This fix is consistent with the earlier clarification and lifecycle docs, so they do not need replacement. Two older docs now have stale implementation details around the widget build pipeline and should be refreshed together:

- `docs/solutions/test-failures/storybook-widget-typescript-pr-checks.md`
- `docs/solutions/integration-issues/apps-sdk-fastmcp-structural-refactor-deployment-hardening-20260512.md`

Suggested targeted refresh scope:

```bash
/prompts:ce-compound-refresh Apps SDK widget build pipeline after Vite inlined MCP resources
```
