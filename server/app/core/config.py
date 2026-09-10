from typing import List, Optional
import os
from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
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
    
    # JWT Authentication
    jwt_secret: str = Field(
        default="jwt-secret-circuit-auth-key-2026",
        validation_alias="JWT_SECRET"
    )
    jwt_algorithm: str = "HS256"
    jwt_expires_in: str = Field(default="7d", validation_alias="JWT_EXPIRES_IN")
    jwt_expires_seconds: int = 7 * 24 * 3600  # 7 days in seconds
    
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
    biometric_match_threshold: float = Field(default=0.78, validation_alias="BIOMETRIC_MATCH_THRESHOLD")
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
            return ["*"]
        return [origin.strip() for origin in self.cors_origin.split(",") if origin.strip()]

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
