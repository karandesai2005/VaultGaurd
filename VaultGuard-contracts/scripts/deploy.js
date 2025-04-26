const { ethers } = require("hardhat");

async function main() {
  const VaultGuard = await ethers.getContractFactory("VaultGuard");
  const vaultGuard = await VaultGuard.deploy();
  const tx = await vaultGuard.waitForDeployment();
  console.log("Deployment transaction:", tx);
  console.log("VaultGuard deployed to:", vaultGuard.target);

  // Verify deployment
  const provider = ethers.provider;
  const code = await provider.getCode(vaultGuard.target);
  console.log("Contract code:", code);
}

main().catch((error) => {
  console.error("Deployment error:", error);
  process.exitCode = 1;
});