from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from motor.motor_asyncio import AsyncIOMotorClient
from core.config import settings

# PostgreSQL Setup
engine = create_engine(settings.SQLALCHEMY_DATABASE_URI, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# MongoDB Setup
mongo_client = AsyncIOMotorClient(settings.MONGO_DATABASE_URI)
mongo_db = mongo_client[settings.MONGO_DB]
traffic_collection = mongo_db["traffic_logs"]
