---
title: "Fix Travel Storybook Apps SDK UI Component Review Findings"
module: "Travel MCP Widgets"
date: 2026-05-14
problem_type: ui_bug
component: storybook_travel_apps_sdk_ui_components
severity: medium
status: resolved
root_cause: review_found_component_structure_and_widget_lifecycle_gaps
resolution_type: refactor_and_hardening
review_target:
  branch: codex/feat-pizzaz-storybook-gallery
  commit: e06f760a917acddddbbfa287da24bd1ca870ba9c
  commit_subject: "fix(storybook): resolve travel component review findings"
tags:
  - storybook
  - apps-sdk
  - react
  - widgets
  - accessibility
  - hook-order
  - bundle-size
  - widget-state
  - mapbox
  - npm-audit
related_files:
  - app/web/src/trip-components/TravelPizzazComponents.tsx
  - app/web/src/trip-components/TravelOptionsList.tsx
  - app/web/src/trip-components/TravelComparisonCarousel.tsx
  - app/web/src/trip-components/TravelMap.tsx
  - app/web/src/trip-components/TravelMediaAlbum.tsx
  - app/web/src/trip-components/TravelCart.tsx
  - app/web/src/trip-components/travel-shared.tsx
  - app/web/src/trip-components/useWidgetState.ts
  - app/web/src/trip-components/TripBoard.tsx
  - app/web/src/trip-components/TripItinerary.tsx
  - app/web/vite.config.ts
  - app/web/package.json
  - app/web/package-lock.json
related_docs:
  - docs/solutions/ui-bugs/storybook-widget-preview-v3-ui-drift-20260505.md
  - docs/solutions/test-failures/storybook-widget-typescript-pr-checks.md
  - docs/solutions/integration-issues/apps-sdk-clarification-widget-state-and-schema-contract-20260511.md
  - docs/solutions/integration-issues/apps-sdk-fastmcp-structural-refactor-deployment-hardening-20260512.md
related_todos:
  - todos/023-complete-p2-fix-trip-component-hook-order.md
  - todos/024-complete-p2-split-mapbox-from-shared-widget-bundle.md
  - todos/025-complete-p2-add-accessible-labels-to-icon-controls.md
  - todos/026-complete-p2-persist-interactive-widget-state.md
  - todos/027-complete-p2-track-apps-sdk-ui-lodash-advisory.md
---

# Fix Travel Storybook Apps SDK UI Component Review Findings

## Problem

A review of the transformed travel Storybook and Apps SDK UI components found several correctness and maintainability issues:

- `TravelPizzazComponents.tsx` had grown into a 905-line module mixing unrelated option list, carousel, map, album, and cart logic.
- Some components could violate React hook order when Storybook controls or an Apps SDK host repainted the same mounted component from a normal payload to an error payload.
- `mapbox-gl` was statically imported by the shared component entry, so non-map widgets paid the Mapbox JavaScript cost.
- Icon-only controls and fallback map marker buttons lacked accessible names.
- Interactive state, such as selected filters, selected map markers, album feedback, and cart quantities, lived only in local React state.
- `npm audit --omit=dev` reported a lodash advisory through `@openai/apps-sdk-ui`.

The symptoms were mostly review and build-surface problems rather than a single runtime exception. The dangerous part was that several of them would only show up later: when toggling Storybook states, loading non-map widgets in a constrained iframe, replaying Apps SDK widget output, or running dependency audit checks.

## Root Cause

The travel component work had grown as one large bundled implementation. That made unrelated concerns share a single module boundary, pulled heavy dependencies into every consumer, and made lifecycle issues harder to see.

The hook-order issue came from returning error shells before later hooks. For example, `TripBoard` and `TripItinerary` returned immediately for error payloads and only called `useState` on non-error renders. If the mounted Storybook story changed from valid data to error data, React would see a different hook sequence.

The bundle-size issue came from importing `mapbox-gl` and its CSS at module scope. Because the file was part of the shared component export surface, non-map widgets loaded the Mapbox implementation path too.

The state issue repeated a previously documented Apps SDK lesson: Storybook-local React state works for static previews, but ChatGPT Apps hosts can replay tool output and repaint widgets. Meaningful user interaction state should use `window.openai.widgetState` and `window.openai.setWidgetState` when available.

## Solution

### Split the Monolith into Focused Modules

`TravelPizzazComponents.tsx` became a compatibility export barrel:

```tsx
export { TravelCart } from "./TravelCart";
export { TravelComparisonCarousel } from "./TravelComparisonCarousel";
export { TravelMap } from "./TravelMap";
export { TravelMediaAlbum } from "./TravelMediaAlbum";
export { TravelOptionsList } from "./TravelOptionsList";
```

The implementation moved into focused files:

- `TravelOptionsList.tsx`
- `TravelComparisonCarousel.tsx`
- `TravelMap.tsx`
- `TravelMediaAlbum.tsx`
- `TravelCart.tsx`
- `travel-shared.tsx`
- `useWidgetState.ts`

Shared display primitives and helpers moved to `travel-shared.tsx`: category labels, status labels, option metadata, category filters, option cards, option details, `isTravelError`, `uniqueValues`, and `selectedOrFirst`.

This kept external imports stable while making the implementation reviewable. The largest focused implementation file after the split was under 300 lines.

### Persist Widget Interaction State

The fix added `useWidgetState`, a progressive Apps SDK bridge hook. It reads and writes `window.openai.widgetState` when the host bridge exists, and falls back to local React state in Storybook.

```tsx
export function useWidgetState<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setLocalValue] = React.useState<T>(() => readWidgetValue(key, initialValue));

  const setValue = React.useCallback<React.Dispatch<React.SetStateAction<T>>>(
    (nextValue) => {
      setLocalValue((currentValue) => {
        const resolvedValue =
          typeof nextValue === "function"
            ? (nextValue as (current: T) => T)(currentValue)
            : nextValue;

        const bridge = getBridge();
        if (bridge?.setWidgetState) {
          const currentWidgetState = bridge.widgetState ?? {};
          const nextWidgetState = { ...currentWidgetState, [key]: resolvedValue };
          bridge.widgetState = nextWidgetState;
          Promise.resolve(bridge.setWidgetState(nextWidgetState)).catch(() => {});
        }

        return resolvedValue;
      });
    },
    [key],
  );

  React.useEffect(() => {
    setLocalValue(readWidgetValue(key, initialValue));
  }, [initialValue, key]);

  return [value, setValue];
}
```

The new travel components use namespaced keys:

```tsx
const [category, setCategory] = useWidgetState("travel-options-list:category", "all");
const [selectedId, setSelectedId] = useWidgetState<string | null>("travel-map:selected-id", null);
const [items, setItems] = useWidgetState<TravelCartItem[]>("travel-cart:items", defaultItems);
```

This generalizes the earlier clarification-widget lesson from [apps-sdk-clarification-widget-state-and-schema-contract-20260511.md](../integration-issues/apps-sdk-clarification-widget-state-and-schema-contract-20260511.md): meaningful Apps SDK widget state should survive host replays.

### Lazy-Load Mapbox

`TravelMap` now dynamically imports Mapbox only when the map component mounts:

```tsx
type MapboxModule = typeof import("mapbox-gl");

const mapboxRef = React.useRef<MapboxModule | null>(null);
const [mapReady, setMapReady] = React.useState(false);

React.useEffect(() => {
  if (!mapContainerRef.current || mapRef.current || !MAPBOX_ACCESS_TOKEN) return;

  let cancelled = false;
  let resize: (() => void) | null = null;

  const initializeMap = async () => {
    try {
      const mapboxModule = await import("mapbox-gl");
      if (cancelled || !mapContainerRef.current) return;

      mapboxModule.default.accessToken = MAPBOX_ACCESS_TOKEN;
      mapboxRef.current = mapboxModule;

      const map = new mapboxModule.default.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: first?.lon != null && first?.lat != null ? [first.lon, first.lat] : [4.8952, 52.3702],
        zoom: 12,
        attributionControl: false,
      });

      mapRef.current = map;
      setMapReady(true);
    } catch (error) {
      if (!cancelled) {
        setMapError(error instanceof Error ? error.message : "Map failed to initialize.");
      }
    }
  };

  void initializeMap();

  return () => {
    cancelled = true;
    if (resize) window.removeEventListener("resize", resize);
    markerRefs.current.forEach((marker) => marker.remove());
    markerRefs.current = [];
    mapRef.current?.remove();
    mapRef.current = null;
    mapboxRef.current = null;
    setMapReady(false);
  };
}, [options]);
```

The marker effect waits for explicit readiness. This matters because refs do not trigger React effects when the async Mapbox import resolves.

```tsx
React.useEffect(() => {
  const map = mapRef.current;
  const mapboxModule = mapboxRef.current;
  if (!mapReady || !map || !mapboxModule) return;

  markerRefs.current.forEach((marker) => marker.remove());
  markerRefs.current = [];

  markerOptions.forEach((option) => {
    if (option.coordinates?.lon == null || option.coordinates.lat == null) return;

    const marker = new mapboxModule.default.Marker({
      color: option.id === selected?.id ? "#111111" : "#F46C21",
    })
      .setLngLat([option.coordinates.lon, option.coordinates.lat])
      .addTo(map);

    marker.getElement().addEventListener("click", () => setSelectedId(option.id));
    markerRefs.current.push(marker);
  });
}, [mapReady, markerOptions, selected?.id, setSelectedId]);
```

Mapbox CSS moved into the shared stylesheet:

```css
@import "tailwindcss";
@import "mapbox-gl/dist/mapbox-gl.css";
@import "@openai/apps-sdk-ui/css";
```

Vite now emits stable chunk names for the component library build:

```ts
rollupOptions: {
  output: {
    chunkFileNames: "chunks/[name].js",
  },
},
```

The fixed build produces a tiny entry file, a non-map component chunk, and a separate Mapbox chunk:

```text
app/web/dist/component.js              355 B
app/web/dist/chunks/component.js       182 KB
app/web/dist/chunks/mapbox-gl.js       2.3 MB
```

### Keep Hooks Stable Across Error States

The hook-order fix pattern is:

1. Compute the error flag.
2. Derive safe fallback data.
3. Call hooks unconditionally.
4. Return the error shell after hooks.

`TripBoard` follows this shape:

```tsx
export function TripBoard({ board }: { board: TripBoardData | ErrorOutput }) {
  const error = isError(board);
  const safeBoard = error ? {} : board;
  const lanes = safeBoard.lanes ?? {};
  const [activeLane, setActiveLane] = React.useState<string | null>(null);

  if (error) {
    return (
      <TripShell eyebrow="Organize" title="Trip Board" error={board.error}>
        {null}
      </TripShell>
    );
  }

  return /* normal board */;
}
```

`TripItinerary` uses the same pattern:

```tsx
export function TripItinerary({ itinerary }: { itinerary: TripItineraryData | ErrorOutput }) {
  const error = isError(itinerary);
  const safeItinerary = error ? {} : itinerary;
  const days = safeItinerary.days ?? [];
  const [selectedDayIndex, setSelectedDayIndex] = React.useState(0);
  const [selectedItemKey, setSelectedItemKey] = React.useState<string | null>(null);

  if (error) {
    return (
      <TripShell eyebrow="Schedule" title="Day by day" error={itinerary.error}>
        {null}
      </TripShell>
    );
  }

  return /* normal itinerary */;
}
```

`TravelComparisonCarousel` also calls hooks before the error branch and bounds the persisted index before rendering.

### Add Accessible Names

Icon-only and marker-only controls received explicit names:

```tsx
<Button aria-label="Previous option" ...>
  <ChevronLeft className="h-4 w-4" />
</Button>

<Button aria-label="Next option" ...>
  <ChevronRight className="h-4 w-4" />
</Button>

<Button aria-label={`Decrease ${item.title} quantity`} ...>
  <Minus className="h-3.5 w-3.5" />
</Button>

<Button aria-label={`Increase ${item.title} quantity`} ...>
  <Plus className="h-3.5 w-3.5" />
</Button>

<button aria-label={`Select ${option.title} on map`} ...>
  {categoryLabels[option.category]?.slice(0, 1) ?? "P"}
</button>
```

This improves screen-reader behavior and also makes agent-native/browser automation more reliable.

### Resolve the Dependency Advisory

`@openai/apps-sdk-ui` was current, but its dependency tree resolved lodash to an audited version. The fix added an npm override:

```json
"overrides": {
  "lodash": "4.18.1"
}
```

After `npm install`, the lockfile resolved `node_modules/lodash` to `4.18.1`, and `npm audit --omit=dev` reported zero vulnerabilities.

## Investigation Steps

1. Reviewed `e06f760` and the five completed review todos: `023` through `027`.
2. Compared `TravelPizzazComponents.tsx` before and after the fix: it changed from a monolith with a top-level Mapbox import to a compatibility barrel.
3. Inspected the new focused modules and confirmed shared UI primitives moved to `travel-shared.tsx`.
4. Checked `TripBoard.tsx` and `TripItinerary.tsx` for hook-order stability.
5. Inspected `TravelMap.tsx` to verify Mapbox is dynamically imported and marker setup waits for `mapReady`.
6. Checked `vite.config.ts` for stable chunk output.
7. Checked generated dist output for `component.js`, `chunks/component.js`, and `chunks/mapbox-gl.js`.
8. Checked `TravelComparisonCarousel.tsx`, `TravelCart.tsx`, and `TravelMap.tsx` for accessible labels.
9. Checked `package.json` and `package-lock.json` for the lodash override.
10. Re-ran automated and browser verification.

## Verification

The fix was verified with:

```bash
cd app/web
npm run check
npm audit --omit=dev
```

and:

```bash
python -m pytest \
  tests/test_apps_ui_resources.py \
  tests/test_travel_agent_server.py::test_unified_server_registers_every_tool_output_template
```

Browser smoke covered:

- `options-list`
- `comparison-carousel`
- `map`
- `album`
- `cart`
- `itinerary` error state
- `board` error state

The browser smoke confirmed:

- no console errors,
- all expected mock images loaded,
- Mapbox rendered one canvas and seven markers,
- error states rendered without hook-order failures,
- no unlabeled icon-only buttons were found in the affected stories.

## Prevention

Keep Apps SDK widget modules small and reviewable. Treat `TravelPizzazComponents.tsx` as an export barrel or composition file only. New interactive travel widgets should live in their own files.

Use this size check during review:

```bash
cd app/web
find src/trip-components -name '*.tsx' -not -name '*.stories.tsx' -print0 \
  | xargs -0 wc -l \
  | sort -nr
```

React hooks should not sit behind error, empty, or component-kind branches. A future lint setup should include `eslint-plugin-react-hooks` and gate on `react-hooks/rules-of-hooks`.

Protect the Mapbox split:

```bash
cd app/web
npm run build:component
ls -lh dist/component.js dist/chunks/mapbox-gl.js
grep -R "mapbox-gl" -n src/trip-components src/component.tsx
```

Expected:

- `dist/chunks/mapbox-gl.js` exists,
- `dist/component.js` remains small,
- static Mapbox imports appear only as type imports or dynamic imports in the map component.

Every icon-only button should have visible text or an `aria-label`. Fallback map markers should describe the place, not just the marker category.

Any interaction that should survive Apps SDK host replays should use `useWidgetState` with a namespaced key. Storybook should still work when `window.openai` is absent.

Run audit after changing `@openai/apps-sdk-ui`, Storybook, Vite, React, or related build tooling:

```bash
cd app/web
npm audit --omit=dev
npm ls lodash
npm outdated @openai/apps-sdk-ui storybook vite vitest react react-dom
```

## Related Documentation

- [Storybook widget preview v3 UI drift](storybook-widget-preview-v3-ui-drift-20260505.md) covers earlier Storybook preview drift, bridge simulation, nested iframe QA, and resource versioning.
- [Storybook widget TypeScript PR checks](../test-failures/storybook-widget-typescript-pr-checks.md) covers Storybook and TypeScript validation expectations.
- [Apps SDK clarification widget state and schema contract](../integration-issues/apps-sdk-clarification-widget-state-and-schema-contract-20260511.md) documents the original `widgetState` replay issue that this fix generalizes.
- [Apps SDK FastMCP structural refactor deployment hardening](../integration-issues/apps-sdk-fastmcp-structural-refactor-deployment-hardening-20260512.md) covers `app/web`, source/dist parity, widget packaging, and build/deploy hardening.

## Refresh Candidates

This solution suggests a targeted refresh, not a broad sweep.

Recommended scope:

```text
ce:compound-refresh Storybook widget component build and resource drift after React travel components, lazy Mapbox chunking, widgetState persistence, and lodash override
```

Highest-value files to refresh:

- `docs/solutions/ui-bugs/storybook-widget-preview-v3-ui-drift-20260505.md`
- `docs/solutions/test-failures/storybook-widget-typescript-pr-checks.md`

The existing `apps-sdk-clarification-widget-state-and-schema-contract-20260511.md` remains correct and should be cross-referenced rather than rewritten.
