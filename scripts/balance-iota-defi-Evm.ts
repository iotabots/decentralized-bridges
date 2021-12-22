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

  const Token = await ethers.getContractFactory("TokenIotaDefiEvm");

  const token = await Token.attach(
    "0xC40af1448fB9DbEEA037Ecd07db51106931e0BBB"
  );
  const recieverAddress = "0x1580f3062af55e0D23b251341Db5dA323D5f9c66";

  const balance = await token.balanceOf(recieverAddress);
  console.log("balance: ", balance.toString());
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
