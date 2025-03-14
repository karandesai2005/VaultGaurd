import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePassword } from '@/contexts/PasswordContext';
import { Key, Copy, Lock, CheckCircle } from 'lucide-react';
import { toast } from '@/lib/toast';

const PasswordRetrieval: React.FC = () => {
  const { storedPasswords, retrievePassword } = usePassword();
  const [selectedPasswordId, setSelectedPasswordId] = useState<string>('');
  const [retrievedPassword, setRetrievedPassword] = useState<string | null>(null);
  const [isRetrieving, setIsRetrieving] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleRetrieve = async () => {
    if (!selectedPasswordId) {
      toast.error('Please select a website');
      return;
    }
    
    setIsRetrieving(true);
    
    try {
      const password = await retrievePassword(selectedPasswordId);
      setRetrievedPassword(password);
    } catch (error) {
      console.error('Failed to retrieve password:', error);
    } finally {
      setIsRetrieving(false);
    }
  };

  const handleCopy = () => {
    if (retrievedPassword) {
      navigator.clipboard.writeText(retrievedPassword);
      setCopied(true);
      toast.success('Password copied to clipboard!');
      
      // Reset copied after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card className="w-full bg-vault-darker border-gray-800 shadow-lg animate-fade-in">
      <CardHeader>
        <div className="flex items-center">
          <Key className="h-5 w-5 text-vault-accent mr-2" />
          <CardTitle>Retrieve Password</CardTitle>
        </div>
        <CardDescription>
          Access your securely stored passwords
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="website-select">Select Website</Label>
          <Select 
            onValueChange={setSelectedPasswordId}
            value={selectedPasswordId}
          >
            <SelectTrigger className="bg-vault-dark border-gray-700">
              <SelectValue placeholder="Select a website" />
            </SelectTrigger>
            <SelectContent className="bg-vault-dark border-gray-700">
              {storedPasswords.length > 0 ? (
                storedPasswords.map((password) => (
                  <SelectItem key={password.id} value={password.id}>
                    {password.website}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-passwords" disabled>
                  No passwords stored yet
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        
        {retrievedPassword && (
          <div className="space-y-2 animate-fade-in">
            <Label htmlFor="retrievedPassword">Decrypted Password</Label>
            <div className="flex">
              <Input
                id="retrievedPassword"
                type="text"
                value={retrievedPassword}
                readOnly
                className="font-mono bg-vault-dark border-gray-700 flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                className="ml-2 border-gray-700 hover:bg-vault-dark"
                onClick={handleCopy}
                title="Copy to clipboard"
              >
                {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-sm text-green-500 flex items-center">
              <Lock className="h-3 w-3 mr-1" />
              Password decrypted locally for security
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleRetrieve}
          className="w-full hover-scale bg-vault-accent hover:bg-vault-accent-hover"
          disabled={!selectedPasswordId || isRetrieving}
        >
          <Key className="h-4 w-4 mr-2" />
          {isRetrieving ? 'Decrypting...' : 'Retrieve Password'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PasswordRetrieval;
