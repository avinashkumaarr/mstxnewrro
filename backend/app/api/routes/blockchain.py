from fastapi import APIRouter

from app.schemas.blockchain import BlockchainAnchorRequest, BlockchainRecordResponse, VerificationResponse
from app.services.blockchain_service import anchor_event, verify_event
from app.core.dependencies import DB, CurrentUserId

router = APIRouter(prefix="/blockchain", tags=["blockchain"])


@router.post("/anchor", response_model=BlockchainRecordResponse)
async def request_anchor(req: BlockchainAnchorRequest, db: DB, user_id: CurrentUserId):
    # Depending on auth, might want to check if they own the event
    return await anchor_event(db, req.event_id)


@router.get("/verify/{event_id}", response_model=VerificationResponse)
async def verify_event_integrity(event_id: str, db: DB, user_id: CurrentUserId):
    from uuid import UUID
    return await verify_event(db, UUID(event_id))
