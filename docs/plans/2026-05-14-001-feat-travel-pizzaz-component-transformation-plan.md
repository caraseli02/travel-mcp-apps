---
title: "feat: Transform Pizzaz Examples Into Travel Components"
type: feat
status: completed
date: 2026-05-14
---

# feat: Transform Pizzaz Examples Into Travel Components

## Overview

Transform the imported OpenAI Apps SDK Pizzaz examples into travel-native components that become part of the app's normal trip component set. The full Pizzaz family should be represented as travel surfaces:

- Pizzaz List -> Travel Options List
- Pizzaz Carousel -> Travel Comparison Carousel
- Pizzaz Map -> Travel Map
- Pizzaz Album -> Travel Media / Inspiration Album
- Pizzaz Shop -> Travel Cart / Checkout-like Flow

The refactor should not keep `/examples/openai-apps-sdk` as a long-term source path. Use it as temporary input during implementation, then remove the examples once equivalent travel components and stories exist. The final code should contain travel concepts, travel fixtures, and ChatGPT-native interaction patterns rather than pizza copy or pizza data.

## Problem Statement / Motivation

The current Storybook has two parallel worlds that should collapse into one travel component system:

- OpenAI Pizzaz examples imported faithfully under `app/web/src/examples/openai-apps-sdk`
- First-pass travel components under `app/web/src/trip-components`

The Pizzaz examples show richer interaction patterns than the current trip components, but they are still pizza-specific and not connected to travel planning mental models. The Travel MCP app needs one coherent set of travel components: map-based context, option comparison, saved choices, destination media, and a cart-like trip selection flow.

The map should not be treated as optional. A trip planner without a map is missing a core way users reason about neighborhoods, distances, saved places, and itinerary tradeoffs.

The cart-like flow can start as a mocked Storybook surface. It does not need live booking or payment semantics yet, but it should establish the pattern for selected travel items, estimated totals, and next-step review.

## Current Context

### Relevant Local Files

- `app/web/src/examples/openai-apps-sdk/src/pizzaz-list/index.jsx`
- `app/web/src/examples/openai-apps-sdk/src/pizzaz-carousel/index.jsx`
- `app/web/src/examples/openai-apps-sdk/src/pizzaz/index.jsx`
- `app/web/src/examples/openai-apps-sdk/src/pizzaz-albums/index.jsx`
- `app/web/src/examples/openai-apps-sdk/src/pizzaz-shop/index.tsx`
- `app/web/src/examples/openai-apps-sdk/src/pizzaz-stories.tsx`
- `app/web/stories/OpenAIAppsSdkPizzaz.stories.tsx`
- `app/web/src/trip-components/*`
- `app/web/src/trip-components/TripShell.tsx`
- `app/web/src/trip-components/format.ts`
- `app/web/src/trip-components/types.ts`
- `app/web/stories/TripComponents.stories.tsx`
- `app/web/stories/fixtures/travelFixtures.ts`
- `app/server/travel_agent/mcp.py`
- `tests/test_apps_ui_resources.py`

### Relevant Prior Decisions

- `docs/brainstorms/2026-05-05-apps-sdk-revalidation-requirements.md` says to prefer official OpenAI example patterns when they match the trip use case, including Pizzaz list/map/carousel and Shopping Cart state patterns.
- `docs/plans/2026-05-12-002-feat-apps-sdk-component-storybook-preview-plan.md` intentionally imported the Pizzaz family as Storybook-only reference, not production travel UI.
- `docs/plans/2026-05-12-001-refactor-apps-sdk-pizzaz-travel-structure-plan.md` already mapped Pizzaz List to saved trip options, Carousel to comparison, Map to destination/area clustering, and Shopping Cart state to future saved-trip interactions.
- Current production MCP resources still serve static HTML widgets through `ui://trip/*.html`; this plan should not break those contracts unless a later phase explicitly migrates production resources.

### Learnings To Preserve

- Storybook can hide actual iframe/widget problems. Browser QA should load the exact manager URL and/or `iframe.html` target, not rely only on build success.
- Resource URI, output template metadata, Storybook URL, and served widget version must stay in lockstep when production widget contracts change.
- Apps SDK host behavior differs from local previews; Storybook is visual/local-interaction coverage, not submission-readiness proof.
- Avoid inert controls. If a button appears actionable, it must either update local Storybook state or call a mocked bridge action with visible feedback.

## Proposed Solution

Create travel-native components that adapt the Pizzaz patterns while reusing as much as possible from the current trip component system.

Recommended target: keep these under the normal travel component area rather than an examples area. The final Storybook should expose travel components, not OpenAI/Pizza examples.

The first implementation should be Storybook-first:

1. Extend existing travel fixtures and types so they support the five surfaces.
2. Reuse existing trip component pieces such as `TripShell`, formatting helpers, shared types, Apps SDK UI controls, and fixture conventions.
3. Add the transformed components into the main travel component Storybook surface.
4. Remove `OpenAIAppsSdkPizzaz.stories.tsx` and `/examples/openai-apps-sdk` once the travel replacements exist.
5. Do not change production MCP `ui://trip/*` resources until the visual direction is accepted.

After visual acceptance, a follow-up production plan can decide whether these components replace or extend existing `TripBoard`, `TripInbox`, `TripItinerary`, `TripBudget`, and `TripClarification` resources. The Storybook refactor should still avoid creating a permanent second component system.

## Component Transformations

### Travel Options List

Transform Pizzaz List into a travel saved-options surface.

Primary use cases:

- Review saved hotels, flights, restaurants, activities, neighborhoods, and open decisions.
- Move items between inbox, shortlist, booked, itinerary draft, and dismissed states.
- Surface missing fields such as dates, price, location, and booking status.

Expected interactions:

- Filter by category and status.
- Select an item to reveal details.
- Mock actions: shortlist, compare, add to itinerary, mark booked, dismiss.
- Empty, error, and dense-data states.

### Travel Comparison Carousel

Transform Pizzaz Carousel into a comparison surface for travel options.

Primary use cases:

- Compare shortlisted hotels, flights, restaurants, and activities.
- Show decision-ready details: price, location, date/time, tradeoffs, confidence, source.
- Let users browse horizontally without losing context.

Expected interactions:

- Previous/next navigation.
- Category selector.
- Highlight a recommended option.
- Mock actions: choose, compare details, save for later.

### Travel Map

Transform Pizzaz Map into an essential travel map surface.

Primary use cases:

- Show saved hotels, restaurants, activities, transit points, and neighborhoods on a map.
- Help users understand clustering and distance tradeoffs.
- Support itinerary and planning decisions visually.

Expected interactions:

- Marker selection updates a detail panel.
- Category toggles for lodging, food, activities, transit, and open decisions.
- List/sidebar item selection focuses the matching marker.
- Deterministic no-secret Storybook behavior if live Mapbox configuration is unavailable.

Important constraint:

- The map must work in Storybook without requiring production secrets. If a live map token is absent, render a deterministic styled fallback that still shows spatial relationships and marker interactions.

### Travel Media / Inspiration Album

Transform Pizzaz Album into a travel media and inspiration surface.

Primary use cases:

- Browse destination images, saved places, hotel photos, activity photos, and neighborhood inspiration.
- Support early trip ideation and visual review.

Expected interactions:

- Filmstrip/gallery browsing.
- Fullscreen or focused viewer where supported locally.
- Save or attach an image/place to the trip in mocked state.

### Travel Cart / Checkout-like Flow

Transform Pizzaz Shop into a trip-selection cart.

Primary use cases:

- Show selected hotels, flights, activities, reservations, and add-ons as a draft trip package.
- Summarize estimated total, required follow-ups, and booking readiness.
- Establish future stateful selection patterns without implementing real checkout.

Expected interactions:

- Add/remove mock travel items.
- Quantity/passenger/date-like controls only where they fit travel semantics.
- Summary panel with subtotal, warnings, and next step.
- No payment processing, no real booking, no external checkout.

## Technical Approach

### Architecture

Use the imported Pizzaz examples as temporary source references during implementation, not as retained source layout or production component names.

Target shape:

- Remove upstream examples under `app/web/src/examples/openai-apps-sdk` after the travel-native replacements are implemented.
- Add or fold travel-native components into the existing `app/web/src/trip-components` structure unless implementation discovers a clearly better local module boundary.
- Reuse Apps SDK UI components and Tailwind tokens wherever they fit.
- Reuse current `TripShell`, formatting helpers, types, and travel fixtures wherever practical.
- Reuse shared travel option data shapes across list, carousel, map, album, and cart stories only when that removes real duplication.
- Keep Storybook stories explicit and reviewable with default, empty, dense, and error/mock-unavailable states.

Avoid wiring these new components directly into the MCP server during the first implementation unless the user explicitly expands scope.

### Implementation Phases

#### Phase 1: Fixture and Storybook Foundation

- Define a shared travel option fixture set in `app/web/stories/fixtures/travelFixtures.ts` or a focused adjacent fixture module.
- Reuse existing Amsterdam/Venice/Paris trip fixtures where they still fit, extending them instead of duplicating parallel sample worlds.
- Include hotels, flights, restaurants, activities, neighborhoods, transit points, media, and selected cart items.
- Include location data for map markers: coordinates where available, or deterministic sample coordinates.
- Add the new surfaces into the main trip/travel Storybook area.
- Remove the OpenAI/Pizzaz example story once travel-native replacements cover the same patterns.

Success criteria:

- Storybook can render the new travel surfaces with placeholder shells before every component is complete.
- The fixture vocabulary is travel-specific and does not contain pizza demo copy.

#### Phase 2: List and Carousel

- Build Travel Options List from the Pizzaz List pattern.
- Build Travel Comparison Carousel from the Pizzaz Carousel pattern.
- Use the same fixture items so selection and comparison feel connected.
- Add interactive local state for filters, selected item, and mock actions.

Success criteria:

- List supports category/status filtering and selected-item detail.
- Carousel supports navigation and recommendation highlighting.
- Controls never appear inert.

#### Phase 3: Map

- Build Travel Map from the Pizzaz Map pattern.
- Render markers and a synchronized detail/sidebar panel.
- Provide deterministic fallback rendering when live map dependencies or tokens are unavailable.
- Avoid making the fallback look like an error state; it should still be a useful spatial preview.

Success criteria:

- Map story renders on a clean local machine without production secrets.
- Selecting markers and sidebar items updates visible state.
- Category toggles change visible markers.

#### Phase 4: Album and Cart

- Build Travel Media / Inspiration Album from the Pizzaz Album pattern.
- Build Travel Cart / Checkout-like Flow from the Pizzaz Shop pattern.
- Keep cart semantics explicitly travel-focused and mock-only.

Success criteria:

- Album supports browsing and a focused image/place state.
- Cart supports add/remove/local edits and shows totals/readiness warnings.
- No UI text implies real purchase or booking completion.

#### Phase 5: Cleanup and Consolidation

- Delete `/app/web/src/examples/openai-apps-sdk` once all adapted travel surfaces exist.
- Delete `app/web/stories/OpenAIAppsSdkPizzaz.stories.tsx` once the travel stories cover list, carousel, map, album, and cart.
- Remove pizza-specific adapted code and data from travel components.
- Keep only dependencies that are still used by the final travel components.
- Update imports and Tailwind source scanning so no build path depends on the removed examples directory.

Success criteria:

- The final Storybook sidebar contains travel components, not retained pizza examples.
- No pizza demo copy appears in travel-native stories.
- No `/examples/openai-apps-sdk` source remains after the transformation is complete.
- Working tree does not include generated junk or ignored artifacts.

#### Phase 6: Production Readiness Decision

This is a decision phase, not necessarily part of the first implementation.

- Evaluate which adapted components should replace current MCP resources.
- Decide if production should migrate from static `trip_*.html` files to React/Vite-built resources.
- Update resource URI versions only when production behavior changes materially.
- Add server tests and hosted Developer Mode validation requirements before replacing live widgets.

Success criteria:

- There is a deliberate follow-up plan before any production resource contract changes.
- Existing MCP resource tests remain green until a planned migration changes them.

## System-Wide Impact

### Interaction Graph

Storybook phase:

1. Storybook loads travel-adapted component story.
2. Story render function mounts React component.
3. Component reads local fixtures and mocked Apps SDK globals where needed.
4. User interactions update local React state only.
5. No FastMCP server or persistent trip store code executes.

Future production phase:

1. ChatGPT selects a travel tool.
2. FastMCP handler returns structured trip data and optional render metadata.
3. ChatGPT loads the matching `ui://trip/...` resource.
4. React widget reads tool output through Apps SDK bridge.
5. Widget interactions either update local widget state, call a tool, or send a follow-up message.

### Error & Failure Propagation

- Storybook compile/type errors should fail `npm run check`.
- Storybook runtime errors should be caught by Playwright/browser smoke tests against exact story URLs.
- Map provider failures should degrade into deterministic fallback UI, not blank content.
- Future production bridge failures should be feature-detected and shown as disabled or explanatory local states, not silent no-ops.

### State Lifecycle Risks

- First implementation should use local component state only.
- Cart state is mock state, not persisted booking state.
- If future production work persists cart/selections, it needs a separate data lifecycle plan to avoid duplicate or stale trip items.

### API Surface Parity

- Current production resources in `app/server/travel_agent/mcp.py` should remain unchanged during Storybook adaptation.
- Storybook should represent all new adapted surfaces so visual review does not depend on production MCP resources.
- Final Storybook should not keep a separate Pizzaz examples category once travel replacements are complete.
- Future production migration must update tests, docs, resource URIs, output templates, and package data together.

### Integration Test Scenarios

- Storybook exact manager URL renders each adapted component without blank frames.
- Storybook `iframe.html` renders each adapted component without console errors.
- Map story works without live provider secrets.
- Cart story add/remove actions change totals and readiness state.
- Existing MCP resource tests still pass after Storybook-only changes.

## Acceptance Criteria

### Functional Requirements

- [ ] Travel-native Storybook coverage exists for all adapted Pizzaz surfaces.
- [ ] Travel Options List exists and uses travel data, statuses, categories, and local actions.
- [ ] Travel Comparison Carousel exists and supports travel option comparison.
- [ ] Travel Map exists and is treated as an essential trip-planning surface.
- [ ] Travel Map has a no-secret deterministic fallback that still supports marker/list interactions.
- [ ] Travel Media / Inspiration Album exists and uses destination/place/media fixtures.
- [ ] Travel Cart / Checkout-like Flow exists as a mock trip selection/cart surface.
- [ ] All adapted components have default, empty, and relevant edge-state stories.
- [ ] No travel-adapted component displays pizza-specific copy or pizza fixture data.
- [ ] `/app/web/src/examples/openai-apps-sdk` is removed after replacement components exist.
- [ ] `app/web/stories/OpenAIAppsSdkPizzaz.stories.tsx` is removed after replacement stories exist.
- [ ] Existing trip component helpers, types, fixtures, and shell components are reused wherever practical.

### Non-Functional Requirements

- [ ] Components use Apps SDK UI and Tailwind tokens where practical.
- [ ] Components fit ChatGPT widget constraints and do not rely on oversized dashboard layouts.
- [ ] UI controls that look actionable must perform a visible local action in Storybook.
- [ ] Map and cart surfaces do not require live secrets, real booking, or payment infrastructure.
- [ ] Generated Storybook output and local screenshots remain ignored.

### Quality Gates

- [ ] `npm run check` passes from `app/web`.
- [ ] Existing Python resource tests pass if production resources are untouched.
- [ ] Browser smoke covers exact Storybook manager URLs for list, carousel, map, album, cart, and at least one current trip component.
- [ ] Browser smoke includes interaction checks for map selection and cart add/remove.
- [ ] Screenshots are captured for visual review and stored only in ignored local artifacts unless intentionally attached.

## Success Metrics

- A reviewer can open Storybook and understand the travel adaptation of every Pizzaz pattern without reading code.
- The map is visible and useful locally without credentials.
- The cart flow communicates "draft trip selection" rather than real checkout.
- The adapted components feel like part of the current trip component system rather than a separate examples gallery.
- The production MCP resource contract remains stable until a deliberate migration plan changes it.

## Dependencies & Prerequisites

- Existing React/Vite/Storybook setup in `app/web`.
- Existing Apps SDK UI and Tailwind dependencies.
- Temporary Pizzaz source examples as implementation input, including map-related packages.
- Travel fixtures that include enough location, price, status, and media data to make the components meaningful.

## Risks & Mitigations

- **Scope creep into production migration:** Keep first implementation Storybook-first; create a separate production migration plan after visual review.
- **Map blank state or secret dependency:** Implement deterministic fallback as part of the map acceptance criteria.
- **Cart implies real booking/payment:** Use copy and state labels like "Draft package", "Estimated total", and "Review next steps"; no checkout/payment language.
- **Duplicated component worlds:** Remove the upstream examples after travel replacements land; reuse existing trip component foundations to avoid parallel systems.
- **Over-cleanup before parity:** Do not delete Pizzaz source paths until every planned travel replacement has Storybook coverage and checks pass.
- **Oversized UI:** Verify in Storybook at realistic ChatGPT widget widths and mobile/narrow viewports.
- **Inert actions:** Every visible action changes local state, records mock feedback, or is removed.

## Alternative Approaches Considered

### Adapt Only List/Carousel First

This is lower risk, but it contradicts the product direction that map is essential for trip planning and delays the cart pattern that can clarify selected-trip state.

### Replace Existing Trip Components Immediately

This would reduce duplicate UI, but it couples visual exploration to production resource migration. That raises risk because production still depends on static HTML resources and tests.

### Keep Pizzaz Examples Only As-Is

This preserves upstream fidelity, but it does not move the travel product forward. The team still has to mentally translate pizza UI into travel UI during review.

### Keep Pizzaz Examples As A Permanent Reference Folder

Rejected. The refactored component set should not retain `/examples/openai-apps-sdk` as ongoing product code. Keeping both would create review noise and make it unclear which components represent the travel app.

## Documentation Plan

- Update the plan or implementation summary with the final mapping of Pizzaz source pattern to travel component.
- Document that upstream Pizzaz examples were used as implementation input and removed after travel replacements were created.
- If production resources are later migrated, update `README.md`, `docs/testing_chatgpt_apps.md`, and resource tests in the same PR.

## Sources & References

### Internal References

- `docs/brainstorms/2026-05-05-apps-sdk-revalidation-requirements.md`
- `docs/plans/2026-05-12-002-feat-apps-sdk-component-storybook-preview-plan.md`
- `docs/plans/2026-05-12-001-refactor-apps-sdk-pizzaz-travel-structure-plan.md`
- `docs/solutions/ui-bugs/storybook-widget-preview-v3-ui-drift-20260505.md`
- `docs/solutions/test-failures/storybook-widget-typescript-pr-checks.md`
- `docs/solutions/integration-issues/apps-sdk-clarification-widget-state-and-schema-contract-20260511.md`
- `app/web/src/examples/openai-apps-sdk/src/pizzaz-stories.tsx`
- `app/web/stories/OpenAIAppsSdkPizzaz.stories.tsx`
- `app/web/stories/TripComponents.stories.tsx`
- `app/web/stories/fixtures/travelFixtures.ts`
- `app/server/travel_agent/mcp.py`

### External References

- OpenAI Apps SDK UI: https://openai.github.io/apps-sdk-ui/
- OpenAI Apps SDK ChatGPT UI guide: https://developers.openai.com/apps-sdk/build/chatgpt-ui
- OpenAI Apps SDK examples: https://github.com/openai/openai-apps-sdk-examples

## Implementation Checklist

- [x] Confirm current branch is clean before starting implementation.
- [x] Add or extend travel fixtures for list, carousel, map, album, and cart.
- [x] Reuse existing trip component shell, helpers, fixtures, and types wherever practical.
- [x] Add shared travel option/card primitives only where they reduce real duplication.
- [x] Implement Travel Options List.
- [x] Implement Travel Comparison Carousel.
- [x] Implement Travel Map with fallback.
- [x] Implement Travel Media / Inspiration Album.
- [x] Implement Travel Cart / Checkout-like Flow.
- [x] Add Storybook stories and states for all adapted components.
- [x] Remove `app/web/stories/OpenAIAppsSdkPizzaz.stories.tsx`.
- [x] Remove `/app/web/src/examples/openai-apps-sdk` after replacement parity is achieved.
- [x] Remove unused dependencies introduced only for deleted examples.
- [x] Run `npm run check`.
- [x] Run existing Python resource tests if production files are touched.
- [x] Use browser automation on exact Storybook manager URLs for all adapted surfaces.
- [x] Capture screenshots in ignored local artifacts for review.
