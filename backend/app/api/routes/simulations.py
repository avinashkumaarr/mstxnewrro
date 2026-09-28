from uuid import UUID
from fastapi import APIRouter

from app.schemas.simulation import SimulationCreate, SimulationResponse, SimulationUpdate
from app.models.simulation import SimulationStatus
from app.services.simulation_service import create_simulation, get_simulation, list_simulations, update_simulation_status
from app.core.dependencies import DB, CurrentUserId

router = APIRouter(prefix="/simulations", tags=["simulations"])


@router.post("/", response_model=SimulationResponse)
async def create_new_simulation(sim_in: SimulationCreate, db: DB, user_id: CurrentUserId):
    return await create_simulation(db, sim_in, UUID(user_id))


@router.get("/", response_model=list[SimulationResponse])
async def read_simulations(db: DB, user_id: CurrentUserId):
    return await list_simulations(db, UUID(user_id))


@router.get("/{sim_id}", response_model=SimulationResponse)
async def read_simulation(sim_id: UUID, db: DB, user_id: CurrentUserId):
    sim = await get_simulation(db, sim_id)
    if sim.owner_id != UUID(user_id):
        from app.core.exceptions import forbidden
        raise forbidden()
    return sim


@router.patch("/{sim_id}/status", response_model=SimulationResponse)
async def update_status(sim_id: UUID, status: SimulationStatus, db: DB, user_id: CurrentUserId):
    return await update_simulation_status(db, sim_id, status, UUID(user_id))
