import hardhat from "hardhat";
const { ethers, artifacts } = hardhat;
import fs from "fs";

async function main() {
  console.log("Deploying OnChainAnalytics contract...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  const OnChainAnalytics = await ethers.getContractFactory("OnChainAnalytics");
  const analytics = await OnChainAnalytics.deploy();

  await analytics.waitForDeployment();
  const address = await analytics.getAddress();

  console.log("OnChainAnalytics deployed to:", address);

  // Save the contract address and ABI for the frontend
    const contractsDir = "./src/contracts";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    contractsDir + "/contract-address.json",
    JSON.stringify({ OnChainAnalytics: address }, undefined, 2)
  );

  const OnChainAnalyticsArtifact = await artifacts.readArtifact("OnChainAnalytics");

  fs.writeFileSync(
    contractsDir + "/OnChainAnalytics.json",
    JSON.stringify(OnChainAnalyticsArtifact, null, 2)
  );

  console.log("Contract artifacts saved to src/contracts/");
}

main()
  .then(() => {})
  .catch((error) => {
    console.error(error);
  });