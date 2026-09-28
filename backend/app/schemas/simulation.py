from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

from app.models.simulation import SimulationStatus


class SimulationBase(BaseModel):
    name: str = Field(..., max_length=200)
    robot_id: UUID
    environment_config: dict | None = None
    initial_pose: dict | None = None
    goal: dict | None = None


class SimulationCreate(SimulationBase):
    pass


class SimulationUpdate(BaseModel):
    name: str | None = Field(None, max_length=200)
    environment_config: dict | None = None
    initial_pose: dict | None = None
    goal: dict | None = None
    summary: dict | None = None


class SimulationResponse(SimulationBase):
    id: UUID
    owner_id: UUID
    status: SimulationStatus
    started_at: datetime | None
    ended_at: datetime | None
    summary: dict | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
