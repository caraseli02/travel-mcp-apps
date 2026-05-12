---
status: complete
priority: p2
issue_id: "020"
tags: [code-review, apps-sdk, mcp]
dependencies: []
---

# Improve Legacy Tool Descriptors

## Problem Statement

The standalone weather, travel tips, and packing MCP tools are still exposed and widget-aware, but their descriptors are less model-friendly than the newer travel-agent tools.

## Findings

- `app/server/weather/mcp.py` widget tools omit the richer title, annotations, output schema, and status metadata used by travel-agent tools.
- `app/server/travel_tips/mcp.py` has the same descriptor gap.
- `app/server/packing/mcp.py` has the same descriptor gap.
- Testing docs still list these endpoints as supported Apps SDK surfaces.

## Proposed Solutions

### Option 1: Upgrade Descriptors For Exposed Tools

**Approach:** Add titles, read-only/idempotency annotations, output schemas, and short invocation status metadata where accurate.

**Pros:**
- Consistent Apps SDK quality across endpoints.
- Improves model tool choice.

**Cons:**
- Requires careful schema definitions.

**Effort:** Medium

**Risk:** Low

---

### Option 2: Mark Legacy Endpoints As Non-MVP

**Approach:** Keep them for local experimentation but remove them from primary testing docs and ChatGPT app setup.

**Pros:**
- Narrows MVP scope.
- Avoids polishing non-core endpoints.

**Cons:**
- Leaves uneven quality if users still expose those endpoints.

**Effort:** Small

**Risk:** Low

## Recommended Action

To be filled during triage.

## Technical Details

**Affected files:**
- `app/server/weather/mcp.py`
- `app/server/travel_tips/mcp.py`
- `app/server/packing/mcp.py`
- `docs/testing_chatgpt_apps.md`
- `tests/test_api.py`

## Resources

- Agent-native review finding.

## Acceptance Criteria

- [ ] Every documented Apps SDK tool has intentional descriptor metadata.
- [ ] Output schemas are present where handlers return structured content.
- [ ] Tests cover descriptor metadata for exposed endpoints or docs scope them out.

## Work Log

### 2026-05-12 - Review Discovery

**By:** Codex

**Actions:**
- Compared legacy endpoint descriptors with travel-agent descriptors.

**Learnings:**
- The cleanup moved legacy endpoints but did not align them with the new Apps SDK standard.

