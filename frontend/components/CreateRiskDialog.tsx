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
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useBackend } from '../hooks/useBackend';
import { useToast } from '@/components/ui/use-toast';
import type { AssetGroup, TreatmentOption, TreatmentStatus, ComplianceFramework } from '~backend/risks/types';

interface CreateRiskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateRiskDialog({ open, onOpenChange, onSuccess }: CreateRiskDialogProps) {
  const [formData, setFormData] = useState({
    assetGroup: undefined as AssetGroup | undefined,
    asset: '',
    threat: '',
    vulnerability: '',
    riskType: '',
    riskOwner: '',
    riskOwnerApproval: 'Approved' as 'Approved' | 'Not Approved',
    existingControls: '',
    likelihood: 1,
    impact: 1,
    impactRationale: '',
    treatmentOptionChosen: 'Modify' as TreatmentOption,
    proposedTreatmentAction: '',
    annexAControlReference: '',
    treatmentCost: '',
    treatmentActionOwner: '',
    treatmentActionTimescale: '',
    treatmentActionStatus: 'Not Started' as TreatmentStatus,
    postTreatmentLikelihood: undefined as number | undefined,
    postTreatmentImpact: undefined as number | undefined,
    treatmentOptionChosen2: undefined as TreatmentOption | undefined,
    comments: '',
    complianceFrameworks: [] as ComplianceFramework[],
    reviewDate: '',
    nextAssessmentDate: '',
  });

  const backend = useBackend();
  const { toast } = useToast();

  const createRiskMutation = useMutation({
    mutationFn: () => {
      // Validate required fields
      if (!formData.assetGroup) {
        throw new Error('Asset Group is required');
      }
      if (!formData.asset.trim()) {
        throw new Error('Asset is required');
      }
      if (!formData.threat.trim()) {
        throw new Error('Threat is required');
      }
      if (!formData.vulnerability.trim()) {
        throw new Error('Vulnerability is required');
      }
      if (!formData.riskType.trim()) {
        throw new Error('Risk Type is required');
      }
      if (!formData.riskOwner.trim()) {
        throw new Error('Risk Owner is required');
      }
      if (!formData.impactRationale.trim()) {
        throw new Error('Impact Rationale is required');
      }
      if (!formData.proposedTreatmentAction.trim()) {
        throw new Error('Proposed Treatment Action is required');
      }
      if (!formData.annexAControlReference.trim()) {
        throw new Error('Annex A Control Reference is required');
      }
      if (!formData.treatmentCost.trim()) {
        throw new Error('Treatment Cost is required');
      }
      if (!formData.treatmentActionOwner.trim()) {
        throw new Error('Treatment Action Owner is required');
      }
      if (!formData.treatmentActionTimescale.trim()) {
        throw new Error('Treatment Action Timescale is required');
      }

      return backend.risks.create({
        assetGroup: formData.assetGroup,
        asset: formData.asset.trim(),
        threat: formData.threat.trim(),
        vulnerability: formData.vulnerability.trim(),
        riskType: formData.riskType.trim(),
        riskOwner: formData.riskOwner.trim(),
        riskOwnerApproval: formData.riskOwnerApproval,
        existingControls: formData.existingControls.trim() || undefined,
        likelihood: formData.likelihood,
        impact: formData.impact,
        impactRationale: formData.impactRationale.trim(),
        treatmentOptionChosen: formData.treatmentOptionChosen,
        proposedTreatmentAction: formData.proposedTreatmentAction.trim(),
        annexAControlReference: formData.annexAControlReference.trim(),
        treatmentCost: formData.treatmentCost.trim(),
        treatmentActionOwner: formData.treatmentActionOwner.trim(),
        treatmentActionTimescale: formData.treatmentActionTimescale.trim(),
        treatmentActionStatus: formData.treatmentActionStatus,
        postTreatmentLikelihood: formData.postTreatmentLikelihood,
        postTreatmentImpact: formData.postTreatmentImpact,
        treatmentOptionChosen2: formData.treatmentOptionChosen2,
        comments: formData.comments.trim() || undefined,
        complianceFrameworks: formData.complianceFrameworks,
        reviewDate: formData.reviewDate ? new Date(formData.reviewDate) : undefined,
        nextAssessmentDate: formData.nextAssessmentDate ? new Date(formData.nextAssessmentDate) : undefined,
      });
    },
    onSuccess: () => {
      toast({
        title: "Risk Created",
        description: "The risk has been created successfully.",
      });
      onSuccess();
      onOpenChange(false);
      resetForm();
    },
    onError: (error: any) => {
      console.error('Create risk error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create risk.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      assetGroup: undefined,
      asset: '',
      threat: '',
      vulnerability: '',
      riskType: '',
      riskOwner: '',
      riskOwnerApproval: 'Approved',
      existingControls: '',
      likelihood: 1,
      impact: 1,
      impactRationale: '',
      treatmentOptionChosen: 'Modify',
      proposedTreatmentAction: '',
      annexAControlReference: '',
      treatmentCost: '',
      treatmentActionOwner: '',
      treatmentActionTimescale: '',
      treatmentActionStatus: 'Not Started',
      postTreatmentLikelihood: undefined,
      postTreatmentImpact: undefined,
      treatmentOptionChosen2: undefined,
      comments: '',
      complianceFrameworks: [],
      reviewDate: '',
      nextAssessmentDate: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createRiskMutation.mutate();
  };

  const handleComplianceFrameworkChange = (framework: ComplianceFramework, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      complianceFrameworks: checked
        ? [...prev.complianceFrameworks, framework]
        : prev.complianceFrameworks.filter(f => f !== framework)
    }));
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Risk</DialogTitle>
          <DialogDescription>
            Add a new risk to the risk management framework
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assetGroup">Asset Group *</Label>
              <Select 
                value={formData.assetGroup || 'none'} 
                onValueChange={(value: string) => setFormData(prev => ({ ...prev, assetGroup: value === 'none' ? undefined : value as AssetGroup }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select asset group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Select asset group</SelectItem>
                  <SelectItem value="Information">Information</SelectItem>
                  <SelectItem value="Network">Network</SelectItem>
                  <SelectItem value="Hardware">Hardware</SelectItem>
                  <SelectItem value="Software">Software</SelectItem>
                  <SelectItem value="Physical/Site">Physical/Site</SelectItem>
                  <SelectItem value="People">People</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="asset">Asset *</Label>
              <Input
                id="asset"
                value={formData.asset}
                onChange={(e) => setFormData(prev => ({ ...prev, asset: e.target.value }))}
                placeholder="Enter asset name"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="threat">Threat *</Label>
            <Textarea
              id="threat"
              value={formData.threat}
              onChange={(e) => setFormData(prev => ({ ...prev, threat: e.target.value }))}
              placeholder="Describe the threat"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vulnerability">Vulnerability *</Label>
            <Textarea
              id="vulnerability"
              value={formData.vulnerability}
              onChange={(e) => setFormData(prev => ({ ...prev, vulnerability: e.target.value }))}
              placeholder="Describe the vulnerability"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="riskType">Risk Type *</Label>
              <Input
                id="riskType"
                value={formData.riskType}
                onChange={(e) => setFormData(prev => ({ ...prev, riskType: e.target.value }))}
                placeholder="e.g., Confidentiality, Integrity, Availability"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="riskOwner">Risk Owner *</Label>
              <Input
                id="riskOwner"
                value={formData.riskOwner}
                onChange={(e) => setFormData(prev => ({ ...prev, riskOwner: e.target.value }))}
                placeholder="Enter risk owner name"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="existingControls">Existing Controls</Label>
            <Textarea
              id="existingControls"
              value={formData.existingControls}
              onChange={(e) => setFormData(prev => ({ ...prev, existingControls: e.target.value }))}
              placeholder="Describe existing controls (optional)"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="likelihood">Likelihood (1-5) *</Label>
              <Select value={formData.likelihood.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, likelihood: parseInt(value) }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Improbable</SelectItem>
                  <SelectItem value="2">2 - Unlikely</SelectItem>
                  <SelectItem value="3">3 - Likely</SelectItem>
                  <SelectItem value="4">4 - Very Likely</SelectItem>
                  <SelectItem value="5">5 - Almost Certain</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="impact">Impact (1-5) *</Label>
              <Select value={formData.impact.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, impact: parseInt(value) }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Insignificant</SelectItem>
                  <SelectItem value="2">2 - Slight</SelectItem>
                  <SelectItem value="3">3 - Moderate</SelectItem>
                  <SelectItem value="4">4 - High</SelectItem>
                  <SelectItem value="5">5 - Very High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="impactRationale">Impact Rationale *</Label>
            <Textarea
              id="impactRationale"
              value={formData.impactRationale}
              onChange={(e) => setFormData(prev => ({ ...prev, impactRationale: e.target.value }))}
              placeholder="Explain the rationale for the impact rating"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="treatmentOptionChosen">Treatment Option *</Label>
            <Select value={formData.treatmentOptionChosen} onValueChange={(value: TreatmentOption) => setFormData(prev => ({ ...prev, treatmentOptionChosen: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Accept">Accept</SelectItem>
                <SelectItem value="Avoid">Avoid</SelectItem>
                <SelectItem value="Modify">Modify</SelectItem>
                <SelectItem value="Share">Share</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="proposedTreatmentAction">Proposed Treatment Action *</Label>
            <Textarea
              id="proposedTreatmentAction"
              value={formData.proposedTreatmentAction}
              onChange={(e) => setFormData(prev => ({ ...prev, proposedTreatmentAction: e.target.value }))}
              placeholder="Describe the proposed treatment action"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="annexAControlReference">Annex A Control Reference *</Label>
              <Input
                id="annexAControlReference"
                value={formData.annexAControlReference}
                onChange={(e) => setFormData(prev => ({ ...prev, annexAControlReference: e.target.value }))}
                placeholder="e.g., A.5.1.1"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="treatmentCost">Treatment Cost *</Label>
              <Input
                id="treatmentCost"
                value={formData.treatmentCost}
                onChange={(e) => setFormData(prev => ({ ...prev, treatmentCost: e.target.value }))}
                placeholder="e.g., NPR 100,000"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="treatmentActionOwner">Treatment Action Owner *</Label>
              <Input
                id="treatmentActionOwner"
                value={formData.treatmentActionOwner}
                onChange={(e) => setFormData(prev => ({ ...prev, treatmentActionOwner: e.target.value }))}
                placeholder="Enter owner name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="treatmentActionTimescale">Treatment Action Timescale *</Label>
              <Input
                id="treatmentActionTimescale"
                value={formData.treatmentActionTimescale}
                onChange={(e) => setFormData(prev => ({ ...prev, treatmentActionTimescale: e.target.value }))}
                placeholder="e.g., 3 months"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="treatmentActionStatus">Treatment Action Status *</Label>
            <Select value={formData.treatmentActionStatus} onValueChange={(value: TreatmentStatus) => setFormData(prev => ({ ...prev, treatmentActionStatus: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Not Started">Not Started</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="postTreatmentLikelihood">Post-Treatment Likelihood (1-5)</Label>
              <Select 
                value={formData.postTreatmentLikelihood?.toString() || 'none'} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, postTreatmentLikelihood: value === 'none' ? undefined : parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select likelihood (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Not Set</SelectItem>
                  <SelectItem value="1">1 - Improbable</SelectItem>
                  <SelectItem value="2">2 - Unlikely</SelectItem>
                  <SelectItem value="3">3 - Likely</SelectItem>
                  <SelectItem value="4">4 - Very Likely</SelectItem>
                  <SelectItem value="5">5 - Almost Certain</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="postTreatmentImpact">Post-Treatment Impact (1-5)</Label>
              <Select 
                value={formData.postTreatmentImpact?.toString() || 'none'} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, postTreatmentImpact: value === 'none' ? undefined : parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select impact (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Not Set</SelectItem>
                  <SelectItem value="1">1 - Insignificant</SelectItem>
                  <SelectItem value="2">2 - Slight</SelectItem>
                  <SelectItem value="3">3 - Moderate</SelectItem>
                  <SelectItem value="4">4 - High</SelectItem>
                  <SelectItem value="5">5 - Very High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="treatmentOptionChosen2">Secondary Treatment Option</Label>
            <Select 
              value={formData.treatmentOptionChosen2 || 'none'} 
              onValueChange={(value: string) => setFormData(prev => ({ ...prev, treatmentOptionChosen2: value === 'none' ? undefined : value as TreatmentOption }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select secondary option (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="Accept">Accept</SelectItem>
                <SelectItem value="Avoid">Avoid</SelectItem>
                <SelectItem value="Modify">Modify</SelectItem>
                <SelectItem value="Share">Share</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reviewDate">Review Date</Label>
              <Input
                id="reviewDate"
                type="date"
                value={formData.reviewDate}
                onChange={(e) => setFormData(prev => ({ ...prev, reviewDate: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nextAssessmentDate">Next Assessment Date</Label>
              <Input
                id="nextAssessmentDate"
                type="date"
                value={formData.nextAssessmentDate}
                onChange={(e) => setFormData(prev => ({ ...prev, nextAssessmentDate: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comments">Comments</Label>
            <Textarea
              id="comments"
              value={formData.comments}
              onChange={(e) => setFormData(prev => ({ ...prev, comments: e.target.value }))}
              placeholder="Additional comments (optional)"
            />
          </div>

          <div className="space-y-2">
            <Label>Compliance Frameworks</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {(['ISO 27001', 'SOC2', 'HIPAA', 'PCI DSS', 'COSO', 'COBIT', 'GDPR', 'NIST RMF'] as ComplianceFramework[]).map((framework) => (
                <div key={framework} className="flex items-center space-x-2">
                  <Checkbox
                    id={framework}
                    checked={formData.complianceFrameworks.includes(framework)}
                    onCheckedChange={(checked) => handleComplianceFrameworkChange(framework, checked as boolean)}
                  />
                  <Label htmlFor={framework} className="text-sm">{framework}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => handleDialogOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createRiskMutation.isLoading}>
              {createRiskMutation.isLoading ? 'Creating...' : 'Create Risk'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
