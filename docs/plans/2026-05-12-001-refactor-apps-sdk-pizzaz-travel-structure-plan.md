---
title: "refactor: Align Travel App With Apps SDK Pizzaz Structure"
type: refactor
status: active
date: 2026-05-12
origin: docs/brainstorms/2026-05-05-apps-sdk-revalidation-requirements.md
---

# refactor: Align Travel App With Apps SDK Pizzaz Structure

## Overview

Refactor the Travel MCP app toward the official OpenAI Apps SDK example shape while keeping the current trip-planning product direction. The target structure is:

```text
app/
  server/            # Python MCP/FastAPI server modules
  web/               # React component bundle source plus Storybook
    package.json
    tsconfig.json
    src/component.tsx
    dist/component.js
```

This should adapt the official Pizzaz demo patterns to travel: list/carousel-style option review, reusable HTML/component bundles, explicit widget resources, and model-friendly tools that return `structuredContent`. It should not restart the product as a generic travel dashboard, should not move away from Python solely because some examples are TypeScript, and should not reintroduce weather/forecast widgets into the unified MVP path (see origin: `docs/brainstorms/2026-05-05-apps-sdk-revalidation-requirements.md`).

## Problem Statement

The app already has working FastAPI/FastMCP server code, trip persistence, tool metadata, and Storybook-backed widget previews. The current shape still carries historical drift:

- Server code lives in multiple top-level locations (`mcp_servers/`, `services/`, `app/`) rather than the clearer Apps SDK-inspired `app/server` boundary.
- Widget source is mostly self-contained HTML files under `mcp_servers/widgets`, while the official examples build versioned HTML/JS/CSS assets from component source.
- Storybook is useful and already handles Apps SDK bridge simulation, but it is tied to the legacy widget folder.
- Some MVP widgets still use one-shot render coupling that should be revisited after the first successful decoupled Trip Board path.
- Resource URI versions and built file names have known drift risks from prior v3 promotion work.

The goal is to reuse upstream example structure and build flow where it helps, not transplant the example repo wholesale (see origin: `docs/brainstorms/2026-05-05-apps-sdk-revalidation-requirements.md`).

## Research Findings

### Origin Decisions Carried Forward

- Keep the app ChatGPT-native and centered on saved trip state, capture, decision support, and itinerary support (see origin: `docs/brainstorms/2026-05-05-apps-sdk-revalidation-requirements.md`).
- Prefer official OpenAI examples selectively, especially Pizzaz list/map/carousel for travel options, Kitchen Sink Lite for host APIs, Shopping Cart for session/state patterns, and authenticated Python examples later if auth becomes needed (see origin).
- Keep `/mcp/travel-agent/` as the primary Developer Mode endpoint and keep weather/forecast out of MVP alignment scope (see origin).
- Move non-trivial flows toward data/mutation tools returning reusable `structuredContent` and render tools owning `_meta.ui.resourceUri` plus `_meta["openai/outputTemplate"]` (see origin).
- Keep Python/FastMCP for now because the current server works and is compatible with official Python examples (see origin).
- Require hosted ChatGPT Developer Mode validation before calling the app submission-ready (see origin).

### Local Codebase

- `mcp_servers/travel_agent_server.py` already defines `WIDGETS_DIR`, FastMCP setup, status metadata, render metadata, tool output schemas, and trip workspace tools.
- `mcp_servers/travel_agent_server.py:114` defines `_render_meta()` with both `_meta.ui.resourceUri` and `openai/outputTemplate`, matching the intended compatibility shape.
- `mcp_servers/travel_agent_server.py:168` manually attaches output schemas for `CallToolResult` handlers, which should be preserved during file moves.
- `mcp_servers/travel_agent_server.py:369` and `mcp_servers/travel_agent_server.py:393` already split Trip Board into `get_trip_board` and `render_trip_board`.
- `mcp_servers/widgets/.storybook/main.ts:10` whitelists widget HTML files for Storybook static serving, a pattern that must survive the move.
- `mcp_servers/widgets/stories/renderWidget.ts:57` simulates `openai:set_globals` and `ui/notifications/tool-result`, and `mcp_servers/widgets/stories/renderWidget.ts:86` mocks `window.openai` host APIs.
- `tests/test_api.py` verifies the mounted `/mcp/travel-agent/` tool contract, output schemas, descriptor metadata, and render metadata.
- `tests/test_apps_ui_resources.py` verifies widget HTML completeness, self-contained resources, and bridge handlers.

### Institutional Learnings

- `docs/solutions/integration-issues/apps-sdk-trip-workspace-mvp-tool-render-alignment-20260505.md`: keep the unified endpoint focused on trip workspace tools, separate data/mutation/render tool roles, and update tests whenever tool metadata changes.
- `docs/solutions/ui-bugs/storybook-widget-preview-v3-ui-drift-20260505.md`: do not serve an entire widget project root as Storybook static assets; whitelist only the needed widget files; keep `ui://` versions, Storybook URLs, and resource readers in lockstep.
- `docs/solutions/integration-issues/apps-sdk-clarification-widget-state-and-schema-contract-20260511.md`: widgets that own meaningful interaction state must use `widgetState` and `setWidgetState`; ChatGPT Developer Mode can reveal issues Storybook misses.

### External Documentation

- OpenAI Apps SDK ChatGPT UI docs state that UI components run in an iframe, communicate through the MCP Apps bridge, and render inline with the conversation: https://developers.openai.com/apps-sdk/build/chatgpt-ui
- The same docs recommend the MCP Apps bridge by default, with ChatGPT continuing to support `window.openai` as a compatibility layer.
- The docs show the desired split: a data tool returns reusable `structuredContent`, and a render tool owns the UI template metadata.
- The official examples repository includes `pizzaz_server_python`, `pizzaz_server_node`, `src/pizzaz-list`, `src/pizzaz-carousel`, `src/pizzaz`, `kitchen_sink_*`, and `shopping_cart_python`: https://github.com/openai/openai-apps-sdk-examples
- The Python Pizzaz server registers reusable widget resources, associates tools with `openai/outputTemplate`, returns structured content, and loads built HTML assets from an assets directory.
- The examples build flow uses Vite multi-entry component bundles and emits per-component HTML/JS/CSS assets, which is the closest fit for `app/web/src/component.tsx` plus `app/web/dist`.

## Proposed Solution

Create a staged refactor that separates server and web concerns before redesigning the widgets:

1. Introduce `app/server/` as the canonical Python server package.
2. Introduce `app/web/` as the canonical widget component package with Storybook retained.
3. Move or wrap current trip-agent server/resource code into `app/server/travel_agent/`.
4. Move current widget preview/build assets into `app/web/`, keeping compatibility wrappers or imports so tests can be migrated safely.
5. Add a Vite build contract modeled on the official examples: component source in `src/`, build output in `dist/`, resource HTML shells emitted for server loading.
6. Adapt the first travel UI from Pizzaz list/carousel patterns, focused on Trip Board saved options rather than generic destination content.
7. Keep existing resource URI contracts stable during the first move unless a widget visible contract changes materially.
8. Update tests, README, and ChatGPT testing docs to make the new structure the official path.

## Technical Approach

### Target File Layout

```text
app/
  main.py
  config.py
  mcp_mounts.py
  server/
    __init__.py
    travel_agent/
      __init__.py
      mcp.py
      resources.py
      schemas.py
      tools.py
      store.py          # wrapper/import boundary for services.trips during migration
    legacy/
      weather.py        # optional compatibility phase only if useful
  web/
    package.json
    tsconfig.json
    vite.config.ts
    .storybook/
      main.ts
      preview.ts
    src/
      component.tsx
      trip-board/
        TripBoard.tsx
        TripBoard.stories.ts
      trip-inbox/
      bridge/
        openai.ts
        hostHarness.ts
      fixtures/
        travelFixtures.ts
    dist/
      trip-board.html
      trip-board.js
      trip-board.css
```

Compatibility can be temporary:

- `mcp_servers/travel_agent_server.py` may import and re-export `server` and widget resource readers from `app.server.travel_agent.mcp` while tests are migrated.
- `mcp_servers/widgets/` may remain as a compatibility shim until Storybook and resource tests point to `app/web`.
- `services/trips.py` may stay in place initially, with `app/server/travel_agent/store.py` importing it. Moving persistence code can be a later cleanup if it adds risk.

### Pizzaz Pattern Mapping

| Pizzaz Pattern | Travel Refactor Use |
| --- | --- |
| `pizzaz-list` | Saved trip options list: inbox/shortlist/booked lanes with concise action affordances |
| `pizzaz-carousel` | Compare shortlisted hotels, flights, restaurants, or activities |
| `pizzaz` map | Later destination/area clustering only if saved items include useful location data |
| Python Pizzaz server widget registry | Travel widget registry in `app/server/travel_agent/resources.py` |
| Vite multi-entry assets | `app/web` build output consumed by Python resource readers |
| Kitchen Sink Lite host APIs | Bridge utilities and Storybook harness coverage |
| Shopping Cart state | Future multi-step saved-trip interactions, not the first migration blocker |

First adaptation target: Trip Board as a saved-option list/carousel surface. This resolves the origin question about which example to adapt first: start with Pizzaz list/carousel, not map, because the current persisted trip data is strongest for comparison and triage, not geospatial display.

### Tool Contract Direction

Keep or improve this split:

```python
# app/server/travel_agent/tools.py
@server.tool(name="get_trip_board", meta=_status_meta(...))
def get_trip_board(trip_id: str) -> CallToolResult:
    return CallToolResult(structuredContent=board, content=_text(...), _meta={})

@server.tool(name="render_trip_board", meta=_render_meta("ui://trip/board-v2.html", ...))
def render_trip_board(trip_id: str) -> CallToolResult:
    return CallToolResult(structuredContent=board, content=_text(...), _meta={})
```

Do not move every widget to a separate render tool immediately. The first phase should preserve behavior and prove the new package/build contract. Then evaluate `list_trip_inbox`, `get_trip_itinerary`, and `get_trip_budget` with the helpful-UI gate.

### Resource Loading Contract

Create a registry similar to the Python Pizzaz example, but travel-specific:

```python
# app/server/travel_agent/resources.py
@dataclass(frozen=True)
class TravelWidget:
    identifier: str
    title: str
    template_uri: str
    html_file: str
    invoking: str
    invoked: str

def read_widget_html(widget: TravelWidget) -> str:
    return (WEB_DIST_DIR / widget.html_file).read_text(encoding="utf-8")
```

Acceptance should require resource readers to load from `app/web/dist` after build, while tests may use checked-in HTML only if the project intentionally commits build outputs.

### Storybook Contract

Storybook stays inside `app/web` and remains the local widget review surface. It must keep:

- A bridge/host harness equivalent to `renderWidget.ts`
- Fixture-driven stories for Trip Board, Inbox, Itinerary, Budget, Clarification
- Chat preview stories for multi-widget flows
- Nested iframe verification guidance
- Static whitelist behavior if HTML shells are served directly

The plan should remove weather/forecast and destination-guide stories from the MVP review set unless they are explicitly kept as legacy examples outside the unified travel-agent scope.

## Implementation Phases

### Phase 1: Package Boundaries and Compatibility

- [x] Create `app/server/` and `app/server/travel_agent/`.
- [x] Move or copy trip-agent constants, schemas, metadata helpers, tools, and resource readers into focused modules.
- [x] Keep `mcp_servers/travel_agent_server.py` as a compatibility import layer during migration.
- [x] Update imports in `app/mcp_mounts.py` only after tests pass against the new module.
- [x] Add tests that assert `mcp_servers.travel_agent_server.server is app.server.travel_agent.mcp.server` or remove the old import path after all tests are migrated.
- [x] Keep `services/trips.py` stable unless there is a clean, low-risk import-only wrapper.

### Phase 2: Move Widget Project to `app/web`

- [x] Create `app/web/package.json`, `app/web/tsconfig.json`, `app/web/vite.config.ts`, and `app/web/.storybook/`.
- [x] Move Storybook stories and fixtures from `mcp_servers/widgets/stories` to `app/web/src` or `app/web/stories`, choosing one convention and documenting it.
- [x] Port `renderWidget.ts` to `app/web/src/bridge/hostHarness.ts`.
- [x] Move current active widget HTML files into either `app/web/public` as legacy static inputs or `app/web/src/legacy-html` until React components replace them.
- [x] Update Storybook static whitelist so it serves only active MVP widget shells.
- [ ] Leave a temporary `mcp_servers/widgets` README or shim pointing to `app/web` if legacy scripts still reference it.

### Phase 3: Build Output Contract

- [x] Add a Vite build script that emits widget HTML/JS/CSS into `app/web/dist`.
- [x] Model the multi-entry build after the official examples, but keep only the entries the Travel MVP needs.
- [ ] Decide whether `dist/` is committed. If committed, add tests that fail when source and dist drift. If not committed, update local/dev/deploy commands to build before serving resources.
- [x] Update Python resource readers to load from `app/web/dist`.
- [x] Add clear failure text when dist assets are missing: "Run `npm run build` in `app/web`."
- [x] Preserve self-contained/CSP expectations. If dist HTML references JS/CSS files, document allowed resource loading and update tests accordingly instead of silently breaking current self-contained assumptions.

### Phase 4: Pizzaz-to-Travel Component Adaptation

- [x] Create `app/web/src/component.tsx` as the initial app-level entry, then split into `trip-board/TripBoard.tsx` once stable.
- [x] Adapt Pizzaz list/card density to saved trip options: title, type, price/date/location notes, status, source, and next action.
- [ ] Add optional carousel comparison for shortlisted items only after list rendering is stable.
- [ ] Keep Trip Board actions model-friendly: UI actions should call existing tools or send follow-up messages, not mutate hidden state without conversation handoff.
- [ ] Use Apps SDK UI kit only where it reduces basic component work and fits the ChatGPT container. Do not adopt shadcn/ui by default.
- [ ] Add fixture parity checks so Storybook data matches `build_board()` output shape.

### Phase 5: Test and Documentation Migration

- [x] Update `tests/test_api.py` imports and expected metadata paths.
- [x] Update `tests/test_apps_ui_resources.py` for the new `app/web/dist` resource source.
- [x] Add tests for the new widget registry: known `ui://` URI, HTML file, MIME type, `_meta.ui.resourceUri`, and `openai/outputTemplate`.
- [x] Update `README.md` project structure and quickstart commands.
- [x] Update `docs/testing_chatgpt_apps.md` with the new build, Storybook, and Developer Mode flow.
- [ ] Update or add a solution note if the migration reveals a reusable Apps SDK Python/Web split pattern.

### Phase 6: Hosted Developer Mode Validation

- [x] Run Python tests.
- [x] Run `npm run check` and Storybook build from `app/web`.
- [x] Run browser Storybook verification, including nested iframe inspection.
- [ ] Validate in hosted ChatGPT Developer Mode: create trip, clarify trip, save fragment, render Trip Board, use UI state/action, continue conversation.
- [ ] Capture any Developer Mode-only behavior in `docs/testing_chatgpt_apps.md`.

## System-Wide Impact

### Interaction Graph

User asks to plan or save travel state -> ChatGPT selects `prepare_trip_clarification`, `ask_trip_clarification`, `create_trip`, `add_trip_item`, `get_trip_board`, or `render_trip_board` -> FastMCP handler calls trip store/build helpers -> `CallToolResult` returns `structuredContent` and optional render metadata -> ChatGPT reads `ui://` resource -> Python resource reader loads `app/web/dist` HTML -> widget hydrates from bridge `toolOutput` -> widget may call a tool or send a follow-up message -> ChatGPT continues the conversation.

### Error & Failure Propagation

- Missing database/file store should still surface through `TripConfigError` and `_tool_error()`.
- Missing `app/web/dist` assets should fail loudly at resource read time with a developer-actionable message.
- Invalid JSON/session payloads should continue to use existing `TripValidationError` handling.
- Storybook fixture drift should fail during typecheck/build or a fixture parity test, not only in Developer Mode.
- Hosted ChatGPT bridge mismatches should be documented separately from Storybook failures.

### State Lifecycle Risks

- Moving files can accidentally create two trip-agent server instances. Tests must verify the mounted endpoint uses the intended new module.
- Widget state persistence can regress if React components ignore the current `widgetState` lessons from the clarification widget.
- Build output can drift from source if `dist/` is committed without a check.
- Resource URI versioning can mislead ChatGPT if old `ui://...-vN.html` URIs serve materially different UI contracts.

### API Surface Parity

Update or intentionally preserve:

- `/mcp/travel-agent/` mounted endpoint
- `mcp_servers.travel_agent_server` import path during compatibility phase
- Widget resource reader functions used by tests
- Storybook stories and chat preview
- README project structure
- ChatGPT Apps testing docs
- Any manual smoke script or deployment workflow that references `mcp_servers/widgets`

### Integration Test Scenarios

- [ ] MCP `list_tools` returns the same MVP travel-agent tool set after moving modules.
- [ ] `get_trip_board` remains data-only; `render_trip_board` owns the widget template.
- [ ] Resource URI `ui://trip/board-v2.html` resolves to the new `app/web/dist` HTML.
- [ ] Storybook renders Trip Board with real `build_board()` fixture shape.
- [ ] Chat preview can simulate save -> board render -> UI follow-up without losing widget state.
- [ ] Missing `dist/` emits a clear setup failure in tests or local startup.

## SpecFlow Analysis

### User Flow Overview

1. Developer starts local app and Storybook from the new structure.
2. ChatGPT Developer Mode connects to `/mcp/travel-agent/`.
3. User gives an underspecified trip request.
4. ChatGPT uses clarification tools and may render the clarification widget.
5. User saves options or constraints into a trip.
6. ChatGPT fetches board data, reasons conversationally, and renders Trip Board only when visual scanning helps.
7. User interacts with Trip Board to continue the conversation or request a mutation.
8. Developer verifies the same flow in Storybook and hosted ChatGPT.

### Flow Permutations Matrix

| Dimension | Permutations To Cover |
| --- | --- |
| User state | new trip, existing trip, missing trip, duplicate saved item |
| Widget state | first render, bridge replay, user-selected action, restored widgetState |
| Runtime | local pytest, local Storybook, static Storybook build, hosted Developer Mode |
| Asset state | dist present, dist missing, resource URI/file mismatch |
| Tool choice | data-only call, render-only call, mutation followed by render |

### Gaps Resolved By This Plan

- First official example to adapt: Pizzaz list/carousel for Trip Board option triage.
- First tool split target: preserve Trip Board split and use it as the migration proving ground before splitting Inbox/Itinerary/Budget.
- Widgets to deprioritize: weather, forecast, long destination guide, and generic activity widgets are outside MVP migration unless reframed around saved trip state.
- Descriptor surface: keep current FastMCP decorator path plus explicit output schema patching unless a field requires lower-level registration.
- Developer Mode host/domain values: document during Phase 6 because this depends on the actual tunnel/deploy environment.

### Remaining Questions

- Should `app/web/dist` be committed for deploy simplicity, or generated during deployment?
- Should the new React widget build use `@openai/apps-sdk-ui` immediately, or first port current visuals to reduce migration scope?
- Should legacy weather/travel/packing servers remain top-level during this refactor, or move under `app/server/legacy` later?

These do not block planning. The conservative implementation default is: do not commit `dist/` unless deployment needs it, use Apps SDK UI only for clear base controls, and leave non-MVP legacy servers untouched until the trip-agent split is stable.

## Acceptance Criteria

### Functional Requirements

- [ ] Repository has canonical `app/server` and `app/web` directories matching the documented target structure.
- [ ] `/mcp/travel-agent/` still exposes the current MVP tool set and existing tool metadata.
- [ ] Trip Board resource loading comes from the new web build/output path.
- [ ] Storybook runs from `app/web` and includes the Apps SDK bridge harness.
- [ ] First Pizzaz-inspired travel component renders Trip Board saved options from existing structured content.
- [ ] Weather/forecast widgets are not part of the unified MVP migration path.

### Non-Functional Requirements

- [ ] No unnecessary product rewrite into a standalone travel dashboard.
- [ ] Python/FastMCP remains the server runtime.
- [ ] Widget source/build/resource URI contracts are documented.
- [ ] Missing build artifacts produce actionable developer errors.
- [ ] UI remains responsive in ChatGPT iframe and Storybook.

### Quality Gates

- [ ] `python -m pytest tests`
- [ ] `cd app/web && npm run check`
- [ ] Storybook build succeeds from `app/web`.
- [ ] Browser verification checks nested widget iframes, not just parent canvas text.
- [ ] Hosted ChatGPT Developer Mode validates trip creation, save, board render, UI follow-up, and conversation continuation.

## Success Metrics

- Developers can explain where server code and web widget code live without referencing legacy folders.
- A new widget can be added by creating a typed web entry, adding it to the widget registry, and adding a Storybook story.
- ChatGPT can still choose tools correctly because titles, descriptions, annotations, output schemas, and invocation status strings survive the refactor.
- Trip Board renders from the same structured content in pytest fixtures, Storybook, and hosted ChatGPT.
- The migration reduces resource/version drift rather than adding another source of truth.

## Dependencies & Prerequisites

- Existing Python test suite.
- Existing Storybook dependency set under `mcp_servers/widgets`.
- Official OpenAI Apps SDK docs and examples.
- Local Node/npm or pnpm decision for `app/web`; default to npm because the current widget project uses npm.
- Hosted ChatGPT Developer Mode access for final validation.

## Risk Analysis & Mitigation

- **Risk: two active MCP server instances.** Mitigate with import-path compatibility tests and a single mounted server source.
- **Risk: build output drift.** Mitigate with either generated-only dist and setup docs, or committed dist plus source/dist verification.
- **Risk: React migration hides Apps bridge regressions.** Mitigate by porting bridge harness first and preserving `window.openai`, `openai:set_globals`, and `ui/notifications/tool-result` tests.
- **Risk: too much moved at once.** Mitigate with compatibility wrappers and phase boundaries.
- **Risk: resource URI version mismatch.** Mitigate by documenting compatibility or bumping URI versions when the visible contract changes.
- **Risk: Storybook passes but ChatGPT fails.** Mitigate with hosted Developer Mode as a required quality gate.

## Alternative Approaches Considered

- **Full TypeScript server migration:** Rejected for now because the origin decision says Python/FastMCP works and should not be replaced solely because examples often use TypeScript.
- **Keep current folder structure and only port Pizzaz UI:** Rejected because the user explicitly wants the clearer `app/server` and `app/web` direction, and current folders already contribute to source-of-truth drift.
- **Rewrite all widgets in React immediately:** Rejected as too broad. First prove Trip Board and the build/resource contract.
- **Keep self-contained static HTML forever:** Rejected as the long-term direction because the official examples show a maintainable component build pipeline; static HTML can remain a bridge during migration.

## Documentation Plan

- [ ] Update `README.md` project structure and local commands.
- [ ] Update `docs/testing_chatgpt_apps.md` with `app/web` build and Storybook steps.
- [ ] Update `docs/chatgpt_apps_readiness_review.md` if resource URI/versioning guidance changes.
- [ ] Add a migration note under `docs/solutions/integration-issues/` after implementation if the split becomes reusable guidance.

## Sources & References

### Origin

- **Origin document:** `docs/brainstorms/2026-05-05-apps-sdk-revalidation-requirements.md`
- Key decisions carried forward: keep ChatGPT-native travel workspace direction, reuse official examples selectively, keep Python-first, decouple data/render tools, exclude weather/forecast from MVP, require hosted Developer Mode validation.

### Internal References

- `mcp_servers/travel_agent_server.py:34` current widget directory boundary.
- `mcp_servers/travel_agent_server.py:114` render metadata helper.
- `mcp_servers/travel_agent_server.py:168` explicit output schema registry.
- `mcp_servers/travel_agent_server.py:369` Trip Board data tool.
- `mcp_servers/travel_agent_server.py:393` Trip Board render tool.
- `mcp_servers/widgets/.storybook/main.ts:10` Storybook widget HTML whitelist.
- `mcp_servers/widgets/stories/renderWidget.ts:57` bridge update simulation.
- `mcp_servers/widgets/stories/renderWidget.ts:86` Storybook `window.openai` host mock.
- `docs/solutions/integration-issues/apps-sdk-trip-workspace-mvp-tool-render-alignment-20260505.md`
- `docs/solutions/ui-bugs/storybook-widget-preview-v3-ui-drift-20260505.md`
- `docs/solutions/integration-issues/apps-sdk-clarification-widget-state-and-schema-contract-20260511.md`

### External References

- OpenAI Apps SDK ChatGPT UI docs: https://developers.openai.com/apps-sdk/build/chatgpt-ui
- OpenAI Apps SDK examples repository: https://github.com/openai/openai-apps-sdk-examples
- Pizzaz Python server example: https://github.com/openai/openai-apps-sdk-examples/tree/main/pizzaz_server_python
- Pizzaz component examples: https://github.com/openai/openai-apps-sdk-examples/tree/main/src
