from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
import models.user  # to ensure models are registered
from api import auth, dashboard, sniffer, users

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ZeroBreach AI",
    description="Network Anomaly Detection & Threat Monitoring System API",
    version="1.0.0"
)

# Configure CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the frontend URL
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
