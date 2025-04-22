import React, { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import { toast } from "@/lib/toast";

// Define the type for MetaMask's provider (optional, for better type safety)
interface EthereumProvider {
  isMetaMask?: boolean;
  request: (...args: any[]) => Promise<any>;
  on: (event: string, callback: (...args: any[]) => void) => void;
  removeListener: (event: string, callback: (...args: any[]) => void) => void;
}

interface Web3ContextType {
  account: string | null;
  provider: ethers.BrowserProvider | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const Web3Context = createContext<Web3ContextType | null>(null);

export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);

  const connectWallet = async () => {
    const ethereum = (window as any).ethereum as EthereumProvider | undefined;
    if (!ethereum) {
      toast.error("Please install MetaMask!");
      return;
    }

    try {
      const newProvider = new ethers.BrowserProvider(ethereum);
      const accounts = await newProvider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);
      setProvider(newProvider);

      // Switch to Ganache local network
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x539" }], // Chain ID for Ganache (1337 in hex)
      });

      toast.success(`Connected: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`);
    } catch (error: any) {
      if (error.code === 4902) {
        // Chain not added, add Ganache local network
        await ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0x539",
              chainName: "Ganache Local",
              rpcUrls: ["http://127.0.0.1:7545"],
              nativeCurrency: { name: "Ganache ETH", symbol: "ETH", decimals: 18 },
              blockExplorerUrls: ["http://ganache.local"], // Optional placeholder
            },
          ],
        });
        await connectWallet(); // Retry after adding chain
      } else {
        toast.error("Failed to connect wallet");
        console.error(error);
      }
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    localStorage.removeItem("walletAddress");
    toast.success("Wallet disconnected!");
  };

  useEffect(() => {
    const ethereum = (window as any).ethereum as EthereumProvider | undefined;
    if (ethereum) {
      const storedAddress = localStorage.getItem("walletAddress");
      if (storedAddress) {
        connectWallet();
      }

      // Handle account changes
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else if (accounts[0] !== account) {
          setAccount(accounts[0]);
          toast.success(`Account changed: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`);
        }
      };

      // Handle chain changes
      const handleChainChanged = (chainId: string) => {
        if (chainId !== "0x539") { // Updated from "0x13881" to "0x539" for Ganache
          toast.error("Please switch to Ganache Local network");
          disconnectWallet();
        } else {
          connectWallet();
        }
      };

      ethereum.on("accountsChanged", handleAccountsChanged);
      ethereum.on("chainChanged", handleChainChanged);

      // Cleanup listeners on unmount
      return () => {
        ethereum.removeListener("accountsChanged", handleAccountsChanged);
        ethereum.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, [account]);

  useEffect(() => {
    if (account) {
      localStorage.setItem("walletAddress", account);
    }
  }, [account]);

  return (
    <Web3Context.Provider value={{ account, provider, connectWallet, disconnectWallet }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = (): Web3ContextType => {
  const context = useContext(Web3Context);
  if (!context) throw new Error("useWeb3 must be used within a Web3Provider");
  return context;
};