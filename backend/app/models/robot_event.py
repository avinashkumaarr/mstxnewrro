import uuid
import enum
from datetime import datetime

from sqlalchemy import String, DateTime, ForeignKey, Enum as SAEnum, JSON, func, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID as PG_UUID

from app.db.base import Base


class EventType(str, enum.Enum):
    task_started = "task_started"
    task_completed = "task_completed"
    collision = "collision"
    obstacle_detected = "obstacle_detected"
    low_battery = "low_battery"
    maintenance = "maintenance"
    robot_registered = "robot_registered"
    software_updated = "software_updated"


class RobotEvent(Base):
    __tablename__ = "robot_events"

    id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    robot_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("robots.id", ondelete="CASCADE"), nullable=False, index=True
    )
    simulation_id: Mapped[uuid.UUID | None] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("simulations.id", ondelete="SET NULL"), index=True
    )
    owner_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    event_type: Mapped[EventType] = mapped_column(SAEnum(EventType), nullable=False, index=True)
    event_timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    payload: Mapped[dict | None] = mapped_column(JSON)
    canonical_repr: Mapped[str | None] = mapped_column(String(4096))
    event_hash: Mapped[str | None] = mapped_column(String(64), index=True)  # SHA-256 hex
    hash_created_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    blockchain_anchor_id: Mapped[uuid.UUID | None] = mapped_column(PG_UUID(as_uuid=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    robot: Mapped["Robot"] = relationship("Robot", back_populates="events")  # type: ignore[name-defined]
    simulation: Mapped["Simulation"] = relationship("Simulation", back_populates="events")  # type: ignore[name-defined]
    blockchain_record: Mapped["BlockchainRecord"] = relationship(  # type: ignore[name-defined]
        "BlockchainRecord", back_populates="event", uselist=False
    )

    __table_args__ = (
        Index("ix_robot_events_type_ts", "event_type", "event_timestamp"),
    )
