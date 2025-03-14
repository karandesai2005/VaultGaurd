import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Mail } from 'lucide-react';

interface LoginFormProps {
  onToggleMode: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onToggleMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, loginWithGoogle } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await login(email, password);
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error('Google login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md bg-vault-darker border-gray-800">
      <CardHeader className="space-y-1 flex items-center flex-col">
        <Shield className="h-12 w-12 text-vault-accent mb-2" />
        <CardTitle className="text-2xl font-bold text-center text-vault-text">Login to VaultGuard</CardTitle>
        <CardDescription className="text-center">
          Enter your credentials to access your secure passwords
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-vault-dark border-gray-700"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <a href="#" className="text-sm text-vault-accent hover:underline">
                Forgot password?
              </a>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-vault-dark border-gray-700"
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-vault-accent hover:bg-vault-accent-hover"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Logging in...' : 'Login'}
          </Button>
        </form>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-vault-darker px-2 text-vault-muted">Or continue with</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-2">
          <Button 
            variant="outline" 
            className="border-gray-700 hover:bg-vault-dark"
            onClick={handleGoogleLogin}
            disabled={isSubmitting}
          >
            <Mail className="h-4 w-4 mr-2" />
            Google
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col">
        <div className="text-sm text-vault-muted">
          Don't have an account?{' '}
          <button 
            onClick={onToggleMode} 
            className="text-vault-accent hover:underline"
          >
            Sign up
          </button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
