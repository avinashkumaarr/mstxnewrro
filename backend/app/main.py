from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.core.config import get_settings
from app.api.router import api_router
from app.websocket.simulation_socket import manager

settings = get_settings()

logging.basicConfig(level=logging.INFO if not settings.DEBUG else logging.DEBUG)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting RoboLedger API...")
    # Typically would init DB here or rely on Alembic
    # from app.db.init_db import init_db
    # await init_db()
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
            # Echo back or broadcast to others
            await manager.broadcast(data, simulation_id)
    except WebSocketDisconnect:
        manager.disconnect(websocket, simulation_id)

@app.get("/health")
def root_health_check():
    return {
        "status": "ok",
        "service": "RoboLedger API"
    }