from uuid import UUID
from fastapi import APIRouter

from app.schemas.telemetry import TelemetryCreate, TelemetryResponse
from app.services.telemetry_service import ingest_telemetry_batch, get_latest_telemetry
from app.core.dependencies import DB, CurrentUserId

router = APIRouter(prefix="/telemetry", tags=["telemetry"])


@router.post("/batch")
async def ingest_batch(batch: list[TelemetryCreate], db: DB, user_id: CurrentUserId):
    count = await ingest_telemetry_batch(db, batch, UUID(user_id))
    return {"inserted": count}


@router.get("/{robot_id}/latest", response_model=list[TelemetryResponse])
async def read_latest_telemetry(robot_id: UUID, db: DB, user_id: CurrentUserId, limit: int = 100):
    return await get_latest_telemetry(db, robot_id, limit)
