from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # App
    APP_NAME: str = "RoboLedger API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:password@localhost:5432/roboledger"

    # JWT
    SECRET_KEY: str = "change-this-to-a-real-secret-key-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # CORS
    CORS_ORIGINS: str = "http://localhost:3000"

    # Blockchain (MST Testnet) — configure before deploying
    BLOCKCHAIN_ENABLED: bool = False
    MST_RPC_URL: str = ""
    MST_CHAIN_ID: int = 0
    MST_CONTRACT_ROBOT_REGISTRY: str = ""
    MST_CONTRACT_ROBOT_EVENT_LEDGER: str = ""
    MST_SIGNER_PRIVATE_KEY: str = ""  # Never commit a real key

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",")]


@lru_cache
def get_settings() -> Settings:
    return Settings()
