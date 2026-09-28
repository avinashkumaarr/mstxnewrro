import json
import hashlib
from typing import Any

from app.models.robot_event import RobotEvent


def canonicalize_event(event: RobotEvent) -> str:
    """
    Creates a deterministic canonical JSON string representing the event.
    Keys are sorted, and spacing is removed to ensure the exact same hash
    is generated for the same logical event fields on any platform.
    """
    data: dict[str, Any] = {
        "event_id": str(event.id),
        "robot_id": str(event.robot_id),
        "simulation_id": str(event.simulation_id) if event.simulation_id else None,
        "event_type": event.event_type.value,
        "event_timestamp": event.event_timestamp.isoformat(),
        "payload": event.payload,
    }
    
    # Sort keys and use the most compact JSON representation
    return json.dumps(data, sort_keys=True, separators=(",", ":"))


def compute_hash(canonical_repr: str) -> str:
    """Computes a SHA-256 hex digest of the canonical string."""
    return hashlib.sha256(canonical_repr.encode("utf-8")).hexdigest()
