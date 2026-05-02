from app.config import Settings


def test_trip_database_url_returns_database_url() -> None:
    settings = Settings(database_url="postgresql://user:pass@host/db")

    assert settings.trip_database_url == "postgresql://user:pass@host/db"


def test_trip_database_url_falls_back_to_neon_database_url() -> None:
    settings = Settings(neon_database_url="postgresql://neon")

    assert settings.trip_database_url == "postgresql://neon"


def test_trip_database_url_falls_back_to_supabase_database_url() -> None:
    settings = Settings(supabase_database_url="postgresql://supabase")

    assert settings.trip_database_url == "postgresql://supabase"


def test_trip_store_file_defaults_to_tmp_json() -> None:
    settings = Settings()

    assert settings.trip_store_backend == "postgres"
    assert settings.trip_store_file_path == "/tmp/travel-mcp-trips.json"


def test_trip_database_url_returns_empty_when_not_set() -> None:
    settings = Settings()

    assert settings.trip_database_url == ""
