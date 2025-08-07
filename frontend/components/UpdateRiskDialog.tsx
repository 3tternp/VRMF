import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useBackend } from '../hooks/useBackend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import type { Risk } from '~backend/risk/types';

interface UpdateRiskDialogProps {
  risk: Risk;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function UpdateRiskDialog({ risk, open, onOpenChange, onSuccess }: UpdateRiskDialogProps) {
  const backend = useBackend();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    compliance_framework: '',
    likelihood: 1,
    impact: 1,
    status: '',
    owner_id: '',
    mitigation_plan: '',
    residual_likelihood: undefined as number | undefined,
    residual_impact: undefined as number | undefined,
  });

  useEffect(() => {
    if (risk) {
      setFormData({
        title: risk.title,
        description: risk.description || '',
        category: risk.category,
        compliance_framework: risk.compliance_framework,
        likelihood: risk.likelihood,
        impact: risk.impact,
        status: risk.status,
        owner_id: risk.owner_id,
        mitigation_plan: risk.mitigation_plan || '',
        residual_likelihood: risk.residual_likelihood,
        residual_impact: risk.residual_impact,
      });
    }
  }, [risk]);

  const updateRiskMutation = useMutation({
    mutationFn: (data: any) => backend.risk.update({ id: risk.id, ...data }),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Risk updated successfully',
      });
      onSuccess();
    },
    onError: (error: any) => {
      console.error('Update risk error:', error);
      toast({
        title: 'Error',
        description: 'Failed to update risk. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateRiskMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Update Risk</DialogTitle>
          <DialogDescription>
            Modify the risk details and assessment
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter risk title"
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
              <Label htmlFor="category">Category</Label>
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
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="identified">Identified</SelectItem>
                  <SelectItem value="assessed">Assessed</SelectItem>
                  <SelectItem value="mitigated">Mitigated</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="transferred">Transferred</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="likelihood">Likelihood (1-5)</Label>
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
              <Label htmlFor="impact">Impact (1-5)</Label>
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

            <div>
              <Label htmlFor="residual_likelihood">Residual Likelihood (1-5)</Label>
              <Select 
                value={formData.residual_likelihood?.toString() || ""} 
                onValueChange={(value) => setFormData({ 
                  ...formData, 
                  residual_likelihood: value ? parseInt(value) : undefined 
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select residual likelihood" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Not Set</SelectItem>
                  <SelectItem value="1">1 - Very Low</SelectItem>
                  <SelectItem value="2">2 - Low</SelectItem>
                  <SelectItem value="3">3 - Medium</SelectItem>
                  <SelectItem value="4">4 - High</SelectItem>
                  <SelectItem value="5">5 - Very High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="residual_impact">Residual Impact (1-5)</Label>
              <Select 
                value={formData.residual_impact?.toString() || ""} 
                onValueChange={(value) => setFormData({ 
                  ...formData, 
                  residual_impact: value ? parseInt(value) : undefined 
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select residual impact" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Not Set</SelectItem>
                  <SelectItem value="1">1 - Very Low</SelectItem>
                  <SelectItem value="2">2 - Low</SelectItem>
                  <SelectItem value="3">3 - Medium</SelectItem>
                  <SelectItem value="4">4 - High</SelectItem>
                  <SelectItem value="5">5 - Very High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="owner_id">Risk Owner</Label>
              <Input
                id="owner_id"
                value={formData.owner_id}
                onChange={(e) => setFormData({ ...formData, owner_id: e.target.value })}
                placeholder="Enter risk owner email or ID"
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateRiskMutation.isPending}>
              {updateRiskMutation.isPending ? 'Updating...' : 'Update Risk'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
