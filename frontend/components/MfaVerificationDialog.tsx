import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import backend from '~backend/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Shield } from 'lucide-react';

interface MfaVerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tempToken: string;
  onSuccess: () => void;
}

export function MfaVerificationDialog({ open, onOpenChange, tempToken, onSuccess }: MfaVerificationDialogProps) {
  const [mfaCode, setMfaCode] = useState('');
  const { toast } = useToast();

  const verifyMfaMutation = useMutation({
    mutationFn: (code: string) => backend.auth.verifyMfa({ tempToken, mfaCode: code }),
    onSuccess: (data) => {
      // Store the token and user data
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      
      toast({
        title: 'Login Successful',
        description: 'MFA verification completed successfully.',
      });
      
      onSuccess();
      setMfaCode('');
    },
    onError: (error: any) => {
      console.error('MFA verification error:', error);
      toast({
        title: 'Verification Failed',
        description: 'Invalid MFA code. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaCode || mfaCode.length !== 6) {
      toast({
        title: 'Invalid Code',
        description: 'Please enter a 6-digit MFA code',
        variant: 'destructive',
      });
      return;
    }
    verifyMfaMutation.mutate(mfaCode);
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setMfaCode(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-12 w-12 text-blue-600" />
          </div>
          <DialogTitle className="text-center">Two-Factor Authentication</DialogTitle>
          <DialogDescription className="text-center">
            Enter the 6-digit code from your authenticator app to complete login.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="mfa-code">Authentication Code</Label>
            <Input
              id="mfa-code"
              type="text"
              value={mfaCode}
              onChange={handleCodeChange}
              placeholder="000000"
              className="text-center text-2xl tracking-widest"
              maxLength={6}
              required
              disabled={verifyMfaMutation.isPending}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={verifyMfaMutation.isPending || mfaCode.length !== 6}
          >
            {verifyMfaMutation.isPending ? 'Verifying...' : 'Verify Code'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
