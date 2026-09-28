from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict

from app.models.blockchain_record import TransactionStatus


class BlockchainRecordResponse(BaseModel):
    id: UUID
    event_id: UUID
    chain_id: int
    contract_address: str
    transaction_hash: str | None
    block_number: int | None
    event_hash: str
    status: TransactionStatus
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class BlockchainAnchorRequest(BaseModel):
    event_id: UUID


class VerificationResponse(BaseModel):
    event_id: UUID
    is_verified: bool
    local_hash: str
    on_chain_hash: str | None
    status: TransactionStatus
    message: str
