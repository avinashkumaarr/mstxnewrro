import { expect } from "chai";
import hre from "hardhat";
import { RobotRegistry } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("RobotRegistry", function () {
  let registry: RobotRegistry;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;

  beforeEach(async function () {
    [owner, addr1] = await hre.ethers.getSigners();
    const RobotRegistry = await hre.ethers.getContractFactory("RobotRegistry");
    registry = await RobotRegistry.deploy();
  });

  it("Should register a new robot", async function () {
    const robotId = hre.ethers.id("robot-1");
    await expect(registry.registerRobot(robotId, "ipfs://metadata-uri"))
      .to.emit(registry, "RobotRegistered")
      .withArgs(robotId, owner.address, "ipfs://metadata-uri");

    const robot = await registry.robots(robotId);
    expect(robot.owner).to.equal(owner.address);
    expect(robot.isActive).to.be.true;
    expect(robot.metadataURI).to.equal("ipfs://metadata-uri");
  });

  it("Should not register duplicate robot", async function () {
    const robotId = hre.ethers.id("robot-1");
    await registry.registerRobot(robotId, "ipfs://metadata-uri");
    await expect(registry.registerRobot(robotId, "ipfs://metadata-uri-2"))
      .to.be.revertedWithCustomError(registry, "RobotAlreadyRegistered");
  });
});
