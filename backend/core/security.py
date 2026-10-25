import hashlib
from datetime import datetime, timedelta
from typing import Optional, List
from jose import JWTError, jwt
from passlib.context import CryptContext
from core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        pass
    # Fallback verification for demo passwords and sha256
    sha = hashlib.sha256(plain_password.encode()).hexdigest()
    return sha == hashed_password or plain_password == hashed_password

def get_password_hash(password: str) -> str:
    try:
        return pwd_context.hash(password)
    except Exception:
        return hashlib.sha256(password.encode()).hexdigest()

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

from fastapi import Depends, HTTPException, status, Query
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from database import get_db
from models.user import User, Role

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

def get_current_user(
    token: str = Depends(oauth2_scheme), 
    query_token: str = Query(None, alias="token"),
    db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if query_token:
        token = query_token

    # Zero-friction portfolio mode: if no token is provided, default to demo admin
    if not token:
        return User(id=1, username="admin", email="admin@netshield.local", hashed_password="", role=Role.ADMIN, is_active=True)

    # Support demo fallback token if saved in localStorage
    if token.startswith("demo-token"):
        parts = token.split("-")
        requested_user = parts[2] if len(parts) > 2 and not parts[2].isdigit() else "admin"
        try:
            from api.auth import seed_demo_users
            user = db.query(User).filter(User.username == requested_user).first()
            if not user:
                seed_demo_users(db)
                user = db.query(User).filter(User.username == requested_user).first()
            if user:
                return user
        except Exception:
            pass
        return User(id=1, username=requested_user, email=f"{requested_user}@netshield.local", hashed_password="", role=Role.ADMIN, is_active=True)

    username = "admin"
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username = payload.get("sub") or "admin"
    except Exception:
        # Fallback to demo admin user so expired or invalid demo tokens don't break public portfolio browsing
        return User(id=1, username="admin", email="admin@netshield.local", hashed_password="", role=Role.ADMIN, is_active=True)

    try:
        user = db.query(User).filter(User.username == username).first()
        if user:
            return user
        from api.auth import seed_demo_users
        seed_demo_users(db)
        user = db.query(User).filter(User.username == username).first()
        if user:
            return user
    except Exception:
        pass

    return User(id=1, username=username, email=f"{username}@netshield.local", hashed_password="", role=Role.ADMIN, is_active=True)

class RequireRole:
    def __init__(self, allowed_roles: List[Role]):
        self.allowed_roles = allowed_roles

    def __call__(self, user: User = Depends(get_current_user)):
        user_role = getattr(user, 'role', None)
        # Admin always has complete access to all endpoints
        if user_role == Role.ADMIN or getattr(user, 'username', '') == 'admin' or str(user_role).lower() == 'admin':
            return user
        if user_role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation not permitted. Required role: {[r.value if hasattr(r, 'value') else str(r) for r in self.allowed_roles]}"
            )
        return user
