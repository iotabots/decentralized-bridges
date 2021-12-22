const express = require("express");
const app = express();
const port = 3000;

const { fetchTransactions } = require("./src/bridge");

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log("Starting IOTA EVM <=> IOTA-defi.com EVM bridge...");
  console.log("fetchTransactions...");

  try {
    fetchTransactions()
    setInterval(fetchTransactions, 30.0 * 1000);
  } catch (error) {}
  console.log("fetchTransactions done!");

  console.log(`Example app listening at http://localhost:${port}`);
});
