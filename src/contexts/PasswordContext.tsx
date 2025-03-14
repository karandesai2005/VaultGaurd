
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/components/ui/sonner';

// Types
type StoredPassword = {
  id: string;
  website: string;
  password: string;
  createdAt: string;
};

type PasswordContextType = {
  storedPasswords: StoredPassword[];
  generatedPassword: string | null;
  generatePassword: (length?: number) => void;
  storePassword: (website: string, password: string) => Promise<void>;
  retrievePassword: (id: string) => Promise<string | null>;
  deletePassword: (id: string) => Promise<void>;
};

// Create context
const PasswordContext = createContext<PasswordContextType | undefined>(undefined);

// Sample stored passwords (mock data)
const MOCK_PASSWORDS: StoredPassword[] = [
  { id: '1', website: 'example.com', password: 'P@ssw0rd!123', createdAt: new Date().toISOString() },
  { id: '2', website: 'github.com', password: 'G1tHub#2023', createdAt: new Date().toISOString() },
];

export const PasswordProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [storedPasswords, setStoredPasswords] = useState<StoredPassword[]>([]);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);

  useEffect(() => {
    // Initialize with mock data
    setStoredPasswords(MOCK_PASSWORDS);
  }, []);

  const generatePassword = (length = 12) => {
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const numberChars = '0123456789';
    const specialChars = '!@#$%^&*()_+~`|}{[]:;?><,./-=';
    
    const allChars = uppercaseChars + lowercaseChars + numberChars + specialChars;
    let password = '';
    
    // Ensure at least one character from each category
    password += uppercaseChars.charAt(Math.floor(Math.random() * uppercaseChars.length));
    password += lowercaseChars.charAt(Math.floor(Math.random() * lowercaseChars.length));
    password += numberChars.charAt(Math.floor(Math.random() * numberChars.length));
    password += specialChars.charAt(Math.floor(Math.random() * specialChars.length));
    
    // Fill the rest of the password
    for (let i = 4; i < length; i++) {
      password += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }
    
    // Shuffle the password characters
    password = password.split('').sort(() => 0.5 - Math.random()).join('');
    
    setGeneratedPassword(password);
    return password;
  };

  const storePassword = async (website: string, password: string) => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newPassword: StoredPassword = {
        id: Date.now().toString(),
        website,
        password,
        createdAt: new Date().toISOString(),
      };
      
      setStoredPasswords(prev => [...prev, newPassword]);
      toast.success('Password stored securely!');
    } catch (error) {
      toast.error('Failed to store password');
      throw error;
    }
  };

  const retrievePassword = async (id: string) => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const password = storedPasswords.find(p => p.id === id);
      
      if (!password) {
        throw new Error('Password not found');
      }
      
      toast.success('Password retrieved successfully');
      return password.password;
    } catch (error) {
      toast.error('Failed to retrieve password');
      return null;
    }
  };

  const deletePassword = async (id: string) => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setStoredPasswords(prev => prev.filter(p => p.id !== id));
      toast.success('Password deleted successfully');
    } catch (error) {
      toast.error('Failed to delete password');
      throw error;
    }
  };

  const value = {
    storedPasswords,
    generatedPassword,
    generatePassword,
    storePassword,
    retrievePassword,
    deletePassword,
  };

  return <PasswordContext.Provider value={value}>{children}</PasswordContext.Provider>;
};

export const usePassword = () => {
  const context = useContext(PasswordContext);
  if (context === undefined) {
    throw new Error('usePassword must be used within a PasswordProvider');
  }
  return context;
};
