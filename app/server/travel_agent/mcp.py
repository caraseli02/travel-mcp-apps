from pathlib import Path
import json
import os
import re
import sys
from typing import Any, Callable

if __package__ is None or __package__ == "":
    current_dir = str(Path(__file__).resolve().parent)
    sys.path = [path for path in sys.path if path != current_dir]
    sys.path.insert(0, str(Path(__file__).resolve().parents[3]))

from mcp.server.fastmcp import FastMCP
from mcp.server.transport_security import TransportSecuritySettings
from mcp.types import CallToolResult, TextContent, ToolAnnotations

from app.config import get_settings
from app.server.services.trip_clarification import (
    build_clarification_session,
    summarize_clarification,
)
from app.server.services.trips import (
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

WEB_DIR = Path(__file__).resolve().parents[2] / "web"
WEB_DIST_DIR = WEB_DIR / "dist"
WEB_RUNTIME_TEMPLATES_DIR = WEB_DIR / "runtime_templates"
_STORE: PostgresTripStore | FileTripStore | None = None
MAX_JSON_PAYLOAD_CHARS = 12_000
MAX_JSON_OBJECT_KEYS = 64
MAX_JSON_DEPTH = 8


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


def _read_widget_html(filename: str) -> str:
    widget_path = WEB_RUNTIME_TEMPLATES_DIR / filename
    if not widget_path.exists():
        widget_path = WEB_DIST_DIR / "templates" / filename
    if not widget_path.exists():
        raise FileNotFoundError(
            f"Built widget asset {filename} was not found. Run `npm run build` in app/web before deploying."
        )
    return widget_path.read_text(encoding="utf-8")


OBJECT_SCHEMA: dict[str, Any] = {"type": "object", "additionalProperties": True}
TRIP_SCHEMA: dict[str, Any] = {
    "type": "object",
    "additionalProperties": True,
    "required": ["id", "title"],
    "properties": {
        "id": {"type": "string"},
        "title": {"type": "string"},
        "destination": {"type": ["string", "null"]},
        "start_date": {"type": ["string", "null"]},
        "end_date": {"type": ["string", "null"]},
    },
}
TRIP_ITEM_SCHEMA: dict[str, Any] = {
    "type": "object",
    "additionalProperties": True,
    "required": ["id", "trip_id", "raw_content", "status"],
    "properties": {
        "id": {"type": "string"},
        "trip_id": {"type": "string"},
        "raw_content": {"type": "string"},
        "status": {"type": "string"},
        "item_type": {"type": ["string", "null"]},
        "title": {"type": ["string", "null"]},
    },
}
ERROR_OUTPUT_SCHEMA: dict[str, Any] = {
    "type": "object",
    "required": ["error"],
    "properties": {"error": {"type": "string"}},
    "additionalProperties": False,
}


def _output_schema(
    properties: dict[str, Any],
    required: list[str] | None = None,
) -> dict[str, Any]:
    return {
        "type": "object",
        "properties": properties,
        "required": required or list(properties),
        "additionalProperties": True,
    }


TOOL_OUTPUT_SCHEMAS: dict[str, dict[str, Any]] = {
    "create_trip": _output_schema({"trip": TRIP_SCHEMA}),
    "add_trip_item": _output_schema(
        {
            "trip": TRIP_SCHEMA,
            "item": TRIP_ITEM_SCHEMA,
            "items": {"type": "array", "items": TRIP_ITEM_SCHEMA},
            "deduped": {"type": "boolean"},
        }
    ),
    "list_trip_inbox": _output_schema(
        {"trip": TRIP_SCHEMA, "items": {"type": "array", "items": TRIP_ITEM_SCHEMA}}
    ),
    "update_trip_item_status": _output_schema({"item": TRIP_ITEM_SCHEMA}),
    "get_trip_board": OBJECT_SCHEMA,
    "render_trip_board": OBJECT_SCHEMA,
    "get_trip_itinerary": OBJECT_SCHEMA,
    "get_trip_budget": OBJECT_SCHEMA,
    "render_trip_options": OBJECT_SCHEMA,
    "render_trip_comparison": OBJECT_SCHEMA,
    "render_trip_map": OBJECT_SCHEMA,
    "render_trip_album": OBJECT_SCHEMA,
    "render_trip_cart": OBJECT_SCHEMA,
    "get_trip_summary": _output_schema(
        {
            "trip": TRIP_SCHEMA,
            "counts": OBJECT_SCHEMA,
            "missing_pieces": {"type": "array", "items": {"type": "string"}},
        }
    ),
    "prepare_trip_clarification": OBJECT_SCHEMA,
    "ask_trip_clarification": OBJECT_SCHEMA,
    "render_trip_clarification": OBJECT_SCHEMA,
    "submit_trip_clarification": _output_schema(
        {
            "session": OBJECT_SCHEMA,
            "resolved_fields": OBJECT_SCHEMA,
            "remaining_fields": {"type": "array", "items": {"type": "string"}},
            "recommended_next_action": {"type": "string"},
            "trip_draft": OBJECT_SCHEMA,
            "trip_item_draft": OBJECT_SCHEMA,
            "next_tool_calls": {"type": "array", "items": OBJECT_SCHEMA},
            "summary": {"type": "string"},
        }
    ),
}


TRAVEL_OPTION_CATEGORIES = {
    "hotel": "lodging",
    "lodging": "lodging",
    "restaurant": "food",
    "food": "food",
    "activity": "activity",
    "museum": "activity",
    "transit": "transit",
    "train": "transit",
    "flight": "flight",
    "neighborhood": "neighborhood",
    "area": "neighborhood",
}


def _trip_options_payload(trip: Any, items: list[Any]) -> dict[str, Any]:
    trip_dict = trip_to_dict(trip)
    options = []
    for index, item in enumerate(items):
        data = item_to_dict(item)
        raw = data.get("raw_content") or ""
        item_type = (data.get("item_type") or "").lower()
        category = TRAVEL_OPTION_CATEGORIES.get(item_type, "activity")
        status = data.get("status") if data.get("status") in {"inbox", "shortlisted", "booked"} else "open"
        title = data.get("title") or raw[:80] or "Saved trip option"
        location = data.get("location_note") or data.get("notes") or trip_dict.get("destination") or "Trip area"
        price_text = data.get("price_note") or raw
        price_match = re.search(r"(?:€|EUR|\\$|USD)?\\s*(\\d+(?:\\.\\d{1,2})?)", price_text)
        price = float(price_match.group(1)) if price_match else None
        options.append(
            {
                "id": data.get("id") or f"option-{index}",
                "category": category,
                "status": status,
                "title": title,
                "subtitle": data.get("source_label") or location,
                "description": raw or data.get("notes") or title,
                "neighborhood": location,
                "schedule_label": data.get("day_label"),
                "price": price,
                "currency": "EUR" if "€" in price_text or "EUR" in price_text.upper() else "USD",
                "price_note": data.get("price_note"),
                "source": data.get("source_label"),
                "score": max(72, 94 - index * 3),
                "recommended": index == 0,
                "coordinates": {
                    "x": 18 + (index * 17) % 64,
                    "y": 22 + (index * 23) % 58,
                },
                "pros": ["Saved in trip workspace", "Ready to compare"],
                "cons": ["Needs confirmation"],
            }
        )

    media = [
        {
            "id": f"media-{option['id']}",
            "category": option["category"],
            "title": option["title"],
            "subtitle": option["subtitle"],
            "description": option["description"],
            "location": option.get("neighborhood") or trip_dict.get("destination") or "Trip area",
            "image_url": "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 600'%3E%3Crect width='800' height='600' fill='%23dbeafe'/%3E%3Cpath d='M0 430 220 250l160 120 130-90 290 210v110H0z' fill='%2393c5fd'/%3E%3Ccircle cx='610' cy='145' r='70' fill='%23fef3c7'/%3E%3C/svg%3E",
            "gradient": "from-sky-200 via-white to-emerald-200",
        }
        for option in options[:8]
    ]

    return {"trip": trip_dict, "options": options, "media": media}


def _trip_cart_payload(trip: Any, items: list[Any]) -> dict[str, Any]:
    options = _trip_options_payload(trip, items)["options"]
    selected = [option for option in options if option["status"] in {"shortlisted", "booked"}] or options[:3]
    return {
        "trip": trip_to_dict(trip),
        "currency": "EUR",
        "items": [
            {
                "id": option["id"],
                "category": option["category"],
                "title": option["title"],
                "subtitle": option["subtitle"],
                "price": option.get("price") or 0,
                "quantity": 1,
                "ready": option["status"] == "booked",
                "warning": "Confirm before booking" if option["status"] != "booked" else None,
            }
            for option in selected
        ],
        "readiness": ["Trip items collected", "Review remaining gaps before booking"],
        "warnings": ["This is a planning cart, not a checkout."],
    }


def _register_output_schemas() -> None:
    for tool in server._tool_manager.list_tools():
        schema = TOOL_OUTPUT_SCHEMAS.get(tool.name)
        if schema is not None:
            # FastMCP derives output schemas from return annotations. These tools
            # return CallToolResult directly so they can control Apps metadata;
            # attach the equivalent schema to the cached property used by list_tools.
            tool.__dict__["output_schema"] = {"anyOf": [schema, ERROR_OUTPUT_SCHEMA]}


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
        "ui://trip/board-v3.html",
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
        "ui://trip/itinerary-v3.html",
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
        "ui://trip/budget-v3.html",
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


def _render_trip_options_widget(
    trip_id: str,
    resource_uri: str,
    content_label: str,
    cart: bool = False,
) -> CallToolResult:
    def action() -> CallToolResult:
        store = get_trip_store()
        trip = store.get_trip(trip_id)
        items = store.list_items(trip_id)
        payload = _trip_cart_payload(trip, items) if cart else _trip_options_payload(trip, items)
        return CallToolResult(
            structuredContent=payload,
            content=_text(f"Rendered {content_label} for {trip.title}."),
            _meta={},
        )

    return _run_trip_tool(action)


@server.tool(
    name="render_trip_options",
    title="Render trip options",
    description="Use this when the user asks to see saved hotels, restaurants, flights, activities, or trip places as a visual options list.",
    annotations=READ_ONLY,
    meta=_render_meta("ui://trip/options-list-v1.html", "Rendering trip options", "Rendered trip options"),
)
def render_trip_options(trip_id: str) -> CallToolResult:
    return _render_trip_options_widget(trip_id, "ui://trip/options-list-v1.html", "trip options")


@server.tool(
    name="render_trip_comparison",
    title="Render trip comparison",
    description="Use this when the user asks to compare saved trip options visually.",
    annotations=READ_ONLY,
    meta=_render_meta("ui://trip/comparison-v1.html", "Rendering trip comparison", "Rendered trip comparison"),
)
def render_trip_comparison(trip_id: str) -> CallToolResult:
    return _render_trip_options_widget(trip_id, "ui://trip/comparison-v1.html", "trip comparison")


@server.tool(
    name="render_trip_map",
    title="Render trip map",
    description="Use this when the user asks for a map, pins, places, or geographic view of saved trip items. Renders saved places as map pins when precise coordinates are unavailable.",
    annotations=READ_ONLY,
    meta=_render_meta("ui://trip/map-v1.html", "Rendering trip map", "Rendered trip map"),
)
def render_trip_map(trip_id: str) -> CallToolResult:
    return _render_trip_options_widget(trip_id, "ui://trip/map-v1.html", "trip map")


@server.tool(
    name="render_trip_album",
    title="Render trip album",
    description="Use this when the user asks for a visual album or inspiration view of saved trip places.",
    annotations=READ_ONLY,
    meta=_render_meta("ui://trip/album-v1.html", "Rendering trip album", "Rendered trip album"),
)
def render_trip_album(trip_id: str) -> CallToolResult:
    return _render_trip_options_widget(trip_id, "ui://trip/album-v1.html", "trip album")


@server.tool(
    name="render_trip_cart",
    title="Render trip cart",
    description="Use this when the user asks to package selected trip options or review a cart-like planning checklist before booking.",
    annotations=READ_ONLY,
    meta=_render_meta("ui://trip/cart-v1.html", "Rendering trip cart", "Rendered trip cart"),
)
def render_trip_cart(trip_id: str) -> CallToolResult:
    return _render_trip_options_widget(trip_id, "ui://trip/cart-v1.html", "trip cart", cart=True)


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
    if len(value or "") > MAX_JSON_PAYLOAD_CHARS:
        raise TripValidationError(
            f"{field_name} may be at most {MAX_JSON_PAYLOAD_CHARS} characters."
        )

    try:
        parsed = json.loads(value or "{}")
    except json.JSONDecodeError as exc:
        raise TripValidationError(f"{field_name} must be valid JSON.") from exc

    if not isinstance(parsed, dict):
        raise TripValidationError(f"{field_name} must be a JSON object.")
    _validate_json_shape(parsed, field_name)
    return parsed


def _validate_json_shape(value: Any, field_name: str, depth: int = 0) -> None:
    if depth > MAX_JSON_DEPTH:
        raise TripValidationError(f"{field_name} may be nested at most {MAX_JSON_DEPTH} levels.")
    if isinstance(value, dict):
        if len(value) > MAX_JSON_OBJECT_KEYS:
            raise TripValidationError(
                f"{field_name} may include at most {MAX_JSON_OBJECT_KEYS} object keys."
            )
        for child in value.values():
            _validate_json_shape(child, field_name, depth + 1)
    elif isinstance(value, list):
        if len(value) > MAX_JSON_OBJECT_KEYS:
            raise TripValidationError(
                f"{field_name} may include at most {MAX_JSON_OBJECT_KEYS} array values."
            )
        for child in value:
            _validate_json_shape(child, field_name, depth + 1)


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
    item_type_counts = store.item_type_counts(trip_id)
    return build_clarification_session(
        utterance=utterance,
        intent=intent,
        destination=destination,
        known_fields=known_fields,
        trip=trip,
        item_type_counts=item_type_counts,
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
    title="Summarize trip clarification answers",
    description=(
        "Use this after the user answers trip clarification questions. It summarizes "
        "selected answers and recommends whether to create a trip, save hotel "
        "constraints, save flight constraints, or ask a text follow-up. Widgets can "
        "submit session_json. Direct model callers can omit session_json and pass "
        "utterance, intent, destination, trip_id, and known_fields_json instead. "
        "This tool does not persist a trip or trip item by itself; after it returns, "
        "continue with the recommended next tool call when appropriate."
    ),
    annotations=READ_ONLY,
    meta=_status_meta("Summarizing trip answers", "Summarized trip answers"),
)
def submit_trip_clarification(
    answers_json: str,
    session_json: str = "",
    utterance: str | None = None,
    intent: str | None = None,
    destination: str | None = None,
    trip_id: str | None = None,
    known_fields_json: str = "{}",
) -> CallToolResult:
    def action() -> CallToolResult:
        if session_json.strip():
            session = _parse_json_object(session_json, "session_json")
        else:
            if not utterance or not utterance.strip():
                raise TripValidationError("utterance is required when session_json is not provided.")
            session = _build_clarification_session_from_tool_input(
                utterance=utterance,
                intent=intent,
                destination=destination,
                trip_id=trip_id,
                known_fields_json=known_fields_json,
            )
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
    return _read_widget_html("trip_inbox_v2.html")


@server.resource(
    "ui://trip/board-v3.html",
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
    return _read_widget_html("trip_board_v3.html")


@server.resource(
    "ui://trip/itinerary-v3.html",
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
    return _read_widget_html("trip_itinerary_v3.html")


@server.resource(
    "ui://trip/budget-v3.html",
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
    return _read_widget_html("trip_budget_v3.html")


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
    return _read_widget_html("trip_clarification_v1.html")


@server.resource(
    "ui://trip/options-list-v1.html",
    name="Trip Options UI",
    description="Visual saved trip options list.",
    mime_type="text/html;profile=mcp-app",
    meta={
        "ui": {"prefersBorder": True, "csp": {"connectDomains": [], "resourceDomains": []}},
        "openai/widgetDescription": "Shows saved trip options as a filterable visual list.",
    },
)
def trip_options_list_ui() -> str:
    return _read_widget_html("trip_options_list_v1.html")


@server.resource(
    "ui://trip/comparison-v1.html",
    name="Trip Comparison UI",
    description="Visual saved trip option comparison carousel.",
    mime_type="text/html;profile=mcp-app",
    meta={
        "ui": {"prefersBorder": True, "csp": {"connectDomains": [], "resourceDomains": []}},
        "openai/widgetDescription": "Compares saved trip options in a carousel.",
    },
)
def trip_comparison_ui() -> str:
    return _read_widget_html("trip_comparison_v1.html")


@server.resource(
    "ui://trip/map-v1.html",
    name="Trip Map UI",
    description="Visual saved trip places map.",
    mime_type="text/html;profile=mcp-app",
    meta={
        "ui": {"prefersBorder": True, "csp": {"connectDomains": [], "resourceDomains": []}},
        "openai/widgetDescription": "Shows saved trip places as map pins.",
    },
)
def trip_map_ui() -> str:
    return _read_widget_html("trip_map_v1.html")


@server.resource(
    "ui://trip/album-v1.html",
    name="Trip Album UI",
    description="Visual saved trip inspiration album.",
    mime_type="text/html;profile=mcp-app",
    meta={
        "ui": {"prefersBorder": True, "csp": {"connectDomains": [], "resourceDomains": []}},
        "openai/widgetDescription": "Shows saved trip places as an inspiration album.",
    },
)
def trip_album_ui() -> str:
    return _read_widget_html("trip_album_v1.html")


@server.resource(
    "ui://trip/cart-v1.html",
    name="Trip Cart UI",
    description="Cart-like trip planning package.",
    mime_type="text/html;profile=mcp-app",
    meta={
        "ui": {"prefersBorder": True, "csp": {"connectDomains": [], "resourceDomains": []}},
        "openai/widgetDescription": "Shows selected trip options in a cart-like planning review.",
    },
)
def trip_cart_ui() -> str:
    return _read_widget_html("trip_cart_v1.html")


_register_output_schemas()


if __name__ == "__main__":
    server.run("streamable-http")
