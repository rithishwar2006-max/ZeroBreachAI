import os, sys, traceback
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine as db_engine, Base, SessionLocal as db_SessionLocal
import models.user  # to ensure models are registered
from api import auth, dashboard, sniffer, users
from api.auth import seed_demo_users
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Create database tables and seed initial users with automatic SQLite fallback
engine = db_engine
SessionLocal = db_SessionLocal
try:
    Base.metadata.create_all(bind=engine)
    _db = SessionLocal()
    seed_demo_users(_db)
    _db.close()
    print("[OK] Database tables created and demo users seeded.")
except Exception as e:
    print(f"[WARN] Primary database initialization warning: {e}. Switching to embedded SQLite!")
    db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "app.db"))
    engine = create_engine(f"sqlite:///{db_path}", connect_args={"check_same_thread": False})
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)
    _db = SessionLocal()
    seed_demo_users(_db)
    _db.close()
    print(f"[OK] Fallback SQLite ready and seeded at {db_path}.")

app = FastAPI(
    title="ZeroBreach AI",
    description="Network Anomaly Detection & Threat Monitoring System API",
    version="1.0.0"
)

# Configure CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(sniffer.router, prefix="/api")
app.include_router(users.router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "ZeroBreach AI API is running"}

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.get("/api/debug-status")
def debug_status():
    from database import settings
    data_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "data"))
    sizes = {}
    try:
        for f in ["monday.csv", "tuesday.csv", "wednesday.csv", "thursday.csv", "friday.csv"]:
            p = os.path.join(data_dir, f)
            sizes[f] = os.path.getsize(p) if os.path.exists(p) else 0
    except Exception:
        pass

    res = {
        "engine": str(engine.url) if engine else None,
        "is_sqlite": "sqlite" in str(engine.url) if engine else False,
        "commit": "8cd8fc2-benchmark-fix",
        "dataset_sizes": sizes,
    }
    try:
        from models.user import User
        db = SessionLocal()
        seed_demo_users(db)
        users_list = [u.username for u in db.query(User).all()]
        db.close()
        res["users"] = users_list
        res["status"] = "OK"
    except Exception as e:
        res["error"] = str(e)
        res["traceback"] = traceback.format_exc()
    return res
