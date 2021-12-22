const express = require("express");
const app = express();
const port = 3000;

const { fetchTransactions } = require("./src/iotaEvm");

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log("Starting IOTA EVM <=> Binance Smart Chain (BSC) bridge...");
  console.log("fetchTransactions...");
  fetchTransactions();
  setInterval(fetchTransactions, 30.0 * 1000);
  console.log("fetchTransactions done!");

  console.log(`Example app listening at http://localhost:${port}`);
});
