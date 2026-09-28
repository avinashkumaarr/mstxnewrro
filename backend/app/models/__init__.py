from app.models.user import User
from app.models.robot import Robot
from app.models.simulation import Simulation
from app.models.telemetry import TelemetryRecord
from app.models.robot_event import RobotEvent
from app.models.maintenance import MaintenanceRecord
from app.models.blockchain_record import BlockchainRecord

# Alias for convenience
Telemetry = TelemetryRecord

# Expose models
__all__ = [
    "User",
    "Robot",
    "Simulation",
    "TelemetryRecord",
    "Telemetry",
    "RobotEvent",
    "MaintenanceRecord",
    "BlockchainRecord",
]
