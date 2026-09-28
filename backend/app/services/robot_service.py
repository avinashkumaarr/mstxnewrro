from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.robot import Robot
from app.schemas.robot import RobotCreate, RobotUpdate
from app.core.exceptions import not_found, forbidden


async def create_robot(db: AsyncSession, robot_in: RobotCreate, owner_id: UUID) -> Robot:
    robot = Robot(**robot_in.model_dump(by_alias=True), owner_id=owner_id)
    db.add(robot)
    await db.flush()
    return robot


async def get_robot(db: AsyncSession, robot_id: UUID) -> Robot:
    robot = await db.get(Robot, robot_id)
    if not robot:
        raise not_found("Robot")
    return robot


async def list_robots(db: AsyncSession, owner_id: UUID | None = None) -> list[Robot]:
    query = select(Robot)
    if owner_id:
        query = query.where(Robot.owner_id == owner_id)
    result = await db.execute(query)
    return list(result.scalars().all())


async def update_robot(db: AsyncSession, robot_id: UUID, robot_in: RobotUpdate, user_id: UUID) -> Robot:
    robot = await get_robot(db, robot_id)
    if robot.owner_id != user_id:
        raise forbidden("You don't own this robot")

    update_data = robot_in.model_dump(exclude_unset=True, by_alias=True)
    for field, value in update_data.items():
        setattr(robot, field, value)
    
    await db.flush()
    return robot


async def delete_robot(db: AsyncSession, robot_id: UUID, user_id: UUID) -> None:
    robot = await get_robot(db, robot_id)
    if robot.owner_id != user_id:
        raise forbidden("You don't own this robot")
    await db.delete(robot)
    await db.flush()
