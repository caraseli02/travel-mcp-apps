from datetime import date
from typing import Any

from pydantic import BaseModel, Field, model_validator


class TravelPlanRequest(BaseModel):
    origin_city: str = Field(min_length=1, examples=["Madrid"])
    destination_city: str = Field(min_length=1, examples=["Paris"])
    start_date: date
    end_date: date

    @model_validator(mode="after")
    def validate_dates(self) -> "TravelPlanRequest":
        if self.end_date < self.start_date:
            raise ValueError("end_date must be on or after start_date")
        return self


class TravelPlanResponse(BaseModel):
    status: str
    message: str
    plan: dict[str, Any] | None = None
    errors: dict[str, str] = Field(default_factory=dict)
