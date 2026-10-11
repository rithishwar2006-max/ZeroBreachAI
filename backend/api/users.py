from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models.user import User, Role, AuditLog
from core.security import get_current_user, RequireRole

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/")
def get_users(db: Session = Depends(get_db), current_user: User = Depends(RequireRole([Role.ADMIN]))):
    users = db.query(User).all()
    return [{"id": u.id, "username": u.username, "email": u.email, "role": u.role, "is_active": u.is_active} for u in users]

@router.post("/")
def create_user(user_data: dict, db: Session = Depends(get_db), current_user: User = Depends(RequireRole([Role.ADMIN]))):
    # This is a stub for team management
    return {"message": "User created successfully (stub)"}

@router.get("/audit")
def get_audit_logs(db: Session = Depends(get_db), current_user: User = Depends(RequireRole([Role.ADMIN]))):
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(100).all()
    return logs
