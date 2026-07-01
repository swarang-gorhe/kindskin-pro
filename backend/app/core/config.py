from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "KindSkin API"
    debug: bool = False

    # Comma-separated explicit origins (production domain, Vercel prod URL, localhost)
    cors_origins: str = (
        "http://localhost:3000,"
        "https://kindskinco.com,"
        "https://www.kindskinco.com,"
        "https://kindskin-pro.vercel.app"
    )
    # Primary frontend URL — used for CORS and redirect/webhook URLs
    frontend_url: str = "https://kindskin-pro.vercel.app"

    openai_api_key: str = ""
    anthropic_api_key: str = ""
    supabase_url: str = ""
    supabase_service_key: str = ""
    database_url: str = ""

    kb_similarity_threshold: float = 0.72
    kb_high_confidence_threshold: float = 0.92


settings = Settings()
