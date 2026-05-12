---
status: complete
priority: p3
issue_id: "021"
tags: [code-review, security, docs, mcp]
dependencies: []
---

# Gate Mounted MCP Transport Security

## Problem Statement

Mounted FastAPI MCP routes disable DNS rebinding protection unconditionally, while docs describe `MCP_DEV_TUNNEL=1` as the development-only switch for this behavior.

## Findings

- `app/mcp_mounts.py` sets `TransportSecuritySettings(enable_dns_rebinding_protection=False)` for mounted servers.
- Standalone MCP scripts use `MCP_DEV_TUNNEL=1` to disable the protection only for tunnel development.
- This creates a mismatch between deployed `/mcp/...` behavior and documented security assumptions.

## Proposed Solutions

### Option 1: Gate Mounted Settings With `MCP_DEV_TUNNEL`

**Approach:** Reuse the same environment conditional for mounted FastAPI servers.

**Pros:**
- Matches docs and standalone behavior.
- Safer default.

**Cons:**
- May affect current tunnel-based FastAPI testing unless env is set.

**Effort:** Small

**Risk:** Medium

---

### Option 2: Document Mounted Routes As Intentionally Disabled

**Approach:** Keep current behavior and update docs with rationale.

**Pros:**
- No runtime behavior change.

**Cons:**
- Leaves a broader security posture.

**Effort:** Small

**Risk:** Low

## Recommended Action

To be filled during triage.

## Technical Details

**Affected files:**
- `app/mcp_mounts.py`
- `docs/testing_chatgpt_apps.md`
- `README.md`

## Resources

- Agent-native review finding.

## Acceptance Criteria

- [ ] Mounted and standalone MCP transport-security behavior is intentionally aligned or clearly documented.
- [ ] Tunnel docs specify required env vars.
- [ ] Mounted MCP tests still pass.

## Work Log

### 2026-05-12 - Review Discovery

**By:** Codex

**Actions:**
- Compared mounted server transport settings with standalone server helper behavior.

**Learnings:**
- The app currently optimizes for tunnel usability, but the security model is not explicit.

