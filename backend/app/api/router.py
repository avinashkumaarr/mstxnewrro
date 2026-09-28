from fastapi import APIRouter

from .routes.health import router as health_router
from .routes.robots import router as robots_router
from .routes.simulations import router as simulations_router
from .routes.telemetry import router as telemetry_router
from .routes.events import router as events_router
from .routes.blockchain import router as blockchain_router

api_router = APIRouter()
api_router.include_router(health_router, prefix="/health")
api_router.include_router(robots_router)
api_router.include_router(simulations_router)
api_router.include_router(telemetry_router)
api_router.include_router(events_router)
api_router.include_router(blockchain_router)
