from uuid import UUID
from fastapi import APIRouter

from app.schemas.robot import RobotCreate, RobotResponse, RobotUpdate
from app.services.robot_service import create_robot, get_robot, list_robots, update_robot, delete_robot
from app.core.dependencies import DB, CurrentUserId

router = APIRouter(prefix="/robots", tags=["robots"])


@router.post("/", response_model=RobotResponse)
async def create_new_robot(robot_in: RobotCreate, db: DB, user_id: CurrentUserId):
    return await create_robot(db, robot_in, UUID(user_id))


@router.get("/", response_model=list[RobotResponse])
async def read_robots(db: DB, user_id: CurrentUserId):
    return await list_robots(db, UUID(user_id))


@router.get("/{robot_id}", response_model=RobotResponse)
async def read_robot(robot_id: UUID, db: DB, user_id: CurrentUserId):
    robot = await get_robot(db, robot_id)
    if robot.owner_id != UUID(user_id):
        from app.core.exceptions import forbidden
        raise forbidden("You don't own this robot")
    return robot


@router.put("/{robot_id}", response_model=RobotResponse)
async def update_existing_robot(robot_id: UUID, robot_in: RobotUpdate, db: DB, user_id: CurrentUserId):
    return await update_robot(db, robot_id, robot_in, UUID(user_id))


@router.delete("/{robot_id}", status_code=204)
async def delete_existing_robot(robot_id: UUID, db: DB, user_id: CurrentUserId):
    await delete_robot(db, robot_id, UUID(user_id))
