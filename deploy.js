const hre = require('hardhat');

async function main() {
  const NFTDegree = await hre.ethers.getContractFactory('NFTDegree');
  const nft = await NFTDegree.deploy('UniversityDegreeNFT', 'UDN');
  await nft.deployed();
  console.log('NFTDegree deployed to:', nft.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});