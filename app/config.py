from functools import lru_cache

from pydantic import AnyHttpUrl, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Runtime configuration loaded from environment variables."""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    environment: str = "development"
    debug: bool = True
    database_url: str = ""
    supabase_database_url: str = ""
    trip_store_backend: str = "postgres"
    trip_store_file_path: str = "/tmp/travel-mcp-trips.json"
    openweather_api_key: str = ""
    weather_mcp_url: AnyHttpUrl = Field(default="http://localhost:8000/mcp/weather/")
    travel_tips_mcp_url: AnyHttpUrl = Field(default="http://localhost:8000/mcp/travel/")
    packing_mcp_url: AnyHttpUrl = Field(default="http://localhost:8000/mcp/packing/")

    @property
    def has_openweather_key(self) -> bool:
        return bool(self.openweather_api_key.strip())

    @property
    def trip_database_url(self) -> str:
        return self.database_url.strip() or self.supabase_database_url.strip()


@lru_cache
def get_settings() -> Settings:
    return Settings()
