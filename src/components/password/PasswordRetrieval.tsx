import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from '@/lib/toast';
import { usePassword } from '@/contexts/PasswordContext';

const PasswordRetrieval = () => {
  const { passwords, retrievePassword } = usePassword();
  const [selectedHash, setSelectedHash] = useState<string | null>(null);
  const [retrievedPassword, setRetrievedPassword] = useState<string | null>(null);

  const handleRetrieve = async () => {
    if (!selectedHash) {
      toast.error('Please select a website');
      return;
    }

    const password = await retrievePassword(selectedHash);
    if (password) {
      setRetrievedPassword(password);
    }
  };

  const copyToClipboard = () => {
    if (retrievedPassword) {
      navigator.clipboard.writeText(retrievedPassword);
      toast.success('Password copied to clipboard!');
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Retrieve Password</h3>
      <Select onValueChange={setSelectedHash}>
        <SelectTrigger className="bg-[#121212] text-white">
          <SelectValue placeholder="Select website" />
        </SelectTrigger>
        <SelectContent>
          {passwords.map((entry) => (
            <SelectItem key={entry.ipfsHash} value={entry.ipfsHash}>
              {entry.website}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button onClick={handleRetrieve} className="bg-[#1EAEDB] hover:bg-[#1a96c1]">
        Retrieve Password
      </Button>
      {retrievedPassword && (
        <div className="space-y-2">
          <p className="text-white">Password: {retrievedPassword}</p>
          <Button onClick={copyToClipboard} className="bg-gray-700 hover:bg-gray-600">
            Copy to Clipboard
          </Button>
        </div>
      )}
    </div>
  );
};

export default PasswordRetrieval;