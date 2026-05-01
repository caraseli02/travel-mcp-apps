# Changelog

All notable changes to this project are documented here.

## [0.1.0.0] - 2026-04-30

### Added

- Added a unified travel-agent MCP endpoint so ChatGPT can use weather, destination tips, activity recommendations, packing, Trip Inbox, and Trip Board tools from one app connection.
- Added persistent Trip and TripItem storage backed by Supabase Postgres through `DATABASE_URL`, with duplicate travel fragments detected by normalized raw content.
- Added Trip Inbox and Trip Board widgets so saved planning fragments can be reviewed, grouped, and turned into visible trip state.
- Added tests for trip storage behavior, MCP tool structured output, widget resources, and the unified `/mcp/travel-agent/` endpoint.

### Changed

- Documented the new `DATABASE_URL` deployment secret and regenerated the dependency lockfile with `psycopg` pool support.
