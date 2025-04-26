import { ethers } from 'ethers';
import fs from 'node:fs';
import { randomBytes, createCipheriv } from 'crypto';
import axios from 'axios';

async function main() {
  const password = "mySecretPassword123";
  const key = randomBytes(32);
  const iv = randomBytes(16);
  const cipher = createCipheriv('aes-256-cbc', key, iv);
  let encryptedPassword = cipher.update(password, 'utf8', 'hex');
  encryptedPassword += cipher.final('hex');
  const encryptedData = JSON.stringify({ iv: iv.toString('hex'), data: encryptedPassword });

  const pinataApiKey = '8a497bad1f9131d60427';
  const pinataSecretApiKey = '2f9a756beb412cc36cb3107ed8364e02d953d073e8a654979b44748effc7d4e4';
  const url = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';
  const response = await axios.post(url, encryptedData, {
    headers: {
      pinata_api_key: pinataApiKey,
      pinata_secret_api_key: pinataSecretApiKey,
      'Content-Type': 'application/json',
    },
  });
  if (response.status !== 200) {
    console.error("Pinata API error:", response.status, response.data);
    throw new Error("Pinata upload failed");
  }

  const ipfsHash = response.data.IpfsHash;
  console.log("IPFS Hash:", ipfsHash);

  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  const wallet = new ethers.Wallet("0xf2cc76b8c33853fcb2ce05c8a4901bf01aa662f89756e95be63ad36a8c9f8201", provider);
  const contractAddress = "0x525826FCA6fac419faA362A1c9e8426976a8aCA1";
  const contractAbi = JSON.parse(fs.readFileSync("../artifacts/contracts/VaultGuard.sol/VaultGuard.json")).abi;
  const contract = new ethers.Contract(contractAddress, contractAbi, wallet);

  const tx = await contract.storeHash(ipfsHash);
  const receipt = await tx.wait();
  console.log("Transaction receipt:", receipt);
  console.log("Logs:", receipt.logs);
  console.log("Hash stored on-chain for address", wallet.address, ":", ipfsHash);

  // Verify immediately
  const storedHash = await contract.getHash({ from: wallet.address });
  console.log("Verified on-chain hash:", storedHash);
}

main().catch(console.error);