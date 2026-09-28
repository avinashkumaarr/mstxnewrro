from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class TelemetryBase(BaseModel):
    robot_id: UUID
    simulation_id: UUID | None = None
    timestamp: datetime
    position_x: float | None = None
    position_y: float | None = None
    position_z: float | None = None
    orientation: float | None = None
    velocity_linear: float | None = None
    velocity_angular: float | None = None
    battery: float | None = None
    sensor_readings: dict | None = None


class TelemetryCreate(TelemetryBase):
    pass


class TelemetryResponse(TelemetryBase):
    id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
