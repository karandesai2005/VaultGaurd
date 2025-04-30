import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { usePassword } from '@/contexts/PasswordContext';
import { Copy, RefreshCw, Shield, CheckCircle } from 'lucide-react';
import { toast } from '@/lib/toast';

const PasswordGenerator: React.FC = () => {
  const { generatedPassword, generatePassword } = usePassword();
  const [passwordLength, setPasswordLength] = useState(12);
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    generatePassword(passwordLength);
    setCopied(false);
  };

  const handleCopy = () => {
    if (generatedPassword) {
      navigator.clipboard.writeText(generatedPassword);
      setCopied(true);
      toast.success('Password copied to clipboard!');
      
      // Reset the copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getPasswordStrength = () => {
    if (!generatedPassword) return { text: 'Not Generated', color: 'text-vault-muted' };
    
    if (passwordLength < 8) {
      return { text: 'Weak', color: 'text-red-500' };
    } else if (passwordLength < 12) {
      return { text: 'Medium', color: 'text-yellow-500' };
    } else {
      return { text: 'Strong', color: 'text-green-500' };
    }
  };

  const strength = getPasswordStrength();

  return (
    <Card className="w-full bg-vault-darker border-gray-800 shadow-lg animate-fade-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Shield className="h-5 w-5 text-vault-accent mr-2" />
            <CardTitle className="text-white">Generate Password</CardTitle>
          </div>
        </div>
        <CardDescription>
          Create a secure password with customizable strength
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="passwordLength">Password Length: {passwordLength}</Label>
            <span className={`text-sm font-medium ${strength.color}`}>
              {strength.text}
            </span>
          </div>
          <div className="pt-2">
            <Slider 
              id="passwordLength" 
              min={6} 
              max={30} 
              step={1} 
              defaultValue={[12]}
              value={[passwordLength]}
              onValueChange={(value) => setPasswordLength(value[0])}
              className="w-full"
            />
          </div>
          <div className="flex justify-between text-sm text-vault-muted">
            <span>6</span>
            <span>18</span>
            <span>30</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="generatedPassword" className="text-white">Generated Password</Label>
          <div className="flex">
            <Input
              id="generatedPassword"
              value={generatedPassword || ''}
              readOnly
              placeholder="Click 'Generate' to create a password"
              className="font-mono bg-vault-dark border-gray-700 flex-1"
            />
            <Button
              variant="outline"
              size="icon"
              className="ml-2 border-gray-700 hover:bg-vault-dark"
              onClick={handleCopy}
              disabled={!generatedPassword}
              title="Copy to clipboard"
            >
              {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-between">
        <Button 
          onClick={handleGenerate}
          className="hover-scale bg-vault-accent hover:bg-vault-accent-hover"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Generate Password
        </Button>
        
        {generatedPassword && (
          <div className={`text-sm font-medium ${strength.color}`}>
            Password Strength: {strength.text}
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default PasswordGenerator;