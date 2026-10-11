from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class TrafficLog(BaseModel):
    source_ip: str
    destination_ip: str
    source_port: int
    destination_port: int
    protocol: str
    flow_duration: float
    total_fwd_packets: int
    total_backward_packets: int
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    is_anomaly: bool = False
    threat_label: Optional[str] = "Normal"
    risk_score: float = 0.0

    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "source_ip": "192.168.1.100",
                "destination_ip": "10.0.0.5",
                "source_port": 50000,
                "destination_port": 80,
                "protocol": "TCP",
                "flow_duration": 12.5,
                "total_fwd_packets": 10,
                "total_backward_packets": 12,
                "is_anomaly": False,
                "threat_label": "Normal",
                "risk_score": 0.0
            }
        }
