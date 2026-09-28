import uuid
import enum
from datetime import datetime

from sqlalchemy import String, Float, DateTime, ForeignKey, Enum as SAEnum, JSON, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID as PG_UUID

from app.db.base import Base


class SimulationStatus(str, enum.Enum):
    created = "created"
    running = "running"
    paused = "paused"
    completed = "completed"
    stopped = "stopped"
    failed = "failed"


class Simulation(Base):
    __tablename__ = "simulations"

    id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    robot_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("robots.id", ondelete="CASCADE"), nullable=False, index=True
    )
    owner_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    environment_config: Mapped[dict | None] = mapped_column(JSON)
    initial_pose: Mapped[dict | None] = mapped_column(JSON)
    goal: Mapped[dict | None] = mapped_column(JSON)
    status: Mapped[SimulationStatus] = mapped_column(SAEnum(SimulationStatus), default=SimulationStatus.created, index=True)
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    ended_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    summary: Mapped[dict | None] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    robot: Mapped["Robot"] = relationship("Robot", back_populates="simulations")  # type: ignore[name-defined]
    telemetry: Mapped[list["TelemetryRecord"]] = relationship("TelemetryRecord", back_populates="simulation", lazy="noload")  # type: ignore[name-defined]
    events: Mapped[list["RobotEvent"]] = relationship("RobotEvent", back_populates="simulation", lazy="noload")  # type: ignore[name-defined]

    _VALID_TRANSITIONS: dict[str, list[str]] = {
        "created": ["running"],
        "running": ["paused", "completed", "stopped", "failed"],
        "paused": ["running", "stopped"],
        "completed": [],
        "stopped": [],
        "failed": [],
    }

    def can_transition_to(self, new_status: SimulationStatus) -> bool:
        allowed = self._VALID_TRANSITIONS.get(self.status.value, [])
        return new_status.value in allowed
