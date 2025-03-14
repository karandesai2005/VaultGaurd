import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { usePassword } from '@/contexts/PasswordContext';
import { Save, Database, AlertCircle } from 'lucide-react';
import { toast } from '@/lib/toast';

interface PasswordStorageProps {
  onPasswordStored?: () => void;
}

const PasswordStorage: React.FC<PasswordStorageProps> = ({ onPasswordStored }) => {
  const { generatedPassword, storePassword } = usePassword();
  const [website, setWebsite] = useState('');
  const [customPassword, setCustomPassword] = useState('');
  const [isStoring, setIsStoring] = useState(false);
  const [storageComplete, setStorageComplete] = useState(false);

  const passwordToStore = generatedPassword || customPassword;
  const canStore = website.trim() !== '' && passwordToStore.trim() !== '';

  const handleStore = async () => {
    if (!canStore) {
      toast.error('Please provide both website and password');
      return;
    }
    
    setIsStoring(true);
    setStorageComplete(false);
    
    try {
      await storePassword(website, passwordToStore);
      setWebsite('');
      setCustomPassword('');
      setStorageComplete(true);
      
      // Reset storage complete after 3 seconds
      setTimeout(() => setStorageComplete(false), 3000);
      
      if (onPasswordStored) {
        onPasswordStored();
      }
    } catch (error) {
      console.error('Failed to store password:', error);
    } finally {
      setIsStoring(false);
    }
  };

  return (
    <Card className="w-full bg-vault-darker border-gray-800 shadow-lg animate-fade-in">
      <CardHeader>
        <div className="flex items-center">
          <Database className="h-5 w-5 text-vault-accent mr-2" />
          <CardTitle>Store Password</CardTitle>
        </div>
        <CardDescription>
          Save your password securely in the encrypted vault
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="website">Website or Application Name</Label>
          <Input
            id="website"
            placeholder="example.com"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="bg-vault-dark border-gray-700"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Password to Store</Label>
          <Input
            id="password"
            type="password"
            placeholder={generatedPassword ? 'Using generated password' : 'Enter a password'}
            value={customPassword}
            onChange={(e) => setCustomPassword(e.target.value)}
            disabled={!!generatedPassword}
            className="bg-vault-dark border-gray-700"
          />
          {generatedPassword ? (
            <p className="text-sm text-vault-muted">
              Using the generated password. Generate a new one or clear it to use a custom password.
            </p>
          ) : (
            <p className="text-sm text-vault-muted">
              Enter a custom password or use the generator above to create a secure one.
            </p>
          )}
        </div>

        {!canStore && (
          <div className="flex items-center text-amber-500 text-sm mt-2">
            <AlertCircle className="h-4 w-4 mr-2" />
            Please provide both a website name and a password.
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleStore}
          className="w-full hover-scale bg-vault-accent hover:bg-vault-accent-hover"
          disabled={!canStore || isStoring}
        >
          <Save className="h-4 w-4 mr-2" />
          {isStoring 
            ? 'Encrypting and Storing...' 
            : storageComplete 
              ? 'Password Stored Successfully!' 
              : 'Store Password Securely'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PasswordStorage;
