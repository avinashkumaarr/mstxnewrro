import uuid
import enum
from datetime import datetime

from sqlalchemy import String, Float, Boolean, DateTime, ForeignKey, Enum as SAEnum, JSON, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID as PG_UUID

from app.db.base import Base


class RobotStatus(str, enum.Enum):
    idle = "idle"
    running = "running"
    paused = "paused"
    offline = "offline"
    maintenance = "maintenance"


class Robot(Base):
    __tablename__ = "robots"

    id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    model: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str | None] = mapped_column(String(1000))
    status: Mapped[RobotStatus] = mapped_column(SAEnum(RobotStatus), default=RobotStatus.idle, index=True)
    battery_percentage: Mapped[float] = mapped_column(Float, default=100.0)
    position_x: Mapped[float] = mapped_column(Float, default=0.0)
    position_y: Mapped[float] = mapped_column(Float, default=0.0)
    position_z: Mapped[float] = mapped_column(Float, default=0.0)
    orientation: Mapped[float] = mapped_column(Float, default=0.0)  # degrees
    capabilities: Mapped[list | None] = mapped_column(JSON)
    metadata_: Mapped[dict | None] = mapped_column("metadata", JSON)
    owner_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    owner: Mapped["User"] = relationship("User", back_populates="robots")  # type: ignore[name-defined]
    simulations: Mapped[list["Simulation"]] = relationship("Simulation", back_populates="robot", lazy="noload")  # type: ignore[name-defined]
    events: Mapped[list["RobotEvent"]] = relationship("RobotEvent", back_populates="robot", lazy="noload")  # type: ignore[name-defined]
    maintenance_records: Mapped[list["MaintenanceRecord"]] = relationship("MaintenanceRecord", back_populates="robot", lazy="noload")  # type: ignore[name-defined]
