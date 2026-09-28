from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.blockchain_record import BlockchainRecord, TransactionStatus
from app.services.event_service import get_event
from app.services.hash_service import canonicalize_event, compute_hash
from app.schemas.blockchain import VerificationResponse
from app.core.exceptions import bad_request


async def anchor_event(db: AsyncSession, event_id: UUID) -> BlockchainRecord:
    event = await get_event(db, event_id)
    
    if event.blockchain_anchor_id:
        record = await db.get(BlockchainRecord, event.blockchain_anchor_id)
        if record:
            return record

    if not event.event_hash:
        raise bad_request("Event has no hash to anchor")
        
    # Create a pending blockchain record
    record = BlockchainRecord(
        event_id=event.id,
        chain_id=0,  # MST Testnet chain ID placeholder
        contract_address="0x0000000000000000000000000000000000000000", # Placeholder
        event_hash="0x" + event.event_hash,
        status=TransactionStatus.pending
    )
    db.add(record)
    await db.flush()
    
    event.blockchain_anchor_id = record.id
    await db.flush()
    
    return record


async def verify_event(db: AsyncSession, event_id: UUID) -> VerificationResponse:
    event = await get_event(db, event_id)
    
    if not event.canonical_repr:
        return VerificationResponse(
            event_id=event_id,
            is_verified=False,
            local_hash="",
            on_chain_hash=None,
            status=TransactionStatus.failed,
            message="Event missing canonical representation"
        )
        
    local_hash = compute_hash(event.canonical_repr)
    
    if local_hash != event.event_hash:
        return VerificationResponse(
            event_id=event_id,
            is_verified=False,
            local_hash=local_hash,
            on_chain_hash=None,
            status=TransactionStatus.failed,
            message=f"Local hash mismatch: DB hash {event.event_hash} != {local_hash}"
        )
        
    if not event.blockchain_anchor_id:
        return VerificationResponse(
            event_id=event_id,
            is_verified=False,
            local_hash=local_hash,
            on_chain_hash=None,
            status=TransactionStatus.pending,
            message="Event hash matches DB, but is not anchored to blockchain yet"
        )
        
    record = await db.get(BlockchainRecord, event.blockchain_anchor_id)
    if not record:
        raise bad_request("Blockchain record missing")
        
    on_chain = record.event_hash.replace("0x", "")
    is_verified = (local_hash == on_chain and record.status == TransactionStatus.confirmed)
    
    msg = "Event verified on blockchain" if is_verified else f"Blockchain status: {record.status.value}"
    
    return VerificationResponse(
        event_id=event_id,
        is_verified=is_verified,
        local_hash=local_hash,
        on_chain_hash=on_chain,
        status=record.status,
        message=msg
    )
