# travel-mcp-app

Learning-by-doing project for a Travel Tip Planner built with FastAPI, MCP, OpenWeather, and MCP Apps UI resources.

The intended deployment target is FastAPI Cloud:

- Docs: https://fastapicloud.com/docs/getting-started/
- App dashboard: https://dashboard.fastapicloud.com

## Quick Start

### Start the development server

```bash
source .venv/bin/activate
pip install -e ".[dev]"
fastapi dev
```

Visit http://localhost:8000

Local MCP endpoints mounted in the FastAPI app:

- Weather: http://localhost:8000/mcp/weather/
- Travel tips: http://localhost:8000/mcp/travel/
- Packing: http://localhost:8000/mcp/packing/
- Unified travel agent: http://localhost:8000/mcp/travel-agent/

Trip Inbox and Trip Board tools require a Postgres database through `DATABASE_URL`.
The recommended setup is [Neon](https://neon.tech) via the FastAPI Cloud integration
(Storage → Connect Neon), which sets `DATABASE_URL` automatically.
The MCP tool returns a setup error if no database is configured.

### Deploy to FastAPI Cloud

FastAPI Cloud can deploy this project if:

- `fastapi[standard]` is installed.
- `pyproject.toml` includes the Python version.
- `fastapi dev` works locally without extra arguments, or `[tool.fastapi]` defines the entrypoint.
- Runtime secrets such as `OPENWEATHER_API_KEY` are configured in FastAPI Cloud.

```bash
fastapi login
fastapi deploy
```

Set the OpenWeather key as a FastAPI Cloud secret:

```bash
fastapi cloud env set --secret OPENWEATHER_API_KEY "your-api-key"
```

Set up Neon Postgres for Trip Inbox and Trip Board:

1. Go to your app's **Storage** tab in the FastAPI Cloud dashboard
2. Click **Connect** on the Neon integration
3. Select your Neon project and branch
4. `DATABASE_URL` is set automatically

Or set it manually:

```bash
fastapi cloud env set --secret DATABASE_URL "postgresql://..."
```

Environment variable changes apply on the next deployment.

## Project Structure

- `app/main.py` - FastAPI application factory and app instance
- `app/config.py` - environment-based settings
- `app/routers/health.py` - health and MCP readiness endpoints
- `app/routers/travel.py` - travel API endpoint placeholder for later MCP orchestration
- `services/trips.py` - Postgres-backed Trip and TripItem persistence for the unified travel agent
- `mcp_servers/travel_agent_server.py` - unified MCP endpoint with weather, travel, packing, Trip Inbox, and Trip Board tools
- `main.py` - compatibility import for `app.main:app`
- `pyproject.toml` - Project dependencies
- `.env.example` - local environment variable template
- `.fastapicloudignore` - deployment upload exclusions
- `tests/` - API test scaffold
- `docs/chatgpt_apps_readiness_review.md` - ChatGPT Apps publication-readiness review
- `docs/testing_chatgpt_apps.md` - MCP protocol and ChatGPT Apps widget bridge testing guide
- `todos/001-ready-p1-mcp-learning-roadmap.md` - detailed MCP learning todo list with hints and references
- `.kiro/specs/mcp-travel-planner-ui/` - Requirements and design notes for the MCP learning project

## Learn More

- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [FastAPI Cloud Docs](https://fastapicloud.com/docs/getting-started/)
