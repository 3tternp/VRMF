import { useState, useEffect } from 'react';
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
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import type { Risk, AssetGroup, TreatmentOption, TreatmentStatus, ComplianceFramework } from '~backend/risks/types';

interface EditRiskDialogProps {
  risk: Risk;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditRiskDialog({ risk, open, onOpenChange, onSuccess }: EditRiskDialogProps) {
  const [formData, setFormData] = useState({
    assetGroup: risk.assetGroup,
    asset: risk.asset,
    threat: risk.threat,
    vulnerability: risk.vulnerability,
    riskType: risk.riskType,
    riskOwner: risk.riskOwner,
    riskOwnerApproval: risk.riskOwnerApproval,
    existingControls: risk.existingControls || '',
    likelihood: risk.likelihood,
    impact: risk.impact,
    impactRationale: risk.impactRationale,
    treatmentOptionChosen: risk.treatmentOptionChosen,
    proposedTreatmentAction: risk.proposedTreatmentAction,
    annexAControlReference: risk.annexAControlReference,
    treatmentCost: risk.treatmentCost,
    treatmentActionOwner: risk.treatmentActionOwner,
    treatmentActionTimescale: risk.treatmentActionTimescale,
    treatmentActionStatus: risk.treatmentActionStatus,
    postTreatmentLikelihood: risk.postTreatmentLikelihood,
    postTreatmentImpact: risk.postTreatmentImpact,
    treatmentOptionChosen2: risk.treatmentOptionChosen2,
    comments: risk.comments || '',
    complianceFrameworks: risk.complianceFrameworks,
    reviewDate: risk.reviewDate ? new Date(risk.reviewDate).toISOString().split('T')[0] : '',
    nextAssessmentDate: risk.nextAssessmentDate ? new Date(risk.nextAssessmentDate).toISOString().split('T')[0] : '',
  });

  const backend = useBackend();
  const { user } = useAuth();
  const { toast } = useToast();

  const isAdmin = user?.role === 'admin';
  const isISOOfficer = user?.role === 'iso_officer';
  const canEditFull = isAdmin || isISOOfficer;

  useEffect(() => {
    setFormData({
      assetGroup: risk.assetGroup,
      asset: risk.asset,
      threat: risk.threat,
      vulnerability: risk.vulnerability,
      riskType: risk.riskType,
      riskOwner: risk.riskOwner,
      riskOwnerApproval: risk.riskOwnerApproval,
      existingControls: risk.existingControls || '',
      likelihood: risk.likelihood,
      impact: risk.impact,
      impactRationale: risk.impactRationale,
      treatmentOptionChosen: risk.treatmentOptionChosen,
      proposedTreatmentAction: risk.proposedTreatmentAction,
      annexAControlReference: risk.annexAControlReference,
      treatmentCost: risk.treatmentCost,
      treatmentActionOwner: risk.treatmentActionOwner,
      treatmentActionTimescale: risk.treatmentActionTimescale,
      treatmentActionStatus: risk.treatmentActionStatus,
      postTreatmentLikelihood: risk.postTreatmentLikelihood,
      postTreatmentImpact: risk.postTreatmentImpact,
      treatmentOptionChosen2: risk.treatmentOptionChosen2,
      comments: risk.comments || '',
      complianceFrameworks: risk.complianceFrameworks,
      reviewDate: risk.reviewDate ? new Date(risk.reviewDate).toISOString().split('T')[0] : '',
      nextAssessmentDate: risk.nextAssessmentDate ? new Date(risk.nextAssessmentDate).toISOString().split('T')[0] : '',
    });
  }, [risk]);

  const updateRiskMutation = useMutation({
    mutationFn: () => {
      const updateData: any = {};
      
      if (canEditFull) {
        // Admin and ISO Officer can edit all fields
        updateData.assetGroup = formData.assetGroup;
        updateData.asset = formData.asset;
        updateData.threat = formData.threat;
        updateData.vulnerability = formData.vulnerability;
        updateData.riskType = formData.riskType;
        updateData.riskOwner = formData.riskOwner;
        updateData.riskOwnerApproval = formData.riskOwnerApproval;
        updateData.existingControls = formData.existingControls || undefined;
        updateData.likelihood = formData.likelihood;
        updateData.impact = formData.impact;
        updateData.impactRationale = formData.impactRationale;
        updateData.treatmentOptionChosen = formData.treatmentOptionChosen;
        updateData.proposedTreatmentAction = formData.proposedTreatmentAction;
        updateData.annexAControlReference = formData.annexAControlReference;
        updateData.treatmentCost = formData.treatmentCost;
        updateData.treatmentActionTimescale = formData.treatmentActionTimescale;
        updateData.complianceFrameworks = formData.complianceFrameworks;
      }
      
      // All authorized users can edit these fields
      updateData.treatmentActionOwner = formData.treatmentActionOwner;
      updateData.treatmentActionStatus = formData.treatmentActionStatus;
      updateData.postTreatmentLikelihood = formData.postTreatmentLikelihood;
      updateData.postTreatmentImpact = formData.postTreatmentImpact;
      updateData.treatmentOptionChosen2 = formData.treatmentOptionChosen2;
      updateData.comments = formData.comments || undefined;
      updateData.reviewDate = formData.reviewDate ? new Date(formData.reviewDate) : undefined;
      updateData.nextAssessmentDate = formData.nextAssessmentDate ? new Date(formData.nextAssessmentDate) : undefined;

      return backend.risks.update({ id: risk.id, ...updateData });
    },
    onSuccess: () => {
      toast({
        title: "Risk Updated",
        description: "The risk has been updated successfully.",
      });
      onSuccess();
    },
    onError: (error: any) => {
      console.error('Update risk error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update risk.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateRiskMutation.mutate();
  };

  const handleComplianceFrameworkChange = (framework: ComplianceFramework, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      complianceFrameworks: checked
        ? [...prev.complianceFrameworks, framework]
        : prev.complianceFrameworks.filter(f => f !== framework)
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Risk SN {risk.sn}</DialogTitle>
          <DialogDescription>
            Update the risk details and treatment information
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {canEditFull && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="assetGroup">Asset Group</Label>
                  <Select value={formData.assetGroup} onValueChange={(value: AssetGroup) => setFormData(prev => ({ ...prev, assetGroup: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
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
                  <Label htmlFor="asset">Asset</Label>
                  <Input
                    id="asset"
                    value={formData.asset}
                    onChange={(e) => setFormData(prev => ({ ...prev, asset: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="threat">Threat</Label>
                <Textarea
                  id="threat"
                  value={formData.threat}
                  onChange={(e) => setFormData(prev => ({ ...prev, threat: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vulnerability">Vulnerability</Label>
                <Textarea
                  id="vulnerability"
                  value={formData.vulnerability}
                  onChange={(e) => setFormData(prev => ({ ...prev, vulnerability: e.target.value }))}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="riskType">Risk Type</Label>
                  <Input
                    id="riskType"
                    value={formData.riskType}
                    onChange={(e) => setFormData(prev => ({ ...prev, riskType: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="riskOwner">Risk Owner</Label>
                  <Input
                    id="riskOwner"
                    value={formData.riskOwner}
                    onChange={(e) => setFormData(prev => ({ ...prev, riskOwner: e.target.value }))}
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
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="likelihood">Likelihood (1-5)</Label>
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
                  <Label htmlFor="impact">Impact (1-5)</Label>
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
                <Label htmlFor="impactRationale">Impact Rationale</Label>
                <Textarea
                  id="impactRationale"
                  value={formData.impactRationale}
                  onChange={(e) => setFormData(prev => ({ ...prev, impactRationale: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="treatmentOptionChosen">Treatment Option</Label>
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
                <Label htmlFor="proposedTreatmentAction">Proposed Treatment Action</Label>
                <Textarea
                  id="proposedTreatmentAction"
                  value={formData.proposedTreatmentAction}
                  onChange={(e) => setFormData(prev => ({ ...prev, proposedTreatmentAction: e.target.value }))}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="annexAControlReference">Annex A Control Reference</Label>
                  <Input
                    id="annexAControlReference"
                    value={formData.annexAControlReference}
                    onChange={(e) => setFormData(prev => ({ ...prev, annexAControlReference: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="treatmentCost">Treatment Cost</Label>
                  <Input
                    id="treatmentCost"
                    value={formData.treatmentCost}
                    onChange={(e) => setFormData(prev => ({ ...prev, treatmentCost: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="treatmentActionTimescale">Treatment Action Timescale</Label>
                <Input
                  id="treatmentActionTimescale"
                  value={formData.treatmentActionTimescale}
                  onChange={(e) => setFormData(prev => ({ ...prev, treatmentActionTimescale: e.target.value }))}
                  required
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
            </>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="treatmentActionOwner">Treatment Action Owner</Label>
              <Input
                id="treatmentActionOwner"
                value={formData.treatmentActionOwner}
                onChange={(e) => setFormData(prev => ({ ...prev, treatmentActionOwner: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="treatmentActionStatus">Treatment Status</Label>
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="postTreatmentLikelihood">Post-Treatment Likelihood (1-5)</Label>
              <Select 
                value={formData.postTreatmentLikelihood?.toString() || 'none'} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, postTreatmentLikelihood: value === 'none' ? undefined : parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select likelihood" />
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
                  <SelectValue placeholder="Select impact" />
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
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateRiskMutation.isLoading}>
              {updateRiskMutation.isLoading ? 'Updating...' : 'Update Risk'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
