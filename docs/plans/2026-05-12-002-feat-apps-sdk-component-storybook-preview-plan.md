---
title: "feat: Add Apps SDK Pizzaz Gallery Storybook Preview"
type: feat
status: completed
date: 2026-05-12
---

# feat: Add Apps SDK Pizzaz Gallery Storybook Preview

## Overview

Bring the full official OpenAI Apps SDK Pizzaz example component set into the Travel MCP app as a Storybook-only preview gallery, following the post-PR #23 `app/server` and `app/web` structure. This first slice is intentionally narrow: make all available Pizzaz components visible and reviewable in Storybook without wiring them into the live travel-agent MCP tools, changing trip schemas, or treating them as production trip UI yet.

The imported gallery should serve as a reference surface for later adapting OpenAI's Pizzaz-style component patterns into real travel trip components.

## Problem Statement / Motivation

PR #23 moved the project toward the official Apps SDK layout described by OpenAI:

```text
app/
  server/            # MCP server
  web/               # Component bundle source
    package.json
    tsconfig.json
    src/component.tsx
    dist/component.js
```

The repo now has `app/web` with React, Vite, Storybook, HTML widget previews, and a host harness that simulates `window.openai`. The next useful step is to import the upstream Apps SDK Pizzaz component family into this web package so the team can inspect the full range beside the current travel widgets before deciding how to refactor them into trip-specific components.

This should not create a new production widget contract yet. The purpose is visual and technical review in Storybook.

## Research Findings

### Local Repository Context

- PR #23 (`dffe9d2`) relocated MCP/runtime code into `app/server` and widget/component code into `app/web`.
- `app/web/package.json` already has `storybook`, `build-storybook`, `typecheck`, and `check` scripts.
- `app/web/.storybook/main.ts` serves only whitelisted widget HTML files through a Vite plugin, avoiding the earlier Storybook static-serving bug.
- `app/web/stories/renderWidget.ts` re-exports the host harness from `app/web/src/bridge/hostHarness.ts`.
- `app/web/src/bridge/hostHarness.ts` simulates `window.openai`, `openai:set_globals`, `ui/notifications/tool-result`, `callTool`, `setWidgetState`, and related host behavior.
- `app/web/src/component.tsx` currently exports `renderWidget` and the local `TripBoard` React component.
- Existing Storybook stories live under `app/web/stories`, using TypeScript and `@storybook/html-vite`.

### Institutional Learnings

- `docs/solutions/ui-bugs/storybook-widget-preview-v3-ui-drift-20260505.md`: keep Storybook static assets whitelisted; do not serve the whole project root; keep Storybook URLs, resource readers, and widget versions in lockstep.
- `docs/solutions/test-failures/storybook-widget-typescript-pr-checks.md`: preserve TypeScript Storybook checks through `npm run typecheck`, `npm run build-storybook`, and `npm run check`.
- `docs/solutions/integration-issues/apps-sdk-fastmcp-structural-refactor-deployment-hardening-20260512.md`: after the structure move, package/runtime assets need explicit contracts; avoid source/dist drift.
- `docs/solutions/integration-issues/apps-sdk-clarification-widget-state-and-schema-contract-20260511.md`: Storybook can catch a lot, but ChatGPT host behavior can still differ; keep host assumptions explicit.

### External References

- OpenAI Apps SDK ChatGPT UI docs: https://developers.openai.com/apps-sdk/build/chatgpt-ui
- OpenAI examples repository: https://github.com/openai/openai-apps-sdk-examples
- Apps SDK UI kit reference linked from the docs: https://openai.github.io/apps-sdk-ui/

The OpenAI docs state that UI components run inside an iframe, communicate with the host through the MCP Apps bridge, and render inline with the conversation. They recommend separating data tools from render tools so the widget is mounted intentionally from final structured context. For this plan, that means the imported preview should stay Storybook-only until the travel app has a deliberate render-tool contract for it.

The current upstream examples repository HEAD checked during planning was `18cc38e78a968712c357bacdc3c79fead5bfc6b4`. Its Pizzaz build targets are:

- `pizzaz` / Pizza Map
- `pizzaz-carousel` / Pizza Carousel
- `pizzaz-list` / Pizza List
- `pizzaz-albums` / Pizza Album
- `pizzaz-shop` / Pizzaz Shop

No `pizzaz-video` source directory or build target was present at that upstream HEAD. Implementation should still search the selected official source before coding; if a Pizzaz Video example exists in a newer official revision or adjacent official resource, include it in the gallery.

## Proposed Solution

Add a dedicated Storybook gallery for every available official Apps SDK Pizzaz example component inside `app/web`, using the current Vite/React/Storybook setup and host harness where useful.

Implementation should prefer an isolated example namespace so the upstream code can be inspected before being rewritten as trip UI:

```text
app/web/src/examples/openai-apps-sdk/
  README.md
  pizzaz/
    Map.tsx
    Carousel.tsx
    List.tsx
    Albums.tsx
    Shop.tsx
    Video.tsx            # only if found in official upstream source
    sampleData.ts
    styles.css

app/web/stories/OpenAIAppsSdkPizzaz.stories.ts
```

The imported components should be adapted only as much as necessary to compile and render locally:

- Keep attribution to the upstream OpenAI examples repository and license.
- Keep sample data local and static.
- Avoid adding MCP server resources or `ui://` template metadata in this slice.
- Avoid mutating existing trip fixtures unless the story needs a small comparison fixture.
- Prefer React source over copied built bundles where feasible, even when upstream source is JSX rather than TypeScript.
- If the chosen upstream examples depend on packages not already installed, add only the minimal dependency set needed for Storybook review.
- Include every Pizzaz target found in the selected upstream examples, not just a representative sample.

## Technical Considerations

- **Source choice:** The source should be the Pizzaz family from `openai/openai-apps-sdk-examples`: map, carousel, list, albums, shop, and any additional Pizzaz entries discovered in the selected upstream revision. If a Pizzaz Video resource exists in a newer official revision, include it too.
- **Isolation:** Use `src/examples/openai-apps-sdk` rather than placing upstream code directly into `src/trip-board` or existing trip widget files.
- **Storybook config:** Add only the new Pizzaz story path to `app/web/.storybook/main.ts`; do not broaden static serving.
- **Build contract:** `npm run check` must pass from `app/web`.
- **Styling:** Keep imported styles scoped to the example namespace to avoid changing existing travel widget previews. The upstream examples use Tailwind/UI-kit conventions; either carry the required CSS/dependencies explicitly or adapt styles into scoped local CSS.
- **Host bridge:** If any example reads `window.openai`, render it through the existing host harness or a small React equivalent that dispatches the same globals.
- **Map dependency:** The upstream map example uses map-oriented assets/dependencies. If it needs a token or remote map provider at runtime, Storybook should provide a deterministic fallback state rather than failing the gallery.
- **License/attribution:** Include a short note in the example README or story docs identifying copied/adapted upstream source and MIT license.

## System-Wide Impact

- **Interaction graph:** Storybook loads `OpenAIAppsSdkPizzaz.stories.ts`, which renders the imported Pizzaz components with static sample data. No FastAPI route, MCP server, resource registration, or trip store code should execute.
- **Error propagation:** Compile errors should fail `npm run typecheck`; Storybook rendering errors should fail `npm run build-storybook` where possible and be visible in browser smoke checks.
- **State lifecycle risks:** No persistent state should be introduced. If the imported component has interactions, they should remain local Storybook state or mocked `window.openai` state.
- **API surface parity:** Existing MCP tools and widget `ui://` resources remain unchanged. The new story is a review surface only.
- **Integration test scenarios:** Existing Python tests should not need changes unless package metadata or static asset lists are changed, which this slice should avoid.

## SpecFlow Analysis

### User Flow Overview

1. Developer opens Storybook from `app/web`.
2. Developer selects the new Apps SDK Pizzaz gallery story group.
3. Developer opens Pizzaz List, Carousel, Map, Album, Shop, Video if found, and any other discovered Pizzaz stories.
4. Storybook renders each imported example component with local sample data.
5. Developer toggles story args or variants to inspect default, empty, and long-content states where each component supports them.
6. Later work can adapt the components into travel-specific trip components after the team reviews the imported baseline.

### Flow Permutations Matrix

| Flow | Context | Expected Behavior |
| --- | --- | --- |
| Pizzaz List | Desktop Storybook | List renders without console/runtime errors |
| Pizzaz Carousel | Desktop Storybook | Carousel renders and supports expected local navigation |
| Pizzaz Map | Desktop Storybook | Map or deterministic fallback renders without requiring production secrets |
| Pizzaz Album | Desktop Storybook | Album/filmstrip/fullscreen paths render locally |
| Pizzaz Shop | Desktop Storybook | Shop preview renders without live checkout/server coupling |
| Pizzaz Video | Official source contains video | Video preview renders, or the plan documents that no official source exists |
| Empty data | Storybook args or variant | Each applicable component displays a stable empty state |
| Long content | Large title/description/image set | Layout does not overflow or hide content |
| Dark or compact host theme | Host harness theme args if used | Component remains legible |
| Missing host APIs | Plain React render path | Components either avoid host dependency or feature-detect it |

### Gaps To Resolve During Implementation

- Confirm the exact upstream revision and enumerate every `src/pizzaz*` entry before coding.
- Confirm whether a Pizzaz Video example exists in a newer official source; if not, document that it is absent from the imported upstream revision.
- Confirm whether each upstream component imports assets, CSS, or dependencies that should be copied, installed, or replaced with local static sample data.
- Decide whether Storybook should expose one gallery story with tabs/args, individual stories for each component, or both.

These gaps do not block planning because the safe default is to import every available `src/pizzaz*` target from the selected official examples revision and document any requested component that is not present there.

## Acceptance Criteria

- [ ] New Storybook stories exist under `app/web/stories` for the imported OpenAI Apps SDK Pizzaz gallery.
- [ ] Imported/adapted source lives under an isolated `app/web/src/examples/openai-apps-sdk` namespace or an equivalent clearly non-production folder.
- [ ] Pizzaz List is imported and visible in Storybook.
- [ ] Pizzaz Carousel is imported and visible in Storybook.
- [ ] Pizzaz Map is imported and visible in Storybook, with a deterministic fallback if a live map provider/token is unavailable.
- [ ] Pizzaz Album/Albums is imported and visible in Storybook.
- [ ] Pizzaz Shop is imported and visible in Storybook if present in the selected official upstream source.
- [ ] Pizzaz Video is imported and visible in Storybook if present in the selected official upstream source; if not present, the implementation documents the upstream revision checked and the absence.
- [ ] Any additional `src/pizzaz*` targets in the selected official upstream source are imported or explicitly documented as intentionally out of scope with a reason.
- [ ] Stories include `Default`, `Empty`, and `Long Content` variants where each component shape supports them.
- [ ] The story is discoverable in Storybook without changing existing travel widget stories.
- [ ] Existing trip widget stories continue to render from their current HTML files.
- [ ] `app/web/.storybook/main.ts` remains narrowly scoped; no broad project-root static serving is introduced.
- [ ] The imported components include source attribution to the OpenAI examples or Apps SDK UI resource.
- [ ] No new MCP tool, `ui://` resource, or server widget registration is added in this first slice.
- [ ] `npm run typecheck` passes from `app/web`.
- [ ] `npm run build-storybook` passes from `app/web`.
- [ ] `npm run check` passes from `app/web`.

## Success Metrics

- Developers can inspect the full available OpenAI Pizzaz example component family in local Storybook.
- The import creates a concrete reference point for later trip-component refactoring.
- Existing widget previews and build checks do not regress.
- The implementation avoids premature MCP/server coupling.

## Dependencies & Risks

- **Dependency drift:** Upstream examples may use packages or styling conventions not currently installed. Mitigation: import the complete Pizzaz family but keep new dependencies explicit, minimal, and justified.
- **Static asset drift:** Copying built assets can create stale artifacts. Mitigation: prefer source-level React/TypeScript where feasible and document copied assets.
- **Storybook regression:** Broad static serving previously broke Vite internals. Mitigation: keep the whitelist pattern and avoid `staticDirs` root exposure.
- **Map runtime risk:** Map components can require external provider setup. Mitigation: include a no-secret Storybook fallback that still shows the layout and sample markers.
- **Requested Video may not exist upstream:** Current upstream HEAD has no `pizzaz-video` entry. Mitigation: search before implementation, import it if found in an official source, otherwise document the checked revision and absence.

## Implementation Notes

Suggested implementation sequence:

1. Select and pin the exact upstream OpenAI Apps SDK examples revision.
2. Enumerate all upstream Pizzaz entries, starting with `pizzaz`, `pizzaz-carousel`, `pizzaz-list`, `pizzaz-albums`, and `pizzaz-shop`.
3. Search the selected official source for `pizzaz-video` or other Pizzaz components and include them if present.
4. Copy/adapt the complete Pizzaz component family into `app/web/src/examples/openai-apps-sdk/pizzaz`.
5. Add local static sample data and any required local asset fixtures.
6. Add TypeScript Storybook stories under `app/web/stories`.
7. If needed, extend the existing host harness only in a backwards-compatible way.
8. Run `npm run check` from `app/web`.
9. Browser-smoke every new Pizzaz story plus at least one existing travel widget story.

## Sources & References

- OpenAI Apps SDK ChatGPT UI docs: https://developers.openai.com/apps-sdk/build/chatgpt-ui
- OpenAI Apps SDK examples repository: https://github.com/openai/openai-apps-sdk-examples
- Apps SDK UI resource: https://openai.github.io/apps-sdk-ui/
- Similar local Storybook pattern: `app/web/stories/TripBoard.stories.ts`
- Host harness: `app/web/src/bridge/hostHarness.ts`
- Storybook config: `app/web/.storybook/main.ts`
- Recent structure refactor: PR #23 / commit `dffe9d2`
- Local learning: `docs/solutions/ui-bugs/storybook-widget-preview-v3-ui-drift-20260505.md`
- Local learning: `docs/solutions/test-failures/storybook-widget-typescript-pr-checks.md`
- Local learning: `docs/solutions/integration-issues/apps-sdk-fastmcp-structural-refactor-deployment-hardening-20260512.md`
