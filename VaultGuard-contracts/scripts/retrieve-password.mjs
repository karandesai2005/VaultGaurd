import { create } from 'ipfs-http-client';
import { ethers } from 'ethers';
import fs from 'fs';
import { createDecipheriv } from 'crypto';

const ipfs = create({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });

async function main() {
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  const wallet = new ethers.Wallet("0xf2cc76b8c33853fcb2ce05c8a4901bf01aa662f89756e95be63ad36a8c9f8201", provider);
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
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