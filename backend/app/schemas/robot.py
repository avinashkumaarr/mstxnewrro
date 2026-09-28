from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

from app.models.robot import RobotStatus


class RobotBase(BaseModel):
    name: str = Field(..., max_length=200)
    model: str = Field(..., max_length=100)
    description: str | None = Field(None, max_length=1000)
    capabilities: list[str] | None = None
    metadata_: dict | None = Field(None, alias="metadata")


class RobotCreate(RobotBase):
    pass


class RobotUpdate(BaseModel):
    name: str | None = Field(None, max_length=200)
    model: str | None = Field(None, max_length=100)
    description: str | None = Field(None, max_length=1000)
    status: RobotStatus | None = None
    battery_percentage: float | None = Field(None, ge=0.0, le=100.0)
    position_x: float | None = None
    position_y: float | None = None
    position_z: float | None = None
    orientation: float | None = None
    capabilities: list[str] | None = None
    metadata_: dict | None = Field(None, alias="metadata")


class RobotResponse(RobotBase):
    id: UUID
    status: RobotStatus
    battery_percentage: float
    position_x: float
    position_y: float
    position_z: float
    orientation: float
    owner_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
