---
title: "Fix ChatGPT Apps FastAPI/FastMCP relocation review findings"
module: "Travel MCP ChatGPT Apps"
date: 2026-05-12
problem_type: integration_issue
component: apps_sdk_fastmcp_server
severity: high
status: resolved
root_cause: incomplete_runtime_and_contract_update_after_relocating_legacy_mcp_layout
resolution_type: structural_refactor_and_test_hardening
tags:
  - fastapi
  - fastmcp
  - mcp
  - chatgpt-apps
  - apps-sdk
  - widgets
  - packaging
  - ci
  - transport-security
  - refactor
related_files:
  - app/mcp_mounts.py
  - app/server/travel_agent/mcp.py
  - app/server/weather/mcp.py
  - app/server/travel_tips/mcp.py
  - app/server/packing/mcp.py
  - app/server/widgets/
  - app/web/
  - app/web/scripts/copy-widgets-to-dist.mjs
  - pyproject.toml
  - .github/workflows/widgets-storybook.yml
  - tests/test_api.py
  - tests/test_apps_ui_resources.py
  - tests/test_config.py
related_docs:
  - docs/solutions/ui-bugs/storybook-widget-preview-v3-ui-drift-20260505.md
  - docs/solutions/test-failures/storybook-widget-typescript-pr-checks.md
  - docs/solutions/integration-issues/apps-sdk-trip-workspace-mvp-tool-render-alignment-20260505.md
  - docs/solutions/integration-issues/apps-sdk-clarification-widget-state-and-schema-contract-20260511.md
---

# Troubleshooting: Apps SDK FastMCP Structural Refactor Deployment Hardening

## Problem

After moving the project toward the official ChatGPT Apps structure, runtime code lived under `app/server` and widget code lived under `app/web`, but several deployment, package, CI, and Apps SDK contracts still reflected the older top-level layout.

The app worked from the local source tree, but review found merge and deploy risks that would only show up after packaging, CI filtering, or a clean checkout.

## Symptoms

- New runtime trees under `app/server` and `app/web` were untracked while old `mcp_servers`, `mcp_clients`, `services`, and `sample_data` paths were deleted.
- Python package installs could miss HTML assets loaded by MCP resources.
- `python -m pytest tests` failed on machines where local `.env` set `TRIP_STORE_BACKEND=file`.
- Trip widget `ui://` resource versions did not match the served v3 HTML files.
- Storybook CI watched `app/web/**` but missed exposed server-owned widgets under `app/server/widgets/**`.
- The Trip Board widget exposed a `Resolve next gap` button with no bridge or tool action.
- Weather, travel tips, and packing tools had weaker Apps SDK descriptors than the travel-agent tools.
- Mounted FastAPI MCP routes disabled DNS rebinding protection unconditionally, while standalone scripts gated that behavior behind `MCP_DEV_TUNNEL=1`.
- Root sprint docs still instructed developers to create or run deleted legacy paths.

## Root Cause

The refactor moved files before all surrounding contracts moved with them. Source-tree execution hid some gaps because local files existed, but package installs need explicit package data. Storybook and CI had a narrower view of widget ownership than the runtime. Tests read developer-local settings through `.env`, so defaults were not deterministic.

The Apps SDK surface also needed cleanup: resource URI versions are cache and compatibility contracts, widget controls need real bridge behavior, and every documented tool should expose model-friendly descriptor metadata.

## Solution

### Package runtime widget assets explicitly

`pyproject.toml` now includes both server widget HTML and trip widget source/build output as package data.

```toml
[tool.setuptools.packages.find]
include = ["app*"]

[tool.setuptools.package-data]
app = [
    "server/widgets/*.html",
    "web/*.html",
    "web/dist/*",
]
```

This closes the gap where source deploys worked but wheel/package installs could omit `text/html;profile=mcp-app` resources.

### Make widget source the runtime source of truth

The travel-agent resource reader now checks `app/web/*.html` first and falls back to `app/web/dist` only when source HTML is absent.

```python
WEB_DIR = Path(__file__).resolve().parents[2] / "web"
WEB_DIST_DIR = WEB_DIR / "dist"

def _read_widget_html(filename: str) -> str:
    widget_path = WEB_DIR / filename
    if not widget_path.exists():
        widget_path = WEB_DIST_DIR / filename
    if not widget_path.exists():
        raise FileNotFoundError(
            f"Widget asset {filename} was not found. Run `npm run build:widgets` in app/web."
        )
    return widget_path.read_text(encoding="utf-8")
```

The source/dist relationship is now tested so stale built files do not silently drift:

```python
def test_built_trip_widgets_match_source_html() -> None:
    for filename in DIST_WIDGETS:
        assert (WEB_DIR / "dist" / filename).read_text(encoding="utf-8") == (
            WEB_DIR / filename
        ).read_text(encoding="utf-8")
```

### Align Apps SDK resource versions

Trip board, itinerary, and budget resources now use v3 URIs to match the v3 HTML files.

```python
meta=_render_meta(
    "ui://trip/board-v3.html",
    "Rendering trip board",
    "Rendered trip board",
)

@server.resource("ui://trip/board-v3.html", ...)
def trip_board_ui() -> str:
    return _read_widget_html("trip_board_v3.html")
```

Tests and docs were updated to assert the same `ui://` values. This follows the previously documented rule: when the visible widget contract changes materially, keep `ui://` resource URI, `openai/outputTemplate`, Storybook URL, and served file version in lockstep.

### Isolate settings tests from local environment

Config tests now clear relevant environment variables and use a `Settings` subclass that disables `.env` loading.

```python
@pytest.fixture(autouse=True)
def clear_settings_env(monkeypatch: pytest.MonkeyPatch) -> None:
    for name in (
        "DATABASE_URL",
        "NEON_DATABASE_URL",
        "SUPABASE_DATABASE_URL",
        "TRIP_STORE_BACKEND",
        "TRIP_STORE_FILE_PATH",
    ):
        monkeypatch.delenv(name, raising=False)


class DefaultsOnlySettings(Settings):
    model_config = SettingsConfigDict(env_file=None, extra="ignore")
```

This keeps default-value tests stable even when a developer's `.env` intentionally uses file-backed local storage.

### Expand widget CI coverage

The Storybook workflow now watches both the web package and server-owned widget assets:

```yaml
paths:
  - "app/web/**"
  - "app/server/widgets/**"
  - ".github/workflows/widgets-storybook.yml"
```

The workflow runs `npm run check`, which includes typecheck, widget copy/build, component build, and Storybook static build.

### Make every exposed MCP tool descriptor model-friendly

Weather, travel tips, and packing tools were upgraded to match the travel-agent descriptor standard: titles, annotations, status metadata, render metadata, and explicit output schemas.

```python
@server.tool(
    name="get_current_weather",
    title="Show current weather",
    annotations=READ_ONLY_OPEN_WORLD,
    meta=_render_meta(
        "ui://weather/dashboard-v5.html",
        "Loading current weather",
        "Loaded current weather",
    ),
)
async def get_current_weather(city: str) -> CallToolResult:
    ...
```

`tests/test_api.py` asserts these descriptors through `list_tools`, so descriptor regressions fail as integration tests instead of review comments.

### Gate mounted MCP transport security intentionally

Mounted FastAPI MCP routes now match the standalone server behavior: DNS rebinding protection is disabled only for tunnel development.

```python
if os.getenv("MCP_DEV_TUNNEL") == "1":
    server.settings.transport_security = TransportSecuritySettings(
        enable_dns_rebinding_protection=False
    )
else:
    server.settings.transport_security = None
```

### Remove misleading or stale surfaces

The inert Trip Board button was removed rather than showing a user action with no Apps SDK bridge path. Stale root sprint docs were deleted because they referenced the removed legacy layout.

## Verification

The fix was verified with:

```bash
python -m pytest tests
npm --prefix app/web run check
.venv/bin/python -m pip wheel . --no-deps --no-build-isolation -w /tmp/travel-mcp-wheel-review
```

Results:

- Python tests: `64 passed, 1 skipped`
- Web checks: TypeScript, widget build, component build, and Storybook static build passed
- Wheel inspection: required `app/server/widgets`, `app/web/*.html`, and `app/web/dist/*` assets were present
- Import smoke: `from app.main import app` loaded successfully

## Prevention

Treat package assets, widget source/build parity, MCP descriptors, config isolation, and deployment shape as explicit contracts.

Recommended checks before merging structural Apps SDK/FastMCP refactors:

```bash
python -m pytest tests
npm --prefix app/web run check
.venv/bin/python -m pip wheel . --no-deps --no-build-isolation -w /tmp/travel-mcp-wheel-review
```

Add or keep tests for:

- package asset presence in wheels or deploy bundles
- `app.main` and each `app.server.*.mcp` module importing cleanly
- `list_tools` descriptor metadata and `outputSchema`
- source/dist widget HTML parity
- config defaults isolated from `.env`
- `ui://` resource URI versions matching served widget files

When paths move, search docs and workflows for stale layout references:

```bash
rg -n "mcp_servers|mcp_clients|ui://trip|trip_.*_v[0-9]+\\.html|build:widgets" \
  docs README.md .github app tests
```

## Related Documentation

- `docs/solutions/ui-bugs/storybook-widget-preview-v3-ui-drift-20260505.md` documents the original Storybook/resource drift pattern.
- `docs/solutions/test-failures/storybook-widget-typescript-pr-checks.md` documents why widget CI needs an explicit `check` command and workflow gate.
- `docs/solutions/integration-issues/apps-sdk-trip-workspace-mvp-tool-render-alignment-20260505.md` documents the data-tool versus render-tool split.
- `docs/solutions/integration-issues/apps-sdk-clarification-widget-state-and-schema-contract-20260511.md` documents explicit `outputSchema` handling for `CallToolResult` tools.

## Refresh Candidates

Several older docs still refer to the pre-refactor `mcp_servers/widgets` layout. The highest-value targeted refresh scopes are:

- `docs/solutions/ui-bugs/storybook-widget-preview-v3-ui-drift-20260505.md`
- `docs/solutions/test-failures/storybook-widget-typescript-pr-checks.md`
- `docs/solutions/integration-issues/apps-sdk-clarification-widget-state-and-schema-contract-20260511.md`
- `docs/solutions/integration-issues/apps-sdk-trip-workspace-mvp-tool-render-alignment-20260505.md`

Use a narrow refresh scope such as:

```text
ce-compound-refresh Storybook widget QA/resource versioning after move from mcp_servers/widgets to app/web and app/server
```

