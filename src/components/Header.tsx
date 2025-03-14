
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useWeb3 } from '@/contexts/Web3Context';
import { Button } from '@/components/ui/button';
import { Shield, LogOut, Wallet } from 'lucide-react';

const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { address, isConnected, connectWallet, disconnectWallet } = useWeb3();

  const handleLogout = () => {
    logout();
  };

  const handleWalletConnection = () => {
    if (isConnected) {
      disconnectWallet();
    } else {
      connectWallet();
    }
  };

  const truncateAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <header className="bg-vault-darker py-4 border-b border-gray-800">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center mb-4 md:mb-0">
          <Shield className="h-8 w-8 text-vault-accent mr-2" />
          <div>
            <h1 className="text-2xl font-bold">VaultGuard</h1>
            <p className="text-sm text-vault-muted">Decentralized Password Manager</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {isAuthenticated && (
            <div className="text-sm text-vault-muted mr-4">
              Welcome, <span className="text-vault-text font-medium">{user?.name || user?.email}</span>
            </div>
          )}
          
          <Button 
            variant="outline"
            className="border-vault-accent text-vault-accent hover:bg-vault-accent hover:text-white"
            onClick={handleWalletConnection}
          >
            <Wallet className="h-4 w-4 mr-2" />
            {isConnected ? truncateAddress(address!) : 'Connect Wallet'}
          </Button>
          
          {isAuthenticated && (
            <Button 
              variant="ghost" 
              className="text-vault-muted hover:text-vault-text"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
