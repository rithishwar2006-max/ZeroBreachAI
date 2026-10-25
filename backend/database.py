import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from motor.motor_asyncio import AsyncIOMotorClient
from core.config import settings

# Database Setup with Automatic Embedded SQLite Fallback
engine = None
try:
    if settings.DATABASE_URL or settings.POSTGRES_SERVER != "localhost":
        test_engine = create_engine(
            settings.SQLALCHEMY_DATABASE_URI, 
            pool_pre_ping=True, 
            connect_args={"connect_timeout": 3} if "sqlite" not in settings.SQLALCHEMY_DATABASE_URI else {}
        )
        with test_engine.connect() as conn:
            pass
        engine = test_engine
        print("[OK] Connected to PostgreSQL successfully.")
except Exception as e:
    print(f"[WARN] PostgreSQL connection failed ({e}). Engaging embedded SQLite fallback!")

if engine is None:
    db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "app.db"))
    engine = create_engine(f"sqlite:///{db_path}", connect_args={"check_same_thread": False})
    print(f"[OK] Embedded SQLite active at: {db_path}")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# MongoDB Setup
try:
    mongo_client = AsyncIOMotorClient(settings.MONGO_DATABASE_URI, serverSelectionTimeoutMS=2000)
    mongo_db = mongo_client[settings.MONGO_DB]
    traffic_collection = mongo_db["traffic_logs"]
except Exception as e:
    print(f"[WARN] MongoDB init warning: {e}")
    mongo_client = None
    mongo_db = None
    traffic_collection = None
