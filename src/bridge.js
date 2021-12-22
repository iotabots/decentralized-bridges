const Web3 = require("web3");
require("dotenv").config();

const senderNetwork = {
  name: "iota-defi.com",
  url: "https://evm.wasp.sc.iota-defi.com/",
  bridge_address: "0x27A23dC5fB4dD1A8D88fCff93d93e7E585c1d9fD",
};
const revieverNetwork = {
  name: "IOTA EVM Testnet",
  url: "https://evm.wasp.sc.iota.org/",
  bridge_address: "0x895Fbe1BFBBC52EdD6948D153180cAbD71945F37",
};

const BridgeSender = require("../artifacts/contracts/BridgeBsc.sol/BridgeBsc.json");
const BridgeReciever = require("../artifacts/contracts/BridgeIotaEvm.sol/BridgeIotaEvm.json");

let latestLocalBlock = 10;

const web3sender = new Web3(senderNetwork.url);
const web3receiver = new Web3(revieverNetwork.url);

const adminPrivKey =
  process.env.PRIVATE_KEY !== undefined ? process.env.PRIVATE_KEY : "";

const { address: admin } = web3receiver.eth.accounts.wallet.add(adminPrivKey);

const bridgeSender = new web3sender.eth.Contract(
  BridgeSender.abi,
  senderNetwork.bridge_address
);

const bridgeReceiver = new web3receiver.eth.Contract(
  BridgeReciever.abi,
  revieverNetwork.bridge_address
);

async function fetchTransactions() {
  const latest = await web3sender.eth.getBlockNumber();
  console.log("latestLocalBlock", latestLocalBlock);
  console.log("latest", latest);

  if (latestLocalBlock >= latest) {
    return;
  }

  bridgeSender.getPastEvents(
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
          const tx = bridgeReceiver.methods.mint(
            from,
            to,
            amount,
            nonce,
            signature
          );
          const [gasPrice, gasCost] = await Promise.all([
            web3receiver.eth.getGasPrice(),
            tx.estimateGas({ from: admin }),
          ]);
          const data = tx.encodeABI();
          const txData = {
            from: admin,
            to: bridgeReceiver.options.address,
            data,
            gas: gasCost,
            gasPrice,
          };
          const receipt = await web3receiver.eth.sendTransaction(txData);
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
