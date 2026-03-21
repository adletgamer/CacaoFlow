import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "AVAX");

  // 1. Deploy MockUSDC
  console.log("\n1. Deploying MockUSDC...");
  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const mockUSDC = await MockUSDC.deploy();
  await mockUSDC.waitForDeployment();
  const usdcAddress = await mockUSDC.getAddress();
  console.log("MockUSDC deployed to:", usdcAddress);

  // 2. Deploy CacaoFlowOpportunities
  console.log("\n2. Deploying CacaoFlowOpportunities...");
  const CacaoFlow = await ethers.getContractFactory("CacaoFlowOpportunities");
  const cacaoFlow = await CacaoFlow.deploy(usdcAddress, deployer.address);
  await cacaoFlow.waitForDeployment();
  const cacaoFlowAddress = await cacaoFlow.getAddress();
  console.log("CacaoFlowOpportunities deployed to:", cacaoFlowAddress);

  // 3. Save addresses to frontend
  const addresses = {
    chainId: 43113,
    network: "avalanche-fuji",
    MockUSDC: usdcAddress,
    CacaoFlowOpportunities: cacaoFlowAddress,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
  };

  const outputDir = path.join(__dirname, "../../src/lib/contracts");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(outputDir, "addresses.json"),
    JSON.stringify(addresses, null, 2)
  );
  console.log("\nAddresses saved to src/lib/contracts/addresses.json");

  // 4. Export ABIs
  const usdcArtifact = await ethers.getContractFactory("MockUSDC");
  const cacaoArtifact = await ethers.getContractFactory("CacaoFlowOpportunities");

  fs.writeFileSync(
    path.join(outputDir, "MockUSDC.abi.json"),
    JSON.stringify(usdcArtifact.interface.fragments, null, 2)
  );
  fs.writeFileSync(
    path.join(outputDir, "CacaoFlowOpportunities.abi.json"),
    JSON.stringify(cacaoArtifact.interface.fragments, null, 2)
  );
  console.log("ABIs saved to src/lib/contracts/");

  console.log("\n✅ Deployment complete!");
  console.log("─────────────────────────────────────────");
  console.log("MockUSDC:               ", usdcAddress);
  console.log("CacaoFlowOpportunities: ", cacaoFlowAddress);
  console.log("─────────────────────────────────────────");
  console.log("Explorer: https://testnet.snowtrace.io/address/" + cacaoFlowAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
