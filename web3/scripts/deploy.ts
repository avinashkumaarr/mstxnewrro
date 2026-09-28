import hre from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("Deploying RoboLedger contracts...");

  const RobotRegistry = await hre.ethers.getContractFactory("RobotRegistry");
  const registry = await RobotRegistry.deploy();
  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();
  console.log(`RobotRegistry deployed to: ${registryAddress}`);

  const RobotEventLedger = await hre.ethers.getContractFactory("RobotEventLedger");
  const ledger = await RobotEventLedger.deploy(registryAddress);
  await ledger.waitForDeployment();
  const ledgerAddress = await ledger.getAddress();
  console.log(`RobotEventLedger deployed to: ${ledgerAddress}`);

  const network = hre.network.name;
  const chainId = hre.network.config.chainId || 0;

  const manifest = {
    network,
    chainId,
    robotRegistry: registryAddress,
    robotEventLedger: ledgerAddress,
    timestamp: new Date().toISOString(),
  };

  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  const manifestPath = path.join(deploymentsDir, `${network}.json`);
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`Deployment manifest saved to ${manifestPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
