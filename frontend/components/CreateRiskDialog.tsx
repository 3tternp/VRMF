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

interface CreateRiskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateRiskDialog({ open, onOpenChange, onSuccess }: CreateRiskDialogProps) {
  const backend = useBackend();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    compliance_framework: '',
    likelihood: 1,
    impact: 1,
    owner_id: '',
    mitigation_plan: '',
  });

  const createRiskMutation = useMutation({
    mutationFn: (data: any) => backend.risk.create(data),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Risk created successfully',
      });
      onSuccess();
      resetForm();
    },
    onError: (error: any) => {
      console.error('Create risk error:', error);
      toast({
        title: 'Error',
        description: 'Failed to create risk. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      compliance_framework: '',
      likelihood: 1,
      impact: 1,
      owner_id: '',
      mitigation_plan: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.category || !formData.compliance_framework || !formData.owner_id) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }
    createRiskMutation.mutate(formData);
  };

  const handleClose = () => {
    onOpenChange(false);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Risk</DialogTitle>
          <DialogDescription>
            Add a new risk to your organization's risk register
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter risk title"
                required
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the risk in detail"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="operational">Operational</SelectItem>
                  <SelectItem value="financial">Financial</SelectItem>
                  <SelectItem value="strategic">Strategic</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="reputation">Reputation</SelectItem>
                  <SelectItem value="legal">Legal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="compliance_framework">Compliance Framework *</Label>
              <Select value={formData.compliance_framework} onValueChange={(value) => setFormData({ ...formData, compliance_framework: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select framework" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nist_rmf">NIST RMF</SelectItem>
                  <SelectItem value="iso_27001">ISO 27001</SelectItem>
                  <SelectItem value="soc2">SOC 2</SelectItem>
                  <SelectItem value="gdpr">GDPR</SelectItem>
                  <SelectItem value="hipaa">HIPAA</SelectItem>
                  <SelectItem value="pci_dss">PCI DSS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="likelihood">Likelihood (1-5) *</Label>
              <Select value={formData.likelihood.toString()} onValueChange={(value) => setFormData({ ...formData, likelihood: parseInt(value) })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Very Low</SelectItem>
                  <SelectItem value="2">2 - Low</SelectItem>
                  <SelectItem value="3">3 - Medium</SelectItem>
                  <SelectItem value="4">4 - High</SelectItem>
                  <SelectItem value="5">5 - Very High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="impact">Impact (1-5) *</Label>
              <Select value={formData.impact.toString()} onValueChange={(value) => setFormData({ ...formData, impact: parseInt(value) })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Very Low</SelectItem>
                  <SelectItem value="2">2 - Low</SelectItem>
                  <SelectItem value="3">3 - Medium</SelectItem>
                  <SelectItem value="4">4 - High</SelectItem>
                  <SelectItem value="5">5 - Very High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="owner_id">Risk Owner *</Label>
              <Input
                id="owner_id"
                value={formData.owner_id}
                onChange={(e) => setFormData({ ...formData, owner_id: e.target.value })}
                placeholder="Enter risk owner email or ID"
                required
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="mitigation_plan">Mitigation Plan</Label>
              <Textarea
                id="mitigation_plan"
                value={formData.mitigation_plan}
                onChange={(e) => setFormData({ ...formData, mitigation_plan: e.target.value })}
                placeholder="Describe the plan to mitigate this risk"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createRiskMutation.isPending}>
              {createRiskMutation.isPending ? 'Creating...' : 'Create Risk'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
