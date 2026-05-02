import os

import pytest

from services.trips import (
    FileTripStore,
    InMemoryTripStore,
    TripConfigError,
    TripNotFoundError,
    TripValidationError,
    build_board,
    classify_trip_item,
    database_url_summary,
    normalize_database_url,
    normalize_raw_content,
)


def test_normalizes_raw_content_for_dedupe() -> None:
    assert normalize_raw_content(" HTTPS://Example.com/Hotel/  ") == "example.com/hotel"


def test_normalizes_database_url_for_psycopg() -> None:
    assert (
        normalize_database_url("postgresql+psycopg://user:pass@example.com/app")
        == "postgresql://user:pass@example.com/app?sslmode=require&connect_timeout=8"
    )
    assert (
        normalize_database_url("postgres://user:pass@example.com/app?sslmode=require")
        == "postgresql://user:pass@example.com/app?sslmode=require&connect_timeout=8"
    )


def test_database_url_summary_redacts_credentials() -> None:
    assert (
        database_url_summary("postgresql://user:secret@example.com:6543/app?sslmode=require")
        == "postgresql://example.com:6543/app"
    )


@pytest.mark.parametrize(
    ("raw_content", "expected_type"),
    [
        ("Flight BCN to Tokyo on Iberia", "flight"),
        ("Booking.com hotel option near Shibuya", "hotel"),
        ("Dinner reservation at Narisawa", "restaurant"),
        ("Should we buy train tickets now?", "transport"),
        ("Need to keep budget under 2500", "constraint"),
        ("Visit the Mori Art Museum", "activity"),
    ],
)
def test_classifies_common_trip_fragments(raw_content: str, expected_type: str) -> None:
    assert classify_trip_item(raw_content) == expected_type


def test_store_creates_trip_and_dedupes_items_by_normalized_raw_content() -> None:
    store = InMemoryTripStore()
    trip = store.create_trip("Tokyo", destination="Tokyo")

    first, first_deduped = store.add_item(
        trip.id,
        "https://booking.com/hotel/example/",
        source_label="Booking",
        title="Hotel example",
    )
    second, second_deduped = store.add_item(trip.id, "booking.com/hotel/example")

    assert first_deduped is False
    assert second_deduped is True
    assert second.id == first.id
    assert first.item_type == "hotel"
    assert store.list_items(trip.id, "inbox") == [first]


def test_file_store_persists_trip_items_across_store_instances(tmp_path) -> None:
    path = tmp_path / "trips.json"
    store = FileTripStore(str(path))
    trip = store.create_trip("Tokyo", destination="Tokyo")
    item, deduped = store.add_item(
        trip.id,
        "https://booking.com/hotel/example/",
        source_label="Booking",
        title="Hotel example",
    )
    store.update_item_status(item.id, "shortlisted", day_label="Day 1")

    reloaded = FileTripStore(str(path))
    duplicate, duplicate_deduped = reloaded.add_item(trip.id, "booking.com/hotel/example")

    assert deduped is False
    assert duplicate_deduped is True
    assert duplicate.id == item.id
    assert reloaded.get_trip(trip.id).destination == "Tokyo"
    assert reloaded.list_items(trip.id, "shortlisted")[0].day_label == "Day 1"


def test_store_rejects_empty_trip_title_and_content() -> None:
    store = InMemoryTripStore()

    with pytest.raises(TripValidationError, match="trip title"):
        store.create_trip("  ")

    trip = store.create_trip("Barcelona")
    with pytest.raises(TripValidationError, match="raw_content"):
        store.add_item(trip.id, " ")


def test_store_updates_status_and_builds_board_lanes() -> None:
    store = InMemoryTripStore()
    trip = store.create_trip("Lisbon")
    hotel, _ = store.add_item(trip.id, "Hotel option near Alfama")
    activity, _ = store.add_item(trip.id, "Visit MAAT museum", day_label="Day 2")
    question, _ = store.add_item(trip.id, "Should we rent a car?")

    booked = store.update_item_status(hotel.id, "booked")
    shortlisted = store.update_item_status(activity.id, "shortlisted")
    needs_review = store.update_item_status(question.id, "needs_review")
    board = build_board(trip, [booked, shortlisted, needs_review])

    assert board["lanes"]["booked"][0]["id"] == hotel.id
    assert board["lanes"]["shortlisted"][0]["id"] == activity.id
    assert board["lanes"]["itinerary_draft"][0]["id"] == activity.id
    assert board["lanes"]["open_decisions"][0]["id"] == question.id
    assert "Transport is not booked yet." in board["lanes"]["missing_pieces"]


def test_store_raises_for_unknown_ids_and_invalid_status() -> None:
    store = InMemoryTripStore()
    trip = store.create_trip("Paris")
    item, _ = store.add_item(trip.id, "Museum pass")

    with pytest.raises(TripNotFoundError):
        store.list_items("missing-trip")

    with pytest.raises(TripValidationError, match="status"):
        store.update_item_status(item.id, "maybe")


def test_postgres_store_requires_database_url() -> None:
    from services.trips import PostgresTripStore

    with pytest.raises(TripConfigError, match="DATABASE_URL"):
        PostgresTripStore("")


@pytest.mark.skipif(
    not os.getenv("DATABASE_URL"),
    reason="DATABASE_URL is required for Postgres integration coverage",
)
def test_postgres_store_persists_trip_items_across_store_instances() -> None:
    from services.trips import PostgresTripStore

    database_url = os.environ["DATABASE_URL"]
    store = PostgresTripStore(database_url)
    reloaded_store = PostgresTripStore(database_url)
    trip_id = ""
    try:
        trip = store.create_trip("Integration Test Trip", destination="Test City")
        trip_id = trip.id
        item, deduped = store.add_item(trip.id, "https://example.com/hotel/integration")
        duplicate, duplicate_deduped = reloaded_store.add_item(
            trip.id,
            "example.com/hotel/integration",
        )

        assert deduped is False
        assert duplicate_deduped is True
        assert duplicate.id == item.id
        assert reloaded_store.get_trip(trip.id).title == "Integration Test Trip"
        assert reloaded_store.list_items(trip.id, "inbox")[0].id == item.id
    finally:
        if trip_id:
            with store._pool.connection() as conn:
                conn.execute("DELETE FROM trips WHERE id = %s", (trip_id,))
        store.close()
        reloaded_store.close()
