from __future__ import annotations

from dataclasses import asdict, dataclass
from datetime import UTC, date, datetime
import json
from pathlib import Path
import re
import threading
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit
from typing import Any
from uuid import uuid4

import psycopg
from psycopg import errors
from psycopg.rows import dict_row
from psycopg_pool import NullConnectionPool


ITEM_TYPES = {
    "flight",
    "transport",
    "hotel",
    "restaurant",
    "activity",
    "document",
    "note",
    "question",
    "constraint",
}

ITEM_STATUSES = {"inbox", "shortlisted", "booked", "rejected", "needs_review"}

BOARD_LANES = {
    "open_decisions": {"needs_review"},
    "shortlisted": {"shortlisted"},
    "booked": {"booked"},
    "itinerary_draft": set(),
    "missing_pieces": set(),
}


class TripStoreError(RuntimeError):
    """Base trip store error."""


class TripConfigError(TripStoreError):
    """Raised when Postgres is not configured."""


class TripConnectionError(TripStoreError):
    """Raised when Postgres is configured but unreachable."""


class TripValidationError(TripStoreError):
    """Raised when caller input cannot be accepted."""


class TripNotFoundError(TripStoreError):
    """Raised when a trip or item id does not exist."""


@dataclass(frozen=True)
class Trip:
    id: str
    title: str
    destination: str | None
    start_date: str | None
    end_date: str | None
    created_at: str
    updated_at: str


@dataclass(frozen=True)
class TripItem:
    id: str
    trip_id: str
    raw_content: str
    normalized_raw_content: str
    item_type: str
    status: str
    source_label: str | None
    title: str | None
    day_label: str | None
    date_note: str | None
    price_note: str | None
    location_note: str | None
    notes: str | None
    created_at: str
    updated_at: str


def utc_now() -> str:
    return datetime.now(UTC).isoformat(timespec="seconds").replace("+00:00", "Z")


def normalize_raw_content(raw_content: str) -> str:
    normalized = raw_content.strip().lower()
    normalized = re.sub(r"https?://", "", normalized)
    normalized = re.sub(r"^www\\.", "", normalized)
    normalized = re.sub(r"\\s+", " ", normalized)
    return normalized.rstrip("/#?& ")


def validate_status(status: str) -> str:
    value = status.strip().lower()
    if value not in ITEM_STATUSES:
        allowed = ", ".join(sorted(ITEM_STATUSES))
        raise TripValidationError(f"status must be one of: {allowed}")
    return value


def classify_trip_item(raw_content: str) -> str:
    text = raw_content.lower()
    rules = [
        ("flight", ("flight", "airline", "airport", "boarding", "gate", "skyscanner")),
        ("transport", ("train", "bus", "ferry", "metro", "uber", "taxi", "rail")),
        ("hotel", ("hotel", "hostel", "airbnb", "booking.com", "check-in", "stay")),
        ("restaurant", ("restaurant", "reservation", "dinner", "lunch", "cafe", "menu")),
        ("document", ("ticket", "passport", "visa", "receipt", "confirmation", "pdf")),
        ("question", ("?", "should we", "can we", "what about", "is it worth")),
        ("constraint", ("budget", "must", "can't", "cannot", "need to", "constraint")),
        ("activity", ("museum", "tour", "beach", "hike", "activity", "visit", "show")),
    ]
    for item_type, needles in rules:
        if any(needle in text for needle in needles):
            return item_type
    return "note"


def _clean_optional(value: str | None) -> str | None:
    if value is None:
        return None
    value = value.strip()
    return value or None


def trip_to_dict(trip: Trip) -> dict[str, Any]:
    return asdict(trip)


def item_to_dict(item: TripItem) -> dict[str, Any]:
    return asdict(item)


def build_board(trip: Trip, items: list[TripItem]) -> dict[str, Any]:
    lanes: dict[str, list[dict[str, Any]] | list[str]] = {
        "open_decisions": [],
        "shortlisted": [],
        "booked": [],
        "itinerary_draft": [],
        "missing_pieces": [],
    }

    for item in items:
        data = item_to_dict(item)
        if item.status == "needs_review" or item.item_type in {"question", "constraint"}:
            lanes["open_decisions"].append(data)  # type: ignore[union-attr]
        if item.status == "shortlisted":
            lanes["shortlisted"].append(data)  # type: ignore[union-attr]
        if item.status == "booked":
            lanes["booked"].append(data)  # type: ignore[union-attr]
        if item.day_label and item.status not in {"inbox", "rejected"}:
            lanes["itinerary_draft"].append(data)  # type: ignore[union-attr]

    booked_types = {item.item_type for item in items if item.status == "booked"}
    if "flight" not in booked_types and "transport" not in booked_types:
        lanes["missing_pieces"].append("Transport is not booked yet.")  # type: ignore[union-attr]
    if "hotel" not in booked_types:
        lanes["missing_pieces"].append("Stay is not booked yet.")  # type: ignore[union-attr]
    if not any(item.item_type == "activity" for item in items):
        lanes["missing_pieces"].append("No activities saved yet.")  # type: ignore[union-attr]

    return {
        "trip": trip_to_dict(trip),
        "lanes": lanes,
        "counts": summarize_items(items),
    }


def build_itinerary(trip: Trip, items: list[TripItem]) -> dict[str, Any]:
    scheduled = [
        item
        for item in items
        if item.day_label and item.status not in {"inbox", "rejected"}
    ]

    grouped: dict[str, list[dict[str, Any]]] = {}
    for item in scheduled:
        label = item.day_label or "Unscheduled"
        data = item_to_dict(item)
        data["schedule_label"] = _schedule_part(label) or item.date_note or "Plan"
        grouped.setdefault(_day_label(label), []).append(data)

    def day_sort_key(day_label: str) -> tuple[int, str]:
        match = re.search(r"\d+", day_label)
        if match:
            return (int(match.group()), day_label)
        return (999, day_label)

    def item_sort_key(item: dict[str, Any]) -> tuple[int, str]:
        label = str(item.get("schedule_label") or item.get("date_note") or "")
        order = {"morning": 1, "midday": 2, "afternoon": 3, "evening": 4, "night": 5}
        for key, value in order.items():
            if key in label.lower():
                return (value, label)
        return (50, label)

    days = [
        {"label": label, "items": sorted(grouped[label], key=item_sort_key)}
        for label in sorted(grouped, key=day_sort_key)
    ]

    unscheduled = [
        item_to_dict(item)
        for item in items
        if not item.day_label and item.status in {"shortlisted", "booked", "needs_review"}
    ]

    gaps: list[str] = []
    if not days:
        gaps.append("No day-by-day itinerary items have been assigned yet.")
    if unscheduled:
        gaps.append(f"{len(unscheduled)} saved item(s) still need a day assignment.")

    return {
        "trip": trip_to_dict(trip),
        "days": days,
        "unscheduled": unscheduled,
        "gaps": gaps,
        "counts": {
            "scheduled": len(scheduled),
            "unscheduled": len(unscheduled),
        },
    }


def _day_label(label: str) -> str:
    match = re.search(r"\bday\s*(\d+)\b", label, re.IGNORECASE)
    if match:
        return f"Day {match.group(1)}"
    return label.strip() or "Unscheduled"


def _schedule_part(label: str) -> str | None:
    value = re.sub(r"\bday\s*\d+\b", "", label, flags=re.IGNORECASE)
    value = re.sub(r"^[\s:,-]+|[\s:,-]+$", "", value)
    return value.strip().capitalize() or None


def build_budget(trip: Trip, items: list[TripItem]) -> dict[str, Any]:
    target = _budget_target(items)
    party_size = _party_size(items)
    nights = _trip_nights(trip)
    rows: list[dict[str, Any]] = []

    for item in items:
        if item.status == "rejected" or item.item_type == "constraint":
            continue
        amount = _item_amount(item, party_size, nights)
        if amount is None:
            continue
        rows.append(
            {
                "id": item.id,
                "title": item.title or item.raw_content or "Saved item",
                "item_type": item.item_type,
                "status": item.status,
                "amount": amount,
                "currency": "EUR",
                "note": item.price_note or item.raw_content,
            }
        )

    category_totals: dict[str, float] = {}
    for row in rows:
        category = str(row["item_type"])
        category_totals[category] = category_totals.get(category, 0) + float(row["amount"])

    spent = round(sum(float(row["amount"]) for row in rows), 2)
    remaining = None if target is None else round(target - spent, 2)
    percent_used = 0 if not target else min(100, round((spent / target) * 100))

    return {
        "trip": trip_to_dict(trip),
        "target": target,
        "spent": spent,
        "remaining": remaining,
        "percent_used": percent_used,
        "currency": "EUR",
        "rows": rows,
        "category_totals": [
            {"category": category, "amount": round(amount, 2)}
            for category, amount in sorted(category_totals.items())
        ],
        "counts": {
            "priced_items": len(rows),
            "tracked_categories": len(category_totals),
            "party_size": party_size,
            "nights": nights,
        },
    }


def _budget_target(items: list[TripItem]) -> float | None:
    for item in items:
        text = " ".join(
            part
            for part in [item.price_note, item.raw_content, item.notes]
            if part
        )
        if item.item_type == "constraint" or "budget" in text.lower():
            amount = _first_money_amount(text)
            if amount is not None:
                return amount
    return None


def _item_amount(item: TripItem, party_size: int, nights: int) -> float | None:
    text = " ".join(
        part
        for part in [item.price_note, item.raw_content, item.notes]
        if part
    )
    amount = _first_money_amount(text)
    if amount is None:
        return None
    lowered = text.lower()
    if re.search(r"/\s*person|per\s+person|\bpp\b", lowered):
        amount *= max(1, party_size)
    if re.search(r"/\s*night|per\s+night", lowered):
        amount *= max(1, nights)
    return round(amount, 2)


def _party_size(items: list[TripItem]) -> int:
    text = " ".join(
        part
        for item in items
        for part in [item.raw_content, item.notes]
        if part
    ).lower()
    adults = _count_people(text, r"(\d+)\s*adults?")
    kids = _count_people(text, r"(\d+)\s*(?:kids?|children)")
    return max(1, adults + kids)


def _count_people(text: str, pattern: str) -> int:
    match = re.search(pattern, text, re.IGNORECASE)
    if not match:
        return 0
    return int(match.group(1))


def _trip_nights(trip: Trip) -> int:
    if not trip.start_date or not trip.end_date:
        return 1
    try:
        start = date.fromisoformat(trip.start_date)
        end = date.fromisoformat(trip.end_date)
    except ValueError:
        return 1
    return max(1, (end - start).days)


def _first_money_amount(text: str) -> float | None:
    match = re.search(
        r"(?:€|EUR|\$)\s*([0-9](?:[0-9.,]*[0-9])?)|([0-9](?:[0-9.,]*[0-9])?)\s*(?:€|EUR|\$)",
        text,
        re.IGNORECASE,
    )
    if not match:
        return None
    raw = (match.group(1) or match.group(2) or "").replace(",", "")
    try:
        return round(float(raw), 2)
    except ValueError:
        return None


def summarize_items(items: list[TripItem]) -> dict[str, Any]:
    by_status = {status: 0 for status in sorted(ITEM_STATUSES)}
    by_type = {item_type: 0 for item_type in sorted(ITEM_TYPES)}
    for item in items:
        by_status[item.status] = by_status.get(item.status, 0) + 1
        by_type[item.item_type] = by_type.get(item.item_type, 0) + 1
    return {
        "total": len(items),
        "by_status": by_status,
        "by_type": by_type,
    }


def normalize_database_url(database_url: str) -> str:
    value = database_url.strip()
    if not value:
        return ""
    if value.startswith("postgresql+psycopg://"):
        value = "postgresql://" + value.removeprefix("postgresql+psycopg://")
    if value.startswith("postgres+psycopg://"):
        value = "postgresql://" + value.removeprefix("postgres+psycopg://")
    if value.startswith("postgres://"):
        value = "postgresql://" + value.removeprefix("postgres://")

    parts = urlsplit(value)
    if parts.scheme not in {"postgresql", "postgres"}:
        return value

    query = dict(parse_qsl(parts.query, keep_blank_values=True))
    query.setdefault("sslmode", "require")
    query.setdefault("connect_timeout", "8")
    return urlunsplit((parts.scheme, parts.netloc, parts.path, urlencode(query), parts.fragment))


def database_url_summary(database_url: str) -> str:
    parts = urlsplit(database_url)
    host = parts.hostname or "unknown-host"
    port = f":{parts.port}" if parts.port else ""
    database = parts.path.lstrip("/") or "unknown-db"
    return f"{parts.scheme}://{host}{port}/{database}"


class PostgresTripStore:
    def __init__(self, database_url: str, min_size: int = 0, max_size: int = 5) -> None:
        normalized_url = normalize_database_url(database_url)
        if not normalized_url:
            raise TripConfigError("DATABASE_URL is required for trip persistence.")
        self._database_url = normalized_url
        self._database_summary = database_url_summary(normalized_url)
        try:
            with psycopg.connect(
                normalized_url,
                autocommit=True,
                row_factory=dict_row,
            ):
                pass
        except Exception as exc:
            raise TripConnectionError(
                f"Could not connect to Postgres at {self._database_summary}: {exc}"
            ) from exc

        self._pool = NullConnectionPool(
            conninfo=normalized_url,
            min_size=min_size,
            max_size=max_size,
            kwargs={"autocommit": True, "row_factory": dict_row},
            timeout=8,
            open=False,
        )
        self._pool.open()
        self._schema_ready = False

    def close(self) -> None:
        self._pool.close()

    def ensure_schema(self) -> None:
        if self._schema_ready:
            return
        with self._pool.connection() as conn:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS trips (
                    id TEXT PRIMARY KEY,
                    title TEXT NOT NULL,
                    destination TEXT,
                    start_date TEXT,
                    end_date TEXT,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                )
                """
            )
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS trip_items (
                    id TEXT PRIMARY KEY,
                    trip_id TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
                    raw_content TEXT NOT NULL,
                    normalized_raw_content TEXT NOT NULL,
                    item_type TEXT NOT NULL,
                    status TEXT NOT NULL,
                    source_label TEXT,
                    title TEXT,
                    day_label TEXT,
                    date_note TEXT,
                    price_note TEXT,
                    location_note TEXT,
                    notes TEXT,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    UNIQUE (trip_id, normalized_raw_content)
                )
                """
            )
            conn.execute(
                "CREATE INDEX IF NOT EXISTS idx_trip_items_trip_status ON trip_items(trip_id, status)"
            )
        self._schema_ready = True

    def create_trip(
        self,
        title: str,
        destination: str | None = None,
        start_date: str | None = None,
        end_date: str | None = None,
    ) -> Trip:
        title = title.strip()
        if not title:
            raise TripValidationError("trip title is required.")
        now = utc_now()
        trip = Trip(
            id=str(uuid4()),
            title=title,
            destination=_clean_optional(destination),
            start_date=_clean_optional(start_date),
            end_date=_clean_optional(end_date),
            created_at=now,
            updated_at=now,
        )
        self.ensure_schema()
        with self._pool.connection() as conn:
            conn.execute(
                """
                INSERT INTO trips (id, title, destination, start_date, end_date, created_at, updated_at)
                VALUES (%(id)s, %(title)s, %(destination)s, %(start_date)s, %(end_date)s, %(created_at)s, %(updated_at)s)
                """,
                trip_to_dict(trip),
            )
        return trip

    def get_trip(self, trip_id: str) -> Trip:
        self.ensure_schema()
        with self._pool.connection() as conn:
            row = conn.execute("SELECT * FROM trips WHERE id = %s", (trip_id,)).fetchone()
        if row is None:
            raise TripNotFoundError(f"trip not found: {trip_id}")
        return Trip(**row)

    def add_item(
        self,
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
    ) -> tuple[TripItem, bool]:
        raw_content = raw_content.strip()
        if not raw_content:
            raise TripValidationError("raw_content is required.")
        self.get_trip(trip_id)
        detected_type = (item_type or classify_trip_item(raw_content)).strip().lower()
        if detected_type not in ITEM_TYPES:
            raise TripValidationError(f"item_type must be one of: {', '.join(sorted(ITEM_TYPES))}")
        normalized = normalize_raw_content(raw_content)
        now = utc_now()
        item = TripItem(
            id=str(uuid4()),
            trip_id=trip_id,
            raw_content=raw_content,
            normalized_raw_content=normalized,
            item_type=detected_type,
            status="inbox",
            source_label=_clean_optional(source_label),
            title=_clean_optional(title),
            day_label=_clean_optional(day_label),
            date_note=_clean_optional(date_note),
            price_note=_clean_optional(price_note),
            location_note=_clean_optional(location_note),
            notes=_clean_optional(notes),
            created_at=now,
            updated_at=now,
        )
        try:
            with self._pool.connection() as conn:
                conn.execute(
                    """
                    INSERT INTO trip_items (
                        id, trip_id, raw_content, normalized_raw_content, item_type, status,
                        source_label, title, day_label, date_note, price_note, location_note,
                        notes, created_at, updated_at
                    )
                    VALUES (
                        %(id)s, %(trip_id)s, %(raw_content)s, %(normalized_raw_content)s,
                        %(item_type)s, %(status)s, %(source_label)s, %(title)s, %(day_label)s,
                        %(date_note)s, %(price_note)s, %(location_note)s, %(notes)s,
                        %(created_at)s, %(updated_at)s
                    )
                    """,
                    item_to_dict(item),
                )
            return item, False
        except errors.UniqueViolation:
            return self.get_item_by_normalized_content(trip_id, normalized), True

    def get_item(self, item_id: str) -> TripItem:
        self.ensure_schema()
        with self._pool.connection() as conn:
            row = conn.execute("SELECT * FROM trip_items WHERE id = %s", (item_id,)).fetchone()
        if row is None:
            raise TripNotFoundError(f"trip item not found: {item_id}")
        return TripItem(**row)

    def get_item_by_normalized_content(self, trip_id: str, normalized: str) -> TripItem:
        self.ensure_schema()
        with self._pool.connection() as conn:
            row = conn.execute(
                """
                SELECT * FROM trip_items
                WHERE trip_id = %s AND normalized_raw_content = %s
                """,
                (trip_id, normalized),
            ).fetchone()
        if row is None:
            raise TripNotFoundError("deduped trip item could not be reloaded.")
        return TripItem(**row)

    def list_items(self, trip_id: str, status: str | None = None) -> list[TripItem]:
        self.get_trip(trip_id)
        params: tuple[str, ...]
        sql = "SELECT * FROM trip_items WHERE trip_id = %s"
        params = (trip_id,)
        if status is not None:
            sql += " AND status = %s"
            params = (trip_id, validate_status(status))
        sql += " ORDER BY created_at ASC, id ASC"
        with self._pool.connection() as conn:
            rows = conn.execute(sql, params).fetchall()
        return [TripItem(**row) for row in rows]

    def update_item_status(
        self,
        item_id: str,
        status: str,
        day_label: str | None = None,
        notes: str | None = None,
    ) -> TripItem:
        new_status = validate_status(status)
        now = utc_now()
        self.ensure_schema()
        with self._pool.connection() as conn:
            row = conn.execute(
                """
                UPDATE trip_items
                SET status = %s,
                    day_label = COALESCE(%s, day_label),
                    notes = COALESCE(%s, notes),
                    updated_at = %s
                WHERE id = %s
                RETURNING *
                """,
                (new_status, _clean_optional(day_label), _clean_optional(notes), now, item_id),
            ).fetchone()
        if row is None:
            raise TripNotFoundError(f"trip item not found: {item_id}")
        return TripItem(**row)


class InMemoryTripStore:
    def __init__(self) -> None:
        self.trips: dict[str, Trip] = {}
        self.items: dict[str, TripItem] = {}

    def create_trip(
        self,
        title: str,
        destination: str | None = None,
        start_date: str | None = None,
        end_date: str | None = None,
    ) -> Trip:
        title = title.strip()
        if not title:
            raise TripValidationError("trip title is required.")
        now = utc_now()
        trip = Trip(str(uuid4()), title, destination, start_date, end_date, now, now)
        self.trips[trip.id] = trip
        return trip

    def get_trip(self, trip_id: str) -> Trip:
        try:
            return self.trips[trip_id]
        except KeyError as exc:
            raise TripNotFoundError(f"trip not found: {trip_id}") from exc

    def add_item(self, trip_id: str, raw_content: str, **kwargs: Any) -> tuple[TripItem, bool]:
        self.get_trip(trip_id)
        raw_content = raw_content.strip()
        if not raw_content:
            raise TripValidationError("raw_content is required.")
        normalized = normalize_raw_content(raw_content)
        for item in self.items.values():
            if item.trip_id == trip_id and item.normalized_raw_content == normalized:
                return item, True
        now = utc_now()
        item_type = kwargs.get("item_type") or classify_trip_item(raw_content)
        if item_type not in ITEM_TYPES:
            raise TripValidationError(f"item_type must be one of: {', '.join(sorted(ITEM_TYPES))}")
        item = TripItem(
            id=str(uuid4()),
            trip_id=trip_id,
            raw_content=raw_content,
            normalized_raw_content=normalized,
            item_type=item_type,
            status="inbox",
            source_label=_clean_optional(kwargs.get("source_label")),
            title=_clean_optional(kwargs.get("title")),
            day_label=_clean_optional(kwargs.get("day_label")),
            date_note=_clean_optional(kwargs.get("date_note")),
            price_note=_clean_optional(kwargs.get("price_note")),
            location_note=_clean_optional(kwargs.get("location_note")),
            notes=_clean_optional(kwargs.get("notes")),
            created_at=now,
            updated_at=now,
        )
        self.items[item.id] = item
        return item, False

    def get_item(self, item_id: str) -> TripItem:
        try:
            return self.items[item_id]
        except KeyError as exc:
            raise TripNotFoundError(f"trip item not found: {item_id}") from exc

    def list_items(self, trip_id: str, status: str | None = None) -> list[TripItem]:
        self.get_trip(trip_id)
        if status is not None:
            status = validate_status(status)
        return [
            item
            for item in self.items.values()
            if item.trip_id == trip_id and (status is None or item.status == status)
        ]

    def update_item_status(
        self,
        item_id: str,
        status: str,
        day_label: str | None = None,
        notes: str | None = None,
    ) -> TripItem:
        item = self.get_item(item_id)
        now = utc_now()
        updated = TripItem(
            **{
                **item_to_dict(item),
                "status": validate_status(status),
                "day_label": _clean_optional(day_label) or item.day_label,
                "notes": _clean_optional(notes) or item.notes,
                "updated_at": now,
            }
        )
        self.items[item_id] = updated
        return updated


class FileTripStore(InMemoryTripStore):
    def __init__(self, file_path: str) -> None:
        super().__init__()
        if not file_path.strip():
            raise TripConfigError("TRIP_STORE_FILE_PATH is required for file trip persistence.")
        path = Path(file_path).expanduser()
        self._file_path = path
        self._lock = threading.RLock()
        self._load()

    def _load(self) -> None:
        with self._lock:
            if not self._file_path.exists():
                self.trips = {}
                self.items = {}
                return
            try:
                data = json.loads(self._file_path.read_text(encoding="utf-8"))
                self.trips = {
                    trip["id"]: Trip(**trip)
                    for trip in data.get("trips", [])
                    if isinstance(trip, dict) and trip.get("id")
                }
                self.items = {
                    item["id"]: TripItem(**item)
                    for item in data.get("items", [])
                    if isinstance(item, dict) and item.get("id")
                }
            except (OSError, TypeError, ValueError) as exc:
                raise TripConfigError(
                    f"Could not load file trip store at {self._file_path}: {exc}"
                ) from exc

    def _save(self) -> None:
        with self._lock:
            self._file_path.parent.mkdir(parents=True, exist_ok=True)
            payload = {
                "trips": [trip_to_dict(trip) for trip in self.trips.values()],
                "items": [item_to_dict(item) for item in self.items.values()],
            }
            temp_path = self._file_path.parent / f".{self._file_path.name}.{uuid4().hex}.tmp"
            try:
                temp_path.write_text(json.dumps(payload, indent=2, sort_keys=True), encoding="utf-8")
                temp_path.replace(self._file_path)
            except OSError as exc:
                raise TripStoreError(
                    f"Could not save file trip store at {self._file_path}: {exc}"
                ) from exc

    def get_trip(self, trip_id: str) -> Trip:
        with self._lock:
            self._load()
            return super().get_trip(trip_id)

    def get_item(self, item_id: str) -> TripItem:
        with self._lock:
            self._load()
            return super().get_item(item_id)

    def list_items(self, trip_id: str, status: str | None = None) -> list[TripItem]:
        with self._lock:
            self._load()
            return super().list_items(trip_id, status)

    def create_trip(
        self,
        title: str,
        destination: str | None = None,
        start_date: str | None = None,
        end_date: str | None = None,
    ) -> Trip:
        with self._lock:
            self._load()
            trip = super().create_trip(title, destination, start_date, end_date)
            self._save()
            return trip

    def add_item(self, trip_id: str, raw_content: str, **kwargs: Any) -> tuple[TripItem, bool]:
        with self._lock:
            self._load()
            item, deduped = super().add_item(trip_id, raw_content, **kwargs)
            if not deduped:
                self._save()
            return item, deduped

    def update_item_status(
        self,
        item_id: str,
        status: str,
        day_label: str | None = None,
        notes: str | None = None,
    ) -> TripItem:
        with self._lock:
            self._load()
            item = super().update_item_status(item_id, status, day_label, notes)
            self._save()
            return item
