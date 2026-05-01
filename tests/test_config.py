from app.config import Settings


def test_trip_database_url_prefers_database_url() -> None:
    settings = Settings(
        database_url="postgresql://primary",
        supabase_database_url="postgresql://supabase",
    )

    assert settings.trip_database_url == "postgresql://primary"


def test_trip_database_url_falls_back_to_supabase_database_url() -> None:
    settings = Settings(supabase_database_url="postgresql://supabase")

    assert settings.trip_database_url == "postgresql://supabase"
