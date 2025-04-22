import { create } from 'ipfs-http-client';
import { ethers } from 'ethers';
import fs from 'fs';
import { randomBytes, createCipheriv } from 'crypto';

const ipfs = create({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });

async function main() {
  const password = "mySecretPassword123";
  const website = "example.com";
  const key = randomBytes(32);
  const iv = randomBytes(16);
  const cipher = createCipheriv('aes-256-cbc', key, iv);
  let encryptedPassword = cipher.update(password, 'utf8', 'hex');
  encryptedPassword += cipher.final('hex');
  const encryptedData = JSON.stringify({ iv: iv.toString('hex'), data: encryptedPassword, key: key.toString('hex') });

  const { cid } = await ipfs.add(encryptedData);
  const ipfsHash = cid.toString();
  console.log("IPFS Hash:", ipfsHash);

  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  const wallet = new ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", provider);
  const contractAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
  const contractAbi = JSON.parse(fs.readFileSync("../artifacts/contracts/VaultGuard.sol/VaultGuard.json")).abi;
  const contract = new ethers.Contract(contractAddress, contractAbi, wallet);

  const tx = await contract.storeHash(ipfsHash);
  await tx.wait();
  console.log("Hash stored on-chain for", website, ":", ipfsHash);
}

main().catch(console.error);