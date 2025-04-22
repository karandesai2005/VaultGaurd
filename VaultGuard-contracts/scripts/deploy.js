async function main() {
    const VaultGuard = await ethers.getContractFactory("VaultGuard");
    const vault = await VaultGuard.deploy();
    await vault.waitForDeployment(); // Wait for deployment confirmation
    console.log("VaultGuard deployed to:", await vault.getAddress());
  }
  
  main()
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });