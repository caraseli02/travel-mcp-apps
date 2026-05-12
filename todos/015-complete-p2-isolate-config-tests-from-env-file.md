---
status: complete
priority: p2
issue_id: "015"
tags: [code-review, testing, config]
dependencies: []
---

# Isolate Config Tests From Env File

## Problem Statement

`tests/test_config.py` expects default `Settings()` values, but `Settings` loads `.env`. A developer-local `.env` with `TRIP_STORE_BACKEND=file` makes the default test fail.

## Findings

- `app/config.py` configures `SettingsConfigDict(env_file=".env", ...)`.
- `tests/test_config.py` calls `Settings()` directly and expects `trip_store_backend == "postgres"`.
- Local `.env` sets `TRIP_STORE_BACKEND=file`.
- `python -m pytest tests` failed with `file != postgres`.
- `TRIP_STORE_BACKEND=postgres python -m pytest tests` passed with `63 passed, 1 skipped`.

## Proposed Solutions

### Option 1: Disable Env Loading In Unit Tests

**Approach:** Instantiate settings in config tests with `_env_file=None` or use a test-specific settings helper.

**Pros:**
- Tests true class defaults.
- Keeps local `.env` free for development.

**Cons:**
- Requires every default-focused test to use the helper.

**Effort:** Small

**Risk:** Low

---

### Option 2: Patch Environment Per Test

**Approach:** Use `monkeypatch` to clear or set relevant env vars before each settings assertion.

**Pros:**
- Explicit about each env interaction.

**Cons:**
- Easy to miss future settings keys.

**Effort:** Small

**Risk:** Low

## Recommended Action

To be filled during triage.

## Technical Details

**Affected files:**
- `tests/test_config.py`
- `app/config.py`

## Resources

- Local failure: `tests/test_config.py::test_trip_store_file_defaults_to_tmp_json`.

## Acceptance Criteria

- [ ] `python -m pytest tests/test_config.py` passes regardless of local `.env`.
- [ ] `python -m pytest tests` passes without requiring `TRIP_STORE_BACKEND=postgres`.

## Work Log

### 2026-05-12 - Review Discovery

**By:** Codex

**Actions:**
- Ran full test suite and reproduced the failure.
- Confirmed the failure disappears when `TRIP_STORE_BACKEND=postgres` overrides local `.env`.

**Learnings:**
- Config default tests should not consume developer-local runtime settings.

