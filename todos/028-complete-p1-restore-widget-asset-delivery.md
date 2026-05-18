---
status: complete
priority: p1
issue_id: "028"
tags: [code-review, chatgpt-apps, widgets, packaging, build]
dependencies: []
---

# Restore Widget Asset Delivery

## Problem Statement

The Vite widget migration now serves trip widget resources from `app/web/dist/templates/*.html`, but those generated documents reference separate `/assets/*` and `/chunks/*` files. The MCP resource implementation only returns the HTML string, and the Python package data only includes `web/dist/*`, not nested `web/dist/templates`, `web/dist/assets`, or `web/dist/chunks`.

This can make the hosted ChatGPT Apps widgets render a blank root after deployment even though local `npm run build` and Python resource tests pass.

## Findings

- `app/server/travel_agent/mcp.py:125` now prefers `WEB_DIST_DIR / "templates" / filename`.
- `app/web/vite.config.ts:11` configures multi-page Vite inputs that emit HTML under `dist/templates` and JS/CSS under `dist/assets` and `dist/chunks`.
- A local `npm run build` produced generated HTML such as `app/web/dist/templates/trip_board_v3.html` with `<script type="module" crossorigin src="/assets/trip_board_v3-...js">` and `<link rel="modulepreload" href="/chunks/index-...js">`.
- `pyproject.toml:27` still includes only `web/dist/*`, which does not cover the new nested generated files. It also does not include `web/templates/*.html` for the fallback path.
- `emptyOutDir: false` leaves stale root-level `app/web/dist/trip_*.html` files alongside the new `dist/templates` output, masking packaging and resource drift.

Known Pattern: `docs/solutions/integration-issues/apps-sdk-fastmcp-structural-refactor-deployment-hardening-20260512.md` and `docs/solutions/integration-issues/apps-sdk-trip-workspace-mvp-tool-render-alignment-20260505.md` both emphasize verifying packaged widget assets, not just local files.

## Proposed Solutions

### Option 1: Inline Built Assets Into Self-Contained HTML

**Approach:** Add a Vite plugin or post-build step that inlines the generated JS and CSS into each widget HTML file, then keep MCP resources as single self-contained HTML documents.

**Pros:**
- Matches the previous widget contract and current MCP resource shape.
- Avoids static asset routing and CSP/resource-domain ambiguity.
- Makes tests straightforward: assert no external scripts, links, or modulepreload tags.

**Cons:**
- Requires a small build-time transform.
- HTML files become larger.

**Effort:** Medium

**Risk:** Low

---

### Option 2: Serve and Package Nested Assets Explicitly

**Approach:** Register or serve `/assets/*` and `/chunks/*` from the MCP/FastAPI app, include recursive package data for `web/dist/templates/*`, `web/dist/assets/*`, and `web/dist/chunks/*`, and update widget CSP metadata as needed.

**Pros:**
- Preserves standard Vite output.
- Keeps browser caching possible for hosted web deployments.

**Cons:**
- More moving parts in ChatGPT Apps iframe delivery.
- Requires proving relative asset URLs resolve in the host.

**Effort:** Medium to Large

**Risk:** Medium

---

### Option 3: Keep Legacy Copy Step for MCP Widgets

**Approach:** Restore a dedicated `build:widgets` path that produces self-contained widget HTML resources for MCP, and keep Vite for Storybook/component builds only.

**Pros:**
- Minimizes runtime contract change.
- Faster to recover if Vite asset routing is uncertain.

**Cons:**
- Maintains two widget build paths.
- React component widgets may need a separate bundling strategy.

**Effort:** Medium

**Risk:** Medium

## Recommended Action

Prefer Option 1: inline the Vite-built JS and CSS into each MCP widget HTML resource, then make tests assert that registered `ui://trip/*.html` resources are self-contained and do not reference unavailable `/assets/*`, `/chunks/*`, or `<link rel="modulepreload">` entries.

This aligns with the current OpenAI Apps SDK MCP server guidance: the widget is registered as an MCP resource with `text/html;profile=mcp-app`, and the server-side example reads built JS/CSS and returns a single HTML template containing `<style>${CSS}</style>` and `<script type="module">${HTML}</script>`. Keep external assets only if the app deliberately serves them from a real HTTPS/static origin, sets `_meta.ui.domain`, allowlists that origin in `_meta.ui.csp.resourceDomains`, and proves those files are included in deployment packaging.

Also set `emptyOutDir: true` or explicitly clean stale root-level `dist/trip_*.html` files before build so old artifacts cannot hide the new generated layout.

## Technical Details

**Affected files:**
- `app/server/travel_agent/mcp.py:125` - widget resource file lookup
- `app/web/vite.config.ts:8` - generated asset layout
- `pyproject.toml:26` - package data excludes nested Vite outputs
- `tests/test_apps_ui_resources.py` - current tests accept external asset references

**Related components:**
- ChatGPT Apps widget resources
- FastMCP resource registration
- Python packaging/deployment

**Database changes:** No

## Resources

- `docs/solutions/integration-issues/apps-sdk-fastmcp-structural-refactor-deployment-hardening-20260512.md`
- `docs/solutions/integration-issues/apps-sdk-trip-workspace-mvp-tool-render-alignment-20260505.md`
- OpenAI Apps SDK: Build your MCP server - `https://developers.openai.com/apps-sdk/build/mcp-server`
- OpenAI Apps SDK: Reference - component resource `_meta.ui.csp.resourceDomains` - `https://developers.openai.com/apps-sdk/reference`

## Acceptance Criteria

- [ ] A fresh build produces widget resources that load in the ChatGPT Apps host.
- [ ] Python package data includes every runtime widget asset needed after installation.
- [ ] Stale root-level `dist/trip_*.html` files no longer mask the new output layout.
- [ ] Tests fail if a registered MCP widget references unavailable external assets.
- [ ] `npm run build` and Python resource tests pass from a clean checkout.

## Work Log

### 2026-05-15 - Code Review Discovery

**By:** Claude Code

**Actions:**
- Ran `npm run build` in `app/web`.
- Inspected generated `dist/templates/*.html` asset references.
- Compared generated output to `pyproject.toml` package data and `_read_widget_html`.

**Learnings:**
- Local resource tests currently validate HTML shape, but not runtime asset availability.
- The new Vite output layout changes the deployment contract from one HTML resource to a multi-file asset graph.

### 2026-05-15 - OpenAI Developers Review

**By:** Claude Code

**Actions:**
- Reviewed the current OpenAI Apps SDK MCP server and reference docs.
- Confirmed the docs register widgets as `text/html;profile=mcp-app` resources and show embedding built JS/CSS into the resource HTML.
- Confirmed `_meta.ui.csp.resourceDomains` is the correct metadata surface only when static assets are loaded from explicit allowed domains.

**Learnings:**
- The current implementation is between two valid patterns: it no longer returns self-contained HTML, but it also does not deliberately host/package the emitted static asset graph for the Apps iframe.
- The most conservative fix for this repo is to restore self-contained widget resources at the MCP boundary.

### 2026-05-15 - Fix Implemented

**By:** Claude Code

**Actions:**
- Added `app/web/scripts/inline-widget-assets.mjs` to inline Vite CSS, entry scripts, and static chunk imports into `dist/templates/*.html`.
- Changed `npm run build` to run Vite and then inline widget assets.
- Set `emptyOutDir: true` so stale root-level widget artifacts do not mask the current output layout.
- Updated package data to include `web/dist/templates/*.html` and source template fallbacks.
- Added tests that reject unresolved script/link/module import asset references in registered widget resources.

**Learnings:**
- Vite's first HTML output is only the entry point; static imports to shared chunks must also be collapsed for MCP resources to be self-contained.

## Notes

This blocks merge because it can turn all Vite-backed trip widgets into blank hosted iframes after packaging/deployment.
