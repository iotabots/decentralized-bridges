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

  const BridgeIotaEvm = await ethers.getContractFactory("BridgeIotaEvm");

  const bridgeIotaEvm = await BridgeIotaEvm.attach(
    "0x895Fbe1BFBBC52EdD6948D153180cAbD71945F37"
  );

  const nonce = 1; //Need to increment this for each new transfer

  const privKey =
    process.env.PRIVATE_KEY !== undefined ? process.env.PRIVATE_KEY : "";

  const recieverAddress = "0x757F541C9A5811003975fe35812AF2fD40EFF8E0";

  const amount = 1000000000000;

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
    const res = await bridgeIotaEvm.burn(
      recieverAddress,
      amount,
      nonce,
      signature,
      { gasLimit: 285000, gasPrice: 0 }
    );
    console.log("res", res);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
