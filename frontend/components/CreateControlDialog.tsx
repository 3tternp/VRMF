import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useBackend } from '../hooks/useBackend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

interface CreateControlDialogProps {
  riskId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateControlDialog({ riskId, open, onOpenChange, onSuccess }: CreateControlDialogProps) {
  const backend = useBackend();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    control_name: '',
    control_description: '',
    control_type: '',
    effectiveness: '',
    implementation_status: 'planned',
  });

  const createControlMutation = useMutation({
    mutationFn: (data: any) => backend.control.create({ risk_id: riskId, ...data }),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Control created successfully',
      });
      onSuccess();
      resetForm();
    },
    onError: (error: any) => {
      console.error('Create control error:', error);
      toast({
        title: 'Error',
        description: 'Failed to create control. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setFormData({
      control_name: '',
      control_description: '',
      control_type: '',
      effectiveness: '',
      implementation_status: 'planned',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.control_name || !formData.control_type || !formData.effectiveness) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }
    createControlMutation.mutate(formData);
  };

  const handleClose = () => {
    onOpenChange(false);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Risk Control</DialogTitle>
          <DialogDescription>
            Add a new control to help mitigate this risk
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="control_name">Control Name *</Label>
            <Input
              id="control_name"
              value={formData.control_name}
              onChange={(e) => setFormData({ ...formData, control_name: e.target.value })}
              placeholder="Enter control name"
              required
            />
          </div>

          <div>
            <Label htmlFor="control_description">Description</Label>
            <Textarea
              id="control_description"
              value={formData.control_description}
              onChange={(e) => setFormData({ ...formData, control_description: e.target.value })}
              placeholder="Describe the control in detail"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="control_type">Control Type *</Label>
              <Select value={formData.control_type} onValueChange={(value) => setFormData({ ...formData, control_type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="preventive">Preventive</SelectItem>
                  <SelectItem value="detective">Detective</SelectItem>
                  <SelectItem value="corrective">Corrective</SelectItem>
                  <SelectItem value="compensating">Compensating</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="effectiveness">Effectiveness *</Label>
              <Select value={formData.effectiveness} onValueChange={(value) => setFormData({ ...formData, effectiveness: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select effectiveness" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="not_effective">Not Effective</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="implementation_status">Implementation Status</Label>
            <Select value={formData.implementation_status} onValueChange={(value) => setFormData({ ...formData, implementation_status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planned">Planned</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="implemented">Implemented</SelectItem>
                <SelectItem value="not_implemented">Not Implemented</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createControlMutation.isPending}>
              {createControlMutation.isPending ? 'Creating...' : 'Create Control'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
