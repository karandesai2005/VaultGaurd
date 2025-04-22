import React, { createContext, useContext, useState } from "react";
import CryptoJS from "crypto-js";
import { toast } from "@/lib/toast";
import { create } from "ipfs-http-client";

// Initialize IPFS client (using Infura's free gateway)
const ipfs = create({ url: "https://ipfs.infura.io:5001" });

interface PasswordEntry {
  website: string;
  ipfsHash: string; // Store IPFS hash instead of encrypted password
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
    const key = "vaultguard-secret-key"; // In production, derive this securely
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
      const result = await ipfs.add(encryptedPassword);
      const ipfsHash = result.cid.toString();
      setPasswords((prev) => [...prev, { website, ipfsHash }]);
      toast.success(`Password for ${website} encrypted and stored on IPFS! Hash: ${ipfsHash}`);
      setGeneratedPassword(null); // Clear generated password after storing
    } catch (error) {
      toast.error("Failed to store password on IPFS");
      console.error(error);
      throw error;
    }
  };

  const retrievePassword = async (ipfsHash: string): Promise<string | null> => {
    try {
      const response = await ipfs.cat(ipfsHash);
      let encryptedPassword = "";
      for await (const chunk of response) {
        encryptedPassword += new TextDecoder().decode(chunk);
      }
      const decryptedPassword = decryptPassword(encryptedPassword);
      toast.success("Password retrieved from IPFS and decrypted locally!");
      return decryptedPassword;
    } catch (error) {
      toast.error("Failed to retrieve password from IPFS");
      console.error(error);
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