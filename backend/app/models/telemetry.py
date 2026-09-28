import uuid
from datetime import datetime

from sqlalchemy import Float, DateTime, ForeignKey, JSON, func, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID as PG_UUID

from app.db.base import Base


class TelemetryRecord(Base):
    __tablename__ = "telemetry"

    id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    robot_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("robots.id", ondelete="CASCADE"), nullable=False, index=True
    )
    simulation_id: Mapped[uuid.UUID | None] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("simulations.id", ondelete="SET NULL"), index=True
    )
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    position_x: Mapped[float | None] = mapped_column(Float)
    position_y: Mapped[float | None] = mapped_column(Float)
    position_z: Mapped[float | None] = mapped_column(Float)
    orientation: Mapped[float | None] = mapped_column(Float)
    velocity_linear: Mapped[float | None] = mapped_column(Float)
    velocity_angular: Mapped[float | None] = mapped_column(Float)
    battery: Mapped[float | None] = mapped_column(Float)
    sensor_readings: Mapped[dict | None] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    simulation: Mapped["Simulation"] = relationship("Simulation", back_populates="telemetry")  # type: ignore[name-defined]

    __table_args__ = (
        Index("ix_telemetry_robot_timestamp", "robot_id", "timestamp"),
        Index("ix_telemetry_sim_timestamp", "simulation_id", "timestamp"),
    )
