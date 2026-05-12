---
status: complete
priority: p1
issue_id: "014"
tags: [code-review, packaging, deploy, widgets]
dependencies: ["013"]
---

# Package Widget Assets

## Problem Statement

Package-based installs can drop the HTML widget assets because `pyproject.toml` only includes Python packages and does not declare package data for `app/server/widgets`, `app/web/*.html`, or `app/web/dist`. Runtime resource handlers read those files from disk.

## Findings

- `pyproject.toml` uses `[tool.setuptools.packages.find] include = ["app*"]`.
- `app/server/travel_agent/mcp.py` reads trip widgets from `app/web/dist` and `app/web`.
- `app/server/weather/mcp.py`, `app/server/travel_tips/mcp.py`, and `app/server/packing/mcp.py` read shared HTML from `app/server/widgets`.
- A reviewer reported wheel inspection found no widget HTML assets in package output.
- Local verification could not build a wheel in this shell because `python -m build` is not installed, so this still needs direct verification after adding package data.

## Proposed Solutions

### Option 1: Add Setuptools Package Data

**Approach:** Configure `pyproject.toml` to include `app/server/widgets/*.html`, `app/web/*.html`, and `app/web/dist/*` as package data.

**Pros:**
- Keeps package installs and source deploys consistent.
- Minimal runtime code change.

**Cons:**
- Still requires discipline to keep built assets current.

**Effort:** Small

**Risk:** Low

---

### Option 2: Move Runtime HTML Under Python Packages Only

**Approach:** Keep runtime widget assets under `app/server/widgets` or another Python package-data-only location, and have web builds copy there.

**Pros:**
- Simplifies Python packaging.
- Clear runtime asset ownership.

**Cons:**
- Adds a build copy step.
- May weaken the desired `app/web` Apps SDK structure.

**Effort:** Medium

**Risk:** Medium

## Recommended Action

To be filled during triage.

## Technical Details

**Affected files:**
- `pyproject.toml`
- `app/server/travel_agent/mcp.py`
- `app/server/weather/mcp.py`
- `app/server/travel_tips/mcp.py`
- `app/server/packing/mcp.py`
- `app/web/**`
- `app/server/widgets/**`

## Resources

- Code review finding from kieran-python-reviewer.

## Acceptance Criteria

- [ ] Building a wheel includes all runtime widget HTML assets.
- [ ] Installing the wheel into a clean environment can read every registered `ui://` resource.
- [ ] Source deploy behavior remains unchanged.

## Work Log

### 2026-05-12 - Review Discovery

**By:** Codex

**Actions:**
- Identified package-data gap from review output and runtime file readers.
- Attempted local wheel verification; blocked because `build` is not installed in the current Python environment.

**Learnings:**
- FastAPI Cloud source deploys may still work, but package-based deploy/install is not covered until package data is explicit.

