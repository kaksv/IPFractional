import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Deploy IPAssetRegistry
  console.log("\n1. Deploying IPAssetRegistry...");
  const IPAssetRegistry = await ethers.getContractFactory("IPAssetRegistry");
  const ipAssetRegistry = await IPAssetRegistry.deploy();
  await ipAssetRegistry.waitForDeployment();
  const ipAssetRegistryAddress = await ipAssetRegistry.getAddress();
  console.log("IPAssetRegistry deployed to:", ipAssetRegistryAddress);

  // Deploy IPFractionalizer
  console.log("\n2. Deploying IPFractionalizer...");
  const IPFractionalizer = await ethers.getContractFactory("IPFractionalizer");
  const ipFractionalizer = await IPFractionalizer.deploy(ipAssetRegistryAddress);
  await ipFractionalizer.waitForDeployment();
  const ipFractionalizerAddress = await ipFractionalizer.getAddress();
  console.log("IPFractionalizer deployed to:", ipFractionalizerAddress);

  // Deploy RoyaltyDistributor
  console.log("\n3. Deploying RoyaltyDistributor...");
  const RoyaltyDistributor = await ethers.getContractFactory("RoyaltyDistributor");
  const royaltyDistributor = await RoyaltyDistributor.deploy(
    ipAssetRegistryAddress,
    ipFractionalizerAddress
  );
  await royaltyDistributor.waitForDeployment();
  const royaltyDistributorAddress = await royaltyDistributor.getAddress();
  console.log("RoyaltyDistributor deployed to:", royaltyDistributorAddress);

  // Deploy IPMarketplace
  console.log("\n4. Deploying IPMarketplace...");
  const IPMarketplace = await ethers.getContractFactory("IPMarketplace");
  const ipMarketplace = await IPMarketplace.deploy(ipFractionalizerAddress);
  await ipMarketplace.waitForDeployment();
  const ipMarketplaceAddress = await ipMarketplace.getAddress();
  console.log("IPMarketplace deployed to:", ipMarketplaceAddress);

  // Deploy IPGovernance
  console.log("\n5. Deploying IPGovernance...");
  const IPGovernance = await ethers.getContractFactory("IPGovernance");
  const ipGovernance = await IPGovernance.deploy(ipFractionalizerAddress);
  await ipGovernance.waitForDeployment();
  const ipGovernanceAddress = await ipGovernance.getAddress();
  console.log("IPGovernance deployed to:", ipGovernanceAddress);

  // Save deployment addresses
  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId,
    deployer: deployer.address,
    contracts: {
      IPAssetRegistry: ipAssetRegistryAddress,
      IPFractionalizer: ipFractionalizerAddress,
      RoyaltyDistributor: royaltyDistributorAddress,
      IPMarketplace: ipMarketplaceAddress,
      IPGovernance: ipGovernanceAddress,
    },
    timestamp: new Date().toISOString(),
  };

  console.log("\n=== Deployment Summary ===");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Write to file
  const fs = require("fs");
  const path = require("path");
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  const networkName = (await ethers.provider.getNetwork()).name;
  const deploymentFile = path.join(deploymentsDir, `${networkName}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\nDeployment info saved to: ${deploymentFile}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

