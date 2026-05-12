import pytest
from pydantic_settings import SettingsConfigDict

from app.config import Settings


@pytest.fixture(autouse=True)
def clear_settings_env(monkeypatch: pytest.MonkeyPatch) -> None:
    for name in (
        "DATABASE_URL",
        "NEON_DATABASE_URL",
        "SUPABASE_DATABASE_URL",
        "TRIP_STORE_BACKEND",
        "TRIP_STORE_FILE_PATH",
    ):
        monkeypatch.delenv(name, raising=False)


class DefaultsOnlySettings(Settings):
    model_config = SettingsConfigDict(env_file=None, extra="ignore")


def default_settings() -> Settings:
    return DefaultsOnlySettings()


def test_trip_database_url_returns_database_url() -> None:
    settings = default_settings().model_copy(
        update={"database_url": "postgresql://user:pass@host/db"}
    )

    assert settings.trip_database_url == "postgresql://user:pass@host/db"


def test_trip_database_url_falls_back_to_neon_database_url() -> None:
    settings = default_settings().model_copy(update={"neon_database_url": "postgresql://neon"})

    assert settings.trip_database_url == "postgresql://neon"


def test_trip_database_url_falls_back_to_supabase_database_url() -> None:
    settings = default_settings().model_copy(
        update={"supabase_database_url": "postgresql://supabase"}
    )

    assert settings.trip_database_url == "postgresql://supabase"


def test_trip_store_file_defaults_to_tmp_json() -> None:
    settings = default_settings()

    assert settings.trip_store_backend == "postgres"
    assert settings.trip_store_file_path == "/tmp/travel-mcp-trips.json"


def test_trip_database_url_returns_empty_when_not_set() -> None:
    settings = default_settings()

    assert settings.trip_database_url == ""
