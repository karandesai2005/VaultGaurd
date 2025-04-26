require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: {
      chainId: 1337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      accounts: [
        "0xf2cc76b8c33853fcb2ce05c8a4901bf01aa662f89756e95be63ad36a8c9f8201", // Account #0 private key
      ],
      chainId: 1337,
    },
    ganache: {
      url: "http://127.0.0.1:8545",
      accounts: [
        "0xf2cc76b8c33853fcb2ce05c8a4901bf01aa662f89756e95be63ad36a8c9f8201",
      ],
      chainId: 1337,
    },
  },
};