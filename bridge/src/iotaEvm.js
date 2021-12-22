const Web3 = require("web3");
require('dotenv').config()

const BridgeIotaEvm = require("../../artifacts/contracts/BridgeIotaEvm.sol/BridgeIotaEvm.json");
const BridgeBsc = require("../../artifacts/contracts/BridgeBsc.sol/BridgeBsc.json");

let latestLocalBlock = 0;

const web3IotaEvm = new Web3("https://evm.wasp.sc.iota.org/");
const web3Bsc = new Web3("https://data-seed-prebsc-1-s1.binance.org:8545");

const adminPrivKey =
  process.env.PRIVATE_KEY !== undefined ? process.env.PRIVATE_KEY : "";

const { address: admin } = web3Bsc.eth.accounts.wallet.add(adminPrivKey);

const bridgeIotaEvm = new web3IotaEvm.eth.Contract(
  BridgeIotaEvm.abi,
  "0x895Fbe1BFBBC52EdD6948D153180cAbD71945F37"
);

const bridgeBsc = new web3Bsc.eth.Contract(
  BridgeBsc.abi,
  "0x18076eee61806762750E8B5c20678EB4B05D695A"
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
          const tx = bridgeBsc.methods.mint(from, to, amount, nonce, signature);
          const [gasPrice, gasCost] = await Promise.all([
            web3Bsc.eth.getGasPrice(),
            tx.estimateGas({ from: admin }),
          ]);
          const data = tx.encodeABI();
          const txData = {
            from: admin,
            to: bridgeBsc.options.address,
            data,
            gas: gasCost,
            gasPrice,
          };
          const receipt = await web3Bsc.eth.sendTransaction(txData);
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
