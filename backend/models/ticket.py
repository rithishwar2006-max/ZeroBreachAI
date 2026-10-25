from sqlalchemy import Column, Integer, String, Text, DateTime
from database import Base
from datetime import datetime

class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, index=True)
    role = Column(String)
    subject = Column(String)
    description = Column(Text)
    status = Column(String, default="OPEN")
    created_at = Column(DateTime, default=datetime.utcnow)
