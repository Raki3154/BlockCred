const hre = require("hardhat");

async function main() {
  console.log("Deploying Academic Credential contract...");

  const AcademicCredential = await hre.ethers.getContractFactory("AcademicCredential");
  const academicCredential = await AcademicCredential.deploy();

  await academicCredential.waitForDeployment();

  const address = await academicCredential.getAddress();
  console.log("Academic Credential deployed to:", address);

  // Verify the contract on Etherscan (if not on localhost)
  if (hre.network.name !== "localhost" && hre.network.name !== "hardhat") {
    console.log("Waiting for block confirmations...");
    await academicCredential.deploymentTransaction().wait(6);
    
    try {
      await hre.run("verify:verify", {
        address: address,
        constructorArguments: [],
      });
      console.log("Contract verified on Etherscan");
    } catch (error) {
      console.log("Verification failed:", error.message);
    }
  }

  console.log("Deployment completed successfully!");
  console.log("Contract Address:", address);
  console.log("Network:", hre.network.name);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
