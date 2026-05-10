import pytest
import json

from mcp_servers import travel_agent_server
from services.trips import FileTripStore, InMemoryTripStore


@pytest.fixture()
def trip_store(monkeypatch: pytest.MonkeyPatch) -> InMemoryTripStore:
    store = InMemoryTripStore()
    monkeypatch.setattr(travel_agent_server, "get_trip_store", lambda: store)
    return store


def test_create_trip_tool_returns_stable_trip_id(trip_store: InMemoryTripStore) -> None:
    result = travel_agent_server.create_trip("Tokyo", destination="Tokyo")

    assert result.isError is not True
    assert result.structuredContent["trip"]["id"]
    assert result.structuredContent["trip"]["title"] == "Tokyo"
    assert trip_store.get_trip(result.structuredContent["trip"]["id"]).destination == "Tokyo"


def test_add_trip_item_tool_returns_inbox_widget_shape(trip_store: InMemoryTripStore) -> None:
    trip = trip_store.create_trip("Barcelona")

    result = travel_agent_server.add_trip_item(
        trip.id,
        "Booking.com hotel near Gracia",
        source_label="Booking",
        title="Gracia hotel",
    )

    assert result.isError is not True
    assert result.structuredContent["trip"]["id"] == trip.id
    assert result.structuredContent["deduped"] is False
    assert result.structuredContent["item"]["item_type"] == "hotel"
    assert result.structuredContent["items"][0]["status"] == "inbox"


def test_add_trip_item_tool_marks_duplicates(trip_store: InMemoryTripStore) -> None:
    trip = trip_store.create_trip("Lisbon")
    first = travel_agent_server.add_trip_item(trip.id, "https://example.com/train/")
    second = travel_agent_server.add_trip_item(trip.id, "example.com/train")

    assert first.structuredContent["item"]["id"] == second.structuredContent["item"]["id"]
    assert second.structuredContent["deduped"] is True


def test_board_tool_groups_items_by_status(trip_store: InMemoryTripStore) -> None:
    trip = trip_store.create_trip("London")
    hotel = travel_agent_server.add_trip_item(trip.id, "Hotel near Soho").structuredContent["item"]
    activity = travel_agent_server.add_trip_item(
        trip.id,
        "British Museum visit",
        day_label="Day 1",
    ).structuredContent["item"]
    travel_agent_server.update_trip_item_status(hotel["id"], "booked")
    travel_agent_server.update_trip_item_status(activity["id"], "shortlisted")

    result = travel_agent_server.get_trip_board(trip.id)

    assert result.isError is not True
    assert result.structuredContent["lanes"]["booked"][0]["id"] == hotel["id"]
    assert result.structuredContent["lanes"]["shortlisted"][0]["id"] == activity["id"]
    assert result.structuredContent["lanes"]["itinerary_draft"][0]["id"] == activity["id"]


def test_render_trip_board_matches_data_tool_payload(trip_store: InMemoryTripStore) -> None:
    trip = trip_store.create_trip("London")
    hotel = travel_agent_server.add_trip_item(trip.id, "Hotel near Soho").structuredContent["item"]
    travel_agent_server.update_trip_item_status(hotel["id"], "booked")

    data_result = travel_agent_server.get_trip_board(trip.id)
    render_result = travel_agent_server.render_trip_board(trip.id)

    assert data_result.isError is not True
    assert render_result.isError is not True
    assert render_result.structuredContent == data_result.structuredContent
    assert render_result.content[0].text == "Rendered trip board for London."


def test_itinerary_tool_groups_items_by_day(trip_store: InMemoryTripStore) -> None:
    trip = trip_store.create_trip("Rome")
    activity = travel_agent_server.add_trip_item(
        trip.id,
        "Colosseum tour",
        day_label="Day 1 morning",
        title="Colosseum Tour",
    ).structuredContent["item"]
    dinner = travel_agent_server.add_trip_item(
        trip.id,
        "Dinner in Trastevere",
        day_label="Day 1 evening",
        title="Dinner",
    ).structuredContent["item"]
    travel_agent_server.update_trip_item_status(activity["id"], "shortlisted")
    travel_agent_server.update_trip_item_status(dinner["id"], "shortlisted")

    result = travel_agent_server.get_trip_itinerary(trip.id)

    assert result.isError is not True
    assert result.structuredContent["days"][0]["label"] == "Day 1"
    assert result.structuredContent["days"][0]["items"][0]["id"] == activity["id"]
    assert result.structuredContent["days"][0]["items"][0]["schedule_label"] == "Morning"
    assert result.structuredContent["days"][0]["items"][1]["id"] == dinner["id"]
    assert result.structuredContent["counts"]["scheduled"] == 2


def test_budget_tool_tracks_priced_items_and_target(trip_store: InMemoryTripStore) -> None:
    trip = trip_store.create_trip("Rome")
    flight = travel_agent_server.add_trip_item(
        trip.id,
        "Ryanair BCN-FCO May 25, EUR 47/person",
        title="Ryanair BCN-FCO",
    ).structuredContent["item"]
    hotel = travel_agent_server.add_trip_item(
        trip.id,
        "Hotel Lancelot near Termini, EUR 95/night",
        title="Hotel Lancelot",
    ).structuredContent["item"]
    travel_agent_server.add_trip_item(trip.id, "Budget target EUR 1500", item_type="constraint")
    travel_agent_server.update_trip_item_status(flight["id"], "shortlisted")
    travel_agent_server.update_trip_item_status(hotel["id"], "shortlisted")

    result = travel_agent_server.get_trip_budget(trip.id)

    assert result.isError is not True
    assert result.structuredContent["target"] == 1500
    assert result.structuredContent["spent"] == 142
    assert result.structuredContent["remaining"] == 1358
    assert result.structuredContent["counts"]["priced_items"] == 2


def test_budget_tool_applies_party_and_nightly_multipliers(
    trip_store: InMemoryTripStore,
) -> None:
    trip = trip_store.create_trip(
        "Rome",
        destination="Rome",
        start_date="2026-05-25",
        end_date="2026-06-01",
    )
    travel_agent_server.add_trip_item(trip.id, "Plan for 2 adults and 1 kid")
    flight = travel_agent_server.add_trip_item(
        trip.id,
        "Ryanair BCN-FCO EUR 47/person",
        title="Ryanair BCN-FCO",
    ).structuredContent["item"]
    hotel = travel_agent_server.add_trip_item(
        trip.id,
        "Hotel Lancelot EUR 95/night",
        title="Hotel Lancelot",
    ).structuredContent["item"]
    travel_agent_server.update_trip_item_status(flight["id"], "shortlisted")
    travel_agent_server.update_trip_item_status(hotel["id"], "shortlisted")

    result = travel_agent_server.get_trip_budget(trip.id)

    assert result.isError is not True
    assert result.structuredContent["spent"] == 806
    assert result.structuredContent["counts"]["party_size"] == 3
    assert result.structuredContent["counts"]["nights"] == 7


def test_trip_summary_reports_counts_and_missing_pieces(trip_store: InMemoryTripStore) -> None:
    trip = trip_store.create_trip("Madrid")
    travel_agent_server.add_trip_item(trip.id, "Dinner at Sobrino de Botin")

    result = travel_agent_server.get_trip_summary(trip.id)

    assert result.isError is not True
    assert result.structuredContent["counts"]["total"] == 1
    assert "Stay is not booked yet." in result.structuredContent["missing_pieces"]


def test_prepare_trip_clarification_returns_intent_specific_questions(
    trip_store: InMemoryTripStore,
) -> None:
    trip = travel_agent_server.prepare_trip_clarification(
        utterance="I want to plan a trip to Venice",
        known_fields_json="{}",
    )
    hotel = travel_agent_server.prepare_trip_clarification(
        utterance="I want to book hotel in Paris",
        known_fields_json="{}",
    )
    flight = travel_agent_server.prepare_trip_clarification(
        utterance="I want to book fly to Tokyo",
        known_fields_json="{}",
    )

    assert trip.structuredContent["intent"] == "plan_trip"
    assert trip.structuredContent["destination"] == "Venice"
    assert [question["id"] for question in trip.structuredContent["questions"]] == [
        "duration",
        "travel_style",
        "timing",
    ]
    assert hotel.structuredContent["intent"] == "book_hotel"
    assert hotel.structuredContent["destination"] == "Paris"
    assert hotel.structuredContent["questions"][0]["id"] == "hotel_dates"
    assert flight.structuredContent["intent"] == "book_flight"
    assert flight.structuredContent["destination"] == "Tokyo"
    assert flight.structuredContent["questions"][0]["id"] == "origin"


def test_trip_clarification_omits_known_fields_and_existing_trip_state(
    monkeypatch: pytest.MonkeyPatch,
    trip_store: InMemoryTripStore,
) -> None:
    trip = trip_store.create_trip(
        "Venice Trip",
        destination="Venice",
        start_date="2026-06-01",
        end_date="2026-06-04",
    )
    trip_store.add_item(trip.id, "Hotel Ala confirmed", item_type="hotel", title="Hotel Ala")

    def fail_list_items(*_args, **_kwargs):
        raise AssertionError("prepare_trip_clarification should use aggregate item counts")

    monkeypatch.setattr(trip_store, "list_items", fail_list_items)

    result = travel_agent_server.prepare_trip_clarification(
        utterance="I want to plan a trip to Venice",
        intent="plan_trip",
        trip_id=trip.id,
        known_fields_json=json.dumps({"travel_style": "food"}),
    )
    question_ids = [question["id"] for question in result.structuredContent["questions"]]

    assert result.structuredContent["destination"] == "Venice"
    assert result.structuredContent["known_fields"]["has_hotel"] is True
    assert result.structuredContent["known_fields"]["travel_style"] == "food"
    assert "duration" not in question_ids
    assert "travel_style" not in question_ids


def test_trip_clarification_preserves_known_fields_without_trip(
    trip_store: InMemoryTripStore,
) -> None:
    result = travel_agent_server.prepare_trip_clarification(
        utterance="I want to plan a trip to Lisbon",
        intent="plan_trip",
        known_fields_json=json.dumps({"start_date": "2026-06-01", "travel_style": "food"}),
    )
    question_ids = [question["id"] for question in result.structuredContent["questions"]]

    assert result.structuredContent["destination"] == "Lisbon"
    assert result.structuredContent["known_fields"]["start_date"] == "2026-06-01"
    assert result.structuredContent["known_fields"]["travel_style"] == "food"
    assert "duration" not in question_ids
    assert "travel_style" not in question_ids


def test_render_and_submit_trip_clarification(trip_store: InMemoryTripStore) -> None:
    rendered = travel_agent_server.render_trip_clarification(
        utterance="I want to book hotel in Paris",
        known_fields_json="{}",
    )
    session = rendered.structuredContent

    assert rendered.isError is not True
    assert rendered.content[0].text == "Opened 3 clarification question(s) for Paris."

    submitted = travel_agent_server.submit_trip_clarification(
        session_json=json.dumps(session),
        answers_json=json.dumps(
            {
                "hotel_dates": "3-4 nights",
                "hotel_area": "central",
                "hotel_budget": "120-220",
            }
        ),
    )

    assert submitted.structuredContent["recommended_next_action"] == "save_hotel_request"
    assert submitted.structuredContent["resolved_fields"] == {
        "hotel_dates": "3-4 nights",
        "hotel_area": "central",
        "hotel_budget": "120-220",
    }
    assert submitted.structuredContent["remaining_fields"] == []
    assert submitted.structuredContent["trip_draft"] == {
        "title": "Paris trip",
        "destination": "Paris",
        "start_date": None,
        "end_date": None,
    }
    assert submitted.structuredContent["trip_item_draft"]["item_type"] == "hotel"
    assert submitted.structuredContent["next_tool_calls"] == [
        {
            "name": "create_trip",
            "arguments": {
                "title": "Paris trip",
                "destination": "Paris",
                "start_date": None,
                "end_date": None,
            },
        }
    ]
    assert submitted.meta == {"openai/closeWidget": True}


def test_submit_trip_clarification_accepts_direct_tool_inputs(
    trip_store: InMemoryTripStore,
) -> None:
    result = travel_agent_server.submit_trip_clarification(
        utterance="I want to plan a trip to Porto",
        intent="plan_trip",
        known_fields_json=json.dumps({"start_date": "2026-07-01"}),
        answers_json=json.dumps({"travel_style": "food"}),
    )

    assert result.isError is not True
    assert result.structuredContent["recommended_next_action"] == "create_trip"
    assert result.structuredContent["next_tool_calls"][0]["name"] == "create_trip"
    assert result.structuredContent["next_tool_calls"][0]["arguments"]["destination"] == "Porto"


def test_submit_trip_clarification_rejects_invalid_payload(
    trip_store: InMemoryTripStore,
) -> None:
    result = travel_agent_server.submit_trip_clarification(
        session_json="[]",
        answers_json="{}",
    )

    assert result.isError is True
    assert result.structuredContent == {"error": "session_json must be a JSON object."}


def test_submit_trip_clarification_rejects_tampered_session(
    trip_store: InMemoryTripStore,
) -> None:
    rendered = travel_agent_server.render_trip_clarification(
        utterance="I want to book hotel in Paris",
        known_fields_json="{}",
    )
    session = rendered.structuredContent
    session["questions"][0]["required"] = True

    result = travel_agent_server.submit_trip_clarification(
        session_json=json.dumps(session),
        answers_json=json.dumps({"hotel_dates": "3-4 nights"}),
    )

    assert result.isError is True
    assert result.structuredContent == {
        "error": "session_json questions do not match the generated clarification session."
    }


def test_submit_trip_clarification_rejects_unknown_answer_ids(
    trip_store: InMemoryTripStore,
) -> None:
    rendered = travel_agent_server.render_trip_clarification(
        utterance="I want to plan a trip to Porto",
        known_fields_json="{}",
    )

    result = travel_agent_server.submit_trip_clarification(
        session_json=json.dumps(rendered.structuredContent),
        answers_json=json.dumps({"duration": "3-4 days", "fake": "value"}),
    )

    assert result.isError is True
    assert result.structuredContent == {
        "error": "answers_json includes answers for unknown questions."
    }


def test_submit_trip_clarification_rejects_oversized_json(
    trip_store: InMemoryTripStore,
) -> None:
    result = travel_agent_server.submit_trip_clarification(
        session_json="{}",
        answers_json=json.dumps({"answer": "x" * 13_000}),
    )

    assert result.isError is True
    assert result.structuredContent == {
        "error": "answers_json may be at most 12000 characters."
    }


def test_tool_returns_clear_error_when_database_url_missing(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(travel_agent_server, "_STORE", None)
    monkeypatch.setattr(
        travel_agent_server,
        "get_settings",
        lambda: type("Settings", (), {"trip_store_backend": "postgres", "trip_database_url": ""})(),
    )

    result = travel_agent_server.create_trip("Rome")

    assert result.isError is True
    assert result.structuredContent == {"error": "DATABASE_URL is required for trip persistence."}


def test_tool_uses_file_store_backend_when_configured(
    monkeypatch: pytest.MonkeyPatch,
    tmp_path,
) -> None:
    monkeypatch.setattr(travel_agent_server, "_STORE", None)
    monkeypatch.setattr(
        travel_agent_server,
        "get_settings",
        lambda: type(
            "Settings",
            (),
            {
                "trip_store_backend": "file",
                "trip_store_file_path": str(tmp_path / "trips.json"),
                "trip_database_url": "",
            },
        )(),
    )

    result = travel_agent_server.create_trip("Rome")

    assert result.isError is not True
    assert isinstance(travel_agent_server.get_trip_store(), FileTripStore)


def test_tool_returns_mcp_error_for_store_connection_failure(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    def fail_store():
        raise RuntimeError("could not connect to Postgres")

    monkeypatch.setattr(travel_agent_server, "get_trip_store", fail_store)

    result = travel_agent_server.create_trip("Rome")

    assert result.isError is True
    assert result.structuredContent == {
        "error": "Trip persistence failed: could not connect to Postgres"
    }


def test_unified_server_registers_every_tool_output_template() -> None:
    templates = {
        "ui://trip/inbox-v2.html": travel_agent_server.trip_inbox_ui,
        "ui://trip/board-v2.html": travel_agent_server.trip_board_ui,
        "ui://trip/itinerary-v1.html": travel_agent_server.trip_itinerary_ui,
        "ui://trip/budget-v1.html": travel_agent_server.trip_budget_ui,
        "ui://trip/clarification-v1.html": travel_agent_server.trip_clarification_ui,
    }

    for uri, read_resource in templates.items():
        html = read_resource()

        assert html.startswith("<!doctype html>"), uri
        assert "window.openai?.toolOutput" in html, uri
