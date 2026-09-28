"""init_db — creates all tables (for dev/testing without Alembic)."""
from app.db.base import Base
from app.db.session import engine

# Import all models so Base knows about them
from app.models import user, robot, simulation, telemetry, robot_event, maintenance, blockchain_record  # noqa: F401


async def init_db() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
