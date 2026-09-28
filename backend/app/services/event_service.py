from uuid import UUID
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.robot_event import RobotEvent
from app.schemas.event import EventCreate
from app.core.exceptions import not_found, forbidden
from app.services.robot_service import get_robot
from app.services.hash_service import canonicalize_event, compute_hash


async def create_event(db: AsyncSession, event_in: EventCreate, owner_id: UUID) -> RobotEvent:
    robot = await get_robot(db, event_in.robot_id)
    if robot.owner_id != owner_id:
        raise forbidden("You don't own this robot")

    event = RobotEvent(
        **event_in.model_dump(),
        owner_id=owner_id
    )
    
    # We must add it to session and flush to get an ID for canonicalization
    db.add(event)
    await db.flush()
    
    # Generate deterministic representation and hash
    event.canonical_repr = canonicalize_event(event)
    event.event_hash = compute_hash(event.canonical_repr)
    event.hash_created_at = datetime.now(timezone.utc)
    
    await db.flush()
    return event


async def get_event(db: AsyncSession, event_id: UUID) -> RobotEvent:
    event = await db.get(RobotEvent, event_id)
    if not event:
        raise not_found("Event")
    return event


async def list_events(db: AsyncSession, owner_id: UUID | None = None, limit: int = 100) -> list[RobotEvent]:
    query = select(RobotEvent).order_by(RobotEvent.event_timestamp.desc()).limit(limit)
    if owner_id:
        query = query.where(RobotEvent.owner_id == owner_id)
    result = await db.execute(query)
    return list(result.scalars().all())
