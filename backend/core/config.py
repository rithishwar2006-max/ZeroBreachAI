from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "ZeroBreach AI"
    VERSION: str = "1.0.0"
    
    # PostgreSQL (Users, Roles)
    DATABASE_URL: Optional[str] = None
    POSTGRES_USER: str = "admin"
    POSTGRES_PASSWORD: str = "adminpassword"
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: str = "5432"
    POSTGRES_DB: str = "netshield"
    
    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        if self.DATABASE_URL:
            url = self.DATABASE_URL
            if url.startswith("postgres://"):
                url = url.replace("postgres://", "postgresql+psycopg://", 1)
            elif url.startswith("postgresql://") and not url.startswith("postgresql+psycopg://"):
                url = url.replace("postgresql://", "postgresql+psycopg://", 1)
            return url
        return f"postgresql+psycopg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
    
    # MongoDB (Traffic Logs)
    MONGO_URI: Optional[str] = None
    MONGO_DATABASE_URL: Optional[str] = None
    MONGO_USER: str = "admin"
    MONGO_PASSWORD: str = "adminpassword"
    MONGO_SERVER: str = "localhost"
    MONGO_PORT: str = "27017"
    MONGO_DB: str = "netshield"
    
    @property
    def MONGO_DATABASE_URI(self) -> str:
        return self.MONGO_URI or self.MONGO_DATABASE_URL or f"mongodb://{self.MONGO_USER}:{self.MONGO_PASSWORD}@{self.MONGO_SERVER}:{self.MONGO_PORT}/"
    
    # Security
    SECRET_KEY: str = "b6a8b1c4e7f9a2d3e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z" # In production, use env var
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8 # 8 days

settings = Settings()
