from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
import logging
import asyncio
import random
import hashlib
import json
import time

import app.models  # ensure models are loaded
from app.core.config import get_settings
from app.api.router import api_router
from app.websocket.simulation_socket import manager

settings = get_settings()

logging.basicConfig(level=logging.INFO if not settings.DEBUG else logging.DEBUG)
logger = logging.getLogger(__name__)

# Shared block height for WebSocket
_ws_block_ref = {"height": 4921803, "last_update": time.time()}


def _ws_tick_height() -> int:
    now = time.time()
    elapsed = now - _ws_block_ref["last_update"]
    new_blocks = int(elapsed / 1.2)
    if new_blocks > 0:
        _ws_block_ref["height"] += new_blocks
        _ws_block_ref["last_update"] = now
    return _ws_block_ref["height"]


def _mock_hex(n: int = 64) -> str:
    return "0x" + hashlib.sha256(str(random.random()).encode()).hexdigest()[:n]


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting RoboLedger API...")
    yield
    logger.info("Shutting down RoboLedger API...")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")


@app.websocket("/ws/simulation/{simulation_id}")
async def websocket_endpoint(websocket: WebSocket, simulation_id: str):
    await manager.connect(websocket, simulation_id)
    try:
        while True:
            data = await websocket.receive_json()
            await manager.broadcast(data, simulation_id)
    except WebSocketDisconnect:
        manager.disconnect(websocket, simulation_id)


@app.websocket("/ws/blockchain")
async def blockchain_websocket(websocket: WebSocket):
    """Streams live MST Testnet block events every ~1.2 seconds."""
    await websocket.accept()
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
    try:
        tick = 0
        while True:
            await asyncio.sleep(1.2)
            block_height = _ws_tick_height()
            evt_type = event_types[tick % len(event_types)]
            title = challenge_titles[tick % len(challenge_titles)]

            payload = {
                "type": "BLOCK_PRODUCED",
                "blockHeight": block_height,
                "blockHash": _mock_hex(64),
                "tps": round(random.uniform(1.8, 3.2), 2),
                "latencyMs": random.randint(6, 14),
                "pendingTxns": random.randint(0, 5),
                "timestamp": time.strftime("%H:%M:%S", time.gmtime()),
                "transaction": {
                    "id": f"act-{block_height}-{tick}",
                    "type": evt_type,
                    "challengeTitle": title,
                    "challengeId": f"challenge-{(tick % 8) + 1:02d}",
                    "eventHash": _mock_hex(64),
                    "transactionHash": _mock_hex(64),
                    "blockNumber": block_height,
                    "network": "MST TESTNET (Chain ID: 8841)",
                    "status": "confirmed",
                    "timestamp": time.strftime("%H:%M:%S", time.gmtime()),
                    "details": {
                        "score": round(random.uniform(78, 99.9), 1) if evt_type == "CHALLENGE_PASSED" else None,
                        "executionTime": round(random.uniform(12, 32), 1),
                        "collisions": 0,
                        "gasUsed": f"0.000{random.randint(21, 55)} MST",
                        "latencyMs": random.randint(8, 24),
                    },
                },
            }
            await websocket.send_json(payload)
            tick += 1
    except (WebSocketDisconnect, Exception):
        pass


@app.get("/health")
def root_health_check():
    return {
        "status": "ok",
        "service": "RoboLedger API"
    }