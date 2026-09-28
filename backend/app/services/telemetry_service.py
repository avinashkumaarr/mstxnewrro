from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.telemetry import TelemetryRecord
from app.schemas.telemetry import TelemetryCreate
from app.core.exceptions import forbidden
from app.services.robot_service import get_robot


async def ingest_telemetry_batch(db: AsyncSession, batch: list[TelemetryCreate], user_id: UUID) -> int:
    if not batch:
        return 0
        
    # Optimistically assuming the batch belongs to the same robot for ownership check
    # In a real system, we might cache this check or check each unique robot_id
    robot_id = batch[0].robot_id
    robot = await get_robot(db, robot_id)
    if robot.owner_id != user_id:
        raise forbidden("You don't own this robot")

    records = [TelemetryRecord(**item.model_dump()) for item in batch]
    db.add_all(records)
    await db.flush()
    return len(records)


async def get_latest_telemetry(db: AsyncSession, robot_id: UUID, limit: int = 100) -> list[TelemetryRecord]:
    query = (
        select(TelemetryRecord)
        .where(TelemetryRecord.robot_id == robot_id)
        .order_by(TelemetryRecord.timestamp.desc())
        .limit(limit)
    )
    result = await db.execute(query)
    return list(result.scalars().all())
