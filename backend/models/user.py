from sqlalchemy import Column, Integer, String, Boolean, Enum, DateTime, ForeignKey
from database import Base
import enum
from datetime import datetime

class Role(str, enum.Enum):
    ADMIN = "admin"
    SOC = "soc"
    ANALYST = "analyst"
    ENTERPRISE = "enterprise"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(Role), default=Role.ANALYST)
    is_active = Column(Boolean, default=True)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    username = Column(String, index=True)
    action = Column(String, nullable=False)
    details = Column(String, nullable=True)

