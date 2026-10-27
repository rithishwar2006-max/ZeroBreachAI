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
def _matches_filter(doc, filter_dict):
    """
    Evaluates MongoDB query syntax including operators ($ne, $in, $nin, $gte, $gt, $lte, $lt, $exists, $or, $and).
    """
    if not filter_dict:
        return True
    for k, v in filter_dict.items():
        if k == "$or" and isinstance(v, list):
            if not any(_matches_filter(doc, sub) for sub in v):
                return False
            continue
        if k == "$and" and isinstance(v, list):
            if not all(_matches_filter(doc, sub) for sub in v):
                return False
            continue
        if str(k).startswith("$"):
            continue

        val = doc.get(k)
        if isinstance(v, dict):
            for op, op_val in v.items():
                if op == "$ne" and val == op_val:
                    return False
                elif op == "$in" and val not in op_val:
                    return False
                elif op == "$nin" and val in op_val:
                    return False
                elif op == "$gte" and not (val is not None and val >= op_val):
                    return False
                elif op == "$gt" and not (val is not None and val > op_val):
                    return False
                elif op == "$lte" and not (val is not None and val <= op_val):
                    return False
                elif op == "$lt" and not (val is not None and val < op_val):
                    return False
                elif op == "$exists":
                    exists = (k in doc and doc[k] is not None)
                    if exists != bool(op_val):
                        return False
        else:
            if val != v:
                return False
    return True


class AsyncCursor:
    def __init__(self, items):
        self._items = list(items)
        self._index = 0

    def sort(self, key_or_list, direction=1):
        field = key_or_list
        desc = (direction == -1)
        if isinstance(key_or_list, list) and key_or_list:
            field = key_or_list[0][0]
            desc = (key_or_list[0][1] == -1)
        try:
            self._items.sort(key=lambda d: d.get(field) or 0, reverse=desc)
        except Exception:
            pass
        return self

    def limit(self, n):
        if n is not None:
            self._items = self._items[:n]
        return self

    def skip(self, n):
        if n is not None:
            self._items = self._items[n:]
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
        d = dict(doc)
        if "_id" not in d:
            d["_id"] = len(self.docs) + 1
        self.docs.append(d)
        return type("InsertResult", (), {"inserted_id": d["_id"]})()

    async def insert_many(self, docs):
        res_ids = []
        for doc in docs:
            d = dict(doc)
            if "_id" not in d:
                d["_id"] = len(self.docs) + 1
            self.docs.append(d)
            res_ids.append(d["_id"])
        # Keep collection bounded to prevent runaway memory on prolonged runs
        if len(self.docs) > 10000:
            self.docs = self.docs[-10000:]
        return type("InsertManyResult", (), {"inserted_ids": res_ids})()

    def find(self, filter_dict=None, *args, sort=None, **kwargs):
        res = [d for d in self.docs if _matches_filter(d, filter_dict)]
        c = AsyncCursor(res)
        if sort:
            if isinstance(sort, list) and sort:
                c.sort(sort[0][0], sort[0][1])
            elif isinstance(sort, str):
                c.sort(sort)
        return c

    async def find_one(self, filter_dict=None, *args, sort=None, **kwargs):
        c = self.find(filter_dict, sort=sort)
        items = await c.to_list(1)
        return items[0] if items else None

    async def distinct(self, field, filter_dict=None):
        docs = [d for d in self.docs if _matches_filter(d, filter_dict)] if filter_dict else self.docs
        vals = set()
        for d in docs:
            v = d.get(field)
            if v is not None:
                if isinstance(v, list):
                    vals.update(v)
                else:
                    vals.add(v)
        return list(vals)

    async def update_one(self, filter_dict, update_dict, upsert=False):
        for d in self.docs:
            if _matches_filter(d, filter_dict):
                if "$set" in update_dict:
                    d.update(update_dict["$set"])
                return
        if upsert:
            new_doc = dict(filter_dict) if filter_dict else {}
            if "$set" in update_dict:
                new_doc.update(update_dict["$set"])
            if "_id" not in new_doc:
                new_doc["_id"] = len(self.docs) + 1
            self.docs.append(new_doc)

    async def delete_many(self, filter_dict=None):
        if not filter_dict:
            self.docs.clear()
        else:
            self.docs = [d for d in self.docs if not _matches_filter(d, filter_dict)]

    async def count_documents(self, filter_dict=None):
        if not filter_dict:
            return len(self.docs)
        return len([d for d in self.docs if _matches_filter(d, filter_dict)])

    def aggregate(self, pipeline):
        # Support basic $match, $group, and $count for in-memory mock mongo
        docs = list(self.docs)
        for stage in pipeline:
            if "$match" in stage:
                docs = [d for d in docs if _matches_filter(d, stage["$match"])]
            elif "$count" in stage:
                count_key = stage["$count"]
                return AsyncCursor([{count_key: len(docs)}])
            elif "$group" in stage:
                grp = stage["$group"]
                res_doc = {"_id": grp.get("_id")}
                for k, v in grp.items():
                    if k == "_id":
                        continue
                    if isinstance(v, dict) and "$sum" in v:
                        sum_field = v["$sum"]
                        if isinstance(sum_field, str) and sum_field.startswith("$"):
                            fname = sum_field[1:]
                            res_doc[k] = sum(int(d.get(fname, 0) or 0) for d in docs)
                        elif isinstance(sum_field, (int, float)):
                            res_doc[k] = len(docs) * sum_field
                        else:
                            res_doc[k] = len(docs)
                    elif isinstance(v, dict) and "$first" in v:
                        fname = v["$first"][1:] if v["$first"].startswith("$") else v["$first"]
                        res_doc[k] = docs[0].get(fname) if docs else None
                return AsyncCursor([res_doc])
        return AsyncCursor(docs[-50:])


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

# Only attempt real MongoDB if a custom remote URI is provided (not localhost)
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
