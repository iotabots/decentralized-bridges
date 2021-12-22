// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";
import Web3 from "web3";

const web3 = new Web3("https://evm.wasp.sc.iota.org");

async function main() {
  const [owner] = await ethers.getSigners();
  console.log("owner");
  console.log(owner.address);

  const BridgeBsc = await ethers.getContractFactory("BridgeBsc");

  const bridgeBsc = await BridgeBsc.attach(
    "0x18076eee61806762750E8B5c20678EB4B05D695A"
  );

  const nonce = 1; //Need to increment this for each new transfer

  const privKey =
    process.env.PRIVATE_KEY !== undefined ? process.env.PRIVATE_KEY : "";

  const recieverAddress = "0x8719c0e3E5f950ae9b305feD9B2B2f830C127958";

  const amount = 1000;

  const message = web3.utils
    .soliditySha3(
      { t: "address", v: recieverAddress },
      { t: "address", v: recieverAddress },
      { t: "uint256", v: amount },
      { t: "uint256", v: nonce }
    )
    ?.toString();

  console.log("message", message);
  if (message) {
    const { signature } = web3.eth.accounts.sign(message, privKey);
    console.log("signature", signature);
    const res = await bridgeBsc.burn(recieverAddress, amount, nonce, signature);
    console.log("res", res);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
