import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useBackend } from '../hooks/useBackend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
    residual_likelihood: 'none' as string,
    residual_impact: 'none' as string,
    
    // ISO 27001 specific fields
    asset_group: '',
    asset: '',
    threat: '',
    vulnerability: '',
    risk_type: '',
    risk_owner_approval: false,
    existing_controls: '',
    impact_rationale: '',
    treatment_option: '',
    proposed_treatment_action: '',
    annex_a_reference: '',
    treatment_cost: '',
    treatment_action_owner: '',
    treatment_timescale: '',
    treatment_status: '',
    post_treatment_likelihood: 'none' as string,
    post_treatment_impact: 'none' as string,
    post_treatment_treatment_option: '',
    comments: '',
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
        residual_likelihood: risk.residual_likelihood?.toString() || 'none',
        residual_impact: risk.residual_impact?.toString() || 'none',
        
        // ISO 27001 specific fields
        asset_group: risk.asset_group || '',
        asset: risk.asset || '',
        threat: risk.threat || '',
        vulnerability: risk.vulnerability || '',
        risk_type: risk.risk_type || '',
        risk_owner_approval: risk.risk_owner_approval || false,
        existing_controls: risk.existing_controls || '',
        impact_rationale: risk.impact_rationale || '',
        treatment_option: risk.treatment_option || '',
        proposed_treatment_action: risk.proposed_treatment_action || '',
        annex_a_reference: risk.annex_a_reference || '',
        treatment_cost: risk.treatment_cost?.toString() || '',
        treatment_action_owner: risk.treatment_action_owner || '',
        treatment_timescale: risk.treatment_timescale || '',
        treatment_status: risk.treatment_status || '',
        post_treatment_likelihood: risk.post_treatment_likelihood?.toString() || 'none',
        post_treatment_impact: risk.post_treatment_impact?.toString() || 'none',
        post_treatment_treatment_option: risk.post_treatment_treatment_option || '',
        comments: risk.comments || '',
      });
    }
  }, [risk]);

  const updateRiskMutation = useMutation({
    mutationFn: (data: any) => {
      const updateData = {
        id: risk.id,
        ...data,
        residual_likelihood: data.residual_likelihood === 'none' ? undefined : parseInt(data.residual_likelihood),
        residual_impact: data.residual_impact === 'none' ? undefined : parseInt(data.residual_impact),
        post_treatment_likelihood: data.post_treatment_likelihood === 'none' ? undefined : parseInt(data.post_treatment_likelihood),
        post_treatment_impact: data.post_treatment_impact === 'none' ? undefined : parseInt(data.post_treatment_impact),
        treatment_cost: data.treatment_cost ? parseInt(data.treatment_cost) : undefined,
      };
      return backend.risk.update(updateData);
    },
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

  const getRiskLevel = (likelihood: number, impact: number) => {
    const score = likelihood * impact;
    if (score >= 15) return { level: 'HIGH', color: 'text-red-600' };
    if (score >= 8) return { level: 'MEDIUM', color: 'text-yellow-600' };
    return { level: 'LOW', color: 'text-green-600' };
  };

  const riskLevel = getRiskLevel(formData.likelihood, formData.impact);
  
  const postTreatmentLikelihood = formData.post_treatment_likelihood !== 'none' ? parseInt(formData.post_treatment_likelihood) : formData.likelihood;
  const postTreatmentImpact = formData.post_treatment_impact !== 'none' ? parseInt(formData.post_treatment_impact) : formData.impact;
  const postTreatmentRiskLevel = getRiskLevel(postTreatmentLikelihood, postTreatmentImpact);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Update Risk</DialogTitle>
          <DialogDescription>
            Modify the risk details and assessment with ISO 27001 compliance information
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Information</TabsTrigger>
              <TabsTrigger value="assessment">Risk Assessment</TabsTrigger>
              <TabsTrigger value="treatment">Treatment Plan</TabsTrigger>
              <TabsTrigger value="post-treatment">Post-Treatment</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="title">Risk Title</Label>
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
                  <Label htmlFor="asset_group">Asset Group</Label>
                  <Select value={formData.asset_group} onValueChange={(value) => setFormData({ ...formData, asset_group: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select asset group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Not specified</SelectItem>
                      <SelectItem value="information">Information</SelectItem>
                      <SelectItem value="network">Network</SelectItem>
                      <SelectItem value="hardware">Hardware</SelectItem>
                      <SelectItem value="software">Software</SelectItem>
                      <SelectItem value="physical_site">Physical/Site</SelectItem>
                      <SelectItem value="people">People</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="asset">Specific Asset</Label>
                  <Input
                    id="asset"
                    value={formData.asset}
                    onChange={(e) => setFormData({ ...formData, asset: e.target.value })}
                    placeholder="e.g., Customer database, Web server"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="threat">Threat</Label>
                  <Textarea
                    id="threat"
                    value={formData.threat}
                    onChange={(e) => setFormData({ ...formData, threat: e.target.value })}
                    placeholder="Describe the threat"
                    rows={2}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="vulnerability">Vulnerability</Label>
                  <Textarea
                    id="vulnerability"
                    value={formData.vulnerability}
                    onChange={(e) => setFormData({ ...formData, vulnerability: e.target.value })}
                    placeholder="Identify the specific weakness"
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="risk_type">Risk Type</Label>
                  <Select value={formData.risk_type} onValueChange={(value) => setFormData({ ...formData, risk_type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select risk type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Not specified</SelectItem>
                      <SelectItem value="confidentiality">Confidentiality (C)</SelectItem>
                      <SelectItem value="integrity">Integrity (I)</SelectItem>
                      <SelectItem value="availability">Availability (A)</SelectItem>
                      <SelectItem value="confidentiality_integrity">Confidentiality & Integrity (CI)</SelectItem>
                      <SelectItem value="confidentiality_availability">Confidentiality & Availability (CA)</SelectItem>
                      <SelectItem value="integrity_availability">Integrity & Availability (IA)</SelectItem>
                      <SelectItem value="confidentiality_integrity_availability">Confidentiality, Integrity & Availability (CIA)</SelectItem>
                    </SelectContent>
                  </Select>
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
                  <Label htmlFor="owner_id">Risk Owner</Label>
                  <Input
                    id="owner_id"
                    value={formData.owner_id}
                    onChange={(e) => setFormData({ ...formData, owner_id: e.target.value })}
                    placeholder="Enter risk owner email or ID"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="risk_owner_approval"
                    checked={formData.risk_owner_approval}
                    onCheckedChange={(checked) => setFormData({ ...formData, risk_owner_approval: !!checked })}
                  />
                  <Label htmlFor="risk_owner_approval">Risk Owner's Approval</Label>
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="existing_controls">Existing Controls</Label>
                  <Textarea
                    id="existing_controls"
                    value={formData.existing_controls}
                    onChange={(e) => setFormData({ ...formData, existing_controls: e.target.value })}
                    placeholder="List any current mitigations"
                    rows={2}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="assessment" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="likelihood">Likelihood (1-5)</Label>
                  <Select value={formData.likelihood.toString()} onValueChange={(value) => setFormData({ ...formData, likelihood: parseInt(value) })}>
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

                <div>
                  <Label htmlFor="impact">Impact (1-5)</Label>
                  <Select value={formData.impact.toString()} onValueChange={(value) => setFormData({ ...formData, impact: parseInt(value) })}>
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

                <div className="md:col-span-2">
                  <div className="p-4 border rounded-lg bg-gray-50">
                    <div className="text-center">
                      <div className="text-2xl font-bold">Risk Score: {formData.likelihood * formData.impact}</div>
                      <div className={`text-lg font-semibold ${riskLevel.color}`}>
                        Risk Level: {riskLevel.level}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="residual_likelihood">Residual Likelihood (1-5)</Label>
                  <Select 
                    value={formData.residual_likelihood} 
                    onValueChange={(value) => setFormData({ 
                      ...formData, 
                      residual_likelihood: value 
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select residual likelihood" />
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

                <div>
                  <Label htmlFor="residual_impact">Residual Impact (1-5)</Label>
                  <Select 
                    value={formData.residual_impact} 
                    onValueChange={(value) => setFormData({ 
                      ...formData, 
                      residual_impact: value 
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select residual impact" />
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

                <div className="md:col-span-2">
                  <Label htmlFor="impact_rationale">Impact Rationale</Label>
                  <Textarea
                    id="impact_rationale"
                    value={formData.impact_rationale}
                    onChange={(e) => setFormData({ ...formData, impact_rationale: e.target.value })}
                    placeholder="Provide justification for the impact rating"
                    rows={3}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="treatment" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="treatment_option">Treatment Option</Label>
                  <Select value={formData.treatment_option} onValueChange={(value) => setFormData({ ...formData, treatment_option: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select treatment option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Not specified</SelectItem>
                      <SelectItem value="accept">Accept</SelectItem>
                      <SelectItem value="avoid">Avoid</SelectItem>
                      <SelectItem value="modify">Modify</SelectItem>
                      <SelectItem value="share">Share</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="treatment_status">Treatment Status</Label>
                  <Select value={formData.treatment_status} onValueChange={(value) => setFormData({ ...formData, treatment_status: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Not specified</SelectItem>
                      <SelectItem value="not_started">Not Started</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="proposed_treatment_action">Proposed Treatment Action</Label>
                  <Textarea
                    id="proposed_treatment_action"
                    value={formData.proposed_treatment_action}
                    onChange={(e) => setFormData({ ...formData, proposed_treatment_action: e.target.value })}
                    placeholder="Describe specific actions to mitigate the risk"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="annex_a_reference">Annex A/Control Reference</Label>
                  <Input
                    id="annex_a_reference"
                    value={formData.annex_a_reference}
                    onChange={(e) => setFormData({ ...formData, annex_a_reference: e.target.value })}
                    placeholder="e.g., A.8.26 Application security requirements"
                  />
                </div>

                <div>
                  <Label htmlFor="treatment_cost">Treatment Cost (NPR)</Label>
                  <Input
                    id="treatment_cost"
                    type="number"
                    value={formData.treatment_cost}
                    onChange={(e) => setFormData({ ...formData, treatment_cost: e.target.value })}
                    placeholder="e.g., 90000"
                  />
                </div>

                <div>
                  <Label htmlFor="treatment_action_owner">Treatment Action Owner</Label>
                  <Input
                    id="treatment_action_owner"
                    value={formData.treatment_action_owner}
                    onChange={(e) => setFormData({ ...formData, treatment_action_owner: e.target.value })}
                    placeholder="e.g., IT Manager, ISO"
                  />
                </div>

                <div>
                  <Label htmlFor="treatment_timescale">Treatment Timescale</Label>
                  <Input
                    id="treatment_timescale"
                    value={formData.treatment_timescale}
                    onChange={(e) => setFormData({ ...formData, treatment_timescale: e.target.value })}
                    placeholder="e.g., 2 months, 6 weeks"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="mitigation_plan">Additional Mitigation Plan</Label>
                  <Textarea
                    id="mitigation_plan"
                    value={formData.mitigation_plan}
                    onChange={(e) => setFormData({ ...formData, mitigation_plan: e.target.value })}
                    placeholder="Describe additional mitigation strategies"
                    rows={3}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="post-treatment" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="post_treatment_likelihood">Post-Treatment Likelihood (1-5)</Label>
                  <Select 
                    value={formData.post_treatment_likelihood} 
                    onValueChange={(value) => setFormData({ 
                      ...formData, 
                      post_treatment_likelihood: value 
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select post-treatment likelihood" />
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

                <div>
                  <Label htmlFor="post_treatment_impact">Post-Treatment Impact (1-5)</Label>
                  <Select 
                    value={formData.post_treatment_impact} 
                    onValueChange={(value) => setFormData({ 
                      ...formData, 
                      post_treatment_impact: value 
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select post-treatment impact" />
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

                <div className="md:col-span-2">
                  <div className="p-4 border rounded-lg bg-gray-50">
                    <div className="text-center">
                      <div className="text-2xl font-bold">Post-Treatment Risk Score: {postTreatmentLikelihood * postTreatmentImpact}</div>
                      <div className={`text-lg font-semibold ${postTreatmentRiskLevel.color}`}>
                        Post-Treatment Risk Level: {postTreatmentRiskLevel.level}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="post_treatment_treatment_option">Post-Treatment Option</Label>
                  <Select value={formData.post_treatment_treatment_option} onValueChange={(value) => setFormData({ ...formData, post_treatment_treatment_option: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select post-treatment option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Not specified</SelectItem>
                      <SelectItem value="accept">Accept</SelectItem>
                      <SelectItem value="avoid">Avoid</SelectItem>
                      <SelectItem value="modify">Modify</SelectItem>
                      <SelectItem value="share">Share</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div></div>

                <div className="md:col-span-2">
                  <Label htmlFor="comments">Comments</Label>
                  <Textarea
                    id="comments"
                    value={formData.comments}
                    onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                    placeholder="Any additional notes or comments about the treatment effectiveness"
                    rows={3}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

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
