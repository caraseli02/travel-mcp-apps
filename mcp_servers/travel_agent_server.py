from pathlib import Path
import json
import os
import sys
from typing import Any, Callable

if __package__ is None or __package__ == "":
    sys.path.append(str(Path(__file__).resolve().parents[1]))

from mcp.server.fastmcp import FastMCP
from mcp.server.transport_security import TransportSecuritySettings
from mcp.types import CallToolResult, TextContent, ToolAnnotations

from app.config import get_settings
from services.trip_clarification import (
    build_clarification_session,
    summarize_clarification,
)
from services.trips import (
    FileTripStore,
    PostgresTripStore,
    TripConfigError,
    TripNotFoundError,
    TripStoreError,
    TripValidationError,
    build_board,
    build_budget,
    build_itinerary,
    item_to_dict,
    summarize_items,
    trip_to_dict,
)

WIDGETS_DIR = Path(__file__).resolve().parent / "widgets"
_STORE: PostgresTripStore | FileTripStore | None = None


def local_transport_security() -> TransportSecuritySettings | None:
    if os.getenv("MCP_DEV_TUNNEL") == "1":
        return TransportSecuritySettings(enable_dns_rebinding_protection=False)

    return None


server = FastMCP(
    "travel-agent-server",
    host="127.0.0.1",
    port=8104,
    transport_security=local_transport_security(),
)


def get_trip_store() -> PostgresTripStore | FileTripStore:
    global _STORE
    if _STORE is None:
        settings = get_settings()
        backend = settings.trip_store_backend.strip().lower()
        if backend == "file":
            _STORE = FileTripStore(settings.trip_store_file_path)
        elif backend == "postgres":
            _STORE = PostgresTripStore(settings.trip_database_url)
        else:
            raise TripConfigError("TRIP_STORE_BACKEND must be either 'postgres' or 'file'.")
    return _STORE


def _text(message: str) -> list[TextContent]:
    return [TextContent(type="text", text=message)]


def _tool_error(exc: Exception) -> CallToolResult:
    return CallToolResult(
        structuredContent={"error": str(exc)},
        content=_text(str(exc)),
        _meta={},
        isError=True,
    )


def _run_trip_tool(action: Callable[[], CallToolResult]) -> CallToolResult:
    try:
        return action()
    except (TripConfigError, TripValidationError, TripNotFoundError) as exc:
        return _tool_error(exc)
    except TripStoreError as exc:
        return _tool_error(exc)
    except Exception as exc:
        return _tool_error(RuntimeError(f"Trip persistence failed: {exc}"))


READ_ONLY = ToolAnnotations(
    readOnlyHint=True,
    destructiveHint=False,
    idempotentHint=True,
    openWorldHint=False,
)
MUTATION = ToolAnnotations(
    readOnlyHint=False,
    destructiveHint=False,
    openWorldHint=False,
)


def _status_meta(invoking: str, invoked: str) -> dict[str, str]:
    return {
        "openai/toolInvocation/invoking": invoking,
        "openai/toolInvocation/invoked": invoked,
    }


def _render_meta(resource_uri: str, invoking: str, invoked: str) -> dict[str, object]:
    return {
        "ui": {"resourceUri": resource_uri},
        "openai/outputTemplate": resource_uri,
        **_status_meta(invoking, invoked),
    }


@server.tool(
    name="create_trip",
    title="Create trip workspace",
    description=(
        "Use this when the user wants a saved trip workspace for collecting options, "
        "decisions, itinerary items, and budget notes. Use this only after the user "
        "has confirmed they want a saved trip workspace or after clarification "
        "answers are collected. Do not use this as the first action for vague "
        "requests like 'I want to plan a trip to X', 'I want to book hotel in X', "
        "or 'I want to book fly to X'; use ask_trip_clarification for those first."
    ),
    annotations=MUTATION,
    meta=_status_meta("Creating trip workspace", "Created trip workspace"),
)
def create_trip(
    title: str,
    destination: str | None = None,
    start_date: str | None = None,
    end_date: str | None = None,
) -> CallToolResult:
    def action() -> CallToolResult:
        trip = get_trip_store().create_trip(title, destination, start_date, end_date)
        return CallToolResult(
            structuredContent={"trip": trip_to_dict(trip)},
            content=_text(f"Created trip workspace: {trip.title}."),
            _meta={},
        )

    return _run_trip_tool(action)


@server.tool(
    name="add_trip_item",
    title="Save trip item",
    description=(
        "Use this when the user wants to save a found hotel, flight, restaurant, "
        "activity, note, constraint, or booking fragment to a trip workspace inbox. "
        "Duplicate fragments are detected by normalized content."
    ),
    annotations=ToolAnnotations(
        readOnlyHint=False,
        destructiveHint=False,
        idempotentHint=True,
        openWorldHint=False,
    ),
    meta=_status_meta("Saving trip item", "Saved trip item"),
)
def add_trip_item(
    trip_id: str,
    raw_content: str,
    item_type: str | None = None,
    source_label: str | None = None,
    title: str | None = None,
    day_label: str | None = None,
    date_note: str | None = None,
    price_note: str | None = None,
    location_note: str | None = None,
    notes: str | None = None,
) -> CallToolResult:
    def action() -> CallToolResult:
        store = get_trip_store()
        item, deduped = store.add_item(
            trip_id=trip_id,
            raw_content=raw_content,
            item_type=item_type,
            source_label=source_label,
            title=title,
            day_label=day_label,
            date_note=date_note,
            price_note=price_note,
            location_note=location_note,
            notes=notes,
        )
        inbox = [item_to_dict(inbox_item) for inbox_item in store.list_items(trip_id, "inbox")]
        trip = store.get_trip(trip_id)
        return CallToolResult(
            structuredContent={
                "trip": trip_to_dict(trip),
                "item": item_to_dict(item),
                "items": inbox,
                "deduped": deduped,
            },
            content=_text(
                "That fragment was already in the trip inbox."
                if deduped
                else "Saved the fragment to the trip inbox."
            ),
            _meta={},
        )

    return _run_trip_tool(action)


@server.tool(
    name="list_trip_inbox",
    title="Show trip inbox",
    description=(
        "Use this when the user wants to review saved trip fragments that still need "
        "triage or a next decision."
    ),
    annotations=READ_ONLY,
    meta=_render_meta(
        "ui://trip/inbox-v2.html",
        "Loading trip inbox",
        "Loaded trip inbox",
    ),
)
def list_trip_inbox(trip_id: str) -> CallToolResult:
    def action() -> CallToolResult:
        store = get_trip_store()
        trip = store.get_trip(trip_id)
        items = [item_to_dict(item) for item in store.list_items(trip_id, "inbox")]
        return CallToolResult(
            structuredContent={"trip": trip_to_dict(trip), "items": items},
            content=_text(f"Showing {len(items)} inbox item(s) for {trip.title}."),
            _meta={},
        )

    return _run_trip_tool(action)


@server.tool(
    name="update_trip_item_status",
    title="Update trip item status",
    description=(
        "Use this when the user decides what to do with a saved trip item: keep it in "
        "the inbox, shortlist it, mark it booked, reject it, or flag it for review."
    ),
    annotations=MUTATION,
    meta=_status_meta("Updating trip item", "Updated trip item"),
)
def update_trip_item_status(
    item_id: str,
    status: str,
    day_label: str | None = None,
    notes: str | None = None,
) -> CallToolResult:
    def action() -> CallToolResult:
        item = get_trip_store().update_item_status(item_id, status, day_label, notes)
        return CallToolResult(
            structuredContent={"item": item_to_dict(item)},
            content=_text(f"Moved item to {item.status}."),
            _meta={},
        )

    return _run_trip_tool(action)


@server.tool(
    name="get_trip_board",
    title="Get trip board data",
    description=(
        "Use this to fetch the current trip decision state grouped into inbox, "
        "shortlist, booked items, itinerary draft, and missing planning pieces."
    ),
    annotations=READ_ONLY,
    meta=_status_meta("Fetching trip board", "Fetched trip board"),
)
def get_trip_board(trip_id: str) -> CallToolResult:
    def action() -> CallToolResult:
        store = get_trip_store()
        trip = store.get_trip(trip_id)
        board = build_board(trip, store.list_items(trip_id))
        return CallToolResult(
            structuredContent=board,
            content=_text(f"Showing trip board for {trip.title}."),
            _meta={},
        )

    return _run_trip_tool(action)


@server.tool(
    name="render_trip_board",
    title="Render trip board",
    description=(
        "Use this after fetching or changing trip state when the user asks to see a "
        "visual trip board of decisions, shortlist, booked items, itinerary draft, "
        "and missing pieces."
    ),
    annotations=READ_ONLY,
    meta=_render_meta(
        "ui://trip/board-v2.html",
        "Rendering trip board",
        "Rendered trip board",
    ),
)
def render_trip_board(trip_id: str) -> CallToolResult:
    def action() -> CallToolResult:
        store = get_trip_store()
        trip = store.get_trip(trip_id)
        board = build_board(trip, store.list_items(trip_id))
        return CallToolResult(
            structuredContent=board,
            content=_text(f"Rendered trip board for {trip.title}."),
            _meta={},
        )

    return _run_trip_tool(action)


@server.tool(
    name="get_trip_itinerary",
    title="Show trip itinerary",
    description=(
        "Use this when the user wants to see scheduled or day-labeled trip items as a "
        "day-by-day itinerary."
    ),
    annotations=READ_ONLY,
    meta=_render_meta(
        "ui://trip/itinerary-v1.html",
        "Loading trip itinerary",
        "Loaded trip itinerary",
    ),
)
def get_trip_itinerary(trip_id: str) -> CallToolResult:
    def action() -> CallToolResult:
        store = get_trip_store()
        trip = store.get_trip(trip_id)
        itinerary = build_itinerary(trip, store.list_items(trip_id))
        return CallToolResult(
            structuredContent=itinerary,
            content=_text(f"Showing day-by-day itinerary for {trip.title}."),
            _meta={},
        )

    return _run_trip_tool(action)


@server.tool(
    name="get_trip_budget",
    title="Show trip budget",
    description=(
        "Use this when the user wants tracked trip spending, extracted prices, party "
        "or night multipliers, and any saved budget target."
    ),
    annotations=READ_ONLY,
    meta=_render_meta(
        "ui://trip/budget-v1.html",
        "Loading trip budget",
        "Loaded trip budget",
    ),
)
def get_trip_budget(trip_id: str) -> CallToolResult:
    def action() -> CallToolResult:
        store = get_trip_store()
        trip = store.get_trip(trip_id)
        budget = build_budget(trip, store.list_items(trip_id))
        return CallToolResult(
            structuredContent=budget,
            content=_text(f"Showing spending tracker for {trip.title}."),
            _meta={},
        )

    return _run_trip_tool(action)


@server.tool(
    name="get_trip_summary",
    title="Summarize trip state",
    description=(
        "Use this when the user wants a concise natural-language summary of saved "
        "trip state, item counts, and missing planning pieces."
    ),
    annotations=READ_ONLY,
    meta=_status_meta("Summarizing trip", "Summarized trip"),
)
def get_trip_summary(trip_id: str) -> CallToolResult:
    def action() -> CallToolResult:
        store = get_trip_store()
        trip = store.get_trip(trip_id)
        items = store.list_items(trip_id)
        board = build_board(trip, items)
        counts = summarize_items(items)
        missing = board["lanes"]["missing_pieces"]
        return CallToolResult(
            structuredContent={
                "trip": trip_to_dict(trip),
                "counts": counts,
                "missing_pieces": missing,
            },
            content=_text(
                f"{trip.title} has {counts['total']} saved item(s). "
                f"Missing pieces: {len(missing)}."
            ),
            _meta={},
        )

    return _run_trip_tool(action)


def _parse_json_object(value: str, field_name: str) -> dict[str, Any]:
    try:
        parsed = json.loads(value or "{}")
    except json.JSONDecodeError as exc:
        raise TripValidationError(f"{field_name} must be valid JSON.") from exc

    if not isinstance(parsed, dict):
        raise TripValidationError(f"{field_name} must be a JSON object.")
    return parsed


def _build_clarification_session_from_tool_input(
    utterance: str,
    intent: str | None = None,
    destination: str | None = None,
    trip_id: str | None = None,
    known_fields_json: str = "{}",
) -> dict[str, Any]:
    known_fields = _parse_json_object(known_fields_json, "known_fields_json")
    if not trip_id:
        return build_clarification_session(
            utterance=utterance,
            intent=intent,
            destination=destination,
            known_fields=known_fields,
        )

    store = get_trip_store()
    trip = store.get_trip(trip_id)
    items = store.list_items(trip_id)
    return build_clarification_session(
        utterance=utterance,
        intent=intent,
        destination=destination,
        known_fields=known_fields,
        trip=trip,
        items=items,
    )


@server.tool(
    name="prepare_trip_clarification",
    title="Prepare trip clarification questions",
    description=(
        "Use this when the user gives an underspecified travel request such as "
        "planning a trip, booking a hotel, or booking a flight and a few structured "
        "follow-up questions would help. Returns reusable structured question data "
        "without rendering UI."
    ),
    annotations=READ_ONLY,
    meta=_status_meta("Preparing trip questions", "Prepared trip questions"),
)
def prepare_trip_clarification(
    utterance: str,
    intent: str | None = None,
    destination: str | None = None,
    trip_id: str | None = None,
    known_fields_json: str = "{}",
) -> CallToolResult:
    def action() -> CallToolResult:
        session = _build_clarification_session_from_tool_input(
            utterance=utterance,
            intent=intent,
            destination=destination,
            trip_id=trip_id,
            known_fields_json=known_fields_json,
        )
        return CallToolResult(
            structuredContent=session,
            content=_text(f"Prepared {session['total_questions']} clarification question(s)."),
            _meta={},
        )

    return _run_trip_tool(action)


@server.tool(
    name="ask_trip_clarification",
    title="Ask trip clarification questions",
    description=(
        "Use this as the first action for simple underspecified travel requests: "
        "'I want to plan a trip to X', 'I want to book hotel in X', or "
        "'I want to book fly to X'. This renders the interactive question widget "
        "instead of creating a trip immediately."
    ),
    annotations=READ_ONLY,
    meta=_render_meta(
        "ui://trip/clarification-v1.html",
        "Opening trip questions",
        "Opened trip questions",
    ),
)
def ask_trip_clarification(
    utterance: str,
    intent: str | None = None,
    destination: str | None = None,
    trip_id: str | None = None,
    known_fields_json: str = "{}",
) -> CallToolResult:
    return render_trip_clarification(
        utterance=utterance,
        intent=intent,
        destination=destination,
        trip_id=trip_id,
        known_fields_json=known_fields_json,
    )


@server.tool(
    name="render_trip_clarification",
    title="Render trip clarification widget",
    description=(
        "Use this to render the compact interactive clarification widget when "
        "question data should be shown visually. For first-turn simple travel "
        "requests, prefer ask_trip_clarification."
    ),
    annotations=READ_ONLY,
    meta=_render_meta(
        "ui://trip/clarification-v1.html",
        "Opening trip questions",
        "Opened trip questions",
    ),
)
def render_trip_clarification(
    utterance: str,
    intent: str | None = None,
    destination: str | None = None,
    trip_id: str | None = None,
    known_fields_json: str = "{}",
) -> CallToolResult:
    def action() -> CallToolResult:
        session = _build_clarification_session_from_tool_input(
            utterance=utterance,
            intent=intent,
            destination=destination,
            trip_id=trip_id,
            known_fields_json=known_fields_json,
        )
        return CallToolResult(
            structuredContent=session,
            content=_text(
                f"Opened {session['total_questions']} clarification question(s) "
                f"for {session['destination'] or 'the trip'}."
            ),
            _meta={},
        )

    return _run_trip_tool(action)


@server.tool(
    name="submit_trip_clarification",
    title="Submit trip clarification answers",
    description=(
        "Use this after the user answers trip clarification questions. It summarizes "
        "selected answers and recommends whether to create a trip, save hotel "
        "constraints, save flight constraints, or ask a text follow-up."
    ),
    annotations=MUTATION,
    meta=_status_meta("Saving trip answers", "Saved trip answers"),
)
def submit_trip_clarification(session_json: str, answers_json: str) -> CallToolResult:
    def action() -> CallToolResult:
        session = _parse_json_object(session_json, "session_json")
        answers = _parse_json_object(answers_json, "answers_json")
        result = summarize_clarification(session, answers)
        return CallToolResult(
            structuredContent=result,
            content=_text(result["summary"]),
            _meta={"openai/closeWidget": True},
        )

    return _run_trip_tool(action)


@server.resource(
    "ui://trip/inbox-v2.html",
    name="trip_inbox_ui",
    description="Trip Inbox UI",
    mime_type="text/html;profile=mcp-app",
    meta={
        "ui": {
            "prefersBorder": True,
            "csp": {
                "connectDomains": [],
                "resourceDomains": [],
            },
        },
        "openai/widgetDescription": "Shows saved raw travel fragments that still need review.",
    },
)
def trip_inbox_ui() -> str:
    return (WIDGETS_DIR / "trip_inbox_v2.html").read_text(encoding="utf-8")


@server.resource(
    "ui://trip/board-v2.html",
    name="trip_board_ui",
    description="Trip Board UI",
    mime_type="text/html;profile=mcp-app",
    meta={
        "ui": {
            "prefersBorder": True,
            "csp": {
                "connectDomains": [],
                "resourceDomains": [],
            },
        },
        "openai/widgetDescription": "Shows a trip board grouped by decisions, shortlist, booked items, draft itinerary, and missing pieces.",
    },
)
def trip_board_ui() -> str:
    return (WIDGETS_DIR / "trip_board_v3.html").read_text(encoding="utf-8")


@server.resource(
    "ui://trip/itinerary-v1.html",
    name="trip_itinerary_ui",
    description="Trip itinerary timeline UI",
    mime_type="text/html;profile=mcp-app",
    meta={
        "ui": {
            "prefersBorder": True,
            "csp": {
                "connectDomains": [],
                "resourceDomains": [],
            },
        },
        "openai/widgetDescription": "Shows scheduled trip items grouped into a day-by-day itinerary.",
    },
)
def trip_itinerary_ui() -> str:
    return (WIDGETS_DIR / "trip_itinerary_v3.html").read_text(encoding="utf-8")


@server.resource(
    "ui://trip/budget-v1.html",
    name="trip_budget_ui",
    description="Trip spending tracker UI",
    mime_type="text/html;profile=mcp-app",
    meta={
        "ui": {
            "prefersBorder": True,
            "csp": {
                "connectDomains": [],
                "resourceDomains": [],
            },
        },
        "openai/widgetDescription": "Shows tracked trip spending against a saved budget target.",
    },
)
def trip_budget_ui() -> str:
    return (WIDGETS_DIR / "trip_budget_v3.html").read_text(encoding="utf-8")


@server.resource(
    "ui://trip/clarification-v1.html",
    name="trip_clarification_ui",
    description="Trip clarification questions UI",
    mime_type="text/html;profile=mcp-app",
    meta={
        "ui": {
            "prefersBorder": True,
            "csp": {
                "connectDomains": [],
                "resourceDomains": [],
            },
        },
        "openai/widgetDescription": "Asks concise follow-up questions for underspecified trip planning, hotel, and flight requests.",
    },
)
def trip_clarification_ui() -> str:
    return (WIDGETS_DIR / "trip_clarification_v1.html").read_text(encoding="utf-8")


if __name__ == "__main__":
    server.run("streamable-http")
