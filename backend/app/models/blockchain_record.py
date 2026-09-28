import uuid
import enum
from datetime import datetime

from sqlalchemy import String, Integer, DateTime, ForeignKey, Enum as SAEnum, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID as PG_UUID

from app.db.base import Base


class TransactionStatus(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    failed = "failed"


class BlockchainRecord(Base):
    __tablename__ = "blockchain_records"

    id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("robot_events.id", ondelete="CASCADE"), nullable=False, unique=True, index=True
    )
    chain_id: Mapped[int] = mapped_column(Integer, nullable=False)
    contract_address: Mapped[str] = mapped_column(String(42), nullable=False)
    transaction_hash: Mapped[str | None] = mapped_column(String(66), unique=True, index=True)
    block_number: Mapped[int | None] = mapped_column(Integer)
    event_hash: Mapped[str] = mapped_column(String(66), nullable=False)  # 0x prefixed hex
    status: Mapped[TransactionStatus] = mapped_column(
        SAEnum(TransactionStatus), default=TransactionStatus.pending, index=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    event: Mapped["RobotEvent"] = relationship(  # type: ignore[name-defined]
        "RobotEvent", back_populates="blockchain_record"
    )
