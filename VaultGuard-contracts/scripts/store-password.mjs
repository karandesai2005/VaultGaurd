import { ethers } from "ethers";
import axios from "axios";
import CryptoJS from "crypto-js";

const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
const privateKey = "0xf2cc76b8c33853fcb2ce05c8a4901bf01aa662f89756e95be63ad36a8c9f8201";
const wallet = new ethers.Wallet(privateKey, provider);

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const contractAbi = [
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      { indexed: false, internalType: "string", name: "ipfsHash", type: "string" },
    ],
    name: "HashStored",
    type: "event",
  },
  {
    inputs: [],
    name: "getHash",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "string", name: "ipfsHash", type: "string" }],
    name: "storeHash",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const contract = new ethers.Contract(contractAddress, contractAbi, wallet);

async function main() {
  try {
    const password = "TestPassword123!";
    const key = "vaultguard-secret-key";
    const encryptedPassword = CryptoJS.AES.encrypt(password, key).toString();
    console.log("Encrypted password (raw):", encryptedPassword);

    const pinataJwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJlYWIyNGVhOS04ODExLTQ0ZmItYThkMy05MTY0ODUwYjc4OGMiLCJlbWFpbCI6ImthcmFuaXNodWRlc2FpMkBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiODA2ZTZiNTI2ZDkyZDY4YWQwMmYiLCJzY29wZWRLZXlTZWNyZXQiOiIzNDc2ODU0M3QxZDViMWFkNWM1NWEzNzg2NmNkZjg1NGQ0NWMyOTU3OGVkNDdkYTlhMjc3YTRmYTYwZmQ4NTYxIiwiZXhwIjoxNzc3MjMyMTM0fQ.YjfOu8ikli2PfRjj5zacpGoIIvaPuiSu4KgUfBglQxg";
    const response = await axios.post(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      { encryptedPassword },
      {
        headers: {
          Authorization: `Bearer ${pinataJwt}`,
          "Content-Type": "application/json",
        },
      }
    );

    const ipfsHash = response.data.IpfsHash;
    console.log("IPFS Hash:", ipfsHash);

    const tx = await contract.storeHash(ipfsHash);
    const receipt = await tx.wait();
    console.log("Transaction receipt:", receipt);
    console.log("Logs:", receipt.logs);
    console.log("Hash stored on-chain for address", wallet.address, ":", ipfsHash);

    // Workaround for getHash decoding issue
    const storedHashRaw = await provider.call({
      to: contractAddress,
      data: contract.interface.encodeFunctionData("getHash"),
    });
    const storedHash = contract.interface.decodeFunctionResult("getHash", storedHashRaw)[0];
    console.log("Stored hash retrieved:", storedHash || "Empty");

    // Retrieve and decrypt the password
    const ipfsResponse = await axios.get(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`);
    const retrievedEncryptedPassword = ipfsResponse.data.encryptedPassword;
    if (!retrievedEncryptedPassword) {
      throw new Error("Invalid data format from IPFS");
    }
    const bytes = CryptoJS.AES.decrypt(retrievedEncryptedPassword, key);
    const decryptedPassword = bytes.toString(CryptoJS.enc.Utf8);
    console.log("Decrypted password:", decryptedPassword);
  } catch (error) {
    console.error(error);
  }
}

main();