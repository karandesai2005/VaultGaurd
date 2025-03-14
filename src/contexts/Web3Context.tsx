
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/components/ui/sonner';

// Types
type Web3ContextType = {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  chainId: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
};

// Create context
const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [chainId, setChainId] = useState<string | null>(null);

  // Check for saved connection
  useEffect(() => {
    const savedAddress = localStorage.getItem('vaultguard_wallet_address');
    if (savedAddress) {
      setAddress(savedAddress);
      setChainId('0x13881'); // Mumbai testnet
    }
  }, []);

  const connectWallet = async () => {
    setIsConnecting(true);
    
    try {
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Since we don't have actual MetaMask integration in this mock,
      // we'll simulate a successful connection
      const mockAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
      setAddress(mockAddress);
      setChainId('0x13881'); // Mumbai testnet
      
      // Save to localStorage
      localStorage.setItem('vaultguard_wallet_address', mockAddress);
      
      toast.success('Wallet connected successfully!');
    } catch (error) {
      toast.error('Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAddress(null);
    setChainId(null);
    localStorage.removeItem('vaultguard_wallet_address');
    toast.success('Wallet disconnected');
  };

  const value = {
    address,
    isConnected: !!address,
    isConnecting,
    chainId,
    connectWallet,
    disconnectWallet,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};
