// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');
  const [owner] = await ethers.getSigners();
  console.log("owner: ", owner.address);

  const recieverAddress = "0x8719c0e3E5f950ae9b305feD9B2B2f830C127958"

  // We get the contract to deploy
  const Token = await ethers.getContractFactory("TokenIotaEvm");
  const token = await Token.deploy();
  console.log("Token deployed to:", token.address);

  await token.mint(recieverAddress, ethers.utils.parseEther("1000.0"));
  console.log("Token minted to: ", recieverAddress);

  const Bridge = await ethers.getContractFactory("BridgeIotaEvm");
  const bridge = await Bridge.deploy(token.address);
  await bridge.deployed();
  console.log("Bridge deployed to:", bridge.address);

  await token.updateAdmin(bridge.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
