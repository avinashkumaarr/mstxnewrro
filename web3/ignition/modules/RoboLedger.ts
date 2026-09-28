import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const RoboLedgerModule = buildModule("RoboLedgerModule", (m) => {
  // Deploy RobotRegistry first
  const robotRegistry = m.contract("RobotRegistry");

  // Deploy RobotEventLedger with the registry address
  const robotEventLedger = m.contract("RobotEventLedger", [robotRegistry]);

  return { robotRegistry, robotEventLedger };
});

export default RoboLedgerModule;
