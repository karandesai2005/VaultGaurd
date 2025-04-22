import { create } from 'ipfs-http-client';
import { ethers } from 'ethers';
import fs from 'fs';
import { createDecipheriv } from 'crypto';

const ipfs = create({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });

async function main() {
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  const wallet = new ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", provider);
  const contractAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
  const contractAbi = JSON.parse(fs.readFileSync("../artifacts/contracts/VaultGuard.sol/VaultGuard.json")).abi;
  const contract = new ethers.Contract(contractAddress, contractAbi, wallet);

  const ipfsHash = await contract.getHash();
  console.log("IPFS Hash from blockchain:", ipfsHash);

  const chunks = [];
  for await (const chunk of ipfs.cat(ipfsHash)) {
    chunks.push(chunk);
  }
  const encryptedData = JSON.parse(Buffer.concat(chunks).toString());
  const iv = Buffer.from(encryptedData.iv, 'hex');
  const key = Buffer.from(encryptedData.key, 'hex');
  const decipher = createDecipheriv('aes-256-cbc', key, iv);
  let decryptedPassword = decipher.update(encryptedData.data, 'hex', 'utf8');
  decryptedPassword += decipher.final('utf8');
  console.log("Decrypted Password:", decryptedPassword);
}

main().catch(console.error);