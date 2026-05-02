from app.config import Settings


def test_trip_database_url_returns_database_url() -> None:
    settings = Settings(database_url="postgresql://user:pass@host/db")

    assert settings.trip_database_url == "postgresql://user:pass@host/db"


def test_trip_database_url_returns_empty_when_not_set() -> None:
    settings = Settings()

    assert settings.trip_database_url == ""
