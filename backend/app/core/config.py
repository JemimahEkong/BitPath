import os
from functools import lru_cache
from typing import List

from dotenv import load_dotenv

load_dotenv()


class Settings:
    app_name: str = os.getenv("APP_NAME", "BitPath API")
    app_env: str = os.getenv("APP_ENV", "development")
    frontend_url: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
    supabase_url: str = os.getenv("SUPABASE_URL", "")
    supabase_service_role_key: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    supabase_jwt_audience: str = os.getenv("SUPABASE_JWT_AUDIENCE", "authenticated")
    ai_stage_one_limit: int = int(os.getenv("AI_STAGE_ONE_LIMIT", "10"))
    ai_stage_increment: int = int(os.getenv("AI_STAGE_INCREMENT", "5"))
    ai_warning_threshold: int = int(os.getenv("AI_WARNING_THRESHOLD", "3"))

    @property
    def cors_origins(self) -> List[str]:
        origins = os.getenv("CORS_ORIGINS")

        if origins:
            return [origin.strip() for origin in origins.split(",") if origin.strip()]

        return [
            self.frontend_url,
            "http://127.0.0.1:3000",
        ]

    @property
    def supabase_jwks_url(self) -> str:
        return f"{self.supabase_url.rstrip('/')}/auth/v1/.well-known/jwks.json"

    @property
    def supabase_issuer(self) -> str:
        return f"{self.supabase_url.rstrip('/')}/auth/v1"


@lru_cache
def get_settings() -> Settings:
    return Settings()