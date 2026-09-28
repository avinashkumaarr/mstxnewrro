from uuid import UUID
from fastapi import APIRouter

from app.schemas.event import EventCreate, EventResponse
from app.services.event_service import create_event, get_event, list_events
from app.core.dependencies import DB, CurrentUserId

router = APIRouter(prefix="/events", tags=["events"])


@router.post("/", response_model=EventResponse)
async def create_new_event(event_in: EventCreate, db: DB, user_id: CurrentUserId):
    return await create_event(db, event_in, UUID(user_id))


@router.get("/", response_model=list[EventResponse])
async def read_events(db: DB, user_id: CurrentUserId, limit: int = 100):
    return await list_events(db, UUID(user_id), limit)


@router.get("/{event_id}", response_model=EventResponse)
async def read_event(event_id: UUID, db: DB, user_id: CurrentUserId):
    event = await get_event(db, event_id)
    if event.owner_id != UUID(user_id):
        from app.core.exceptions import forbidden
        raise forbidden()
    return event
