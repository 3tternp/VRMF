import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useBackend } from '../hooks/useBackend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Shield, Smartphone, Copy, Check } from 'lucide-react';

interface MfaSetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function MfaSetupDialog({ open, onOpenChange, onSuccess }: MfaSetupDialogProps) {
  const backend = useBackend();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [mfaData, setMfaData] = useState<{ secret: string; qrCodeUrl: string } | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [secretCopied, setSecretCopied] = useState(false);

  const setupMfaMutation = useMutation({
    mutationFn: () => backend.user.setupMfa(),
    onSuccess: (data) => {
      setMfaData(data);
      setStep(2);
    },
    onError: (error: any) => {
      console.error('Setup MFA error:', error);
      toast({
        title: 'Error',
        description: 'Failed to setup MFA. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const enableMfaMutation = useMutation({
    mutationFn: (code: string) => backend.user.enableMfa({ code }),
    onSuccess: (data) => {
      setBackupCodes(data.backupCodes);
      setStep(3);
    },
    onError: (error: any) => {
      console.error('Enable MFA error:', error);
      toast({
        title: 'Error',
        description: 'Invalid verification code. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleStartSetup = () => {
    setupMfaMutation.mutate();
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode.length !== 6) {
      toast({
        title: 'Invalid Code',
        description: 'Please enter a 6-digit verification code',
        variant: 'destructive',
      });
      return;
    }
    enableMfaMutation.mutate(verificationCode);
  };

  const handleComplete = () => {
    onSuccess();
    handleClose();
  };

  const handleClose = () => {
    onOpenChange(false);
    setStep(1);
    setMfaData(null);
    setVerificationCode('');
    setBackupCodes([]);
    setSecretCopied(false);
  };

  const copySecret = async () => {
    if (mfaData?.secret) {
      await navigator.clipboard.writeText(mfaData.secret);
      setSecretCopied(true);
      setTimeout(() => setSecretCopied(false), 2000);
      toast({
        title: 'Copied',
        description: 'Secret key copied to clipboard',
      });
    }
  };

  const copyBackupCodes = async () => {
    const codesText = backupCodes.join('\n');
    await navigator.clipboard.writeText(codesText);
    toast({
      title: 'Copied',
      description: 'Backup codes copied to clipboard',
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-12 w-12 text-blue-600" />
          </div>
          <DialogTitle className="text-center">Setup Two-Factor Authentication</DialogTitle>
          <DialogDescription className="text-center">
            Add an extra layer of security to your account
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-base">
                  <Smartphone className="h-5 w-5" />
                  <span>Step 1: Install Authenticator App</span>
                </CardTitle>
                <CardDescription>
                  Download an authenticator app like Google Authenticator, Authy, or Microsoft Authenticator
                </CardDescription>
              </CardHeader>
            </Card>

            <Button 
              onClick={handleStartSetup} 
              className="w-full"
              disabled={setupMfaMutation.isPending}
            >
              {setupMfaMutation.isPending ? 'Setting up...' : 'Continue Setup'}
            </Button>
          </div>
        )}

        {step === 2 && mfaData && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Step 2: Scan QR Code</CardTitle>
                <CardDescription>
                  Scan this QR code with your authenticator app or enter the secret key manually
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-center">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(mfaData.qrCodeUrl)}`}
                    alt="MFA QR Code"
                    className="border rounded"
                  />
                </div>
                
                <div>
                  <Label className="text-sm">Manual Entry Key:</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Input 
                      value={mfaData.secret} 
                      readOnly 
                      className="font-mono text-xs"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={copySecret}
                    >
                      {secretCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div>
                <Label htmlFor="verification-code">Verification Code</Label>
                <Input
                  id="verification-code"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit code"
                  className="text-center text-lg tracking-widest"
                  maxLength={6}
                  required
                  disabled={enableMfaMutation.isPending}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={enableMfaMutation.isPending || verificationCode.length !== 6}
              >
                {enableMfaMutation.isPending ? 'Verifying...' : 'Verify & Enable'}
              </Button>
            </form>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base text-green-600">MFA Enabled Successfully!</CardTitle>
                <CardDescription>
                  Save these backup codes in a secure location. You can use them to access your account if you lose your authenticator device.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 rounded font-mono text-sm">
                  {backupCodes.map((code, index) => (
                    <div key={index} className="text-center">{code}</div>
                  ))}
                </div>
                
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={copyBackupCodes} className="flex-1">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Codes
                  </Button>
                  <Button onClick={handleComplete} className="flex-1">
                    Complete Setup
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
