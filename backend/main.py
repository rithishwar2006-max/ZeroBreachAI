import sys, traceback
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base, SessionLocal
import models.user  # to ensure models are registered
from api import auth, dashboard, sniffer, users
from api.auth import seed_demo_users

# Create database tables and seed initial users
try:
    Base.metadata.create_all(bind=engine)
    _db = SessionLocal()
    seed_demo_users(_db)
    _db.close()
    print("[OK] Database tables created and demo users seeded.")
except Exception as e:
    print(f"[WARN] Database initialization warning: {e}")

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
    from database import engine, settings
    res = {
        "engine": str(engine.url) if engine else None,
        "is_sqlite": "sqlite" in str(engine.url) if engine else False,
        "commit": "6a9d3e2-debug",
    }
    try:
        from database import SessionLocal
        from models.user import User
        db = SessionLocal()
        users_list = [u.username for u in db.query(User).all()]
        db.close()
        res["users"] = users_list
        res["status"] = "OK"
    except Exception as e:
        res["error"] = str(e)
        res["traceback"] = traceback.format_exc()
    return res
