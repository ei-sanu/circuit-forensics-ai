from typing import List, Optional
import os
import logging
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, model_validator

logger = logging.getLogger("CIRCUIT.Config")

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )

    app_name: str = "CIRCUIT Intelligence Core API"
    app_version: str = "1.0.0"
    port: int = Field(default=3000, validation_alias="PORT")
    host: str = "0.0.0.0"
    node_env: str = Field(default="development", validation_alias="NODE_ENV")
    
    # PostgreSQL Database URL
    database_url: str = Field(
        default="postgresql+asyncpg://circuit:circuit_pass_2026@localhost:5432/circuit_db",
        validation_alias="DATABASE_URL"
    )
    database_name: str = "circuit_db"
    offline_mode: bool = Field(default=False, validation_alias="OFFLINE_MODE")
    
    # Default Admin / Seed Password
    default_seed_password: str = Field(
        default="demo123",
        validation_alias="SEED_DEFAULT_PASSWORD"
    )
    
    # JWT Authentication (1 hour lifespan for high security)
    jwt_secret: str = Field(
        default="jwt-secret-circuit-auth-key-2026",
        validation_alias="JWT_SECRET"
    )
    jwt_algorithm: str = "HS256"
    jwt_expires_in: str = Field(default="1h", validation_alias="JWT_EXPIRES_IN")
    jwt_expires_seconds: int = Field(default=3600, validation_alias="JWT_EXPIRES_SECONDS")
    
    # Cloudflare R2 / AWS S3 Storage
    r2_account_id: Optional[str] = Field(default="", validation_alias="R2_ACCOUNT_ID")
    r2_access_key_id: Optional[str] = Field(default="", validation_alias="R2_ACCESS_KEY_ID")
    r2_secret_access_key: Optional[str] = Field(default="", validation_alias="R2_SECRET_ACCESS_KEY")
    r2_bucket_name: str = Field(default="circuit-case-files", validation_alias="R2_BUCKET_NAME")
    r2_endpoint: Optional[str] = Field(default="", validation_alias="R2_ENDPOINT")
    r2_public_domain: Optional[str] = Field(default="", validation_alias="R2_PUBLIC_DOMAIN")
    
    # ML Service (Optional external or unified internal)
    ml_service_url: str = Field(
        default="http://localhost:3000",
        validation_alias="ML_SERVICE_URL"
    )
    ml_service_secret: str = Field(
        default="dev-secret-internal-service-key-2026",
        validation_alias="ML_SERVICE_SECRET"
    )
    
    # Biometric System
    biometric_enabled: bool = Field(default=True, validation_alias="BIOMETRIC_ENABLED")
    biometric_match_threshold: float = Field(default=0.70, validation_alias="BIOMETRIC_MATCH_THRESHOLD")
    biometric_challenge_ttl_seconds: int = Field(default=300, validation_alias="BIOMETRIC_CHALLENGE_TTL_SECONDS")
    biometric_max_attempts: int = Field(default=3, validation_alias="BIOMETRIC_MAX_ATTEMPTS")
    biometric_lockout_seconds: int = Field(default=900, validation_alias="BIOMETRIC_LOCKOUT_SECONDS")
    biometric_encryption_key: str = Field(
        default="circuit-biometric-secret-encryption-key-2026-secure",
        validation_alias="BIOMETRIC_ENCRYPTION_KEY"
    )
    
    # CORS
    cors_origin: str = Field(
        default="http://localhost:8080,http://localhost:3000,http://localhost:5173",
        validation_alias="CORS_ORIGIN"
    )

    @property
    def cors_origins_list(self) -> List[str]:
        if not self.cors_origin:
            return ["http://localhost:8080", "http://localhost:3000"]
        return [origin.strip() for origin in self.cors_origin.split(",") if origin.strip()]

    @model_validator(mode="after")
    def validate_production_security(self):
        insecure_jwt_defaults = {
            "jwt-secret-circuit-auth-key-2026",
            "secret",
            "change-me",
            "your-secure-random-jwt-key",
            ""
        }
        insecure_bio_defaults = {
            "circuit-biometric-secret-encryption-key-2026-secure",
            "change-me",
            "your-32-byte-biometric-encryption-key",
            ""
        }

        is_prod = self.node_env.lower() in ("production", "prod")
        allow_defaults = (
            os.getenv("RENDER", "").lower() in ("true", "1")
            or os.getenv("ALLOW_DEV_DEFAULTS", "").lower() in ("true", "1")
        )

        if is_prod:
            if self.jwt_secret in insecure_jwt_defaults or len(self.jwt_secret) < 32:
                msg = (
                    "Production deployment rejected: JWT_SECRET is unset, matches default, "
                    "or is shorter than 32 characters. Provide a high-entropy secret via JWT_SECRET environment variable."
                )
                if not allow_defaults:
                    raise ValueError(f"[SECURITY ALERT] {msg}")
                logger.warning(f"⚠️  [SECURITY NOTICE] {msg}")

            if self.biometric_encryption_key in insecure_bio_defaults or len(self.biometric_encryption_key) < 32:
                msg = (
                    "Production deployment rejected: BIOMETRIC_ENCRYPTION_KEY is unset, matches default, "
                    "or is shorter than 32 characters. Provide a high-entropy 32-byte key via BIOMETRIC_ENCRYPTION_KEY."
                )
                if not allow_defaults:
                    raise ValueError(f"[SECURITY ALERT] {msg}")
                logger.warning(f"⚠️  [SECURITY NOTICE] {msg}")

            if "*" in self.cors_origin:
                msg = (
                    "Production deployment rejected: CORS_ORIGIN contains wildcard '*'. "
                    "Law-enforcement platforms must explicitly specify trusted origin domains."
                )
                if not allow_defaults:
                    raise ValueError(f"[SECURITY ALERT] {msg}")
                logger.warning(f"⚠️  [SECURITY NOTICE] {msg}")

            if "circuit_pass_2026" in self.database_url:
                msg = (
                    "Production deployment rejected: DATABASE_URL uses default password 'circuit_pass_2026'. "
                    "Supply a dedicated, secure production database password."
                )
                if not allow_defaults:
                    raise ValueError(f"[SECURITY ALERT] {msg}")
                logger.warning(f"⚠️  [SECURITY NOTICE] {msg}")
        else:
            if self.jwt_secret in insecure_jwt_defaults:
                logger.warning("⚠️  Using default development JWT_SECRET. Override in .env before deploying to production.")
            if self.biometric_encryption_key in insecure_bio_defaults:
                logger.warning("⚠️  Using default development BIOMETRIC_ENCRYPTION_KEY. Override in .env before deploying to production.")

        return self

settings = Settings()
