import os
import asyncio
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from motor.motor_asyncio import AsyncIOMotorClient
from core.config import settings

# -------------------------------------------------------------
# 1. PostgreSQL Setup with Automatic Embedded SQLite Fallback
# -------------------------------------------------------------
engine = None
try:
    if settings.DATABASE_URL or (settings.POSTGRES_SERVER != "localhost" and settings.POSTGRES_SERVER != "127.0.0.1"):
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


# -------------------------------------------------------------
# 2. In-Memory Mock MongoDB for Zero-Dependency Cloud Operation
# -------------------------------------------------------------
class AsyncCursor:
    def __init__(self, items):
        self._items = list(items)
        self._index = 0

    def sort(self, *args, **kwargs):
        return self

    def limit(self, n):
        self._items = self._items[:n]
        return self

    async def to_list(self, length=None):
        return self._items[:length] if length is not None else self._items

    def __aiter__(self):
        self._index = 0
        return self

    async def __anext__(self):
        if self._index < len(self._items):
            item = self._items[self._index]
            self._index += 1
            return item
        raise StopAsyncIteration


class AsyncCollection:
    def __init__(self, name):
        self.name = name
        self.docs = []

    async def insert_one(self, doc):
        self.docs.append(dict(doc))
        return type("InsertResult", (), {"inserted_id": len(self.docs)})()

    async def insert_many(self, docs):
        self.docs.extend([dict(d) for d in docs])
        return type("InsertManyResult", (), {"inserted_ids": list(range(len(docs)))})()

    def find(self, filter_dict=None, *args, **kwargs):
        res = list(self.docs)
        if filter_dict:
            res = [d for d in res if all(d.get(k) == v for k, v in filter_dict.items() if not str(k).startswith("$"))]
        return AsyncCursor(res)

    async def find_one(self, filter_dict=None, *args, **kwargs):
        c = self.find(filter_dict)
        items = await c.to_list(1)
        return items[0] if items else None

    async def update_one(self, filter_dict, update_dict, upsert=False):
        for d in self.docs:
            if all(d.get(k) == v for k, v in filter_dict.items() if not str(k).startswith("$")):
                if "$set" in update_dict:
                    d.update(update_dict["$set"])
                return
        if upsert:
            new_doc = dict(filter_dict) if filter_dict else {}
            if "$set" in update_dict:
                new_doc.update(update_dict["$set"])
            self.docs.append(new_doc)

    async def delete_many(self, filter_dict=None):
        if not filter_dict:
            self.docs.clear()
        else:
            self.docs = [d for d in self.docs if not all(d.get(k) == v for k, v in filter_dict.items() if not str(k).startswith("$"))]

    async def count_documents(self, filter_dict=None):
        return len(self.docs)

    def aggregate(self, pipeline):
        return AsyncCursor(self.docs[-10:])


class AsyncMockDatabase:
    def __init__(self):
        self._collections = {}

    def __getitem__(self, name):
        if name not in self._collections:
            self._collections[name] = AsyncCollection(name)
        return self._collections[name]

    async def command(self, cmd, *args, **kwargs):
        return {"ok": 1}


# -------------------------------------------------------------
# 3. MongoDB Setup with Graceful In-Memory Fallback
# -------------------------------------------------------------
mongo_db = None
traffic_collection = None

# Only attempt real MongoDB if a custom remote URI is provided
if settings.MONGO_URI or (settings.MONGO_SERVER != "localhost" and settings.MONGO_SERVER != "127.0.0.1"):
    try:
        mongo_client = AsyncIOMotorClient(settings.MONGO_DATABASE_URI, serverSelectionTimeoutMS=2000)
        mongo_db = mongo_client[settings.MONGO_DB]
        traffic_collection = mongo_db["traffic_logs"]
        print("[OK] Remote MongoDB Client configured.")
    except Exception as e:
        print(f"[WARN] Remote MongoDB connection error: {e}. Engaging In-Memory Fallback!")
        mongo_db = None

if mongo_db is None:
    mongo_db = AsyncMockDatabase()
    traffic_collection = mongo_db["traffic_logs"]
    print("[OK] In-Memory Mock MongoDB active (zero external connection dependencies).")
