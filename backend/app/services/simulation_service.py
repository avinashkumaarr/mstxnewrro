from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.simulation import Simulation, SimulationStatus
from app.schemas.simulation import SimulationCreate, SimulationUpdate
from app.core.exceptions import not_found, forbidden, bad_request
from app.services.robot_service import get_robot


async def create_simulation(db: AsyncSession, sim_in: SimulationCreate, owner_id: UUID) -> Simulation:
    robot = await get_robot(db, sim_in.robot_id)
    if robot.owner_id != owner_id:
        raise forbidden("You don't own this robot")

    sim = Simulation(**sim_in.model_dump(), owner_id=owner_id)
    db.add(sim)
    await db.flush()
    return sim


async def get_simulation(db: AsyncSession, sim_id: UUID) -> Simulation:
    sim = await db.get(Simulation, sim_id)
    if not sim:
        raise not_found("Simulation")
    return sim


async def list_simulations(db: AsyncSession, owner_id: UUID | None = None) -> list[Simulation]:
    query = select(Simulation)
    if owner_id:
        query = query.where(Simulation.owner_id == owner_id)
    result = await db.execute(query)
    return list(result.scalars().all())


async def update_simulation_status(db: AsyncSession, sim_id: UUID, status: SimulationStatus, user_id: UUID) -> Simulation:
    sim = await get_simulation(db, sim_id)
    if sim.owner_id != user_id:
        raise forbidden("You don't own this simulation")
        
    if not sim.can_transition_to(status):
        raise bad_request(f"Cannot transition simulation from {sim.status.value} to {status.value}")

    sim.status = status
    await db.flush()
    return sim
