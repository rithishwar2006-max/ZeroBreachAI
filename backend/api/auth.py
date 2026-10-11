from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from database import get_db
from models.user import User, Role, AuditLog
from core.security import verify_password, create_access_token, get_password_hash
from core.config import settings
from pydantic import BaseModel

router = APIRouter(prefix="/auth", tags=["auth"])

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str

def seed_demo_users(db: Session):
    demo_users = [
        {"username": "admin", "email": "admin@netshield.local", "role": Role.ADMIN},
        {"username": "soc", "email": "soc@netshield.local", "role": Role.SOC},
        {"username": "enterprise", "email": "enterprise@netshield.local", "role": Role.ENTERPRISE},
        {"username": "analyst", "email": "analyst@netshield.local", "role": Role.ANALYST},
    ]
    for u in demo_users:
        existing = db.query(User).filter(User.username == u["username"]).first()
        if not existing:
            new_user = User(
                username=u["username"],
                email=u["email"],
                hashed_password=get_password_hash(u["username"] + "123"),
                role=u["role"]
            )
            db.add(new_user)
    db.commit()

@router.post("/login", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    seed_demo_users(db)

    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    role = user.role.value
    
    # Audit log
    audit = AuditLog(
        username=user.username,
        action="LOGIN",
        details="User logged in successfully"
    )
    db.add(audit)
    db.commit()
        
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": form_data.username, "role": role}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "role": role}
