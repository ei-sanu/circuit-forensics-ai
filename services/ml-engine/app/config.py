"""Configuration settings for the ML Engine microservice."""
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    APP_NAME: str = "CrimeGraph ML Engine"
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"
    HOST: str = "0.0.0.0"
    PORT: int = 8001

    # Service-to-Service Security Key
    INTERNAL_SERVICE_SECRET: str = "dev-secret-internal-service-key-2026"

    # AI / LLM Configuration (supports "none", "local", "openai")
    LLM_PROVIDER: str = "none"
    LOCAL_LLM_URL: str = "http://localhost:11434/v1"
    MODEL_NAME: str = "llama3.2"
    OPENAI_API_KEY: str = ""


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
