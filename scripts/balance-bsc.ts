// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";

async function main() {
  const [owner] = await ethers.getSigners();
  console.log("owner");
  console.log(owner.address);

  const TokenIotaEvm = await ethers.getContractFactory("TokenBsc");

  const tokenIotaEvm = await TokenIotaEvm.attach(
    "0x48c560295504826f94CA0dfE120D4b540148D9b0"
  );
  const recieverAddress = "0x8719c0e3E5f950ae9b305feD9B2B2f830C127958";

  const balance = await tokenIotaEvm.balanceOf(recieverAddress);
  console.log("TokenBsc balance: ", balance.toString());
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
