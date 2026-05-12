from __future__ import annotations

from dataclasses import asdict, dataclass
import re
from typing import Any, Literal

from app.server.services.trips import Trip, TripValidationError

ClarificationIntent = Literal["plan_trip", "book_hotel", "book_flight"]
AnswerType = Literal["single_choice", "multi_choice", "free_text"]
NextAction = Literal[
    "create_trip",
    "save_hotel_request",
    "save_flight_request",
    "ask_followup_text",
]

MAX_QUESTIONS = 5
MAX_OPTIONS_PER_QUESTION = 8
MAX_ANSWER_LENGTH = 280
MAX_ANSWER_LIST_LENGTH = 8


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
    item_type_counts: dict[str, int] | None = None,
) -> dict[str, Any]:
    normalized_intent = normalize_intent(intent, utterance)
    resolved_destination = clean(destination) or (trip.destination if trip else None)
    resolved_destination = resolved_destination or infer_destination(utterance)
    derived_fields = compact_record(
        {
            "destination": resolved_destination,
            "trip_id": trip.id if trip else None,
            "start_date": trip.start_date if trip else None,
            "end_date": trip.end_date if trip else None,
            "has_hotel": has_item_type(item_type_counts, {"hotel"}) or None,
            "has_transport": has_item_type(item_type_counts, {"flight", "transport"}) or None,
        }
    )
    resolved_known_fields = compact_record(
        {
            **(known_fields or {}),
            **derived_fields,
        }
    )
    questions = questions_for(normalized_intent, resolved_known_fields)[:MAX_QUESTIONS]
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
    validate_session(session)
    validate_answers(answers)
    validate_session_matches_generated_questions(session)
    questions = session.get("questions")
    question_ids = {question["id"] for question in questions}
    if any(question_id not in question_ids for question_id in answers):
        raise TripValidationError("answers_json includes answers for unknown questions.")

    resolved_fields: dict[str, Any] = {}
    remaining_fields: list[str] = []
    for question in questions:
        question_id = question["id"]
        answer = answers.get(question_id)
        validate_answer_for_question(question, answer)
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
        "trip_draft": trip_draft(hydrated_session),
        "trip_item_draft": trip_item_draft(hydrated_session, resolved_fields),
        "next_tool_calls": next_tool_calls(hydrated_session, resolved_fields, recommended_next_action),
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
    return asdict(session)


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
    match = re.search(
        r"\b(?:to|in|for)\s+([A-Z][\wÀ-ÿ.' -]{1,60}?)(?=\s+(?:for|from|on|with|between|during|near|under|around)\b|[.!?]|$)",
        utterance,
    )
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


def trip_draft(session: dict[str, Any]) -> dict[str, Any] | None:
    destination = session.get("destination") if isinstance(session.get("destination"), str) else None
    known_fields = session.get("known_fields") if isinstance(session.get("known_fields"), dict) else {}
    if session.get("intent") != "plan_trip" and known_fields.get("trip_id"):
        return None

    title = f"{destination} trip" if destination else "Trip workspace"
    return {
        "title": title,
        "destination": destination,
        "start_date": string_or_none(known_fields.get("start_date")),
        "end_date": string_or_none(known_fields.get("end_date")),
    }


def trip_item_draft(session: dict[str, Any], resolved_fields: dict[str, Any]) -> dict[str, Any] | None:
    intent = session.get("intent")
    if intent not in {"book_hotel", "book_flight"}:
        return None

    destination = session.get("destination") if isinstance(session.get("destination"), str) else None
    item_type = "hotel" if intent == "book_hotel" else "flight"
    title = f"{destination} {item_type} request" if destination else f"{item_type.title()} request"
    return {
        "trip_id": string_or_none((session.get("known_fields") or {}).get("trip_id")) if isinstance(session.get("known_fields"), dict) else None,
        "raw_content": answer_summary(session, resolved_fields, []),
        "item_type": item_type,
        "source_label": "Trip clarification",
        "title": title,
        "notes": "; ".join(
            f"{key}: {', '.join(value) if isinstance(value, list) else value}"
            for key, value in resolved_fields.items()
        ),
    }


def next_tool_calls(
    session: dict[str, Any],
    resolved_fields: dict[str, Any],
    recommended_next_action: NextAction,
) -> list[dict[str, Any]]:
    calls: list[dict[str, Any]] = []
    if recommended_next_action == "create_trip":
        draft = trip_draft(session)
        if draft:
            calls.append({"name": "create_trip", "arguments": draft})
    elif recommended_next_action in {"save_hotel_request", "save_flight_request"}:
        draft = trip_item_draft(session, resolved_fields)
        if draft and draft.get("trip_id"):
            calls.append({"name": "add_trip_item", "arguments": draft})
        elif draft:
            trip = trip_draft(session)
            if trip:
                calls.append({"name": "create_trip", "arguments": trip})
    return calls


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


def string_or_none(value: Any) -> str | None:
    return value if isinstance(value, str) and value else None


def slug(value: str) -> str:
    return re.sub(r"^-|-$", "", re.sub(r"[^a-z0-9]+", "-", value.lower())) or "trip"


def is_empty_answer(value: Any) -> bool:
    return value is None or value == "" or value == "skipped" or value == []


def has_item_type(item_type_counts: dict[str, int] | None, item_types: set[str]) -> bool:
    if not item_type_counts:
        return False
    return any(item_type_counts.get(item_type, 0) > 0 for item_type in item_types)


def validate_session(session: dict[str, Any]) -> None:
    questions = session.get("questions")
    if not isinstance(questions, list):
        raise TripValidationError("session_json must include a questions array.")
    if len(questions) > MAX_QUESTIONS:
        raise TripValidationError(f"session_json may include at most {MAX_QUESTIONS} questions.")
    if session.get("intent") not in {"plan_trip", "book_hotel", "book_flight"}:
        raise TripValidationError("session_json intent is invalid.")

    for question in questions:
        if not isinstance(question, dict) or not isinstance(question.get("id"), str):
            raise TripValidationError("session_json questions must contain ids.")
        if not isinstance(question.get("prompt"), str):
            raise TripValidationError("session_json questions must contain prompts.")
        if question.get("required") not in {True, False}:
            raise TripValidationError("session_json question required values must be booleans.")
        if question.get("answer_type") not in {"single_choice", "multi_choice", "free_text"}:
            raise TripValidationError("session_json question answer_type is invalid.")
        if question.get("allow_free_text") not in {True, False}:
            raise TripValidationError("session_json question allow_free_text values must be booleans.")
        if question.get("allow_skip") not in {True, False}:
            raise TripValidationError("session_json question allow_skip values must be booleans.")
        options_value = question.get("options")
        if not isinstance(options_value, list):
            raise TripValidationError("session_json question options must be arrays.")
        if len(options_value) > MAX_OPTIONS_PER_QUESTION:
            raise TripValidationError(f"session_json questions may include at most {MAX_OPTIONS_PER_QUESTION} options.")
        for option in options_value:
            if not isinstance(option, dict) or not isinstance(option.get("value"), str):
                raise TripValidationError("session_json question options must contain string values.")


def validate_session_matches_generated_questions(session: dict[str, Any]) -> None:
    intent = normalize_intent(session.get("intent") if isinstance(session.get("intent"), str) else None, "")
    known_fields = session.get("known_fields") if isinstance(session.get("known_fields"), dict) else {}
    expected = [asdict(question) for question in questions_for(intent, known_fields)[:MAX_QUESTIONS]]
    actual = session.get("questions")
    if actual != expected:
        raise TripValidationError("session_json questions do not match the generated clarification session.")


def validate_answers(answers: dict[str, Any]) -> None:
    if len(answers) > MAX_QUESTIONS:
        raise TripValidationError(f"answers_json may include at most {MAX_QUESTIONS} answers.")
    for value in answers.values():
        validate_answer_value(value)


def validate_answer_value(value: Any) -> None:
    if is_empty_answer(value):
        return
    if isinstance(value, str):
        if len(value) > MAX_ANSWER_LENGTH:
            raise TripValidationError(f"answers may be at most {MAX_ANSWER_LENGTH} characters.")
        return
    if isinstance(value, list):
        if len(value) > MAX_ANSWER_LIST_LENGTH:
            raise TripValidationError(f"answer lists may include at most {MAX_ANSWER_LIST_LENGTH} values.")
        for item in value:
            if not isinstance(item, str) or len(item) > MAX_ANSWER_LENGTH:
                raise TripValidationError(f"answer list values may be at most {MAX_ANSWER_LENGTH} characters.")
        return
    raise TripValidationError("answers must be strings, string arrays, skipped, or empty.")


def validate_answer_for_question(question: dict[str, Any], answer: Any) -> None:
    if is_empty_answer(answer) or question.get("allow_free_text") is True:
        return
    allowed = {
        option["value"]
        for option in question.get("options", [])
        if isinstance(option, dict) and isinstance(option.get("value"), str)
    }
    values = answer if isinstance(answer, list) else [answer]
    if any(value not in allowed for value in values):
        raise TripValidationError("answers_json includes a value that is not allowed for the question.")
