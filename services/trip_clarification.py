from __future__ import annotations

from dataclasses import asdict, dataclass, replace
import re
from typing import Any, Literal

from services.trips import Trip, TripItem

ClarificationIntent = Literal["plan_trip", "book_hotel", "book_flight"]
AnswerType = Literal["single_choice", "multi_choice", "free_text"]
NextAction = Literal[
    "create_trip",
    "save_constraints",
    "save_hotel_request",
    "save_flight_request",
    "ask_followup_text",
]


@dataclass(frozen=True)
class ClarificationOption:
    id: str
    label: str
    value: str
    metadata: dict[str, Any] | None = None


@dataclass(frozen=True)
class ClarificationQuestion:
    id: str
    prompt: str
    required: bool
    answer_type: AnswerType
    options: list[ClarificationOption]
    allow_free_text: bool
    allow_skip: bool
    reason: str | None = None


@dataclass(frozen=True)
class ClarificationSession:
    session_id: str
    intent: ClarificationIntent
    destination: str | None
    current_index: int
    total_questions: int
    known_fields: dict[str, Any]
    questions: list[ClarificationQuestion]
    answers: dict[str, Any]


def build_clarification_session(
    *,
    utterance: str,
    intent: str | None = None,
    destination: str | None = None,
    known_fields: dict[str, Any] | None = None,
    trip: Trip | None = None,
    items: list[TripItem] | None = None,
) -> dict[str, Any]:
    normalized_intent = normalize_intent(intent, utterance)
    resolved_destination = clean(destination) or trip.destination if trip else clean(destination)
    resolved_destination = resolved_destination or infer_destination(utterance)
    resolved_known_fields = compact_record(
        {
            **(known_fields or {}),
            "destination": resolved_destination,
            "start_date": trip.start_date if trip else None,
            "end_date": trip.end_date if trip else None,
            "has_hotel": any(item.item_type == "hotel" for item in items or []) or None,
            "has_transport": any(item.item_type in {"flight", "transport"} for item in items or []) or None,
        }
    )
    questions = questions_for(normalized_intent, resolved_known_fields)[:5]
    session = ClarificationSession(
        session_id=f"clarify-{normalized_intent}-{slug(resolved_destination or 'trip')}",
        intent=normalized_intent,
        destination=resolved_destination,
        current_index=0,
        total_questions=len(questions),
        known_fields=resolved_known_fields,
        questions=questions,
        answers={},
    )
    return session_to_dict(session)


def summarize_clarification(session: dict[str, Any], answers: dict[str, Any]) -> dict[str, Any]:
    questions = session.get("questions")
    if not isinstance(questions, list):
        raise ValueError("session_json must include a questions array.")

    resolved_fields: dict[str, Any] = {}
    remaining_fields: list[str] = []
    for question in questions:
        if not isinstance(question, dict) or not isinstance(question.get("id"), str):
            raise ValueError("session_json questions must contain ids.")

        question_id = question["id"]
        answer = answers.get(question_id)
        if is_empty_answer(answer):
            if question.get("required") is True:
                remaining_fields.append(question_id)
            continue
        resolved_fields[question_id] = answer

    intent = normalize_intent(session.get("intent") if isinstance(session.get("intent"), str) else None, "")
    recommended_next_action = next_action(intent, remaining_fields)
    hydrated_session = {**session, "answers": answers}

    return {
        "session": hydrated_session,
        "resolved_fields": resolved_fields,
        "remaining_fields": remaining_fields,
        "recommended_next_action": recommended_next_action,
        "summary": answer_summary(hydrated_session, resolved_fields, remaining_fields),
    }


def questions_for(intent: ClarificationIntent, known_fields: dict[str, Any]) -> list[ClarificationQuestion]:
    if intent == "book_hotel":
        return hotel_questions(known_fields)
    if intent == "book_flight":
        return flight_questions(known_fields)
    return trip_questions(known_fields)


def trip_questions(known_fields: dict[str, Any]) -> list[ClarificationQuestion]:
    questions: list[ClarificationQuestion | None] = [
        None
        if has_any(known_fields, ["duration", "start_date", "end_date"])
        else ClarificationQuestion(
            id="duration",
            prompt=f"How long are you planning to stay{destination_suffix(known_fields)}?",
            reason="This helps shape the itinerary pace and how much to fit in.",
            required=False,
            answer_type="single_choice",
            options=options("duration", ["1-2 days", "3-4 days", "5-7 days", "1+ weeks"]),
            allow_free_text=True,
            allow_skip=True,
        ),
        None
        if has_any(known_fields, ["travel_style", "interests"])
        else ClarificationQuestion(
            id="travel_style",
            prompt="What's your main travel style?",
            required=False,
            answer_type="single_choice",
            options=[
                ClarificationOption("travel-style-1", "Cultural & sightseeing", "culture"),
                ClarificationOption("travel-style-2", "Food & local experiences", "food"),
                ClarificationOption("travel-style-3", "Relaxation & photography", "relaxed"),
                ClarificationOption("travel-style-4", "Mixed experience", "mixed"),
            ],
            allow_free_text=True,
            allow_skip=True,
        ),
        None
        if has_any(known_fields, ["season", "start_date"])
        else ClarificationQuestion(
            id="timing",
            prompt="When are you thinking of going?",
            required=False,
            answer_type="single_choice",
            options=[
                ClarificationOption("timing-1", "Summer (peak season)", "summer"),
                ClarificationOption("timing-2", "Spring/Fall (shoulder)", "shoulder"),
                ClarificationOption("timing-3", "Winter (quiet)", "winter"),
                ClarificationOption("timing-4", "No preference yet", "no preference"),
            ],
            allow_free_text=True,
            allow_skip=True,
        ),
    ]
    return [question for question in questions if question is not None]


def hotel_questions(known_fields: dict[str, Any]) -> list[ClarificationQuestion]:
    questions: list[ClarificationQuestion | None] = [
        None
        if has_any(known_fields, ["hotel_dates", "start_date", "end_date", "nights"])
        else ClarificationQuestion(
            id="hotel_dates",
            prompt="When do you need the hotel?",
            reason="Dates or nights determine availability and realistic pricing.",
            required=False,
            answer_type="single_choice",
            options=[
                ClarificationOption("hotel-dates-1", "I know exact dates", "exact dates"),
                ClarificationOption("hotel-dates-2", "A weekend", "weekend"),
                ClarificationOption("hotel-dates-3", "3-4 nights", "3-4 nights"),
                ClarificationOption("hotel-dates-4", "Still flexible", "flexible"),
            ],
            allow_free_text=True,
            allow_skip=True,
        ),
        None
        if has_any(known_fields, ["hotel_area", "area", "neighborhood"])
        else ClarificationQuestion(
            id="hotel_area",
            prompt="Which area would you prefer?",
            required=False,
            answer_type="single_choice",
            options=[
                ClarificationOption("hotel-area-1", "Central and walkable", "central"),
                ClarificationOption("hotel-area-2", "Quiet residential", "quiet"),
                ClarificationOption("hotel-area-3", "Near nightlife/restaurants", "nightlife"),
                ClarificationOption("hotel-area-4", "Best value area", "value"),
            ],
            allow_free_text=True,
            allow_skip=True,
        ),
        None
        if has_any(known_fields, ["hotel_budget", "budget"])
        else ClarificationQuestion(
            id="hotel_budget",
            prompt="What's a comfortable nightly budget?",
            required=False,
            answer_type="single_choice",
            options=[
                ClarificationOption("hotel-budget-1", "Under EUR 120/night", "under 120"),
                ClarificationOption("hotel-budget-2", "EUR 120-220/night", "120-220"),
                ClarificationOption("hotel-budget-3", "EUR 220-350/night", "220-350"),
                ClarificationOption("hotel-budget-4", "Flexible for the right place", "flexible"),
            ],
            allow_free_text=True,
            allow_skip=True,
        ),
    ]
    return [question for question in questions if question is not None]


def flight_questions(known_fields: dict[str, Any]) -> list[ClarificationQuestion]:
    questions: list[ClarificationQuestion | None] = [
        None
        if has_any(known_fields, ["origin", "origin_airport"])
        else ClarificationQuestion(
            id="origin",
            prompt="Where are you flying from?",
            reason="Origin airport is the biggest missing piece for flight search.",
            required=False,
            answer_type="single_choice",
            options=options("origin", ["Barcelona", "Madrid", "London", "Not sure yet"]),
            allow_free_text=True,
            allow_skip=True,
        ),
        None
        if has_any(known_fields, ["flight_dates", "start_date", "end_date"])
        else ClarificationQuestion(
            id="flight_dates",
            prompt="How fixed are your travel dates?",
            required=False,
            answer_type="single_choice",
            options=[
                ClarificationOption("flight-dates-1", "Exact dates", "exact"),
                ClarificationOption("flight-dates-2", "Flexible by a few days", "few days flexible"),
                ClarificationOption("flight-dates-3", "Flexible by a month", "month flexible"),
                ClarificationOption("flight-dates-4", "No dates yet", "no dates"),
            ],
            allow_free_text=True,
            allow_skip=True,
        ),
        None
        if has_any(known_fields, ["flight_priority"])
        else ClarificationQuestion(
            id="flight_priority",
            prompt="What should we optimize for?",
            required=False,
            answer_type="single_choice",
            options=[
                ClarificationOption("flight-priority-1", "Lowest price", "price"),
                ClarificationOption("flight-priority-2", "Shortest travel time", "duration"),
                ClarificationOption("flight-priority-3", "Fewer stops", "stops"),
                ClarificationOption("flight-priority-4", "Good arrival time", "arrival"),
            ],
            allow_free_text=True,
            allow_skip=True,
        ),
    ]
    return [question for question in questions if question is not None]


def session_to_dict(session: ClarificationSession) -> dict[str, Any]:
    return asdict(replace(session, questions=session.questions))


def normalize_intent(intent: str | None, utterance: str) -> ClarificationIntent:
    value = clean(intent)
    if value in {"plan_trip", "book_hotel", "book_flight"}:
        return value  # type: ignore[return-value]

    text = utterance.lower()
    if re.search(r"\b(hotel|hostel|airbnb|stay|lodging|accommodation)\b", text):
        return "book_hotel"
    if re.search(r"\b(flight|fly|airport|airline)\b", text):
        return "book_flight"
    return "plan_trip"


def infer_destination(utterance: str) -> str | None:
    match = re.search(r"\b(?:to|in|for)\s+([A-Z][\wÀ-ÿ.' -]{1,60})", utterance)
    if not match:
        return None
    return clean(re.sub(r"[.!?]+$", "", match.group(1)))


def options(prefix: str, labels: list[str]) -> list[ClarificationOption]:
    return [
        ClarificationOption(id=f"{prefix}-{index + 1}", label=label, value=label)
        for index, label in enumerate(labels)
    ]


def has_any(record: dict[str, Any], keys: list[str]) -> bool:
    return any(not is_empty_answer(record.get(key)) for key in keys)


def compact_record(record: dict[str, Any]) -> dict[str, Any]:
    return {key: value for key, value in record.items() if not is_empty_answer(value)}


def destination_suffix(known_fields: dict[str, Any]) -> str:
    destination = known_fields.get("destination")
    return f" in {destination}" if isinstance(destination, str) and destination else ""


def next_action(intent: ClarificationIntent, remaining_fields: list[str]) -> NextAction:
    if remaining_fields:
        return "ask_followup_text"
    if intent == "book_hotel":
        return "save_hotel_request"
    if intent == "book_flight":
        return "save_flight_request"
    return "create_trip"


def answer_summary(
    session: dict[str, Any],
    resolved_fields: dict[str, Any],
    remaining_fields: list[str],
) -> str:
    destination = session.get("destination") if isinstance(session.get("destination"), str) else None
    answered = [
        f"{key}: {', '.join(value) if isinstance(value, list) else value}"
        for key, value in resolved_fields.items()
    ]
    base = f"{destination or 'This trip'} clarification captured"
    if answered:
        base = f"{base} ({'; '.join(answered)})"
    return f"{base}. Still missing: {', '.join(remaining_fields)}." if remaining_fields else f"{base}."


def clean(value: str | None) -> str | None:
    if value is None:
        return None
    stripped = value.strip()
    return stripped or None


def slug(value: str) -> str:
    return re.sub(r"^-|-$", "", re.sub(r"[^a-z0-9]+", "-", value.lower())) or "trip"


def is_empty_answer(value: Any) -> bool:
    return value is None or value == "" or value == "skipped" or value == []
