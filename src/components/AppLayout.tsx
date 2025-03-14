
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Header from './Header';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-vault-dark text-vault-text">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        {children}
      </main>
      <footer className="py-6 text-center text-vault-muted">
        <p className="text-sm">VaultGuard - Secure Password Management with Web3 Technology</p>
        <p className="text-xs mt-1">© {new Date().getFullYear()} VaultGuard. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default AppLayout;
