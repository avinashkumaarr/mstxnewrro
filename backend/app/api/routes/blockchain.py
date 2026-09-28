import random
import hashlib
import time
from datetime import datetime, timezone
from fastapi import APIRouter

from app.schemas.blockchain import BlockchainAnchorRequest, BlockchainRecordResponse, VerificationResponse
from app.services.blockchain_service import anchor_event, verify_event
from app.core.dependencies import DB, CurrentUserId

router = APIRouter(prefix="/blockchain", tags=["blockchain"])

# In-memory block height tracker (resets on server restart)
_block_height_ref = {"height": 4921803, "last_update": time.time()}


def _tick_block_height() -> int:
    now = time.time()
    elapsed = now - _block_height_ref["last_update"]
    new_blocks = int(elapsed / 1.2)  # avg 1.2s per block
    if new_blocks > 0:
        _block_height_ref["height"] += new_blocks
        _block_height_ref["last_update"] = now
    return _block_height_ref["height"]


def _mock_hex(length: int = 64) -> str:
    return "0x" + hashlib.sha256(str(random.random()).encode()).hexdigest()[:length]


@router.get("/status")
async def get_blockchain_status():
    """Returns current MST Testnet node status — no auth required."""
    block_height = _tick_block_height()
    return {
        "connected": True,
        "walletAddress": "0x8F71C94b2A06E5D71C94b2A06E5D71C17A4B3c2",
        "network": "MST Testnet v2.4",
        "chainId": 8841,
        "blockHeight": block_height,
        "latencyMs": random.randint(6, 14),
        "balanceMST": round(42.85 - random.uniform(0, 0.01), 4),
        "activeDaemons": 14,
        "clusterHealth": "SYNCHRONIZED",
        "tps": round(random.uniform(1.8, 3.2), 2),
        "pendingTxns": random.randint(0, 5),
        "lastBlockTime": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/activities")
async def list_blockchain_activities(limit: int = 20):
    """Returns recent blockchain attestation events — no auth required for demo."""
    event_types = [
        "CHALLENGE_PASSED", "SIMULATION_COMPLETED", "CODE_SUBMITTED",
        "CHALLENGE_STARTED", "CHALLENGE_FAILED",
    ]
    challenge_titles = [
        "Dynamic Obstacle Avoidance & Waypoint Navigation",
        "Autonomous Path Planning (Dynamic A*)",
        "Differential Drive Kinematics",
        "Multi-Agent Coordination Protocol",
        "SLAM-Based Map Reconstruction",
    ]
    block_height = _tick_block_height()

    activities = []
    for i in range(min(limit, 20)):
        evt_type = event_types[i % len(event_types)]
        title = challenge_titles[i % len(challenge_titles)]
        block = block_height - i * 3
        activities.append({
            "id": f"act-{block}-{i}",
            "type": evt_type,
            "challengeId": f"challenge-{(i % 8) + 1:02d}",
            "challengeTitle": title,
            "timestamp": datetime.now(timezone.utc).strftime("%H:%M:%S"),
            "eventHash": _mock_hex(64),
            "transactionHash": _mock_hex(64),
            "blockNumber": block,
            "network": "MST TESTNET (Chain ID: 8841)",
            "status": "confirmed" if i > 0 else "pending",
            "details": {
                "score": round(random.uniform(78, 99.9), 1) if evt_type == "CHALLENGE_PASSED" else None,
                "executionTime": round(random.uniform(12, 32), 1),
                "collisions": 0,
                "gasUsed": f"0.000{random.randint(21, 55)} MST",
                "latencyMs": random.randint(8, 24),
            },
        })
    return activities


@router.post("/anchor", response_model=BlockchainRecordResponse)
async def request_anchor(req: BlockchainAnchorRequest, db: DB, user_id: CurrentUserId):
    return await anchor_event(db, req.event_id)


@router.get("/verify/{event_id}", response_model=VerificationResponse)
async def verify_event_integrity(event_id: str, db: DB, user_id: CurrentUserId):
    from uuid import UUID
    return await verify_event(db, UUID(event_id))

