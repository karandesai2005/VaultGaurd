import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';
import PasswordGenerator from '@/components/password/PasswordGenerator';
import PasswordStorage from '@/components/password/PasswordStorage';
import PasswordRetrieval from '@/components/password/PasswordRetrieval';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, Key, RefreshCw, Shield } from 'lucide-react';

const Index = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const toggleAuthMode = () => {
    setAuthMode(authMode === 'login' ? 'signup' : 'login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-vault-dark">
        <div className="text-center">
          <Shield className="h-16 w-16 text-vault-accent mx-auto animate-pulse" />
          <h2 className="text-xl font-semibold mt-4 text-vault-text">Loading VaultGuard...</h2>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-vault-dark p-4">
        <div className="text-center mb-8">
          <Shield className="h-16 w-16 text-vault-accent mx-auto mb-4" />
          <h1 className="text-3xl md:text-4xl font-bold text-vault-text">VaultGuard</h1>
          <p className="text-vault-muted mt-2">Decentralized Password Manager</p>
          <p className="max-w-md mx-auto mt-4 text-vault-muted">
            Securely manage your passwords with Web3 technology.
            Your data is encrypted and stored on decentralized networks.
          </p>
        </div>
        
        {authMode === 'login' ? (
          <LoginForm onToggleMode={toggleAuthMode} />
        ) : (
          <SignupForm onToggleMode={toggleAuthMode} />
        )}
        
        <div className="mt-8 text-center">
          <Card className="bg-vault-darker border-gray-800 max-w-md">
            <CardHeader>
              <CardTitle className="text-lg">How It Works</CardTitle>
              <CardDescription>
                VaultGuard uses Web3 technologies to provide ultimate security
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex flex-col items-center p-2">
                  <Shield className="h-8 w-8 text-vault-accent mb-2" />
                  <h3 className="font-medium">Encrypted Locally</h3>
                  <p className="text-vault-muted text-center">Your passwords never leave your device unencrypted</p>
                </div>
                <div className="flex flex-col items-center p-2">
                  <Database className="h-8 w-8 text-vault-accent mb-2" />
                  <h3 className="font-medium">Stored on IPFS</h3>
                  <p className="text-vault-muted text-center">Encrypted data stored on decentralized storage</p>
                </div>
                <div className="flex flex-col items-center p-2">
                  <Key className="h-8 w-8 text-vault-accent mb-2" />
                  <h3 className="font-medium">Blockchain Security</h3>
                  <p className="text-vault-muted text-center">References secured via Polygon Mumbai blockchain</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Authenticated view
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Password Manager Dashboard</h1>
          <p className="text-vault-muted">
            Generate, store, and manage your passwords securely with Web3 technology
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PasswordGenerator />
          
          <Tabs defaultValue="store" className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="store" className="flex items-center">
                <Database className="h-4 w-4 mr-2" />
                Store Password
              </TabsTrigger>
              <TabsTrigger value="retrieve" className="flex items-center">
                <Key className="h-4 w-4 mr-2" />
                Retrieve Password
              </TabsTrigger>
            </TabsList>
            <TabsContent value="store">
              <PasswordStorage />
            </TabsContent>
            <TabsContent value="retrieve">
              <PasswordRetrieval />
            </TabsContent>
          </Tabs>
        </div>
        
        <Card className="mt-8 bg-vault-darker border-gray-800">
          <CardHeader>
            <CardTitle className="text-xl">VaultGuard: Web3 Password Management</CardTitle>
            <CardDescription>
              Understanding the technology behind your secure password vault
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center">
                  <RefreshCw className="h-5 w-5 text-vault-accent mr-2" />
                  <h3 className="font-medium">Generate</h3>
                </div>
                <p className="text-vault-muted text-sm">
                  Create strong, unique passwords with our generator. Mix of uppercase, lowercase, numbers, and symbols for maximum security.
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center">
                  <Database className="h-5 w-5 text-vault-accent mr-2" />
                  <h3 className="font-medium">Store</h3>
                </div>
                <p className="text-vault-muted text-sm">
                  Passwords are encrypted locally before being stored on IPFS. Only encrypted data leaves your device, ensuring maximum privacy.
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center">
                  <Key className="h-5 w-5 text-vault-accent mr-2" />
                  <h3 className="font-medium">Retrieve</h3>
                </div>
                <p className="text-vault-muted text-sm">
                  Your encrypted passwords are retrieved and decrypted locally using your key. No sensitive data is ever exposed in transit.
                </p>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-800">
              <p className="text-vault-muted text-sm">
                VaultGuard leverages the power of Web3 technologies for unprecedented security. Your passwords are never stored or transmitted in plain text. The local encryption means even we can't access your passwords. The blockchain integration via Polygon Mumbai ensures tamper-proof references to your encrypted data on IPFS.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Index;
