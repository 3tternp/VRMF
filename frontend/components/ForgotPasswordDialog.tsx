import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import backend from '~backend/client';
import { useToast } from '@/components/ui/use-toast';

interface ForgotPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ForgotPasswordDialog({ open, onOpenChange }: ForgotPasswordDialogProps) {
  const [email, setEmail] = useState('');
  const { toast } = useToast();

  const forgotPasswordMutation = useMutation({
    mutationFn: () => backend.users.forgotPassword({ email }),
    onSuccess: () => {
      toast({
        title: "Reset Email Sent",
        description: "If an account with that email exists, we've sent password reset instructions.",
      });
      onOpenChange(false);
      setEmail('');
    },
    onError: (error: any) => {
      console.error('Forgot password error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send reset email.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    forgotPasswordMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Forgot Password</DialogTitle>
          <DialogDescription>
            Enter your email address and we'll send you instructions to reset your password.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={forgotPasswordMutation.isLoading}>
              {forgotPasswordMutation.isLoading ? 'Sending...' : 'Send Reset Instructions'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
