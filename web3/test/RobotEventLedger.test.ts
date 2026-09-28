import { expect } from "chai";
import hre from "hardhat";
import { RobotRegistry, RobotEventLedger } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("RobotEventLedger", function () {
  let registry: RobotRegistry;
  let ledger: RobotEventLedger;
  let owner: SignerWithAddress;

  beforeEach(async function () {
    [owner] = await hre.ethers.getSigners();
    const RobotRegistry = await hre.ethers.getContractFactory("RobotRegistry");
    registry = await RobotRegistry.deploy();

    const RobotEventLedger = await hre.ethers.getContractFactory("RobotEventLedger");
    ledger = await RobotEventLedger.deploy(await registry.getAddress());
  });

  it("Should anchor an event", async function () {
    const robotId = hre.ethers.id("robot-1");
    await registry.registerRobot(robotId, "ipfs://metadata-uri");

    const eventId = hre.ethers.id("event-1");
    const eventHash = hre.ethers.id("payload-hash");

    await expect(ledger.anchorEvent(eventId, robotId, eventHash))
      .to.emit(ledger, "ProofAnchored")
      .withArgs(eventId, robotId, eventHash, owner.address);

    const proof = await ledger.getEventProof(eventId);
    expect(proof.robotId).to.equal(robotId);
    expect(proof.eventHash).to.equal(eventHash);
    expect(proof.submitter).to.equal(owner.address);
  });
});
