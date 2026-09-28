from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict

from app.models.robot_event import EventType


class EventBase(BaseModel):
    robot_id: UUID
    simulation_id: UUID | None = None
    event_type: EventType
    event_timestamp: datetime
    payload: dict | None = None


class EventCreate(EventBase):
    pass


class EventResponse(EventBase):
    id: UUID
    owner_id: UUID
    canonical_repr: str | None
    event_hash: str | None
    hash_created_at: datetime | None
    blockchain_anchor_id: UUID | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
