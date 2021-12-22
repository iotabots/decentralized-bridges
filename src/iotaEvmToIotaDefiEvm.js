const Web3 = require("web3");
require("dotenv").config();

const BridgeIotaEvm = require("../artifacts/contracts/BridgeIotaEvm.sol/BridgeIotaEvm.json");
const BridgeIotaDefiEvm = require("../artifacts/contracts/BridgeBsc.sol/BridgeBsc.json");

let latestLocalBlock = 0;

const web3IotaEvm = new Web3("https://evm.wasp.sc.iota.org/");
const web3IotaDefiEvm = new Web3("https://evm.wasp.sc.iota.com/");

const adminPrivKey =
  process.env.PRIVATE_KEY !== undefined ? process.env.PRIVATE_KEY : "";

const { address: admin } =
  web3IotaDefiEvm.eth.accounts.wallet.add(adminPrivKey);

const bridgeIotaEvm = new web3IotaEvm.eth.Contract(
  BridgeIotaEvm.abi,
  "0x895Fbe1BFBBC52EdD6948D153180cAbD71945F37"
);

const bridgeIotaDefi = new web3IotaDefiEvm.eth.Contract(
  BridgeIotaDefiEvm.abi,
  "0xC40af1448fB9DbEEA037Ecd07db51106931e0BBB"
);
async function fetchTransactions() {
  const latest = await web3IotaEvm.eth.getBlockNumber();
  console.log("latestLocalBlock", latestLocalBlock);
  console.log("latest", latest);

  if (latestLocalBlock >= latest) {
    return;
  }

  bridgeIotaEvm.getPastEvents(
    "Transfer",
    {
      // filter: { _from: address },
      fromBlock: latestLocalBlock,
      toBlock: "latest",
    },
    async (_error, events) => {
      for (let i = 0; i < events.length; i++) {
        var event = events[i];
        console.log("event", event);
        const { from, to, amount, date, nonce, signature } = event.returnValues;

        try {
          const tx = bridgeIotaDefi.methods.mint(
            from,
            to,
            amount,
            nonce,
            signature
          );
          const [gasPrice, gasCost] = await Promise.all([
            web3IotaDefiEvm.eth.getGasPrice(),
            tx.estimateGas({ from: admin }),
          ]);
          const data = tx.encodeABI();
          const txData = {
            from: admin,
            to: bridgeIotaDefi.options.address,
            data,
            gas: gasCost,
            gasPrice,
          };
          const receipt = await web3IotaDefiEvm.eth.sendTransaction(txData);
          console.log(`Transaction hash: ${receipt.transactionHash}`);
          console.log(`
                Processed transfer:
                - from ${from}
                - to ${to}
                - amount ${amount} tokens
                - date ${date}
                - nonce ${nonce}`);
          latestLocalBlock = latest;
        } catch (error) {
          console.error("sendTransaction", error);
        }
      }
    }
  );
}

module.exports = { fetchTransactions };
