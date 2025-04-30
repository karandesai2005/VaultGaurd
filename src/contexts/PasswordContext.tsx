import React, { createContext, useContext, useState } from "react";
import CryptoJS from "crypto-js";
import { toast } from "@/lib/toast";
import axios from "axios";
import { ethers } from "ethers";

interface PasswordEntry {
  website: string;
  ipfsHash: string;
}

interface PasswordContextType {
  generatedPassword: string | null;
  passwords: PasswordEntry[];
  generatePassword: (length: number) => void;
  storePassword: (website: string, password: string) => Promise<void>;
  retrievePassword: (ipfsHash: string) => Promise<string | null>;
  deletePassword: (ipfsHash: string) => void;
  clearGeneratedPassword: () => void;
}

const PasswordContext = createContext<PasswordContextType | null>(null);

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

const walletAddress = "0x89732a1a0A4109ef9c812F63499C9c604e7CEEc1";

export const PasswordProvider = ({ children }: { children: React.ReactNode }) => {
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);

  const generatePassword = (length: number): void => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGeneratedPassword(password);
    toast.success("Password generated!");
  };

  const clearGeneratedPassword = () => {
    setGeneratedPassword(null);
  };

  const encryptPassword = (password: string): string => {
    const key = "vaultguard-secret-key";
    return CryptoJS.AES.encrypt(password, key).toString();
  };

  const decryptPassword = (encryptedPassword: string): string => {
    const key = "vaultguard-secret-key";
    const bytes = CryptoJS.AES.decrypt(encryptedPassword, key);
    return bytes.toString(CryptoJS.enc.Utf8);
  };

  const storePassword = async (website: string, password: string): Promise<void> => {
    try {
      const encryptedPassword = encryptPassword(password);
      console.log("Encrypted password (raw):", encryptedPassword);

      const pinataJwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJlYWIyNGVhOS04ODExLTQ0ZmItYThkMy05MTY0ODUwYjc4OGMiLCJlbWFpbCI6ImthcmFuaXNodWRlc2FpMkBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiODA2ZTZiNTI2ZDkyZDY4YWQwMmYiLCJzY29wZWRLZXlTZWNyZXQiOiIzNDc2ODU0M2QxZDViMWFkNWM1NWEzNzg2NmNkZjg1NGQ0NWMyOTU3OGVkNDdkYTlhMjc3YTRmYTYwZmQ4NTYxIiwiZXhwIjoxNzc3MjMyMTM0fQ.YjfOu8ikli2PfRjj5zacpGoIIvaPuiSu4KgUfBglQxg";
      const url = "https://api.pinata.cloud/pinning/pinJSONToIPFS";

      // Wrap encryptedPassword in a JSON object
      const payload = {
        encryptedPassword: encryptedPassword,
      };
      console.log("Payload sent to Pinata:", JSON.stringify(payload, null, 2));

      const response = await axios.post(url, payload, {
        headers: {
          Authorization: `Bearer ${pinataJwt}`, // Use JWT for authentication
          "Content-Type": "application/json",
        },
      });

      if (response.status !== 200) {
        console.error("Pinata API error:", {
          status: response.status,
          data: response.data,
          headers: response.headers,
          config: response.config,
        });
        throw new Error(`Pinata upload failed: ${response.status} - ${JSON.stringify(response.data)}`);
      }

      const ipfsHash = response.data.IpfsHash;
      console.log("IPFS Hash from frontend:", ipfsHash);

      if (!window.ethereum) {
        throw new Error("MetaMask is not installed");
      }
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      console.log("Connected address:", userAddress);

      if (userAddress.toLowerCase() !== walletAddress.toLowerCase()) {
        throw new Error("Please connect MetaMask with the correct account: 0x89732a1a0A4109ef9c812F63499C9c604e7CEEc1");
      }

      const contract = new ethers.Contract(contractAddress, contractAbi, signer);
      const tx = await contract.storeHash(ipfsHash);
      const receipt = await tx.wait();
      console.log("Transaction hash:", tx.hash);

      setPasswords((prev) => [...prev, { website, ipfsHash }]);
      toast.success(`Password for ${website} encrypted and stored! Hash: ${ipfsHash}`);
      clearGeneratedPassword();
    } catch (error: any) {
      console.error("Store password error:", {
        message: error.message,
        stack: error.stack,
        response: error.response ? error.response.data : "No response data",
      });
      toast.error(error.message || "Failed to store password on IPFS");
      throw error;
    }
  };

  const retrievePassword = async (ipfsHash: string): Promise<string | null> => {
    try {
      const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`);
      const encryptedPassword = response.data.encryptedPassword; // Match the payload structure
      if (!encryptedPassword) {
        throw new Error("Invalid data format from IPFS");
      }
      const decryptedPassword = decryptPassword(encryptedPassword);
      toast.success("Password retrieved and decrypted!");
      return decryptedPassword;
    } catch (error) {
      toast.error("Failed to retrieve password from IPFS");
      console.error("Retrieval error:", error);
      return null;
    }
  };

  const deletePassword = (ipfsHash: string) => {
    setPasswords((prev) => prev.filter((p) => p.ipfsHash !== ipfsHash));
    toast.success("Password entry removed!");
  };

  return (
    <PasswordContext.Provider
      value={{
        generatedPassword,
        passwords,
        generatePassword,
        storePassword,
        retrievePassword,
        deletePassword,
        clearGeneratedPassword,
      }}
    >
      {children}
    </PasswordContext.Provider>
  );
};

export const usePassword = (): PasswordContextType => {
  const context = useContext(PasswordContext);
  if (!context) throw new Error("usePassword must be used within a PasswordProvider");
  return context;
};